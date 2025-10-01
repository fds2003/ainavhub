# API接口规范

注意：当前版本为静态站点，使用JSON文件模拟数据接口。未来版本可扩展为真实API。

## 当前数据接口（JSON文件）

### 1. 新闻数据接口
- **端点**: `./data/rss-data.json`
- **方法**: GET
- **内容类型**: application/json
- **响应结构**:

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

### 2. 备用新闻数据接口
- **端点**: `./data/rss-data-simple.json`
- **方法**: GET
- **内容类型**: application/json
- **响应结构**: 同上

### 3. 工具数据接口
- **端点**: `./data/tools.json`
- **方法**: GET
- **内容类型**: application/json
- **响应结构**:

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

### 4. 产品数据接口
- **端点**: `./data/products.json`
- **方法**: GET
- **内容类型**: application/json
- **响应结构**:

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

### 5. 学习资源接口
- **端点**: `./data/learning-resources.json`
- **方法**: GET
- **内容类型**: application/json
- **响应结构**:

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

### 6. 专题数据接口
- **端点**: `./data/topics.json`
- **方法**: GET
- **内容类型**: application/json
- **响应结构**:

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

## 前端API接口 (JavaScript)

### AINewsSystem 全局接口

#### 1. 系统初始化
- **方法**: `AINewsSystem.init()`
- **参数**: 无
- **返回值**: Promise<boolean>
- **功能**: 初始化新闻系统，加载并渲染数据

#### 2. 数据更新
- **方法**: `AINewsSystem.update()`
- **参数**: 无
- **返回值**: Promise<any>
- **功能**: 手动更新数据

#### 3. 获取统计信息
- **方法**: `AINewsSystem.getStats()`
- **参数**: 无
- **返回值**: Object
- **功能**: 获取系统统计信息
- **返回结构**:
```javascript
{
  lastUpdate: "最后更新时间",
  articleCount: "文章数量",
  cacheValid: "缓存是否有效",
  dataSource: "数据来源"
}
```

#### 4. 获取文章数据
- **方法**: `AINewsSystem.getArticles()`
- **参数**: 无
- **返回值**: Array
- **功能**: 获取当前文章数据

#### 5. 渲染所有模块
- **方法**: `AINewsSystem.renderAllModules()`
- **参数**: 无
- **返回值**: Promise<void>
- **功能**: 重新渲染所有模块

#### 6. 全局搜索
- **方法**: `AINewsSystem.search(query)`
- **参数**: query (string)
- **返回值**: Promise<void>
- **功能**: 执行全局搜索

### AINewsProcessor 类接口

#### 1. 数据加载
- **方法**: `processor.loadArticles()`
- **参数**: 无
- **返回值**: Promise<Array>
- **功能**: 加载新闻文章

#### 2. 数据处理
- **方法**: `processor.processArticles(rawArticles)`
- **参数**: rawArticles (Array)
- **返回值**: Array
- **功能**: 处理原始文章数据

#### 3. 新闻过滤
- **方法**: `processor.filterNews(category)`
- **参数**: category (string)
- **返回值**: void
- **功能**: 按类别过滤新闻

#### 4. 生成文章HTML
- **方法**: `processor.generateArticleHTML(article)`
- **参数**: article (Object)
- **返回值**: string
- **功能**: 生成文章HTML字符串

#### 5. 数据分类
- **方法**: `processor.categorizeArticle(article)`
- **参数**: article (Object)
- **返回值**: string
- **功能**: 分类文章

## 未来API扩展计划

### 认证API
```
POST /api/auth/login     - 用户登录
POST /api/auth/register  - 用户注册
GET  /api/auth/profile   - 获取用户信息
POST /api/auth/logout   - 用户登出
```

### 用户数据API
```
GET    /api/user/favorites        - 获取收藏
POST   /api/user/favorites        - 添加收藏
DELETE /api/user/favorites/:id    - 删除收藏
GET    /api/user/history          - 获取浏览历史
```

### 搜索API
```
GET /api/search?q={query}&type={type}   - 搜索接口
参数:
  - q: 搜索关键词
  - type: 搜索类型(news|tools|products|learning|topics)
  - limit: 结果数量限制
  - offset: 分页偏移
```

### 内容API
```
GET    /api/content/news        - 获取新闻
GET    /api/content/tools       - 获取工具
GET    /api/content/products    - 获取产品
GET    /api/content/learning    - 获取学习资源
GET    /api/content/topics      - 获取专题
```

## 错误处理规范

### HTTP状态码
- 200: 请求成功
- 400: 请求参数错误
- 401: 未授权
- 404: 资源不存在
- 500: 服务器内部错误

### 错误响应格式
```json
{
  "error": {
    "code": "错误代码",
    "message": "错误信息",
    "details": "详细信息(可选)"
  }
}
```

## 速率限制
- 未登录用户: 1000次/小时
- 登录用户: 5000次/小时
- API密钥用户: 10000次/小时

## 安全要求
- 所有API端点需要HTTPS
- 实施适当的输入验证和清理
- 防止常见的Web漏洞(XSS, CSRF等)
- 实施适当的认证和授权

## 版本控制
- 当前版本: v1 (隐式)
- 未来版本: /api/v2/, /api/v3/ 等
- 向后兼容性: 保持至少6个月的兼容期