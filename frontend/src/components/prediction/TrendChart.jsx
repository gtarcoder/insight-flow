import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import { Card } from 'antd';

const TrendChart = ({ data, timeRange }) => {
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

            // 根据时间范围设置X轴标签格式
            let xAxisLabelFormat = 'MM-dd';
            if (timeRange === 'year') xAxisLabelFormat = 'yyyy-MM';
            else if (timeRange === 'quarter') xAxisLabelFormat = 'MM-dd';
            else if (timeRange === 'week') xAxisLabelFormat = 'MM-dd HH:mm';

            // 设置图表选项
            const option = {
                title: {
                    text: '未来趋势预测',
                    left: 'center'
                },
                tooltip: {
                    trigger: 'axis',
                    axisPointer: {
                        type: 'cross'
                    }
                },
                legend: {
                    data: ['历史数据', '预测数据', '乐观估计', '悲观估计'],
                    bottom: 0
                },
                grid: {
                    left: '3%',
                    right: '4%',
                    bottom: '10%',
                    containLabel: true
                },
                xAxis: {
                    type: 'time',
                    axisTick: {
                        alignWithLabel: true
                    },
                    axisLabel: {
                        formatter: function (value) {
                            const date = new Date(value);
                            return echarts.format.formatTime(xAxisLabelFormat, date);
                        }
                    }
                },
                yAxis: {
                    type: 'value',
                    name: data.yAxisName || '指数',
                    nameLocation: 'end'
                },
                series: [
                    {
                        name: '历史数据',
                        type: 'line',
                        data: data.historical || [],
                        connectNulls: true,
                        lineStyle: {
                            width: 3
                        },
                        symbol: 'circle',
                        symbolSize: 6
                    },
                    {
                        name: '预测数据',
                        type: 'line',
                        data: data.predicted || [],
                        connectNulls: true,
                        lineStyle: {
                            width: 3,
                            type: 'dashed'
                        },
                        symbol: 'circle',
                        symbolSize: 6
                    },
                    {
                        name: '乐观估计',
                        type: 'line',
                        data: data.optimistic || [],
                        lineStyle: {
                            width: 2,
                            opacity: 0.5,
                            type: 'dotted'
                        },
                        symbol: 'none'
                    },
                    {
                        name: '悲观估计',
                        type: 'line',
                        data: data.pessimistic || [],
                        lineStyle: {
                            width: 2,
                            opacity: 0.5,
                            type: 'dotted'
                        },
                        symbol: 'none'
                    }
                ],
                visualMap: {
                    show: false,
                    dimension: 0,
                    pieces: [
                        {
                            gte: data.historical ? data.historical[data.historical.length - 1][0] : 0,
                            lte: data.predicted ? data.predicted[data.predicted.length - 1][0] : 0,
                            color: '#91cc75'
                        }
                    ]
                }
            };

            // 添加信息标记点
            if (data.markers && data.markers.length > 0) {
                const markPoints = data.markers.map(marker => ({
                    name: marker.name,
                    coord: [marker.time, marker.value],
                    value: marker.name,
                    itemStyle: {
                        color: marker.color || '#ff4500'
                    }
                }));

                option.series[1].markPoint = {
                    data: markPoints,
                    symbol: 'pin',
                    symbolSize: 40,
                    label: {
                        formatter: '{b}'
                    }
                };
            }

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
    }, [data, timeRange]);

    if (!data) {
        return <Card>暂无数据</Card>;
    }

    return (
        <Card>
            <div className="mb-3">
                <h3 className="text-lg font-medium">{data.title || '趋势预测'}</h3>
                <p className="text-gray-500">{data.description || '基于历史数据的未来趋势预测'}</p>
            </div>
            <div ref={chartRef} style={{ width: '100%', height: '450px' }} />
        </Card>
    );
};

export default TrendChart; 