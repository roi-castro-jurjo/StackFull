import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useJobs } from '../../hooks';

const JobsPage = () => {
    const { data: jobs, error, isLoading } = useJobs();
    const navigate = useNavigate();

    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>Error loading jobs</div>;

    const handleRowClick = (jobId) => {
        navigate(`/jobs/${jobId}`);
    };

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Queued Jobs</h1>
            <table className="min-w-full bg-white border border-gray-200">
                <thead>
                    <tr>
                        <th className="py-2 px-4 border-b">ID</th>
                        <th className="py-2 px-4 border-b">Partition</th>
                        <th className="py-2 px-4 border-b">Name</th>
                        <th className="py-2 px-4 border-b">User</th>
                        <th className="py-2 px-4 border-b">State</th>
                        <th className="py-2 px-4 border-b">Time</th>
                        <th className="py-2 px-4 border-b">Time Left</th>
                        <th className="py-2 px-4 border-b">Nodes</th>
                        <th className="py-2 px-4 border-b">Reason</th>
                    </tr>
                </thead>
                <tbody>
                    {jobs.map(job => (
                        <tr 
                            key={job.job_id} 
                            className="cursor-pointer hover:bg-gray-200"
                            onClick={() => handleRowClick(job.job_id)}
                        >
                            <td className="py-2 px-4 border-b">{job.job_id}</td>
                            <td className="py-2 px-4 border-b">{job.partition}</td>
                            <td className="py-2 px-4 border-b">{job.job_name}</td>
                            <td className="py-2 px-4 border-b">{job.user}</td>
                            <td className="py-2 px-4 border-b">{job.state}</td>
                            <td className="py-2 px-4 border-b">{job.time}</td>
                            <td className="py-2 px-4 border-b">{job.time_left}</td>
                            <td className="py-2 px-4 border-b">{job.nodes}</td>
                            <td className="py-2 px-4 border-b">{job.nodelist_reason}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default JobsPage;
