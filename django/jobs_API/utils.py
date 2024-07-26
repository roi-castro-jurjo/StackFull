import paramiko
import logging
from django.core.cache import cache
from django.contrib.auth.models import User
from cryptography.fernet import Fernet
from django.conf import settings





logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)


def get_user_credentials(username):
    try:
        user = User.objects.get(username=username)
        profile = user.profile
        cipher_suite = Fernet(settings.ENCRYPTION_KEY)
        decrypted_password = cipher_suite.decrypt(profile.encrypted_password.encode()).decode()
        hostname = profile.urls
        return {
            'hostname': hostname,
            'username': username,
            'password': decrypted_password
        }
    except User.DoesNotExist:
        raise Exception("User not found")
    except Exception as e:
        raise Exception(f"Error retrieving user credentials: {e}")

def execute_remote_command(command, username):
    try:
        credentials = get_user_credentials(username)
        hostname = credentials['hostname']
        password = credentials['password']

        client = paramiko.SSHClient()
        client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        client.connect(hostname, username=username, password=password)

        stdin, stdout, stderr = client.exec_command(command)
        output = stdout.read().decode('utf-8')
        error = stderr.read().decode('utf-8')

        client.close()

        if error:
            logger.error(f"Error executing remote command: {error}")
            raise Exception(f"Error executing remote command: {error}")

        return output
    except Exception as e:
        logger.error(f"SSH connection or command execution failed: {e}")
        raise e

def get_queued_jobs(username):
    try:
        output = execute_remote_command("squeue -o '%.18i %.9P %.50j %.8u %.8T %.10M %.9l %.6D %R'", username)
        jobs = []
        for line in output.split('\n')[1:]:  
            if line:
                parts = line.split()
                jobs.append({
                    "job_id": parts[0],
                    "partition": parts[1],
                    "job_name": parts[2],
                    "user": parts[3],
                    "state": parts[4],
                    "time": parts[5],
                    "time_left": parts[6],
                    "nodes": parts[7],
                    "nodelist_reason": parts[8]
                })
        return jobs
    except Exception as e:
        logger.error(f"Failed to get queued jobs: {e}")
        raise e

def get_cluster_info(username):
    try:
        output = execute_remote_command("sinfo -N -r -O NodeList,CPUsState,Memory,FreeMem,Gres,GresUsed", username)
        lines = output.split('\n')[1:] 
        cluster_info = []
        for line in lines:
            if line.strip():  
                parts = line.split()
                cluster_info.append({
                    "NodeList": parts[0],
                    "CPUsState": parts[1],
                    "Memory": parts[2],
                    "FreeMem": parts[3],
                    "Gres": parts[4],
                    "GresUsed": parts[5],
                })
        return cluster_info
    except Exception as e:
        logger.error(f"Failed to get cluster info: {e}")
        raise e

def get_job_details(username, job_id):
    try:
        output = execute_remote_command(f"scontrol show job {job_id}", username)
        details = {}
        key_value_pairs = output.split()
        
        for pair in key_value_pairs:
            if '=' in pair:
                key, value = pair.split('=', 1)
                details[key.strip()] = value.strip()
        
        return details
    except Exception as e:
        logger.error(f"Failed to get job details for job {job_id}: {e}")
        raise e

def get_job_history(username, job_id):
    try:
        output = execute_remote_command(f"sacct -j {job_id} --format=JobID,JobName,Partition,Account,AllocCPUS,State,ExitCode,Elapsed,Start,End", username)
        history = []
        lines = output.split('\n')[1:]  
        for line in lines:
            parts = line.split()
            if len(parts) >= 10:  
                history.append({
                    "job_id": parts[0],
                    "job_name": parts[1],
                    "partition": parts[2],
                    "account": parts[3],
                    "alloc_cpus": parts[4],
                    "state": parts[5],
                    "exit_code": parts[6],
                    "elapsed": parts[7],
                    "start": parts[8],
                    "end": parts[9],
                })
            else:
                logger.warning(f"Unexpected line format: {line}")
        return history
    except Exception as e:
        logger.error(f"Failed to get job history for job {job_id}: {e}")
        raise e