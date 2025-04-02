import axios from 'axios';
import { API_BASE_URL } from '../config/constants';

// 模拟用户配置
const MOCK_USER_CONFIG = {
    user_info: {
        id: 'user-1',
        username: '演示用户',
        avatar: 'https://joeschmoe.io/api/v1/random',
        email: 'demo@example.com',
        created_at: '2023-01-01T00:00:00Z'
    },
    notification_settings: {
        email_notifications: true,
        wechat_notifications: true,
        daily_digest: true,
        weekly_summary: true,
        breaking_news: true,
        push_notification_time: "18:00",
        notification_threshold: 7
    },
    content_preferences: {
        preferred_platforms: ['微信', '知乎'],
        preferred_topics: ['人工智能', '区块链'],
        content_language: 'zh-CN',
        display_mode: 'dark',
        content_density: 'compact'
    },
    access_settings: {
        api_token: 'mock-api-token-12345',
        api_access: true,
        data_sharing: false,
        third_party_integration: false
    }
};

export const fetchUserConfig = async () => {
    try {
        // 实际API调用
        // const response = await axios.get(`${API_BASE_URL}/api/user/config`);
        // return response.data;

        // 模拟数据
        return MOCK_USER_CONFIG;
    } catch (error) {
        console.error('Error fetching user config:', error);
        throw error;
    }
};

export const updateUserConfig = async (config) => {
    try {
        // 实际API调用
        // const response = await axios.put(`${API_BASE_URL}/api/user/config`, config);
        // return response.data;

        // 模拟数据
        console.log('Updating user config:', config);
        return {
            ...MOCK_USER_CONFIG,
            ...config,
            updated_at: new Date().toISOString()
        };
    } catch (error) {
        console.error('Error updating user config:', error);
        throw error;
    }
};

export const getUserHistory = async (type = 'viewed') => {
    try {
        // 实际API调用
        // const response = await axios.get(`${API_BASE_URL}/api/user/history`, {
        //   params: { type }
        // });
        // return response.data;

        // 模拟数据
        const count = Math.floor(Math.random() * 20) + 5;
        const historyItems = Array(count).fill(null).map((_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - Math.floor(Math.random() * 30));

            return {
                id: `history-${type}-${i}`,
                content_id: `content-${i}`,
                title: `${type === 'viewed' ? '查看' : type === 'favorited' ? '收藏' : '分享'}的内容-${i}`,
                action_time: date.toISOString(),
                formatted_time: date.toLocaleDateString('zh-CN') + ' ' + date.toLocaleTimeString('zh-CN'),
                platform: ['微信', '微博', '知乎', 'B站'][Math.floor(Math.random() * 4)]
            };
        });

        return historyItems;
    } catch (error) {
        console.error('Error fetching user history:', error);
        throw error;
    }
}; 