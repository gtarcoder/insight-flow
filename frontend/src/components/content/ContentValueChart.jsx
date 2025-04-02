import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';

const ContentValueChart = ({ data }) => {
    const chartRef = useRef(null);
    const chartInstance = useRef(null);

    useEffect(() => {
        if (chartRef.current && data) {
            // 如果已经有图表实例，先销毁
            if (chartInstance.current) {
                chartInstance.current.dispose();
            }

            // 初始化图表
            const chart = echarts.init(chartRef.current);
            chartInstance.current = chart;

            // 配置图表选项
            const option = {
                radar: {
                    indicator: [
                        { name: '相关性', max: 10 },
                        { name: '时效性', max: 10 },
                        { name: '重要性', max: 10 },
                        { name: '独特性', max: 10 },
                        { name: '综合得分', max: 10 }
                    ],
                    radius: 80
                },
                series: [
                    {
                        type: 'radar',
                        data: [
                            {
                                value: [
                                    data.relevance,
                                    data.timeliness,
                                    data.importance,
                                    data.uniqueness,
                                    data.overall_score
                                ],
                                name: '价值评估',
                                areaStyle: {
                                    color: 'rgba(0, 112, 192, 0.4)'
                                },
                                lineStyle: {
                                    color: 'rgba(0, 112, 192, 0.8)',
                                    width: 2
                                },
                                itemStyle: {
                                    color: 'rgba(0, 112, 192, 1)'
                                }
                            }
                        ]
                    }
                ],
                color: ['#3398DB']
            };

            // 设置图表选项
            chart.setOption(option);

            // 自适应窗口大小
            window.addEventListener('resize', () => {
                chart.resize();
            });
        }

        return () => {
            if (chartInstance.current) {
                chartInstance.current.dispose();
                chartInstance.current = null;
            }
            window.removeEventListener('resize', () => { });
        };
    }, [data]);

    return (
        <div ref={chartRef} style={{ width: '100%', height: '300px' }} />
    );
};

export default ContentValueChart; 