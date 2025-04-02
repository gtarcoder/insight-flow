import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Tag, Select, DatePicker, Skeleton, Empty, Pagination } from 'antd';
import { StarOutlined, StarFilled, ShareAltOutlined, FilterOutlined } from '@ant-design/icons';
import Layout from '../components/common/Layout';
import NewsCard from '../components/news/NewsCard';
import FilterPanel from '../components/news/FilterPanel';
import { fetchLatestNews } from '../api/newsService';

const LatestNews = () => {
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        platforms: [],
        topics: [],
        timeRange: null,
        minScore: 7,
    });
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0,
    });

    useEffect(() => {
        loadData();
    }, [filters, pagination.current]);

    const loadData = async () => {
        setLoading(true);
        try {
            const response = await fetchLatestNews({
                ...filters,
                page: pagination.current,
                pageSize: pagination.pageSize,
            });

            setNews(response.data);
            setPagination(prev => ({
                ...prev,
                total: response.total,
            }));
        } catch (error) {
            console.error('Failed to fetch news:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (newFilters) => {
        setFilters(prev => ({
            ...prev,
            ...newFilters,
        }));
        setPagination(prev => ({
            ...prev,
            current: 1, // 重置页码
        }));
    };

    const handleFavorite = async (id, isFavorited) => {
        // 处理收藏/取消收藏逻辑
    };

    return (
        <Layout>
            <div className="p-4">
                <h1 className="text-2xl font-bold mb-4">最新资讯</h1>

                <FilterPanel
                    filters={filters}
                    onFilterChange={handleFilterChange}
                />

                <div className="my-4">
                    {loading ? (
                        <Row gutter={[16, 16]}>
                            {[...Array(4)].map((_, i) => (
                                <Col xs={24} sm={12} lg={8} xl={6} key={i}>
                                    <Card><Skeleton active /></Card>
                                </Col>
                            ))}
                        </Row>
                    ) : news.length > 0 ? (
                        <Row gutter={[16, 16]}>
                            {news.map(item => (
                                <Col xs={24} sm={12} lg={8} xl={6} key={item.id}>
                                    <NewsCard
                                        item={item}
                                        onFavorite={handleFavorite}
                                    />
                                </Col>
                            ))}
                        </Row>
                    ) : (
                        <Empty description="暂无数据" />
                    )}
                </div>

                <Pagination
                    current={pagination.current}
                    pageSize={pagination.pageSize}
                    total={pagination.total}
                    onChange={(page) => setPagination(prev => ({ ...prev, current: page }))}
                    showSizeChanger={false}
                    className="text-center mt-4"
                />
            </div>
        </Layout>
    );
};

export default LatestNews; 