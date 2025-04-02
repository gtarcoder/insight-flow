import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import { Card, Radio, Space } from 'antd';

const TopicEvolutionView = ({ data }) => {
    const chartRef = useRef(null);
    const chartInstance = useRef(null);
    const [viewType, setViewType] = React.useState('stream');

    useEffect(() => {
        if (chartRef.current && data && data.length > 0) {
            renderChart();
        }

        return () => {
            if (chartInstance.current) {
                chartInstance.current.dispose();
                chartInstance.current = null;
            }
            window.removeEventListener('resize', () => { });
        };
    }, [data, viewType]);

    const renderChart = () => {
        // 如果已经有图表实例，先销毁
        if (chartInstance.current) {
            chartInstance.current.dispose();
        }

        // 初始化图表
        const chart = echarts.init(chartRef.current);
        chartInstance.current = chart;

        // 准备数据
        const { series, xAxis, legend } = processData(data);

        // 配置图表选项
        const option = {
            title: {
                text: '主题演变趋势',
                left: 'center'
            },
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'line',
                    lineStyle: {
                        color: 'rgba(0,0,0,0.2)',
                        width: 1,
                        type: 'solid'
                    }
                }
            },
            legend: {
                data: legend,
                bottom: 10
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '15%',
                containLabel: true
            },
            xAxis: {
                type: 'category',
                boundaryGap: false,
                data: xAxis,
                axisLabel: {
                    formatter: function (value) {
                        return value.substring(5); // 只显示月-日
                    }
                }
            },
            yAxis: {
                type: 'value'
            },
            series: viewType === 'stream'
                ? series.map(s => ({ ...s, type: 'line', stack: 'Total', areaStyle: {}, emphasis: { focus: 'series' } }))
                : series.map(s => ({ ...s, type: 'line', emphasis: { focus: 'series' } }))
        };

        // 设置图表选项
        chart.setOption(option);

        // 自适应窗口大小
        window.addEventListener('resize', () => {
            chart.resize();
        });
    };

    // 处理数据
    const processData = (data) => {
        // 所有日期
        const dates = [...new Set(data.map(item => item.formatted_time.split(' ')[0]))].sort();

        // 所有主题
        const topics = [...new Set(data.flatMap(item => item.topics))];

        // 为每个主题创建数据系列
        const series = topics.map(topic => {
            const topicData = dates.map(date => {
                // 找出该日期下属于该主题的内容数量
                const count = data.filter(item =>
                    item.formatted_time.startsWith(date) &&
                    item.topics.includes(topic)
                ).length;
                return count;
            });

            return {
                name: topic,
                data: topicData,
                smooth: true
            };
        });

        return {
            series,
            xAxis: dates,
            legend: topics
        };
    };

    const handleViewTypeChange = e => {
        setViewType(e.target.value);
    };

    if (!data || data.length === 0) {
        return <div>暂无数据</div>;
    }

    return (
        <Card>
            <div className="mb-4 flex justify-end">
                <Radio.Group value={viewType} onChange={handleViewTypeChange}>
                    <Radio.Button value="stream">流图</Radio.Button>
                    <Radio.Button value="line">折线图</Radio.Button>
                </Radio.Group>
            </div>
            <div ref={chartRef} style={{ width: '100%', height: '500px' }} />
        </Card>
    );
};

export default TopicEvolutionView; 