import axios from 'axios';
import { API_BASE_URL } from '../config/constants';

// 模拟搜索数据生成
const generateSearchResults = (term, type, page = 1, pageSize = 10) => {
    // 为不同类型生成不同的结果
    switch (type) {
        case 'content':
            return generateContentResults(term, page, pageSize);
        case 'topic':
            return generateTopicResults(term, page, pageSize);
        case 'entity':
            return generateEntityResults(term, page, pageSize);
        default:
            return { data: [], total: 0 };
    }
};

// 生成内容搜索结果
const generateContentResults = (term, page, pageSize) => {
    const count = Math.floor(Math.random() * 50) + 10;
    const results = Array(Math.min(count, pageSize)).fill(null).map((_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - Math.floor(Math.random() * 90));

        return {
            id: `content-${i}-${page}`,
            title: `包含"${term}"的内容-${i}`,
            summary: `这是一段包含搜索词"${term}"的摘要，用于展示搜索结果的相关性和内容摘要。这段文字只是演示用，实际内容会基于搜索词返回相关内容。`,
            platform: ['微信', '微博', '知乎', 'B站'][Math.floor(Math.random() * 4)],
            formatted_time: date.toLocaleDateString('zh-CN'),
            topics: ['人工智能', '区块链', '元宇宙', '生物技术'].slice(0, Math.floor(Math.random() * 3) + 1),
            highlights: [`这是一段包含<em>${term}</em>的高亮文本`, `另一个<em>${term}</em>的上下文`],
            relevance_score: Math.random() * 100
        };
    });

    return {
        data: results,
        total: count
    };
};

// 生成主题搜索结果
const generateTopicResults = (term, page, pageSize) => {
    const count = Math.floor(Math.random() * 20) + 5;
    const results = Array(Math.min(count, pageSize)).fill(null).map((_, i) => {
        return {
            id: `topic-${i}`,
            name: `${term}相关主题-${i}`,
            description: `这是关于${term}相关主题的描述，包含了该主题的基本信息和相关内容。`,
            content_count: Math.floor(Math.random() * 1000) + 100,
            popularity_score: Math.random() * 100,
            related_topics: ['人工智能', '区块链', '元宇宙', '生物技术'].slice(0, Math.floor(Math.random() * 3) + 1)
        };
    });

    return {
        data: results,
        total: count
    };
};

// 生成实体搜索结果
const generateEntityResults = (term, page, pageSize) => {
    const count = Math.floor(Math.random() * 30) + 8;
    const results = Array(Math.min(count, pageSize)).fill(null).map((_, i) => {
        return {
            id: `entity-${i}`,
            name: `${term}相关实体-${i}`,
            type: ['TECHNOLOGY', 'PRODUCT', 'ORGANIZATION', 'PERSON', 'CONCEPT'][Math.floor(Math.random() * 5)],
            description: `这是关于${term}相关实体的描述，包含该实体的基本信息及其与${term}的关联。`,
            mentions_count: Math.floor(Math.random() * 500) + 50,
            related_entities: [
                { name: '相关实体A', type: 'TECHNOLOGY' },
                { name: '相关实体B', type: 'ORGANIZATION' }
            ].slice(0, Math.floor(Math.random() * 2) + 1)
        };
    });

    return {
        data: results,
        total: count
    };
};

export const searchContent = async (term, type = 'content', page = 1, pageSize = 10) => {
    try {
        // 实际API调用
        // const response = await axios.get(`${API_BASE_URL}/api/search`, {
        //   params: { term, type, page, pageSize }
        // });
        // return response.data;

        // 模拟数据
        console.log(`Searching for "${term}" in ${type}, page ${page}`);

        // 如果搜索词为空，则返回空结果
        if (!term.trim()) {
            return { data: [], total: 0 };
        }

        return generateSearchResults(term, type, page, pageSize);
    } catch (error) {
        console.error('Error searching content:', error);
        throw error;
    }
}; 