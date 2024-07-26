import React from 'react';
import { useClusterInfo } from '../..//hooks';

const ClusterInfoPage = () => {
    const { data: info, error, isLoading } = useClusterInfo();

    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>Error loading cluster info</div>;

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Cluster Information</h1>
            <table className="min-w-full bg-white border border-gray-200">
                <thead>
                    <tr>
                        <th className="py-2 px-4 border-b">NodeList</th>
                        <th className="py-2 px-4 border-b">CPUs State</th>
                        <th className="py-2 px-4 border-b">Memory</th>
                        <th className="py-2 px-4 border-b">Free Memory</th>
                        <th className="py-2 px-4 border-b">Gres</th>
                        <th className="py-2 px-4 border-b">GresUsed</th>
                    </tr>
                </thead>
                <tbody>
                    {info.map((item, index) => (
                        <tr key={index}>
                            <td className="py-2 px-4 border-b text-center">{item.NodeList}</td>
                            <td className="py-2 px-4 border-b text-center">{item.CPUsState}</td>
                            <td className="py-2 px-4 border-b text-center">{item.Memory}</td>
                            <td className="py-2 px-4 border-b text-center">{item.FreeMem}</td>
                            <td className="py-2 px-4 border-b text-center">{item.Gres}</td>
                            <td className="py-2 px-4 border-b text-center">{item.GresUsed}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ClusterInfoPage;