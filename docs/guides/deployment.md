# 部署指南

## 部署选项

### 1. GitHub Pages (推荐)
适用于静态站点部署，完全免费。

#### 部署步骤
1. 确保代码已推送至GitHub仓库
2. 进入仓库设置页面
3. 在"Pages"部分配置：
   - 源码分支：main 或 master
   - 部署目录：/ (根目录)
4. 保存设置

#### 访问地址
- 默认：https://[用户名].github.io/[仓库名]
- 自定义域名：配置CNAME记录指向 [用户名].github.io

### 2. Vercel
现代前端部署平台，支持快速部署。

#### 部署步骤
1. 注册Vercel账户并连接GitHub
2. 导入AiNavHub仓库
3. 配置项目（默认设置通常适用）
4. 部署完成

### 3. Netlify
简单的静态网站托管服务。

#### 部署步骤
1. 注册Netlify账户
2. 拖放构建文件或连接GitHub仓库
3. 配置构建设置（如果是动态构建）
4. 发布网站

### 4. 自托管
使用自己的服务器进行部署。

#### 配置要求
- Web服务器 (Nginx, Apache等)
- HTTPS支持
- 静态文件服务

## 部署前检查清单

### 1. 代码检查
- [ ] 所有功能正常工作
- [ ] 无JavaScript错误
- [ ] CSS样式正常显示
- [ ] 数据加载正常

### 2. 性能检查
- [ ] 页面加载时间 < 3秒
- [ ] 所有资源正确加载
- [ ] 缓存配置正确

### 3. 兼容性检查
- [ ] 主流浏览器兼容
- [ ] 移动端显示正常
- [ ] 响应式设计工作正常

### 4. 安全检查
- [ ] 无敏感信息泄露
- [ ] 外部链接安全
- [ ] 代码无恶意内容

## GitHub Actions 部署配置

### 创建部署工作流
在 `.github/workflows/deploy.yml` 文件中：

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
    - name: Checkout
      uses: actions/checkout@v3

    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '16'

    - name: Install dependencies
      run: npm install

    - name: Build
      run: npm run build

    - name: Deploy to GitHub Pages
      uses: peaceiris/actions-gh-pages@v3
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./
```

## 环境配置

### 生产环境配置
在 `data/` 目录中的JSON文件需要确保：
- 可通过网络访问
- 正确的CORS设置（如需要）
- 数据安全性和准确性

### 自定义域名配置
1. 在仓库设置中添加自定义域名
2. 在域名服务商配置CNAME记录：
   ```
   ainavhub.top    CNAME    [用户名].github.io
   ```

## 性能优化配置

### CDN配置（如使用）
- 配置静态资源缓存策略
- 设置合适的TTL值
- 启用Gzip压缩

### 缓存策略
- HTML文件：不缓存或短缓存
- CSS/JS文件：长期缓存（带版本号）
- 图片等资源：长期缓存

### HTTPS配置
- 启用强制HTTPS
- 配置HSTS头
- 使用安全的SSL证书

## 监控与日志

### 前端监控
- 集成Google Analytics
- 设置错误跟踪（如Sentry）
- 性能监控（Core Web Vitals）

### 访问统计
- 页面访问统计
- 用户行为分析
- 功能使用情况

## 回滚策略

### 版本控制
- 保留部署历史
- 标记重要版本
- 快速回滚机制

### 备份策略
- 定期备份数据
- 代码版本控制
- 配置文件管理

## 常见部署问题及解决方案

### 1. 资源加载失败
**问题**: JSON文件或其他资源无法加载
**解决方案**: 
- 检查文件路径是否正确
- 确认服务器MIME类型设置
- 验证CORS配置

### 2. 页面显示异常
**问题**: 样式或功能不正常
**解决方案**:
- 检查CDN配置
- 验证文件路径
- 确认缓存清除

### 3. 搜索引擎不收录
**问题**: SEO效果不佳
**解决方案**:
- 检查meta标签
- 验证sitemap配置
- 确认robots.txt设置

## 部署后验证

### 功能验证
- [ ] 首页正常加载
- [ ] 各模块数据正确显示
- [ ] 搜索功能正常
- [ ] 过滤功能正常
- [ ] 响应式设计正常

### 性能验证
- [ ] 页面加载时间达标
- [ ] 资源加载正常
- [ ] 缓存工作正常

### 兼容性验证
- [ ] 主流浏览器测试
- [ ] 移动设备测试
- [ ] 不同分辨率测试

## 自动化部署

### 持续集成
- 自动测试
- 代码质量检查
- 构建验证

### 自动化监控
- 网站可用性监控
- 性能指标跟踪
- 错误率监控

## 部署最佳实践

1. **分阶段部署**
   - 先在预发布环境测试
   - 验证无误后部署到生产

2. **渐进式部署**
   - 小范围用户测试
   - 逐步扩大范围

3. **监控先行**
   - 部署监控工具
   - 设置告警机制

4. **文档同步**
   - 更新部署文档
   - 记录部署变更

## 安全部署

### 内容安全策略
- 配置CSP头
- 防止XSS攻击
- 限制外部资源加载

### 数据安全
- 敏感信息加密
- 访问权限控制
- 定期安全审计