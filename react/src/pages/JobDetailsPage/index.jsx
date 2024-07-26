import React from 'react';
import { useParams } from 'react-router-dom';
import { useJobDetails, useJobHistory } from '../../hooks';

const JobDetailsPage = () => {
    const { jobId } = useParams();
    const { data: details, error: detailsError, isLoading: detailsLoading } = useJobDetails(jobId);
    const { data: history, error: historyError, isLoading: historyLoading } = useJobHistory(jobId);

    if (detailsLoading || historyLoading) return <div>Loading...</div>;
    if (detailsError || historyError) return <div>Error loading job details or history</div>;

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Job Details</h1>
            <table className="min-w-full bg-white border border-gray-200 mb-8">
                <tbody>
                    {Object.entries(details).map(([key, value]) => (
                        <tr key={key}>
                            <td className="py-2 px-4 border-b font-bold">{key}</td>
                            <td className="py-2 px-4 border-b">{value}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <h2 className="text-xl font-bold mb-4">Job History</h2>
            <table className="min-w-full bg-white border border-gray-200">
                <thead>
                    <tr>
                        <th className="py-2 px-4 border-b">Job ID</th>
                        <th className="py-2 px-4 border-b">Job Name</th>
                        <th className="py-2 px-4 border-b">Partition</th>
                        <th className="py-2 px-4 border-b">Account</th>
                        <th className="py-2 px-4 border-b">Allocated CPUs</th>
                        <th className="py-2 px-4 border-b">State</th>
                        <th className="py-2 px-4 border-b">Exit Code</th>
                        <th className="py-2 px-4 border-b">Elapsed</th>
                        <th className="py-2 px-4 border-b">Start</th>
                        <th className="py-2 px-4 border-b">End</th>
                    </tr>
                </thead>
                <tbody>
                    {history.map(item => (
                        <tr key={item.job_id}>
                            <td className="py-2 px-4 border-b">{item.job_id}</td>
                            <td className="py-2 px-4 border-b">{item.job_name}</td>
                            <td className="py-2 px-4 border-b">{item.partition}</td>
                            <td className="py-2 px-4 border-b">{item.account}</td>
                            <td className="py-2 px-4 border-b">{item.alloc_cpus}</td>
                            <td className="py-2 px-4 border-b">{item.state}</td>
                            <td className="py-2 px-4 border-b">{item.exit_code}</td>
                            <td className="py-2 px-4 border-b">{item.elapsed}</td>
                            <td className="py-2 px-4 border-b">{item.start}</td>
                            <td className="py-2 px-4 border-b">{item.end}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default JobDetailsPage;
