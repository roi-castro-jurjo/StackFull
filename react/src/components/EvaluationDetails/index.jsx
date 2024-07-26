import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { usePRPoints } from '../../hooks';
import { ResponsiveContainer } from 'recharts';

export const EvaluationDetails = (props) => {
    const { data, isLoading, isError, error } = usePRPoints(props.evaluationId, props.iou, props.cat, props.area); 

    if(isLoading) return <div>Loading precision-recall points...</div>;

    if (isError) {
        return <div>Error: {error.message}</div>;
    }

    const chartData = data.map((item) => ({
        id: item.id,
        precision: item.precision,
        recall: item.recall,
        category: item.category,
        iou: item.iou,
        area: item.area,
    }));

    return (
        <div className="rounded">
            <LineChart
                width={500}
                height={500}
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
                <YAxis dataKey="precision"/>
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="precision" stroke="#8884d8" activeDot={{ r: 8 }} dot={false} />
            </LineChart>
        </div>
    );
};
