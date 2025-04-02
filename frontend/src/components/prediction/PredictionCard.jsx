import React from 'react';
import { Card, Progress, Typography, Divider, Tag, Space } from 'antd';
import { RiseOutlined, FallOutlined, DashOutlined, InfoCircleOutlined } from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

const PredictionCard = ({ data }) => {
    // 根据趋势确定图标和颜色
    const getTrendIcon = (trend) => {
        if (trend > 0.2) return <RiseOutlined style={{ color: '#52c41a' }} />;
        if (trend < -0.2) return <FallOutlined style={{ color: '#f5222d' }} />;
        return <DashOutlined style={{ color: '#1890ff' }} />;
    };

    // 根据可信度确定颜色
    const getConfidenceColor = (confidence) => {
        if (confidence >= 0.8) return '#52c41a';
        if (confidence >= 0.6) return '#1890ff';
        if (confidence >= 0.4) return '#faad14';
        return '#f5222d';
    };

    return (
        <Card
            hoverable
            className="h-full flex flex-col"
            actions={[
                <Space key="confidence">
                    <InfoCircleOutlined />
                    <span>可信度: {Math.round(data.confidence * 100)}%</span>
                </Space>
            ]}
        >
            <div className="mb-2">
                <Tag color="purple">{data.category}</Tag>
                <Tag color="blue">{data.timeframe}</Tag>
            </div>

            <Title level={4}>{data.title}</Title>

            <Paragraph className="flex-grow">
                {data.description}
            </Paragraph>

            <Divider style={{ margin: '12px 0' }} />

            <div className="mb-3">
                <div className="flex justify-between mb-1">
                    <Text>可能性:</Text>
                    <Text strong>{Math.round(data.probability * 100)}%</Text>
                </div>
                <Progress
                    percent={data.probability * 100}
                    showInfo={false}
                    status="active"
                    strokeColor={getConfidenceColor(data.confidence)}
                />
            </div>

            <div className="flex justify-between">
                <div>
                    <Text type="secondary">趋势:</Text>
                    <span className="ml-2">
                        {getTrendIcon(data.trend)}
                        <Text
                            strong
                            style={{
                                color: data.trend > 0.2 ? '#52c41a' : data.trend < -0.2 ? '#f5222d' : '#1890ff'
                            }}
                        >
                            {data.trend > 0 ? '+' : ''}{Math.round(data.trend * 100)}%
                        </Text>
                    </span>
                </div>
                <div>
                    <Text type="secondary">影响:</Text>
                    <span className="ml-2">{data.impact_level}</span>
                </div>
            </div>
        </Card>
    );
};

export default PredictionCard; 