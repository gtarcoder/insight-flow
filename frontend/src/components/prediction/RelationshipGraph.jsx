import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import { Card, Empty, Spin } from 'antd';
import { fetchRelationshipData } from '../../api/predictionService';

const RelationshipGraph = ({ topic }) => {
    const chartRef = useRef(null);
    const chartInstance = useRef(null);
    const [loading, setLoading] = React.useState(true);
    const [graphData, setGraphData] = React.useState(null);

    useEffect(() => {
        if (topic) {
            loadData();
        }

        return () => {
            if (chartInstance.current) {
                chartInstance.current.dispose();
                chartInstance.current = null;
            }
            window.removeEventListener('resize', () => { });
        };
    }, [topic]);

    useEffect(() => {
        if (chartRef.current && graphData) {
            renderChart();
        }
    }, [graphData]);

    const loadData = async () => {
        setLoading(true);
        try {
            const data = await fetchRelationshipData(topic);
            setGraphData(data);
        } catch (error) {
            console.error('Failed to fetch relationship data:', error);
        } finally {
            setLoading(false);
        }
    };

    const renderChart = () => {
        // 如果已经有图表实例，先销毁
        if (chartInstance.current) {
            chartInstance.current.dispose();
        }

        // 初始化图表
        const chart = echarts.init(chartRef.current);
        chartInstance.current = chart;

        // 配置图表选项
        const option = {
            title: {
                text: `"${topic}" 关系预测`,
                subtext: '展示主题之间的影响关系和预测方向',
                left: 'center'
            },
            tooltip: {
                formatter: function (params) {
                    if (params.dataType === 'edge') {
                        return `${params.data.source} → ${params.data.target}<br />
                    影响程度: ${params.data.value}<br />
                    方向: ${params.data.direction}`;
                    }
                    return `${params.data.name}<br />
                  热度: ${params.data.symbolSize}<br />
                  趋势: ${params.data.trend > 0 ? '上升' : params.data.trend < 0 ? '下降' : '稳定'}`;
                }
            },
            animationDurationUpdate: 1500,
            animationEasingUpdate: 'quinticInOut',
            series: [
                {
                    type: 'graph',
                    layout: 'force',
                    force: {
                        repulsion: 300,
                        edgeLength: 150
                    },
                    roam: true,
                    label: {
                        show: true
                    },
                    data: graphData.nodes,
                    links: graphData.links,
                    lineStyle: {
                        width: 2,
                        curveness: 0.3,
                        color: 'source'
                    },
                    emphasis: {
                        focus: 'adjacency',
                        lineStyle: {
                            width: 5
                        }
                    }
                }
            ]
        };

        // 设置图表选项
        chart.setOption(option);

        // 自适应窗口大小
        window.addEventListener('resize', () => {
            chart.resize();
        });
    };

    if (!topic) {
        return <Empty description="请选择主题" />;
    }

    return (
        <Card>
            <div className="relative">
                {loading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-70 z-10">
                        <Spin size="large" />
                    </div>
                )}
                <div ref={chartRef} style={{ width: '100%', height: '600px' }} />
            </div>
        </Card>
    );
};

export default RelationshipGraph; 