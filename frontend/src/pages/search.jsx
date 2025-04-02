import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
    Card, Input, Tabs, List, Tag, Typography,
    Button, Divider, Empty, Skeleton, Space
} from 'antd';
import {
    SearchOutlined,
    FileDoneOutlined,
    TagsOutlined,
    ApartmentOutlined,
    ClockCircleOutlined,
    RightOutlined
} from '@ant-design/icons';
import Layout from '../components/common/Layout';
import { searchContent } from '../api/searchService';
import { ENTITY_TYPE_MAP } from '../config/constants';

const { Title, Text, Paragraph } = Typography;
const { Search } = Input;
const { TabPane } = Tabs;

const SearchPage = () => {
    const router = useRouter();
    const { q: initialQuery, type: initialType } = router.query;

    const [searchQuery, setSearchQuery] = useState('');
    const [searchType, setSearchType] = useState('content');
    const [searchResults, setSearchResults] = useState([]);
    const [totalResults, setTotalResults] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (initialQuery) {
            setSearchQuery(initialQuery);
        }

        if (initialType && ['content', 'topic', 'entity'].includes(initialType)) {
            setSearchType(initialType);
        }
    }, [initialQuery, initialType]);

    useEffect(() => {
        if (searchQuery) {
            performSearch();
        }
    }, [searchQuery, searchType, currentPage]);

    const performSearch = async () => {
        setLoading(true);
        try {
            const response = await searchContent(searchQuery, searchType, currentPage, pageSize);
            setSearchResults(response.data);
            setTotalResults(response.total);
        } catch (error) {
            console.error('Search failed:', error);
            setSearchResults([]);
            setTotalResults(0);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (value) => {
        if (value.trim()) {
            setSearchQuery(value);
            setCurrentPage(1);
            // 更新URL但不刷新页面
            router.push(
                {
                    pathname: '/search',
                    query: { q: value, type: searchType }
                },
                undefined,
                { shallow: true }
            );
        }
    };

    const handleTabChange = (key) => {
        setSearchType(key);
        setCurrentPage(1);
        router.push(
            {
                pathname: '/search',
                query: { q: searchQuery, type: key }
            },
            undefined,
            { shallow: true }
        );
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const renderContentItem = (item) => (
        <List.Item
            key={item.id}
            onClick={() => router.push(`/content/${item.id}`)}
            className="cursor-pointer hover:bg-gray-50"
        >
            <div className="w-full">
                <div className="flex items-center mb-1">
                    <Tag color="blue">{item.platform}</Tag>
                    <Text type="secondary" className="ml-2 text-xs flex items-center">
                        <ClockCircleOutlined className="mr-1" />
                        {item.formatted_time}
                    </Text>
                </div>

                <Title level={4} className="mb-1">
                    {item.title}
                </Title>

                <Paragraph ellipsis={{ rows: 2 }} className="mb-2">
                    {item.summary}
                </Paragraph>

                <div className="flex flex-wrap gap-1 mb-2">
                    {item.topics.map(topic => (
                        <Tag key={topic} color="purple">{topic}</Tag>
                    ))}
                </div>

                {item.highlights && item.highlights.length > 0 && (
                    <div className="bg-gray-50 p-2 rounded text-sm">
                        {item.highlights.map((highlight, index) => (
                            <div key={index} dangerouslySetInnerHTML={{ __html: highlight }} />
                        ))}
                    </div>
                )}
            </div>
        </List.Item>
    );

    const renderTopicItem = (item) => (
        <List.Item key={item.id}>
            <Card className="w-full">
                <Title level={4}>{item.name}</Title>
                <Paragraph>{item.description}</Paragraph>

                <div className="flex justify-between items-center">
                    <Space>
                        <Text>内容数量: {item.content_count}</Text>
                        <Text>热度: {Math.round(item.popularity_score)}</Text>
                    </Space>

                    <Button
                        type="primary"
                        icon={<RightOutlined />}
                        onClick={() => router.push(`/history-timeline?topic=${item.id}`)}
                    >
                        查看历史
                    </Button>
                </div>

                {item.related_topics && item.related_topics.length > 0 && (
                    <div className="mt-3">
                        <Text strong>相关主题:</Text>
                        <div className="mt-1">
                            {item.related_topics.map(topic => (
                                <Tag key={topic}>{topic}</Tag>
                            ))}
                        </div>
                    </div>
                )}
            </Card>
        </List.Item>
    );

    const renderEntityItem = (item) => (
        <List.Item key={item.id}>
            <Card className="w-full">
                <div className="flex justify-between items-start">
                    <div>
                        <Title level={4}>{item.name}</Title>
                        <Tag color="blue">{ENTITY_TYPE_MAP[item.type] || item.type}</Tag>
                    </div>
                    <Text className="text-sm">
                        被提及: {item.mentions_count}次
                    </Text>
                </div>

                <Paragraph className="mt-2">{item.description}</Paragraph>

                {item.related_entities && item.related_entities.length > 0 && (
                    <div className="mt-2">
                        <Text strong>相关实体:</Text>
                        <div className="mt-1">
                            {item.related_entities.map((entity, index) => (
                                <Tag key={index} color="green">
                                    {entity.name} ({ENTITY_TYPE_MAP[entity.type] || entity.type})
                                </Tag>
                            ))}
                        </div>
                    </div>
                )}

                <div className="mt-3">
                    <Button
                        type="primary"
                        size="small"
                        onClick={() => router.push(`/search?q=${encodeURIComponent(item.name)}&type=content`)}
                    >
                        查找相关内容
                    </Button>
                </div>
            </Card>
        </List.Item>
    );

    return (
        <Layout>
            <div className="max-w-5xl mx-auto p-4">
                <Card className="mb-4">
                    <Search
                        placeholder="输入搜索关键词"
                        allowClear
                        enterButton="搜索"
                        size="large"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onSearch={handleSearch}
                        prefix={<SearchOutlined />}
                    />

                    <Tabs
                        activeKey={searchType}
                        onChange={handleTabChange}
                        className="mt-4"
                    >
                        <TabPane
                            tab={<span><FileDoneOutlined />内容</span>}
                            key="content"
                        />
                        <TabPane
                            tab={<span><TagsOutlined />主题</span>}
                            key="topic"
                        />
                        <TabPane
                            tab={<span><ApartmentOutlined />实体</span>}
                            key="entity"
                        />
                    </Tabs>
                </Card>

                {searchQuery ? (
                    <>
                        <div className="mb-4">
                            <Text>
                                搜索结果: 找到 <Text strong>{totalResults}</Text> 条关于 "
                                <Text strong>{searchQuery}</Text>" 的{
                                    searchType === 'content' ? '内容' :
                                        searchType === 'topic' ? '主题' : '实体'
                                }
                            </Text>
                        </div>

                        {loading ? (
                            <Skeleton active paragraph={{ rows: 10 }} />
                        ) : searchResults.length > 0 ? (
                            <List
                                itemLayout="vertical"
                                size="large"
                                pagination={{
                                    onChange: handlePageChange,
                                    current: currentPage,
                                    pageSize,
                                    total: totalResults,
                                    showSizeChanger: false
                                }}
                                dataSource={searchResults}
                                renderItem={
                                    searchType === 'content' ? renderContentItem :
                                        searchType === 'topic' ? renderTopicItem :
                                            renderEntityItem
                                }
                            />
                        ) : (
                            <Empty description="未找到相关结果" />
                        )}
                    </>
                ) : (
                    <Card>
                        <Empty
                            description="请输入关键词搜索"
                            image={<SearchOutlined style={{ fontSize: 48 }} />}
                        />
                    </Card>
                )}
            </div>
        </Layout>
    );
};

export default SearchPage; 