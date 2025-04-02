import React from 'react';
import { Card, Tag, Typography, Space, Tooltip } from 'antd';
import { StarOutlined, StarFilled, ShareAltOutlined, EyeOutlined } from '@ant-design/icons';
import Link from 'next/link';

const { Title, Text, Paragraph } = Typography;

const NewsCard = ({ item, onFavorite }) => {
    const handleFavoriteClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (onFavorite) {
            onFavorite(item.id, !item.user_interactions.is_favorited);
        }
    };

    const handleShareClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        // 实现分享功能
        navigator.clipboard.writeText(`${window.location.origin}/content/${item.id}`);
    };

    return (
        <Link href={`/content/${item.id}`}>
            <a className="block h-full">
                <Card
                    hoverable
                    className="h-full flex flex-col"
                    cover={
                        item.metadata.image_urls && item.metadata.image_urls.length > 0 ? (
                            <img
                                alt={item.title}
                                src={item.metadata.image_urls[0]}
                                className="h-40 object-cover"
                            />
                        ) : null
                    }
                    actions={[
                        <Tooltip title={item.user_interactions.is_favorited ? '取消收藏' : '收藏'} key="favorite">
                            {item.user_interactions.is_favorited ? (
                                <StarFilled
                                    className="text-yellow-500"
                                    onClick={handleFavoriteClick}
                                />
                            ) : (
                                <StarOutlined onClick={handleFavoriteClick} />
                            )}
                        </Tooltip>,
                        <Tooltip title="分享" key="share">
                            <ShareAltOutlined onClick={handleShareClick} />
                        </Tooltip>,
                        <Space key="views">
                            <EyeOutlined />
                            <span>{item.user_interactions.view_count}</span>
                        </Space>
                    ]}
                >
                    <div className="mb-2">
                        <Tag color="blue">{item.platform}</Tag>
                        {item.value_assessment.overall_score >= 8.5 && (
                            <Tag color="red">精选</Tag>
                        )}
                    </div>

                    <Title level={4} ellipsis={{ rows: 2 }} className="mb-2">
                        {item.title}
                    </Title>

                    <Paragraph ellipsis={{ rows: 3 }} className="text-gray-600 flex-grow">
                        {item.summary}
                    </Paragraph>

                    <div className="mt-2">
                        <Text type="secondary">{item.formatted_time}</Text>
                    </div>
                </Card>
            </a>
        </Link>
    );
};

export default NewsCard; 