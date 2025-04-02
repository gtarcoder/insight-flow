import React, { useState, useEffect } from 'react';
import {
    Card, Tabs, Form, Switch, Select, Input, Button,
    TimePicker, Slider, Divider, Typography, Tag, message
} from 'antd';
import {
    BellOutlined, UserOutlined,
    FileTextOutlined, ApiOutlined,
    SaveOutlined
} from '@ant-design/icons';
import Layout from '../components/common/Layout';
import { fetchUserConfig, updateUserConfig } from '../api/userService';
import { fetchFilterOptions } from '../api/filterService';

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;

const SettingsPage = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [userConfig, setUserConfig] = useState(null);
    const [filterOptions, setFilterOptions] = useState({
        platforms: [],
        topics: []
    });

    const [notificationForm] = Form.useForm();
    const [contentForm] = Form.useForm();
    const [accessForm] = Form.useForm();

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [configData, optionsData] = await Promise.all([
                fetchUserConfig(),
                fetchFilterOptions()
            ]);

            setUserConfig(configData);
            setFilterOptions(optionsData);

            // 设置表单初始值
            notificationForm.setFieldsValue(configData.notification_settings);
            contentForm.setFieldsValue(configData.content_preferences);
            accessForm.setFieldsValue(configData.access_settings);
        } catch (error) {
            console.error('Failed to load settings data:', error);
            message.error('加载设置数据失败');
        } finally {
            setLoading(false);
        }
    };

    const handleNotificationFormSubmit = async (values) => {
        saveConfig('notification_settings', values);
    };

    const handleContentFormSubmit = async (values) => {
        saveConfig('content_preferences', values);
    };

    const handleAccessFormSubmit = async (values) => {
        saveConfig('access_settings', values);
    };

    const saveConfig = async (key, values) => {
        setSaving(true);
        try {
            const updatedConfig = {
                ...userConfig,
                [key]: values
            };

            await updateUserConfig(updatedConfig);
            setUserConfig(updatedConfig);
            message.success('设置已保存');
        } catch (error) {
            console.error('Failed to save settings:', error);
            message.error('保存设置失败');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <Layout>
                <div className="max-w-5xl mx-auto p-4">
                    <Card loading={true} />
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="max-w-5xl mx-auto p-4">
                <Title level={2}>系统设置</Title>
                <Text type="secondary" className="mb-6 block">
                    管理个人信息助理的通知、内容偏好和访问设置
                </Text>

                <Tabs defaultActiveKey="notifications">
                    <TabPane
                        tab={<span><BellOutlined />通知设置</span>}
                        key="notifications"
                    >
                        <Card>
                            <Form
                                form={notificationForm}
                                layout="vertical"
                                onFinish={handleNotificationFormSubmit}
                            >
                                <Form.Item
                                    name="email_notifications"
                                    label="邮件通知"
                                    valuePropName="checked"
                                >
                                    <Switch />
                                </Form.Item>

                                <Form.Item
                                    name="wechat_notifications"
                                    label="微信推送"
                                    valuePropName="checked"
                                >
                                    <Switch />
                                </Form.Item>

                                <Divider />

                                <Form.Item
                                    name="daily_digest"
                                    label="每日摘要"
                                    valuePropName="checked"
                                    extra="每天发送一次包含重要信息的摘要"
                                >
                                    <Switch />
                                </Form.Item>

                                <Form.Item
                                    name="weekly_summary"
                                    label="每周总结"
                                    valuePropName="checked"
                                    extra="每周发送一次主题演变和预测分析"
                                >
                                    <Switch />
                                </Form.Item>

                                <Form.Item
                                    name="breaking_news"
                                    label="重大新闻提醒"
                                    valuePropName="checked"
                                    extra="重要内容实时推送"
                                >
                                    <Switch />
                                </Form.Item>

                                <Form.Item
                                    name="push_notification_time"
                                    label="推送时间"
                                    extra="设置每日摘要推送时间"
                                >
                                    <TimePicker format="HH:mm" />
                                </Form.Item>

                                <Form.Item
                                    name="notification_threshold"
                                    label="内容重要性阈值"
                                    extra="仅推送重要性分数高于此值的内容"
                                >
                                    <Slider
                                        min={0}
                                        max={10}
                                        step={0.5}
                                        marks={{
                                            0: '0',
                                            5: '5',
                                            10: '10'
                                        }}
                                    />
                                </Form.Item>

                                <Form.Item>
                                    <Button
                                        type="primary"
                                        htmlType="submit"
                                        loading={saving}
                                        icon={<SaveOutlined />}
                                    >
                                        保存通知设置
                                    </Button>
                                </Form.Item>
                            </Form>
                        </Card>
                    </TabPane>

                    <TabPane
                        tab={<span><FileTextOutlined />内容偏好</span>}
                        key="content"
                    >
                        <Card>
                            <Form
                                form={contentForm}
                                layout="vertical"
                                onFinish={handleContentFormSubmit}
                            >
                                <Form.Item
                                    name="preferred_platforms"
                                    label="偏好平台"
                                    extra="选择您更关注的内容平台"
                                >
                                    <Select
                                        mode="multiple"
                                        placeholder="选择平台"
                                        style={{ width: '100%' }}
                                    >
                                        {filterOptions.platforms.map(platform => (
                                            <Option key={platform.id} value={platform.name}>
                                                {platform.name}
                                            </Option>
                                        ))}
                                    </Select>
                                </Form.Item>

                                <Form.Item
                                    name="preferred_topics"
                                    label="偏好主题"
                                    extra="选择您更关注的内容主题"
                                >
                                    <Select
                                        mode="multiple"
                                        placeholder="选择主题"
                                        style={{ width: '100%' }}
                                    >
                                        {filterOptions.topics.map(topic => (
                                            <Option key={topic.id} value={topic.name}>
                                                {topic.name}
                                            </Option>
                                        ))}
                                    </Select>
                                </Form.Item>

                                <Form.Item
                                    name="content_language"
                                    label="内容语言"
                                >
                                    <Select style={{ width: '100%' }}>
                                        <Option value="zh-CN">简体中文</Option>
                                        <Option value="en-US">英文</Option>
                                        <Option value="zh-TW">繁体中文</Option>
                                    </Select>
                                </Form.Item>

                                <Form.Item
                                    name="display_mode"
                                    label="显示模式"
                                >
                                    <Select style={{ width: '100%' }}>
                                        <Option value="light">浅色</Option>
                                        <Option value="dark">深色</Option>
                                        <Option value="system">跟随系统</Option>
                                    </Select>
                                </Form.Item>

                                <Form.Item
                                    name="content_density"
                                    label="内容密度"
                                >
                                    <Select style={{ width: '100%' }}>
                                        <Option value="compact">紧凑</Option>
                                        <Option value="standard">标准</Option>
                                        <Option value="comfortable">宽松</Option>
                                    </Select>
                                </Form.Item>

                                <Form.Item>
                                    <Button
                                        type="primary"
                                        htmlType="submit"
                                        loading={saving}
                                        icon={<SaveOutlined />}
                                    >
                                        保存内容设置
                                    </Button>
                                </Form.Item>
                            </Form>
                        </Card>
                    </TabPane>

                    <TabPane
                        tab={<span><ApiOutlined />访问设置</span>}
                        key="access"
                    >
                        <Card>
                            <Form
                                form={accessForm}
                                layout="vertical"
                                onFinish={handleAccessFormSubmit}
                            >
                                <Form.Item
                                    name="api_access"
                                    label="启用API访问"
                                    valuePropName="checked"
                                    extra="允许通过API访问您的信息助理"
                                >
                                    <Switch />
                                </Form.Item>

                                <Form.Item
                                    name="api_token"
                                    label="API令牌"
                                >
                                    <Input.Password readOnly />
                                </Form.Item>

                                <Form.Item
                                    name="data_sharing"
                                    label="数据共享"
                                    valuePropName="checked"
                                    extra="允许匿名分享数据用于改进服务"
                                >
                                    <Switch />
                                </Form.Item>

                                <Form.Item
                                    name="third_party_integration"
                                    label="第三方集成"
                                    valuePropName="checked"
                                    extra="允许与第三方服务集成"
                                >
                                    <Switch />
                                </Form.Item>

                                <Form.Item>
                                    <Button
                                        type="primary"
                                        htmlType="submit"
                                        loading={saving}
                                        icon={<SaveOutlined />}
                                    >
                                        保存访问设置
                                    </Button>
                                </Form.Item>
                            </Form>
                        </Card>
                    </TabPane>

                    <TabPane
                        tab={<span><UserOutlined />个人资料</span>}
                        key="profile"
                    >
                        <Card>
                            <div className="mb-4">
                                <Title level={4}>{userConfig.user_info.username}</Title>
                                <Text type="secondary">{userConfig.user_info.email}</Text>
                            </div>

                            <div className="mb-4">
                                <Text strong>用户ID:</Text>
                                <Text className="ml-2">{userConfig.user_info.id}</Text>
                            </div>

                            <div className="mb-4">
                                <Text strong>注册时间:</Text>
                                <Text className="ml-2">
                                    {new Date(userConfig.user_info.created_at).toLocaleDateString('zh-CN')}
                                </Text>
                            </div>

                            <div className="mt-6">
                                <Button type="primary">修改个人资料</Button>
                                <Button className="ml-2">修改密码</Button>
                            </div>
                        </Card>
                    </TabPane>
                </Tabs>
            </div>
        </Layout>
    );
};

export default SettingsPage; 