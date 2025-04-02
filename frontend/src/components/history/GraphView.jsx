import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import { Spin } from 'antd';

const GraphView = ({ data }) => {
    const chartRef = useRef(null);
    const chartInstance = useRef(null);

    useEffect(() => {
        if (chartRef.current && data && data.length > 0) {
            // 如果已经有图表实例，先销毁
            if (chartInstance.current) {
                chartInstance.current.dispose();
            }

            // 初始化图表
            const chart = echarts.init(chartRef.current);
            chartInstance.current = chart;

            // 准备图表数据
            const graphData = processDataForGraph(data);

            // 配置图表选项
            const option = {
                title: {
                    text: '内容关系图谱',
                    subtext: '包含内容之间的关联关系',
                    left: 'center'
                },
                tooltip: {
                    trigger: 'item',
                    formatter: function (params) {
                        if (params.dataType === 'node') {
                            return `<div style="font-weight:bold">${params.data.name}</div>
                      <div>平台: ${params.data.platform}</div>
                      <div>时间: ${params.data.time || '未知'}</div>`;
                        } else {
                            return `<div>${params.data.source} → ${params.data.target}</div>
                      <div>关系: ${params.data.name}</div>`;
                        }
                    }
                },
                legend: {
                    data: ['内容', '主题', '实体'],
                    bottom: 0
                },
                animationDurationUpdate: 1500,
                animationEasingUpdate: 'quinticInOut',
                series: [
                    {
                        type: 'graph',
                        layout: 'force',
                        force: {
                            repulsion: 200,
                            edgeLength: 100
                        },
                        roam: true,
                        label: {
                            show: true,
                            position: 'right',
                            formatter: '{b}'
                        },
                        data: graphData.nodes,
                        edges: graphData.links,
                        categories: [
                            { name: '内容' },
                            { name: '主题' },
                            { name: '实体' }
                        ],
                        lineStyle: {
                            color: 'source',
                            curveness: 0.3
                        },
                        emphasis: {
                            focus: 'adjacency',
                            lineStyle: {
                                width: 4
                            }
                        }
                    }
                ]
            };

            // 设置图表选项
            chart.setOption(option);

            // 处理点击事件
            chart.on('click', 'series.graph.node', function (params) {
                if (params.data.id && params.data.category === 0) {
                    window.location.href = `/content/${params.data.id}`;
                }
            });

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

    // 处理数据为图表所需格式
    const processDataForGraph = (data) => {
        const nodes = [];
        const links = [];
        const nodeMap = new Map();

        // 添加内容节点
        data.forEach((item, index) => {
            const nodeId = item.id;
            nodes.push({
                id: nodeId,
                name: item.title,
                category: 0, // 内容类型
                platform: item.platform,
                time: item.formatted_time,
                symbolSize: 20,
                value: item.value_assessment?.overall_score || 5
            });
            nodeMap.set(nodeId, true);

            // 添加主题节点和连接
            item.topics.forEach(topic => {
                const topicId = `topic-${topic}`;
                if (!nodeMap.has(topicId)) {
                    nodes.push({
                        id: topicId,
                        name: topic,
                        category: 1, // 主题类型
                        symbolSize: 15
                    });
                    nodeMap.set(topicId, true);
                }

                links.push({
                    source: nodeId,
                    target: topicId,
                    name: '属于',
                    value: 1
                });
            });

            // 添加实体节点和连接
            item.entities?.forEach(entity => {
                const entityId = `entity-${entity.text}`;
                if (!nodeMap.has(entityId)) {
                    nodes.push({
                        id: entityId,
                        name: entity.text,
                        category: 2, // 实体类型
                        symbolSize: 12
                    });
                    nodeMap.set(entityId, true);
                }

                links.push({
                    source: nodeId,
                    target: entityId,
                    name: '提及',
                    value: 1
                });
            });

            // 添加内容之间的关系
            item.relationships?.forEach(rel => {
                if (nodeMap.has(rel.target_id)) {
                    links.push({
                        source: nodeId,
                        target: rel.target_id,
                        name: getRelationshipLabel(rel.relation_type),
                        value: 2,
                        lineStyle: {
                            width: 2
                        }
                    });
                }
            });
        });

        return { nodes, links };
    };

    // 关系类型转中文标签
    const getRelationshipLabel = (relationType) => {
        const typeMap = {
            'CAUSES': '导致',
            'FOLLOWS': '后续',
            'CONTRADICTS': '矛盾',
            'SIMILAR_TO': '相似',
            'REFERENCES': '引用'
        };
        return typeMap[relationType] || relationType;
    };

    if (!data || data.length === 0) {
        return <div>暂无数据</div>;
    }

    return (
        <div className="relative">
            {!data && <div className="absolute inset-0 flex items-center justify-center"><Spin /></div>}
            <div ref={chartRef} style={{ width: '100%', height: '600px' }} />
        </div>
    );
};

export default GraphView; 