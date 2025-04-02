// API基础URL，根据环境不同可以设置不同的值
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// 应用程序名称
export const APP_NAME = '个人信息助理系统';

// 分页配置
export const PAGINATION_CONFIG = {
    defaultPageSize: 10,
    pageSizeOptions: ['10', '20', '50', '100']
};

// 主题颜色
export const THEME_COLORS = {
    primary: '#1890ff',
    success: '#52c41a',
    warning: '#faad14',
    error: '#f5222d',
    neutral: '#d9d9d9'
};

// 情感分析标签颜色映射
export const SENTIMENT_COLORS = {
    positive: '#52c41a',
    neutral: '#1890ff',
    negative: '#f5222d'
};

// 实体类型映射
export const ENTITY_TYPE_MAP = {
    'PERSON': '人物',
    'ORGANIZATION': '组织',
    'LOCATION': '地点',
    'TECHNOLOGY': '技术',
    'PRODUCT': '产品',
    'CONCEPT': '概念',
    'EVENT': '事件',
    'PROJECT': '项目'
};

// 关系类型映射
export const RELATION_TYPE_MAP = {
    'CAUSES': '导致',
    'FOLLOWS': '后续',
    'CONTRADICTS': '矛盾',
    'SIMILAR_TO': '相似',
    'REFERENCES': '引用'
};

// 本地存储键
export const STORAGE_KEYS = {
    authToken: 'personal_info_assistant_auth_token',
    userPreferences: 'personal_info_assistant_preferences',
    recentSearches: 'personal_info_assistant_recent_searches'
};

// 时间范围选项
export const TIME_RANGE_OPTIONS = [
    { label: '24小时内', value: 'day' },
    { label: '一周内', value: 'week' },
    { label: '一个月内', value: 'month' },
    { label: '三个月内', value: 'quarter' },
    { label: '一年内', value: 'year' },
    { label: '全部时间', value: 'all' }
]; 