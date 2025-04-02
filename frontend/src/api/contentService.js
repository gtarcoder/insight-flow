import axios from 'axios';
import { API_BASE_URL } from '../config/constants';

// 模拟数据生成
const generateContentDetail = (id) => {
    const now = new Date();
    now.setDate(now.getDate() - Math.floor(Math.random() * 30));

    const topics = ['人工智能', '区块链', '元宇宙', '生物技术'];
    const randomTopics = topics.slice(0, Math.floor(Math.random() * 3) + 1);

    const entities = [
        { text: 'GPT-4', type: 'TECHNOLOGY' },
        { text: '元宇宙计划', type: 'PROJECT' },
        { text: '比特币', type: 'CONCEPT' },
        { text: '生物芯片', type: 'PRODUCT' },
        { text: '谷歌', type: 'ORGANIZATION' },
        { text: '特斯拉', type: 'ORGANIZATION' }
    ];
    const randomEntities = entities.slice(0, Math.floor(Math.random() * 4) + 1);

    // 相关内容
    const relatedContents = Array(Math.floor(Math.random() * 3) + 2).fill(null).map((_, i) => ({
        id: `related-${i}`,
        title: `相关内容-${i}`,
        platform: ['微信', '微博', '知乎', 'B站'][Math.floor(Math.random() * 4)],
        formatted_time: `2023-0${Math.floor(Math.random() * 9) + 1}-${Math.floor(Math.random() * 28) + 1}`,
        summary: `这是一段相关内容的摘要，描述了与主内容相关的信息和观点。`,
        relation_type: ['CAUSES', 'FOLLOWS', 'CONTRADICTS', 'SIMILAR_TO', 'REFERENCES'][Math.floor(Math.random() * 5)]
    }));

    return {
        id,
        title: `详细内容-${id.split('-')[1] || id}`,
        original_content: '这是原始内容，通常是从网络爬取的未处理文本。',
        processed_text: `这是处理后的内容，采用了标准格式和结构。\n\n文章主要讨论了${randomTopics.join('、')}等领域的最新发展，分析了当前趋势和未来方向。\n\n第一部分探讨了技术现状，第二部分分析了应用场景，第三部分预测了未来发展。\n\n结论部分指出，这些技术将在未来几年内进一步融合，创造更多创新应用。`,
        summary: `本文总结了${randomTopics.join('、')}等领域的最新发展趋势和未来应用前景。`,
        source: ['微信公众号-前沿科技', '知乎专栏', 'B站UP主', '微博热文'][Math.floor(Math.random() * 4)],
        platform: ['微信', '微博', '知乎', 'B站'][Math.floor(Math.random() * 4)],
        publish_time: now.toISOString(),
        formatted_time: now.toLocaleDateString('zh-CN') + ' ' + now.toLocaleTimeString('zh-CN'),
        topics: randomTopics,
        keywords: ['技术趋势', '创新应用', '未来展望', '发展方向'].slice(0, Math.floor(Math.random() * 3) + 1),
        sentiment: {
            score: Math.random() * 2 - 1, // -1到1之间
            label: Math.random() > 0.3 ? 'positive' : Math.random() > 0.6 ? 'negative' : 'neutral',
            emotions: {
                joy: Math.random(),
                trust: Math.random(),
                fear: Math.random(),
                surprise: Math.random()
            }
        },
        entities: randomEntities,
        metadata: {
            word_count: Math.floor(Math.random() * 1500) + 500,
            read_time_minutes: Math.floor(Math.random() * 10) + 3,
            author: ['张三', '李四', '王五', '赵六'][Math.floor(Math.random() * 4)],
            original_url: `https://example.com/article/${id}`,
            image_urls: Math.random() > 0.3 ? [`https://picsum.photos/id/${Math.floor(Math.random() * 100)}/600/400`] : []
        },
        value_assessment: {
            overall_score: Math.random() * 10,
            relevance: Math.random() * 10,
            timeliness: Math.random() * 10,
            importance: Math.random() * 10,
            uniqueness: Math.random() * 10
        },
        user_interactions: {
            view_count: Math.floor(Math.random() * 100),
            like_count: Math.floor(Math.random() * 50),
            dislike_count: Math.floor(Math.random() * 10),
            comment_count: Math.floor(Math.random() * 30),
            is_favorited: Math.random() > 0.7,
            is_shared: Math.random() > 0.8
        },
        related_contents: relatedContents
    };
};

export const fetchContentDetail = async (id) => {
    try {
        // 实际API调用
        // const response = await axios.get(`${API_BASE_URL}/api/contents/${id}`);
        // return response.data;

        // 模拟数据
        console.log('Fetching content detail for id:', id);
        return generateContentDetail(id);
    } catch (error) {
        console.error('Error fetching content detail:', error);
        throw error;
    }
};

export const likeContent = async (id) => {
    try {
        // 实际API调用
        // await axios.post(`${API_BASE_URL}/api/contents/${id}/like`);

        // 模拟成功响应
        console.log('Liked content:', id);
        return true;
    } catch (error) {
        console.error('Error liking content:', error);
        throw error;
    }
};

export const dislikeContent = async (id) => {
    try {
        // 实际API调用
        // await axios.post(`${API_BASE_URL}/api/contents/${id}/dislike`);

        // 模拟成功响应
        console.log('Disliked content:', id);
        return true;
    } catch (error) {
        console.error('Error disliking content:', error);
        throw error;
    }
};

export const favoriteContent = async (id, isFavorited) => {
    try {
        // 实际API调用
        // if (isFavorited) {
        //   await axios.post(`${API_BASE_URL}/api/contents/${id}/favorite`);
        // } else {
        //   await axios.delete(`${API_BASE_URL}/api/contents/${id}/favorite`);
        // }

        // 模拟成功响应
        console.log(isFavorited ? 'Favorited content:' : 'Unfavorited content:', id);
        return true;
    } catch (error) {
        console.error('Error updating favorite status:', error);
        throw error;
    }
}; 