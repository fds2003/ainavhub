# API端点说明

## 当前API（JSON数据文件）

### 1. 新闻数据端点
- **URL**: `/data/rss-data.json`
- **方法**: GET
- **描述**: 获取AI新闻数据
- **认证**: 无需认证
- **响应格式**: application/json

**响应结构**:
```json
{
  "articles": [
    {
      "title": "文章标题",
      "summary": "文章摘要",
      "link": "原文链接",
      "source": "信息来源",
      "category": "分类",
      "pubDate": "发布日期(ISO格式)",
      "aiScore": "AI评分(1-10)",
      "author": "作者"
    }
  ]
}
```

**示例请求**:
```bash
curl -X GET "https://ainavhub.example.com/data/rss-data.json"
```

**示例响应**:
```json
{
  "articles": [
    {
      "title": "OpenAI发布GPT-5，多模态能力大幅提升",
      "summary": "OpenAI官方宣布GPT-5模型在多模态理解、推理能力和安全性方面取得显著突破",
      "link": "https://example.com/gpt5-release",
      "source": "OpenAI官方博客",
      "category": "技术前沿",
      "pubDate": "2024-09-28T10:00:00Z",
      "aiScore": 9.5,
      "author": "AI研究团队"
    }
  ]
}
```

### 2. 备用新闻数据端点
- **URL**: `/data/rss-data-simple.json`
- **方法**: GET
- **描述**: 获取备用AI新闻数据
- **认证**: 无需认证
- **响应格式**: application/json

### 3. AI工具数据端点
- **URL**: `/data/tools.json`
- **方法**: GET
- **描述**: 获取AI工具数据
- **认证**: 无需认证
- **响应格式**: application/json

**响应结构**:
```json
{
  "tools": [
    {
      "name": "工具名称",
      "description": "工具描述",
      "url": "工具链接",
      "category": "分类",
      "keywords": ["关键词数组"],
      "icon": "图标标识"
    }
  ]
}
```

**示例响应**:
```json
{
  "tools": [
    {
      "name": "ChatGPT",
      "description": "OpenAI开发的高级对话AI模型，能够进行自然对话和内容生成",
      "url": "https://chat.openai.com",
      "category": "聊天机器人",
      "keywords": ["chat", "GPT", "openai", "chatgpt"],
      "icon": "comments"
    }
  ]
}
```

### 4. 热门产品数据端点
- **URL**: `/data/products.json`
- **方法**: GET
- **描述**: 获取热门AI产品数据
- **认证**: 无需认证
- **响应格式**: application/json

**响应结构**:
```json
{
  "products": [
    {
      "name": "产品名称", 
      "description": "产品描述",
      "url": "产品链接",
      "category": "分类",
      "hotnessScore": "热度评分",
      "icon": "图标标识"
    }
  ]
}
```

### 5. 学习资源数据端点
- **URL**: `/data/learning-resources.json`
- **方法**: GET
- **描述**: 获取AI学习资源数据
- **认证**: 无需认证
- **响应格式**: application/json

**响应结构**:
```json
{
  "resources": [
    {
      "title": "资源标题",
      "description": "资源描述", 
      "url": "资源链接",
      "category": "分类",
      "level": "难度级别",
      "icon": "图标标识"
    }
  ]
}
```

### 6. 专题数据端点
- **URL**: `/data/topics.json`
- **方法**: GET
- **描述**: 获取AI专题数据
- **认证**: 无需认证
- **响应格式**: application/json

**响应结构**:
```json
{
  "topics": [
    {
      "name": "专题名称",
      "description": "专题描述",
      "url": "专题链接", 
      "icon": "图标标识"
    }
  ]
}
```

## 前端JavaScript API

### AINewsSystem 全局接口

#### 1. 系统初始化
- **方法**: `AINewsSystem.init()`
- **参数**: 无
- **返回**: Promise<boolean>
- **描述**: 初始化新闻系统，加载并渲染数据

**使用示例**:
```javascript
AINewsSystem.init().then(success => {
  if (success) {
    console.log('系统初始化成功');
  } else {
    console.log('系统初始化部分失败');
  }
});
```

#### 2. 数据更新
- **方法**: `AINewsSystem.update()`
- **参数**: 无
- **返回**: Promise<any>
- **描述**: 手动更新数据

**使用示例**:
```javascript
AINewsSystem.update().then(() => {
  console.log('数据更新完成');
});
```

#### 3. 获取统计信息
- **方法**: `AINewsSystem.getStats()`
- **参数**: 无
- **返回**: Object
- **描述**: 获取系统统计信息

**返回结构**:
```javascript
{
  lastUpdate: "最后更新时间",
  articleCount: "文章数量", 
  cacheValid: "缓存是否有效",
  dataSource: "数据来源"
}
```

**使用示例**:
```javascript
const stats = AINewsSystem.getStats();
console.log('系统统计:', stats);
```

#### 4. 获取文章数据
- **方法**: `AINewsSystem.getArticles()`
- **参数**: 无
- **返回**: Array
- **描述**: 获取当前文章数据

**使用示例**:
```javascript
const articles = AINewsSystem.getArticles();
console.log(`获取到 ${articles.length} 篇文章`);
```

#### 5. 渲染所有模块
- **方法**: `AINewsSystem.renderAllModules()`
- **参数**: 无
- **返回**: Promise<void>
- **描述**: 重新渲染所有模块

**使用示例**:
```javascript
await AINewsSystem.renderAllModules();
console.log('所有模块已重新渲染');
```

