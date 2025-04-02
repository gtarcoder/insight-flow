import axios from 'axios';
import { API_BASE_URL } from '../config/constants';

// 模拟数据，实际项目中应删除
const MOCK_DATA = {
    data: Array(10).fill(null).map((_, i) => ({
        id: `content-${i}`,
        title: `这是一个示例新闻标题-${i}`,
        summary: '这是一段示例摘要文本，描述了文章的主要内容和要点。这只是一个演示用的占位符，实际应用中会显示真实的摘要内容。',
        platform: ['微信', '微博', '知乎', 'B站'][Math.floor(Math.random() * 4)],
        formatted_time: `2023-0${Math.floor(Math.random() * 9) + 1}-${Math.floor(Math.random() * 28) + 1} 12:${Math.floor(Math.random() * 59) + 1}:00`,
        topics: ['人工智能', '区块链', '元宇宙', '生物技术'].slice(0, Math.floor(Math.random() * 3) + 1),
        value_assessment: {
            overall_score: Math.random() * 10,
            relevance: Math.random() * 10,
            timeliness: Math.random() * 10,
            importance: Math.random() * 10,
            uniqueness: Math.random() * 10
        },
        metadata: {
            image_urls: Math.random() > 0.3 ? [`https://picsum.photos/id/${i + 10}/600/400`] : []
        },
        user_interactions: {
            view_count: Math.floor(Math.random() * 100),
            is_favorited: Math.random() > 0.7
        },
        sentiment: {
            score: Math.random() * 2 - 1  // -1到1之间
        }
    })),
    total: 100
};

export const fetchLatestNews = async (params) => {
    try {
        // 实际API调用
        // const response = await axios.get(`${API_BASE_URL}/api/contents/latest`, { params });
        // return response.data;

        // 模拟数据
        console.log('Fetching latest news with params:', params);

        // 模拟筛选
        let filteredData = [...MOCK_DATA.data];

        if (params.platforms && params.platforms.length > 0) {
            filteredData = filteredData.filter(item => params.platforms.includes(item.platform));
        }

        if (params.topics && params.topics.length > 0) {
            filteredData = filteredData.filter(item =>
                item.topics.some(topic => params.topics.includes(topic))
            );
        }

        if (params.minScore) {
            filteredData = filteredData.filter(item =>
                item.value_assessment.overall_score >= params.minScore
            );
        }

        // 模拟分页
        const startIndex = (params.page - 1) * params.pageSize;
        const endIndex = startIndex + params.pageSize;
        const paginatedData = filteredData.slice(startIndex, endIndex);

        return {
            data: paginatedData,
            total: filteredData.length
        };
    } catch (error) {
        console.error('Error fetching latest news:', error);
        throw error;
    }
}; 