import axios from 'axios';
import { API_BASE_URL } from '../config/constants';

// 模拟预测数据生成器
const generatePredictions = (topic) => {
    const categories = {
        'ai': ['自然语言处理', '计算机视觉', '强化学习', '人机交互'],
        'blockchain': ['数字货币', '智能合约', '去中心化金融', '区块链治理'],
        'metaverse': ['虚拟现实', '增强现实', '虚拟社交', '数字资产'],
        'biotech': ['基因编辑', '合成生物学', '生物信息学', '再生医学']
    };

    const topicCategories = categories[topic] || ['技术趋势', '应用场景', '市场变化', '政策影响'];

    return Array(6).fill(null).map((_, i) => {
        const probability = 0.4 + Math.random() * 0.5; // 40%-90%
        const confidence = 0.3 + Math.random() * 0.6; // 30%-90%
        const trend = Math.random() > 0.3 ? 0.1 + Math.random() * 0.5 : -0.1 - Math.random() * 0.3; // 上升或下降趋势

        return {
            id: `${topic}-pred-${i}`,
            title: `${topicCategories[i % topicCategories.length]}将迎来重大变革`,
            description: `基于历史数据分析和当前趋势，预测未来一年内${topicCategories[i % topicCategories.length]}领域将出现新的发展方向，可能对行业产生重大影响。`,
            category: topicCategories[i % topicCategories.length],
            timeframe: ['短期(1-3个月)', '中期(3-6个月)', '长期(6-12个月)'][Math.floor(Math.random() * 3)],
            probability,
            confidence,
            trend,
            impact_level: ['低', '中', '高', '极高'][Math.floor(probability * 3.8)]
        };
    });
};

// 模拟趋势数据生成器
const generateTrendData = (topic, timeRange) => {
    const now = new Date();
    const historyPoints = timeRange === 'week' ? 7 : timeRange === 'month' ? 30 : timeRange === 'quarter' ? 90 : 365;
    const futurePoints = historyPoints / 2;

    // 历史数据点
    const historical = [];
    for (let i = historyPoints; i > 0; i--) {
        const date = new Date();
        date.setDate(now.getDate() - i);

        // 基础值加上一些随机波动
        const baseValue = 100 + i * 0.5;
        const value = baseValue + (Math.random() * 20 - 10);

        historical.push([date.getTime(), value]);
    }

    // 决定趋势方向
    const trendDirection = Math.random() > 0.4 ? 1 : -1;
    const trendStrength = 0.2 + Math.random() * 1.5;

    // 预测数据点
    const predicted = [];
    const optimistic = [];
    const pessimistic = [];

    const lastHistoricalValue = historical[historical.length - 1][1];

    for (let i = 1; i <= futurePoints; i++) {
        const date = new Date();
        date.setDate(now.getDate() + i);

        // 预测值有一定趋势
        const predictedValue = lastHistoricalValue + (i * trendDirection * trendStrength);

        // 乐观和悲观估计
        const optimisticValue = predictedValue * (1 + (0.05 + Math.random() * 0.1));
        const pessimisticValue = predictedValue * (1 - (0.05 + Math.random() * 0.15));

        predicted.push([date.getTime(), predictedValue]);
        optimistic.push([date.getTime(), optimisticValue]);
        pessimistic.push([date.getTime(), pessimisticValue]);
    }

    // 重要事件标记
    const markers = [
        {
            name: '关键点',
            time: predicted[Math.floor(futurePoints / 3)][0],
            value: predicted[Math.floor(futurePoints / 3)][1],
            color: '#ff4500'
        }
    ];

    return {
        title: `${topic}领域热度趋势预测`,
        description: '基于历史数据分析与预测模型生成的未来趋势预测',
        yAxisName: '热度指数',
        historical,
        predicted,
        optimistic,
        pessimistic,
        markers
    };
};

// 模拟关系数据生成器
const generateRelationshipData = (topic) => {
    const nodes = [];
    const links = [];

    // 中心节点
    nodes.push({
        name: TOPIC_MAP[topic] || topic,
        symbolSize: 60,
        trend: 0.5,
        itemStyle: {
            color: '#1890ff'
        }
    });

    // 相关节点
    const relatedTopics = RELATED_TOPICS[topic] || [];
    relatedTopics.forEach((relatedTopic, index) => {
        const trend = Math.random() * 2 - 1; // -1到1
        nodes.push({
            name: relatedTopic,
            symbolSize: 30 + Math.random() * 20,
            trend,
            itemStyle: {
                color: trend > 0.2 ? '#52c41a' : trend < -0.2 ? '#f5222d' : '#faad14'
            }
        });

        links.push({
            source: TOPIC_MAP[topic] || topic,
            target: relatedTopic,
            value: 0.3 + Math.random() * 0.7,
            direction: trend > 0.2 ? '正向影响' : trend < -0.2 ? '负向影响' : '中性影响',
            lineStyle: {
                width: 2 + Math.random() * 4
            }
        });
    });

    // 节点之间的关系
    for (let i = 1; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
            if (Math.random() > 0.7) {
                links.push({
                    source: nodes[i].name,
                    target: nodes[j].name,
                    value: 0.1 + Math.random() * 0.5,
                    direction: Math.random() > 0.5 ? '正向影响' : '负向影响',
                    lineStyle: {
                        width: 1 + Math.random() * 2
                    }
                });
            }
        }
    }

    return { nodes, links };
};

// 主题映射
const TOPIC_MAP = {
    'ai': '人工智能',
    'blockchain': '区块链',
    'metaverse': '元宇宙',
    'biotech': '生物技术'
};

// 相关主题
const RELATED_TOPICS = {
    'ai': ['大语言模型', '机器学习', '自动驾驶', '智能医疗', '数据科学', 'AI安全'],
    'blockchain': ['比特币', '以太坊', 'NFT', '跨链技术', '区块链监管', '数字人民币'],
    'metaverse': ['VR/AR', '虚拟形象', '数字孪生', '游戏引擎', '社交平台', '数字资产'],
    'biotech': ['基因技术', 'mRNA疫苗', '生物制药', '合成生物学', '脑机接口', '精准医疗']
};

export const fetchPredictions = async (topic) => {
    try {
        // 实际API调用
        // const response = await axios.get(`${API_BASE_URL}/api/predictions/${topic}`);
        // return response.data;

        // 模拟数据
        console.log('Fetching predictions for topic:', topic);
        return generatePredictions(topic);
    } catch (error) {
        console.error('Error fetching predictions:', error);
        throw error;
    }
};

export const fetchTrendData = async (topic, timeRange) => {
    try {
        // 实际API调用
        // const response = await axios.get(`${API_BASE_URL}/api/trends/${topic}`, {
        //   params: { timeRange }
        // });
        // return response.data;

        // 模拟数据
        console.log('Fetching trend data for topic:', topic, 'timeRange:', timeRange);
        return generateTrendData(topic, timeRange);
    } catch (error) {
        console.error('Error fetching trend data:', error);
        throw error;
    }
};

export const fetchRelationshipData = async (topic) => {
    try {
        // 实际API调用
        // const response = await axios.get(`${API_BASE_URL}/api/relationships/${topic}`);
        // return response.data;

        // 模拟数据
        console.log('Fetching relationship data for topic:', topic);
        return generateRelationshipData(topic);
    } catch (error) {
        console.error('Error fetching relationship data:', error);
        throw error;
    }
}; 