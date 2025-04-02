import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Card, Skeleton, Tag, Divider, Typography, Button, Tooltip, Space, Row, Col, Tabs, List, Empty } from 'antd';
import {
    StarOutlined, StarFilled, ShareAltOutlined,
    ArrowLeftOutlined, ClockCircleOutlined,
    LinkOutlined, TagOutlined, FileTextOutlined,
    LikeOutlined, DislikeOutlined, MessageOutlined
} from '@ant-design/icons';
import Layout from '../../components/common/Layout';
import { fetchContentDetail, likeContent, dislikeContent, favoriteContent } from '../../api/contentService';
import RelatedContentCard from '../../components/content/RelatedContentCard';
import ContentValueChart from '../../components/content/ContentValueChart';

const { Title, Paragraph, Text } = Typography;
const { TabPane } = Tabs;

const ContentDetail = () => {
    const router = useRouter();
    const { id } = router.query;

    const [content, setContent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [interactions, setInteractions] = useState({
        isLiked: false,
        isDisliked: false,
        isFavorited: false
    });

    useEffect(() => {
        if (id) {
            loadContent();
        }
    }, [id]);

    const loadContent = async () => {
        setLoading(true);
        try {
            const contentData = await fetchContentDetail(id);
            setContent(contentData);
            setInteractions({
                isLiked: false, // 这里可根据API返回设置初始状态
                isDisliked: false,
                isFavorited: contentData.user_interactions.is_favorited
            });
        } catch (error) {
            console.error('Failed to load content:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLike = async () => {
        if (interactions.isLiked) return;

        try {
            await likeContent(id);
            setInteractions({
                ...interactions,
                isLiked: true,
                isDisliked: false
            });

            // 更新内容计数
            setContent({
                ...content,
                user_interactions: {
                    ...content.user_interactions,
                    like_count: content.user_interactions.like_count + 1,
                    dislike_count: interactions.isDisliked ? content.user_interactions.dislike_count - 1 : content.user_interactions.dislike_count
                }
            });
        } catch (error) {
            console.error('Failed to like content:', error);
        }
    };

    const handleDislike = async () => {
        if (interactions.isDisliked) return;

        try {
            await dislikeContent(id);
            setInteractions({
                ...interactions,
                isLiked: false,
                isDisliked: true
            });

            // 更新内容计数
            setContent({
                ...content,
                user_interactions: {
                    ...content.user_interactions,
                    dislike_count: content.user_interactions.dislike_count + 1,
                    like_count: interactions.isLiked ? content.user_interactions.like_count - 1 : content.user_interactions.like_count
                }
            });
        } catch (error) {
            console.error('Failed to dislike content:', error);
        }
    };

    const handleFavorite = async () => {
        const newStatus = !interactions.isFavorited;

        try {
            await favoriteContent(id, newStatus);
            setInteractions({
                ...interactions,
                isFavorited: newStatus
            });
        } catch (error) {
            console.error('Failed to update favorite status:', error);
        }
    };

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href);
        // 可以添加消息提示：复制成功
    };

    const renderSentimentTag = (sentiment) => {
        if (!sentiment) return null;

        let color, text;

        if (sentiment.label === 'positive') {
            color = 'success';
            text = '积极';
        } else if (sentiment.label === 'negative') {
            color = 'error';
            text = '消极';
        } else {
            color = 'processing';
            text = '中性';
        }

        return <Tag color={color}>{text}</Tag>;
    };

    if (loading) {
        return (
            <Layout>
                <div className="max-w-5xl mx-auto p-4">
                    <Skeleton active paragraph={{ rows: 10 }} />
                </div>
            </Layout>
        );
    }

    if (!content) {
        return (
            <Layout>
                <div className="max-w-5xl mx-auto p-4">
                    <Empty description="未找到内容" />
                    <div className="text-center mt-4">
                        <Button type="primary" onClick={() => router.push('/')}>
                            返回首页
                        </Button>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="max-w-5xl mx-auto p-4">
                <Button
                    icon={<ArrowLeftOutlined />}
                    onClick={() => router.back()}
                    type="link"
                    className="p-0 mb-4"
                >
                    返回
                </Button>

                <Row gutter={[16, 16]}>
                    <Col xs={24} lg={16}>
                        <Card>
                            <div className="mb-4">
                                <div className="flex items-center mb-2">
                                    <Tag color="blue">{content.platform}</Tag>
                                    <Text type="secondary" className="ml-2 flex items-center">
                                        <ClockCircleOutlined className="mr-1" />
                                        {content.formatted_time}
                                    </Text>
                                </div>

                                <Title level={2}>{content.title}</Title>

                                <div className="flex flex-wrap gap-1 my-2">
                                    {content.topics.map(topic => (
                                        <Tag key={topic} color="purple">{topic}</Tag>
                                    ))}
                                </div>

                                <Paragraph type="secondary">
                                    来源: {content.source}
                                </Paragraph>
                            </div>

                            <Divider />

                            <div className="mb-4">
                                <Title level={4}>摘要</Title>
                                <Paragraph>{content.summary}</Paragraph>
                            </div>

                            <div className="mb-4">
                                <Title level={4}>内容</Title>
                                <Paragraph>
                                    {content.processed_text.split('\n\n').map((paragraph, index) => (
                                        <Paragraph key={index}>{paragraph}</Paragraph>
                                    ))}
                                </Paragraph>
                            </div>

                            <Divider />

                            <div className="flex justify-between items-center">
                                <div>
                                    <Space>
                                        <Tooltip title="点赞">
                                            <Button
                                                icon={<LikeOutlined />}
                                                onClick={handleLike}
                                                type={interactions.isLiked ? 'primary' : 'default'}
                                            >
                                                {content.user_interactions.like_count || 0}
                                            </Button>
                                        </Tooltip>
                                        <Tooltip title="不喜欢">
                                            <Button
                                                icon={<DislikeOutlined />}
                                                onClick={handleDislike}
                                                type={interactions.isDisliked ? 'primary' : 'default'}
                                            >
                                                {content.user_interactions.dislike_count || 0}
                                            </Button>
                                        </Tooltip>
                                    </Space>
                                </div>

                                <div>
                                    <Space>
                                        <Tooltip title={interactions.isFavorited ? '取消收藏' : '收藏'}>
                                            <Button
                                                icon={interactions.isFavorited ? <StarFilled /> : <StarOutlined />}
                                                onClick={handleFavorite}
                                                type={interactions.isFavorited ? 'primary' : 'default'}
                                            />
                                        </Tooltip>
                                        <Tooltip title="分享">
                                            <Button
                                                icon={<ShareAltOutlined />}
                                                onClick={handleShare}
                                            />
                                        </Tooltip>
                                    </Space>
                                </div>
                            </div>
                        </Card>

                        {content.related_contents && content.related_contents.length > 0 && (
                            <Card title="相关内容" className="mt-4">
                                {content.related_contents.map(item => (
                                    <RelatedContentCard
                                        key={item.id}
                                        item={item}
                                        relationType={item.relation_type}
                                    />
                                ))}
                            </Card>
                        )}
                    </Col>

                    <Col xs={24} lg={8}>
                        <Card title="内容价值评估">
                            <ContentValueChart data={content.value_assessment} />

                            <Divider />

                            <div>
                                <div className="flex justify-between mb-2">
                                    <Text>综合评分:</Text>
                                    <Text strong>{content.value_assessment.overall_score.toFixed(1)}/10</Text>
                                </div>
                                <div className="flex justify-between mb-2">
                                    <Text>情感倾向:</Text>
                                    <div>{renderSentimentTag(content.sentiment)}</div>
                                </div>
                            </div>
                        </Card>

                        <Card title="内容元数据" className="mt-4">
                            <div className="mb-3">
                                <Text type="secondary">阅读时间:</Text>
                                <Text className="ml-2">{content.metadata.read_time_minutes} 分钟</Text>
                            </div>

                            <div className="mb-3">
                                <Text type="secondary">字数:</Text>
                                <Text className="ml-2">{content.metadata.word_count} 字</Text>
                            </div>

                            {content.metadata.author && (
                                <div className="mb-3">
                                    <Text type="secondary">作者:</Text>
                                    <Text className="ml-2">{content.metadata.author}</Text>
                                </div>
                            )}

                            {content.entities && content.entities.length > 0 && (
                                <div className="mb-3">
                                    <Text type="secondary">识别实体:</Text>
                                    <div className="mt-1">
                                        {content.entities.map((entity, index) => (
                                            <Tag key={index}>{entity.text}</Tag>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {content.keywords && content.keywords.length > 0 && (
                                <div className="mb-3">
                                    <Text type="secondary">关键词:</Text>
                                    <div className="mt-1">
                                        {content.keywords.map((keyword, index) => (
                                            <Tag key={index} color="orange">{keyword}</Tag>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {content.metadata.original_url && (
                                <div className="mt-4">
                                    <Button
                                        type="link"
                                        icon={<LinkOutlined />}
                                        href={content.metadata.original_url}
                                        target="_blank"
                                        className="p-0"
                                    >
                                        查看原文
                                    </Button>
                                </div>
                            )}
                        </Card>
                    </Col>
                </Row>
            </div>
        </Layout>
    );
};

export default ContentDetail; 