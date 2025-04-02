import React, { useState, useEffect } from 'react';
import { Select, DatePicker, Slider, Button, Row, Col, Collapse, Tag } from 'antd';
import { FilterOutlined, ClearOutlined } from '@ant-design/icons';
import { fetchFilterOptions } from '../../api/filterService';

const { Option } = Select;
const { RangePicker } = DatePicker;
const { Panel } = Collapse;

const FilterPanel = ({ filters, onFilterChange }) => {
    const [platforms, setPlatforms] = useState([]);
    const [topics, setTopics] = useState([]);
    const [loading, setLoading] = useState(false);
    const [localFilters, setLocalFilters] = useState(filters);

    useEffect(() => {
        loadFilterOptions();
    }, []);

    useEffect(() => {
        setLocalFilters(filters);
    }, [filters]);

    const loadFilterOptions = async () => {
        setLoading(true);
        try {
            const options = await fetchFilterOptions();
            setPlatforms(options.platforms);
            setTopics(options.topics);
        } catch (error) {
            console.error('Failed to load filter options:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (key, value) => {
        setLocalFilters(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const handleApply = () => {
        if (onFilterChange) {
            onFilterChange(localFilters);
        }
    };

    const handleReset = () => {
        const resetFilters = {
            platforms: [],
            topics: [],
            timeRange: null,
            minScore: 7,
        };
        setLocalFilters(resetFilters);
        if (onFilterChange) {
            onFilterChange(resetFilters);
        }
    };

    return (
        <Collapse
            expandIconPosition="right"
            className="mb-4"
        >
            <Panel
                header={
                    <div className="flex items-center">
                        <FilterOutlined className="mr-2" />
                        <span>筛选条件</span>
                        {(filters.platforms.length > 0 || filters.topics.length > 0 || filters.timeRange) && (
                            <div className="ml-2">
                                {filters.platforms.map(platform => (
                                    <Tag key={platform} className="mr-1">{platforms.find(p => p.id === platform)?.name || platform}</Tag>
                                ))}
                                {filters.topics.map(topic => (
                                    <Tag key={topic} color="blue" className="mr-1">{topics.find(t => t.id === topic)?.name || topic}</Tag>
                                ))}
                                {filters.timeRange && (
                                    <Tag color="green" className="mr-1">自定义时间</Tag>
                                )}
                            </div>
                        )}
                    </div>
                }
                key="1"
            >
                <Row gutter={[16, 16]}>
                    <Col xs={24} md={12}>
                        <div className="mb-4">
                            <div className="mb-2">平台:</div>
                            <Select
                                mode="multiple"
                                placeholder="选择平台"
                                style={{ width: '100%' }}
                                value={localFilters.platforms}
                                onChange={(value) => handleChange('platforms', value)}
                                loading={loading}
                            >
                                {platforms.map(platform => (
                                    <Option key={platform.id} value={platform.id}>{platform.name}</Option>
                                ))}
                            </Select>
                        </div>

                        <div className="mb-4">
                            <div className="mb-2">主题:</div>
                            <Select
                                mode="multiple"
                                placeholder="选择主题"
                                style={{ width: '100%' }}
                                value={localFilters.topics}
                                onChange={(value) => handleChange('topics', value)}
                                loading={loading}
                            >
                                {topics.map(topic => (
                                    <Option key={topic.id} value={topic.id}>{topic.name}</Option>
                                ))}
                            </Select>
                        </div>
                    </Col>

                    <Col xs={24} md={12}>
                        <div className="mb-4">
                            <div className="mb-2">时间范围:</div>
                            <RangePicker
                                style={{ width: '100%' }}
                                value={localFilters.timeRange}
                                onChange={(dates) => handleChange('timeRange', dates)}
                            />
                        </div>

                        <div className="mb-4">
                            <div className="mb-2">最低价值分数: {localFilters.minScore}</div>
                            <Slider
                                min={1}
                                max={10}
                                value={localFilters.minScore}
                                onChange={(value) => handleChange('minScore', value)}
                                marks={{
                                    1: '1',
                                    4: '4',
                                    7: '7',
                                    10: '10'
                                }}
                            />
                        </div>
                    </Col>
                </Row>

                <div className="flex justify-end mt-4">
                    <Button
                        onClick={handleReset}
                        icon={<ClearOutlined />}
                        className="mr-2"
                    >
                        重置
                    </Button>
                    <Button
                        type="primary"
                        onClick={handleApply}
                        icon={<FilterOutlined />}
                    >
                        应用筛选
                    </Button>
                </div>
            </Panel>
        </Collapse>
    );
};

export default FilterPanel; 