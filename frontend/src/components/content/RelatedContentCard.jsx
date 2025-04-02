import React from 'react';
import { Card, Typography, Tag, Space } from 'antd';
import { LinkOutlined } from '@ant-design/icons';
import Link from 'next/link';

const { Title, Paragraph, Text } = Typography;

const RelatedContentCard = ({ item, relationType }) => {
    return (
        <Link href={`/content/${item.id}`}>
            <a className="block">
                <Card hoverable size="small" className="mb-2">
                    <div className="flex items-start">
                        <LinkOutlined className="mr-2 mt-1 text-blue-500" />
                        <div>
                            <div className="mb-1">
                                <Title level={5} className="mb-0">
                                    {item.title}
                                </Title>
                                <div className="flex items-center">
                                    <Tag color="blue" className="mr-1">
                                        {item.platform}
                                    </Tag>
                                    <Text type="secondary" className="text-xs">
                                        {item.formatted_time}
                                    </Text>
                                    {relationType && (
                                        <Tag color="purple" className="ml-1">
                                            {relationType}
                                        </Tag>
                                    )}
                                </div>
                            </div>
                            <Paragraph ellipsis={{ rows: 2 }} className="text-sm text-gray-600 mb-0">
                                {item.summary}
                            </Paragraph>
                        </div>
                    </div>
                </Card>
            </a>
        </Link>
    );
};

export default RelatedContentCard; 