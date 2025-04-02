import axios from 'axios';
import { API_BASE_URL } from '../config/constants';

// 模拟过滤选项数据
const MOCK_FILTER_OPTIONS = {
    platforms: [
        { id: 'wechat', name: '微信' },
        { id: 'weibo', name: '微博' },
        { id: 'zhihu', name: '知乎' },
        { id: 'bilibili', name: 'B站' },
        { id: 'toutiao', name: '头条' },
        { id: 'douyin', name: '抖音' }
    ],
    topics: [
        { id: 'ai', name: '人工智能' },
        { id: 'blockchain', name: '区块链' },
        { id: 'metaverse', name: '元宇宙' },
        { id: 'biotech', name: '生物技术' },
        { id: 'cloud', name: '云计算' },
        { id: 'iot', name: '物联网' },
        { id: 'cybersecurity', name: '网络安全' },
        { id: 'robotics', name: '机器人' },
        { id: 'ev', name: '电动汽车' },
        { id: 'quantum', name: '量子计算' }
    ],
    time_ranges: [
        { id: 'day', name: '24小时内' },
        { id: 'week', name: '一周内' },
        { id: 'month', name: '一个月内' },
        { id: 'quarter', name: '三个月内' },
        { id: 'year', name: '一年内' }
    ]
};

export const fetchFilterOptions = async () => {
    try {
        // 实际API调用
        // const response = await axios.get(`${API_BASE_URL}/api/filter-options`);
        // return response.data;

        // 模拟数据
        return MOCK_FILTER_OPTIONS;
    } catch (error) {
        console.error('Error fetching filter options:', error);
        throw error;
    }
}; 