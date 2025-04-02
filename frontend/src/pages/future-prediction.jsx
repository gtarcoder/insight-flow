import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Select, Alert, Skeleton, Tabs, Button, Tooltip } from 'antd';
import { LineChartOutlined, RadarChartOutlined, RiseOutlined, BulbOutlined } from '@ant-design/icons';
import Layout from '../components/common/Layout';
import TrendChart from '../components/prediction/TrendChart';
import PredictionCard from '../components/prediction/PredictionCard';
import RelationshipGraph from '../components/prediction/RelationshipGraph';
import { fetchPredictions, fetchTrendData } from '../api/predictionService';

const { TabPane } = Tabs;
const { Option } = Select;

const FuturePrediction = () => {
    const [loading, setLoading] = useState(true);
    const [topics, setTopics] = useState([]);
    const [selectedTopic, setSelectedTopic] = useState(null);
    const [timeRange, setTimeRange] = useState('month'); // week, month, quarter, year
    const [predictions, setPredictions] = useState([]);
    const [trendData, setTrendData] = useState([]);
    const [activeTab, setActiveTab] = useState('trends');

    useEffect(() => {
        const fetchTopics = async () => {
            // 模拟获取主题列表
            setTopics([
                { id: 'ai', name: '人工智能' },
                { id: 'blockchain', name: '区块链' },
                { id: 'metaverse', name: '元宇宙' },
                { id: 'biotech', name: '生物技术' },
            ]);
            setSelectedTopic('ai');
            setLoading(false);
        };

        fetchTopics();
    }, []);

    useEffect(() => {
        if (selectedTopic) {
            loadData();
        }
    }, [selectedTopic, timeRange, activeTab]);

    const loadData = async () => {
        setLoading(true);
        try {
            if (activeTab === 'trends') {
                const data = await fetchTrendData(selectedTopic, timeRange);
                setTrendData(data);
            } else {
                const data = await fetchPredictions(selectedTopic, timeRange);
                setPredictions(data);
            }
        } catch (error) {
            console.error('Failed to fetch prediction data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleTopicChange = (value) => {
        setSelectedTopic(value);
    };

    const handleTimeRangeChange = (value) => {
        setTimeRange(value);
    };

    return (
        <Layout>
            <div className="p-4">
                <h1 className="text-2xl font-bold mb-4">未来预测</h1>

                <Alert
                    message="预测说明"
                    description="基于历史数据和当前趋势，系统对未来发展进行分析预测。预测结果仅供参考，实际情况可能会有所不同。"
                    type="info"
                    showIcon
                    closable
                    className="mb-4"
                />

                <div className="mb-4 flex items-center flex-wrap">
                    <div className="mr-4 mb-2">
                        <span className="mr-2">主题:</span>
                        <Select
                            value={selectedTopic}
                            onChange={handleTopicChange}
                            style={{ width: 200 }}
                            loading={loading && !topics.length}
                        >
                            {topics.map(topic => (
                                <Option key={topic.id} value={topic.id}>{topic.name}</Option>
                            ))}
                        </Select>
                    </div>

                    <div className="mb-2">
                        <span className="mr-2">时间范围:</span>
                        <Select
                            value={timeRange}
                            onChange={handleTimeRangeChange}
                            style={{ width: 120 }}
                        >
                            <Option value="week">一周</Option>
                            <Option value="month">一个月</Option>
                            <Option value="quarter">一季度</Option>
                            <Option value="year">一年</Option>
                        </Select>
                    </div>
                </div>

                <Tabs activeKey={activeTab} onChange={setActiveTab}>
                    <TabPane
                        tab={<span><LineChartOutlined /> 趋势预测</span>}
                        key="trends"
                    >
                        {loading ? (
                            <Skeleton active paragraph={{ rows: 10 }} />
                        ) : (
                            <TrendChart data={trendData} timeRange={timeRange} />
                        )}
                    </TabPane>

                    <TabPane
                        tab={<span><BulbOutlined /> 预测洞察</span>}
                        key="insights"
                    >
                        {loading ? (
                            <Row gutter={[16, 16]}>
                                {[...Array(3)].map((_, i) => (
                                    <Col xs={24} md={12} lg={8} key={i}>
                                        <Card><Skeleton active /></Card>
                                    </Col>
                                ))}
                            </Row>
                        ) : (
                            <Row gutter={[16, 16]}>
                                {predictions.map(prediction => (
                                    <Col xs={24} md={12} lg={8} key={prediction.id}>
                                        <PredictionCard data={prediction} />
                                    </Col>
                                ))}
                            </Row>
                        )}
                    </TabPane>

                    <TabPane
                        tab={<span><RadarChartOutlined /> 关联分析</span>}
                        key="relationships"
                    >
                        {loading ? (
                            <Skeleton active paragraph={{ rows: 10 }} />
                        ) : (
                            <RelationshipGraph topic={selectedTopic} />
                        )}
                    </TabPane>
                </Tabs>
            </div>
        </Layout>
    );
};

export default FuturePrediction; 