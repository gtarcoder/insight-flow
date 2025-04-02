import React from 'react';
import { Timeline, Card, Tag, Typography, Button } from 'antd';
import { ClockCircleOutlined, LinkOutlined } from '@ant-design/icons';
import { useRouter } from 'next/router';

const { Title, Paragraph, Text } = Typography;

const TimelineView = ({ data }) => {
    const router = useRouter();

    if (!data || data.length === 0) {
        return <div>暂无数据</div>;
    }

    // 按照时间排序
    const sortedData = [...data].sort((a, b) => {
        return new Date(a.publish_time) - new Date(b.publish_time);
    });

    const handleItemClick = (id) => {
        router.push(`/content/${id}`);
    };

    return (
        <Timeline mode="left">
            {sortedData.map((item, index) => (
                <Timeline.Item
                    key={item.id}
                    color={getNodeColor(item.sentiment.score)}
                    label={item.formatted_time}
                >
                    <Card
                        hoverable
                        className="mb-4"
                        onClick={() => handleItemClick(item.id)}
                    >
                        <div className="mb-2">
                            <Tag color="blue">{item.platform}</Tag>
                            {item.topics.map(topic => (
                                <Tag key={topic}>{topic}</Tag>
                            ))}
                        </div>

                        <Title level={4}>{item.title}</Title>

                        <Paragraph ellipsis={{ rows: 2 }}>
                            {item.summary}
                        </Paragraph>

                        {item.relationships && item.relationships.length > 0 && (
                            <div className="mt-2 border-t pt-2">
                                <Text strong>关联内容:</Text>
                                <div className="mt-1">
                                    {item.relationships.map(rel => (
                                        <div key={rel.target_id} className="flex items-center mb-1">
                                            <LinkOutlined className="mr-1" />
                                            <Button
                                                type="link"
                                                size="small"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleItemClick(rel.target_id);
                                                }}
                                            >
                                                {rel.target_title}
                                            </Button>
                                            <Text type="secondary" className="ml-1">
                                                ({getRelationshipLabel(rel.relation_type)})
                                            </Text>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </Card>
                </Timeline.Item>
            ))}
        </Timeline>
    );
};

// 根据情感分数获取节点颜色
const getNodeColor = (sentimentScore) => {
    if (sentimentScore >= 0.5) return 'green';
    if (sentimentScore <= -0.5) return 'red';
    if (sentimentScore >= 0.2) return 'blue';
    if (sentimentScore <= -0.2) return 'orange';
    return 'gray';
};

// 关系类型转中文标签
const getRelationshipLabel = (relationType) => {
    const typeMap = {
        'CAUSES': '原因',
        'FOLLOWS': '后续',
        'CONTRADICTS': '矛盾',
        'SIMILAR_TO': '相似',
        'REFERENCES': '引用'
    };
    return typeMap[relationType] || relationType;
};

export default TimelineView; 