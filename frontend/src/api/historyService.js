import axios from 'axios';
import { API_BASE_URL } from '../config/constants';

// 模拟数据，实际项目中应删除
const MOCK_TOPICS = [
    { id: 'ai', name: '人工智能' },
    { id: 'blockchain', name: '区块链' },
    { id: 'metaverse', name: '元宇宙' },
    { id: 'biotech', name: '生物技术' },
    { id: 'quantum', name: '量子计算' },
    { id: 'iot', name: '物联网' }
];

const MOCK_ENTITIES = [
    { id: 'entity-1', name: 'GPT-4', type: 'TECHNOLOGY' },
    { id: 'entity-2', name: '元宇宙计划', type: 'PROJECT' },
    { id: 'entity-3', name: '比特币', type: 'CONCEPT' },
    { id: 'entity-4', name: '生物芯片', type: 'PRODUCT' },
    { id: 'entity-5', name: '谷歌', type: 'ORGANIZATION' },
    { id: 'entity-6', name: '特斯拉', type: 'ORGANIZATION' }
];

// 预先生成历史数据
const generateHistoryData = (count) => {
    return Array(count).fill(null).map((_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - Math.floor(Math.random() * 365));

        const randomTopics = [];
        const topicCount = Math.floor(Math.random() * 3) + 1;
        for (let j = 0; j < topicCount; j++) {
            const topic = MOCK_TOPICS[Math.floor(Math.random() * MOCK_TOPICS.length)].name;
            if (!randomTopics.includes(topic)) {
                randomTopics.push(topic);
            }
        }

        // 模拟实体
        const randomEntities = [];
        const entityCount = Math.floor(Math.random() * 4);
        for (let j = 0; j < entityCount; j++) {
            const entity = {
                text: MOCK_ENTITIES[Math.floor(Math.random() * MOCK_ENTITIES.length)].name,
                type: ['TECHNOLOGY', 'PRODUCT', 'ORGANIZATION', 'PERSON', 'CONCEPT'][Math.floor(Math.random() * 5)]
            };
            randomEntities.push(entity);
        }

        // 模拟关系
        const relationships = [];
        if (Math.random() > 0.7 && i > 0) {
            const targetId = `history-${Math.floor(Math.random() * i)}`;
            relationships.push({
                target_id: targetId,
                target_title: `历史内容-${targetId.split('-')[1]}`,
                relation_type: ['CAUSES', 'FOLLOWS', 'CONTRADICTS', 'SIMILAR_TO', 'REFERENCES'][Math.floor(Math.random() * 5)]
            });
        }

        return {
            id: `history-${i}`,
            title: `历史内容-${i}`,
            platform: ['微信', '微博', '知乎', 'B站'][Math.floor(Math.random() * 4)],
            publish_time: date.toISOString(),
            formatted_time: date.toLocaleDateString('zh-CN'),
            summary: `这是一段关于主题${randomTopics.join('、')}的历史内容摘要，包含了相关的背景和观点。`,
            topics: randomTopics,
            entities: randomEntities,
            relationships: relationships,
            sentiment: {
                score: Math.random() * 2 - 1 // -1到1之间
            }
        };
    });
};

const MOCK_HISTORY_DATA = generateHistoryData(50);

export const fetchTopics = async () => {
    try {
        // 实际API调用
        // const response = await axios.get(`${API_BASE_URL}/api/topics`);
        // return response.data;

        // 模拟数据
        return MOCK_TOPICS;
    } catch (error) {
        console.error('Error fetching topics:', error);
        throw error;
    }
};

export const fetchEntities = async () => {
    try {
        // 实际API调用
        // const response = await axios.get(`${API_BASE_URL}/api/entities`);
        // return response.data;

        // 模拟数据
        return MOCK_ENTITIES;
    } catch (error) {
        console.error('Error fetching entities:', error);
        throw error;
    }
};

export const fetchHistoryData = async (params) => {
    try {
        // 实际API调用
        // const response = await axios.get(`${API_BASE_URL}/api/history`, { params });
        // return response.data;

        // 模拟数据
        console.log('Fetching history data with params:', params);

        // 模拟筛选
        let filteredData = [...MOCK_HISTORY_DATA];

        if (params.mode === 'topic' && params.items.length > 0) {
            filteredData = filteredData.filter(item =>
                item.topics.some(topic =>
                    params.items.includes(MOCK_TOPICS.find(t => t.name === topic)?.id)
                )
            );
        } else if (params.mode === 'title' && params.items.length > 0) {
            filteredData = filteredData.filter(item =>
                params.items.some(entityId =>
                    item.entities.some(e => e.text === MOCK_ENTITIES.find(ent => ent.id === entityId)?.name)
                )
            );
        }

        return filteredData;
    } catch (error) {
        console.error('Error fetching history data:', error);
        throw error;
    }
}; 