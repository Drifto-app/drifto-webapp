import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface DoughnutChartProps {
    total: number;
    used: number;
}

type SegmentName = 'Used' | 'Available';

const DoughnutChart = ({ total, used }: DoughnutChartProps) => {
    const remaining = Math.max(0, total - used);
    const usedPercentage = total > 0 ? Math.round((used / total) * 100) : 0;

    const data: Array<{ name: SegmentName; value: number }> = [
        { name: 'Used', value: used },
        { name: 'Available', value: remaining },
    ];

    const COLORS: Record<SegmentName, string> = {
        Used: '#1d4ed8',
        Available: '#f3f4f6',
    };

    return (
        <div className="relative w-12 h-12">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={12}
                        outerRadius={18}
                        paddingAngle={0}
                        dataKey="value"
                        startAngle={90}
                        endAngle={-270}
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[entry.name]} stroke="none" />
                        ))}
                    </Pie>
                </PieChart>
            </ResponsiveContainer>

            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-xs font-semibold text-gray-900">{usedPercentage}%</div>
            </div>
        </div>
    );
};

export default DoughnutChart;
