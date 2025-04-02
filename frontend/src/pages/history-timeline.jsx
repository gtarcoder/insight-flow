import React, { useState, useEffect } from 'react';
import { Tabs, Select, Spin, Empty, Button, Tooltip } from 'antd';
import { SwapOutlined, NodeIndexOutlined, HistoryOutlined } from '@ant-design/icons';
import Layout from '../components/common/Layout';
import TimelineView from '../components/history/TimelineView';
import GraphView from '../components/history/GraphView';
import TopicEvolutionView from '../components/history/TopicEvolutionView';
import { fetchHistoryData, fetchTopics, fetchEntities } from '../api/historyService';

const { TabPane } = Tabs;
const { Option } = Select;

const HistoryTimeline = () => {
    const [activeTab, setActiveTab] = useState('timeline');
    const [topics, setTopics] = useState([]);
    const [entities, setEntities] = useState([]);
    const [selectedItems, setSelectedItems] = useState([]);
    const [historyData, setHistoryData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [viewMode, setViewMode] = useState('topic'); // 'topic' or 'title'

    useEffect(() => {
        const loadFilterOptions = async () => {
            const topicsData = await fetchTopics();
            const entitiesData = await fetchEntities();
            setTopics(topicsData);
            setEntities(entitiesData);
        };

        loadFilterOptions();
    }, []);

    useEffect(() => {
        if (selectedItems.length > 0) {
            loadHistoryData();
        }
    }, [selectedItems, viewMode, activeTab]);

    const loadHistoryData = async () => {
        setLoading(true);
        try {
            const data = await fetchHistoryData({
                items: selectedItems,
                mode: viewMode,
                view: activeTab,
            });
            setHistoryData(data);
        } catch (error) {
            console.error('Failed to fetch history data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleModeToggle = () => {
        setViewMode(prev => prev === 'topic' ? 'title' : 'topic');
        setSelectedItems([]);
    };

    const renderSelector = () => {
        const options = viewMode === 'topic' ? topics : entities;

        return (
            <div className="mb-4 flex items-center">
                <Select
                    mode="multiple"
                    placeholder={`请选择${viewMode === 'topic' ? '主题' : '标题'}`}
                    style={{ width: '100%' }}
                    value={selectedItems}
                    onChange={setSelectedItems}
                    optionFilterProp="children"
                >
                    {options.map(option => (
                        <Option key={option.id} value={option.id}>
                            {option.name}
                        </Option>
                    ))}
                </Select>

                <Tooltip title={`切换到${viewMode === 'topic' ? '标题' : '主题'}模式`}>
                    <Button
                        icon={<SwapOutlined />}
                        onClick={handleModeToggle}
                        className="ml-2"
                    />
                </Tooltip>
            </div>
        );
    };

    return (
        <Layout>
            <div className="p-4">
                <h1 className="text-2xl font-bold mb-4">历史脉络</h1>

                {renderSelector()}

                <Tabs
                    activeKey={activeTab}
                    onChange={setActiveTab}
                >
                    <TabPane
                        tab={<span><HistoryOutlined /> 时间线视图</span>}
                        key="timeline"
                    >
                        {loading ? (
                            <div className="text-center py-8"><Spin size="large" /></div>
                        ) : historyData.length > 0 ? (
                            <TimelineView data={historyData} />
                        ) : (
                            <Empty description="请选择主题或标题" />
                        )}
                    </TabPane>

                    <TabPane
                        tab={<span><NodeIndexOutlined /> 关系图谱</span>}
                        key="graph"
                    >
                        {loading ? (
                            <div className="text-center py-8"><Spin size="large" /></div>
                        ) : historyData.length > 0 ? (
                            <GraphView data={historyData} />
                        ) : (
                            <Empty description="请选择主题或标题" />
                        )}
                    </TabPane>

                    <TabPane
                        tab={<span><SwapOutlined /> 主题演变</span>}
                        key="evolution"
                    >
                        {loading ? (
                            <div className="text-center py-8"><Spin size="large" /></div>
                        ) : historyData.length > 0 ? (
                            <TopicEvolutionView data={historyData} />
                        ) : (
                            <Empty description="请选择主题或标题" />
                        )}
                    </TabPane>
                </Tabs>
            </div>
        </Layout>
    );
};

export default HistoryTimeline; 