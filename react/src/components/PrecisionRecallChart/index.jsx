import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { usePRPoints } from '../../hooks';

const PrecisionRecallChart = ({ evaluationId, selectedCategory }) => {
    const { data, isLoading, isError, error } = usePRPoints(evaluationId, null, selectedCategory);

    if (isLoading) return <div>Loading precision-recall points...</div>;
    if (isError) return <div>Error: {error.message}</div>;

    const chartData = data.map((item) => ({
        id: item.id,
        precision: item.precision,
        recall: item.recall,
        category: item.category,
        iou: item.iou,
        area: item.area,
    }));

    return (
        <ResponsiveContainer width="100%" height={400}>
            <LineChart
                data={chartData}
                margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                }}
            >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="recall" />
                <YAxis dataKey="precision" />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="precision" stroke="#8884d8" activeDot={{ r: 8 }} dot={false} />
            </LineChart>
        </ResponsiveContainer>
    );
};

export default PrecisionRecallChart;