#### 6. 全局搜索
- **方法**: `AINewsSystem.search(query)`
- **参数**: 
  - `query` (string): 搜索关键词
- **返回**: Promise<void>
- **描述**: 执行全局搜索

**使用示例**:
```javascript
AINewsSystem.search('机器学习');
console.log('搜索完成');
```

### AINewsProcessor 类接口

#### 1. 数据加载
- **方法**: `processor.loadArticles()`
- **参数**: 无
- **返回**: Promise<Array>
- **描述**: 加载新闻文章

#### 2. 数据处理
- **方法**: `processor.processArticles(rawArticles)`
- **参数**: 
  - `rawArticles` (Array): 原始文章数据
- **返回**: Array
- **描述**: 处理原始文章数据

#### 3. 新闻过滤
- **方法**: `processor.filterNews(category)`
- **参数**: 
  - `category` (string): 分类名称
- **返回**: void
- **描述**: 按类别过滤新闻

#### 4. 生成文章HTML
- **方法**: `processor.generateArticleHTML(article)`
- **参数**: 
  - `article` (Object): 文章对象
- **返回**: string
- **描述**: 生成文章HTML字符串

#### 5. 数据分类
- **方法**: `processor.categorizeArticle(article)`
- **参数**: 
  - `article` (Object): 文章对象
- **返回**: string
- **描述**: 分类文章（行业新闻、技术前沿、应用热点）

## 未来API规划

### V2.0 认证API
```
POST /api/auth/login     - 用户登录
POST /api/auth/register  - 用户注册  
GET  /api/auth/profile   - 获取用户信息
POST /api/auth/logout   - 用户登出
```

### V2.0 用户数据API
```
GET     /api/user/favorites        - 获取收藏
POST    /api/user/favorites        - 添加收藏
DELETE  /api/user/favorites/:id    - 删除收藏
GET     /api/user/history          - 获取浏览历史
PUT     /api/user/preferences      - 更新用户偏好
```

### V2.0 搜索API
```
GET /api/search?q={query}&type={type}&limit={limit}&offset={offset}
参数:
  - q: 搜索关键词 (必填)
  - type: 搜索类型 (可选: news|tools|products|learning|topics)
  - limit: 结果数量限制 (可选, 默认10, 最大50)
  - offset: 分页偏移 (可选, 默认0)
```

### V2.0 内容API
```
GET    /api/content/news        - 获取新闻列表
GET    /api/content/news/:id    - 获取单个新闻
GET    /api/content/tools       - 获取工具列表  
GET    /api/content/products    - 获取产品列表
GET    /api/content/learning    - 获取学习资源
GET    /api/content/topics      - 获取专题列表
```

### V2.0 个人化API
```
GET   /api/personal/recommendations  - 个性化推荐
GET   /api/personal/trends          - 个人趋势
POST  /api/personal/feedback        - 用户反馈
```

## API使用指南

### 1. 错误处理
所有API端点遵循统一的错误响应格式：

```json
{
  "error": {
    "code": "错误代码",
    "message": "错误信息",
    "details": "详细信息(可选)"
  }
}
```

### 2. 状态码
| 状态码 | 含义 |
|--------|------|
| 200 | 请求成功 |
| 400 | 请求参数错误 |
| 401 | 未授权 |
| 403 | 禁止访问 |
| 404 | 资源不存在 |
| 429 | 请求过于频繁 |
| 500 | 服务器内部错误 |

### 3. 限流策略
- 匿名用户: 1000次/小时
- 认证用户: 5000次/小时
- API密钥用户: 10000次/小时

### 4. 认证方式
- 会话认证: 登录后通过cookies
- API密钥: 通过请求头 `X-API-Key`

## SDK和工具

### JavaScript SDK
```javascript
// 使用前端JavaScript API
// 1. 初始化系统
await AINewsSystem.init();

// 2. 获取数据
const articles = AINewsSystem.getArticles();
const tools = await AINewsSystem.processor.loadTools();

// 3. 搜索功能
AINewsSystem.search('人工智能');

// 4. 更新数据
await AINewsSystem.update();
```

### 数据模型
```javascript
// 新闻文章模型
interface NewsArticle {
  id: string;
  title: string;
  titleZh: string;
  summary: string;
  summaryZh: string;
  url: string;
  source: string;
  category: string;
  publishTime: string; // ISO格式日期
  aiScore: number; // 1-10评分
  author: string;
  matchedTools: Array<{
    tool_name: string;
    tool_category: string;
    tool_url: string;
    reason: string;
    score: number;
  }>;
}

// 工具模型
interface Tool {
  name: string;
  description: string;
  url: string;
  category: string;
  keywords: string[];
  icon: string;
}

// 产品模型  
interface Product {
  name: string;
  description: string;
  url: string;
  category: string;
  hotnessScore: number;
  icon: string;
  rank?: number; // 用于热度排行
}
```

## 速率限制

API实施速率限制来保证服务稳定性：

- 全局限制：1000次/小时/IP
- 用户限制：根据用户类型有所不同
- 某些端点可能有特殊的速率限制

速率限制信息包含在响应头中：
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1609459200
```

## 调试和测试

### 开发环境API
在开发环境中，API可能会提供额外的调试信息：

```javascript
// 启用调试模式
AINewsSystem.debug = true;

// 查看API调用详情
console.log('API详细信息:', AINewsSystem.processor.getStats());
```

### 测试端点
```
GET /api/health     - 健康检查
GET /api/version    - 获取API版本
GET /api/stats      - 获取系统统计
```