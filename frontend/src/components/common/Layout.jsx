import React, { useState, useEffect } from 'react';
import { Layout as AntLayout, Menu, Button, Drawer, Avatar, Badge, Input, Dropdown, Space } from 'antd';
import {
    MenuOutlined,
    HomeOutlined,
    HistoryOutlined,
    RiseOutlined,
    SearchOutlined,
    SettingOutlined,
    BellOutlined,
    UserOutlined,
    LogoutOutlined
} from '@ant-design/icons';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { APP_NAME } from '../../config/constants';

const { Header, Sider, Content } = AntLayout;
const { Search } = Input;

const Layout = ({ children }) => {
    const [collapsed, setCollapsed] = useState(false);
    const [mobileView, setMobileView] = useState(false);
    const [drawerVisible, setDrawerVisible] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const router = useRouter();

    // 响应式布局
    useEffect(() => {
        const handleResize = () => {
            setMobileView(window.innerWidth < 768);
            if (window.innerWidth >= 768) {
                setDrawerVisible(false);
            }
        };

        handleResize();
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    // 模拟获取通知
    useEffect(() => {
        // 这里可以替换为实际的通知API调用
        setNotifications([
            { id: 1, title: '系统更新通知', read: false },
            { id: 2, title: '您关注的主题有新内容', read: false },
            { id: 3, title: '每日内容摘要已生成', read: true }
        ]);
    }, []);

    const handleSearch = (value) => {
        if (value.trim()) {
            router.push(`/search?q=${encodeURIComponent(value)}`);
        }
    };

    const notificationMenu = (
        <Menu>
            {notifications.length > 0 ? (
                <>
                    {notifications.map(item => (
                        <Menu.Item key={item.id} className={item.read ? '' : 'font-bold'}>
                            {item.title}
                        </Menu.Item>
                    ))}
                    <Menu.Divider />
                    <Menu.Item>
                        <a className="text-center block">查看所有通知</a>
                    </Menu.Item>
                </>
            ) : (
                <Menu.Item>暂无通知</Menu.Item>
            )}
        </Menu>
    );

    const userMenu = (
        <Menu>
            <Menu.Item key="profile" icon={<UserOutlined />}>
                个人资料
            </Menu.Item>
            <Menu.Item key="settings" icon={<SettingOutlined />}>
                <Link href="/settings">
                    <a>设置</a>
                </Link>
            </Menu.Item>
            <Menu.Divider />
            <Menu.Item key="logout" icon={<LogoutOutlined />}>
                退出登录
            </Menu.Item>
        </Menu>
    );

    const menuItems = [
        {
            key: '/',
            icon: <HomeOutlined />,
            label: <Link href="/"><a>最新资讯</a></Link>
        },
        {
            key: '/history-timeline',
            icon: <HistoryOutlined />,
            label: <Link href="/history-timeline"><a>历史脉络</a></Link>
        },
        {
            key: '/future-prediction',
            icon: <RiseOutlined />,
            label: <Link href="/future-prediction"><a>未来预测</a></Link>
        },
        {
            key: '/search',
            icon: <SearchOutlined />,
            label: <Link href="/search"><a>内容搜索</a></Link>
        },
        {
            key: '/settings',
            icon: <SettingOutlined />,
            label: <Link href="/settings"><a>系统设置</a></Link>
        }
    ];

    const sideMenu = (
        <Menu
            theme="dark"
            mode="inline"
            selectedKeys={[router.pathname]}
            items={menuItems}
        />
    );

    return (
        <AntLayout className="min-h-screen">
            {!mobileView && (
                <Sider
                    collapsible
                    collapsed={collapsed}
                    onCollapse={setCollapsed}
                    theme="dark"
                >
                    <div className="h-16 flex items-center justify-center bg-gray-900 text-white">
                        {!collapsed && <h1 className="text-lg font-bold">{APP_NAME}</h1>}
                    </div>
                    {sideMenu}
                </Sider>
            )}

            <AntLayout>
                <Header className="bg-white p-0 flex items-center justify-between shadow-sm">
                    <div className="flex items-center">
                        {mobileView && (
                            <Button
                                type="text"
                                icon={<MenuOutlined />}
                                onClick={() => setDrawerVisible(true)}
                                className="h-16 ml-4"
                            />
                        )}
                        {mobileView && (
                            <h1 className="text-lg font-bold mx-4">{APP_NAME}</h1>
                        )}
                    </div>

                    <div className="flex items-center mx-4">
                        <Search
                            placeholder="搜索内容..."
                            onSearch={handleSearch}
                            className="mr-4"
                            style={{ width: mobileView ? 120 : 250 }}
                        />

                        <Dropdown overlay={notificationMenu} trigger={['click']} arrow>
                            <Badge count={notifications.filter(n => !n.read).length} size="small">
                                <Button type="text" icon={<BellOutlined />} className="mr-2" />
                            </Badge>
                        </Dropdown>

                        <Dropdown overlay={userMenu} trigger={['click']} arrow>
                            <Space className="cursor-pointer">
                                <Avatar icon={<UserOutlined />} />
                                {!mobileView && <span>演示用户</span>}
                            </Space>
                        </Dropdown>
                    </div>
                </Header>

                <Content className="bg-gray-50 m-2 overflow-auto">
                    {children}
                </Content>
            </AntLayout>

            {mobileView && (
                <Drawer
                    title={APP_NAME}
                    placement="left"
                    onClose={() => setDrawerVisible(false)}
                    visible={drawerVisible}
                    bodyStyle={{ padding: 0 }}
                >
                    {sideMenu}
                </Drawer>
            )}
        </AntLayout>
    );
};

export default Layout; 