# 监控配置

## 监控目标

### 核心指标
- **可用性**: 网站正常访问时间百分比
- **性能**: 页面加载时间、资源加载速度
- **用户体验**: 交互响应时间、错误率
- **内容质量**: 数据更新频率、内容准确性

### 业务指标
- **用户行为**: 访问量、停留时间、功能使用率
- **内容指标**: 内容更新频率、用户参与度
- **系统健康**: 错误率、资源使用率

## 前端监控实现

### 1. 性能监控

#### Core Web Vitals 指标
```javascript
// 监控页面核心性能指标
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

function sendToAnalytics(metric) {
  // 发送到分析服务
  console.log(metric);
}

getCLS(sendToAnalytics);
getFID(sendToAnalytics);
getFCP(sendToAnalytics);
getLCP(sendToAnalytics);
getTTFB(sendToAnalytics);
```

#### 页面加载时间监控
```javascript
// 监控页面加载时间
window.addEventListener('load', function() {
  const pageLoadTime = window.performance.timing.loadEventEnd - window.performance.timing.navigationStart;
  console.log('页面加载时间:', pageLoadTime, 'ms');
  
  // 如果加载时间过长，记录监控数据
  if (pageLoadTime > 3000) {
    console.warn('页面加载时间过长:', pageLoadTime, 'ms');
  }
});
```

#### 资源加载监控
```javascript
// 监控资源加载时间
function monitorResourceLoad() {
  const resources = performance.getEntriesByType('resource');
  resources.forEach((resource) => {
    const loadTime = resource.responseEnd - resource.startTime;
    if (loadTime > 2000) { // 超过2秒的资源加载
      console.warn(`慢资源加载:`, resource.name, `耗时: ${loadTime}ms`);
    }
  });
}
```

### 2. 错误监控

#### JavaScript错误捕获
```javascript
// 全局错误处理
window.addEventListener('error', function(e) {
  console.error('JavaScript错误:', e.error);
  // 发送到错误监控服务
  sendErrorToService({
    message: e.error.message,
    stack: e.error.stack,
    filename: e.filename,
    lineno: e.lineno,
    colno: e.colno
  });
});

// Promise错误处理
window.addEventListener('unhandledrejection', event => {
  console.error('Promise错误:', event.reason);
  sendErrorToService({
    type: 'unhandledrejection',
    reason: event.reason
  });
});
```

#### 数据加载错误监控
```javascript
// 扩展AINewsProcessor以包含监控功能
class AINewsProcessor {
  // ... 现有代码 ...

  async loadArticles() {
    const startTime = performance.now();
    try {
      console.log('📡 开始加载AI新闻数据，数据源:', AINewsConfig.dataPath);

      const primaryResponse = await fetch(AINewsConfig.dataPath);
      console.log('🔍 主文件响应状态码:', primaryResponse.status);

      const loadTime = performance.now() - startTime;
      
      // 监控数据加载时间
      if (loadTime > 5000) { // 超过5秒
        console.warn(`数据加载缓慢: ${loadTime}ms`, AINewsConfig.dataPath);
      }

      if (primaryResponse.ok) {
        let data;
        try {
          data = await primaryResponse.json();
          console.log('📊 主文件JSON解析成功, 数据格式验证:', !!data);
          
          // 数据验证监控
          if (data && data.articles && Array.isArray(data.articles) && data.articles.length > 0) {
            console.log(`✅ 主数据加载成功：${data.articles.length} 篇新闻`);
            return this.processArticles(data.articles);
          } else {
            console.log('⚠️ 主数据格式错误或为空，使用备用数据');
            return await this.loadFromBackup();
          }
        } catch (jsonError) {
          // JSON解析错误监控
          this.reportError(jsonError, 'JSON解析', { url: AINewsConfig.dataPath });
          console.error('❌ 主文件JSON解析失败:', jsonError);
          data = null;
        }
      } else {
        // HTTP错误监控
        this.reportError(`HTTP ${primaryResponse.status}`, 'HTTP请求', { 
          url: AINewsConfig.dataPath, 
          status: primaryResponse.status 
        });
        console.log(`⚠️ 主文件HTTP错误: ${primaryResponse.status}, 使用备用数据`);
        return await this.loadFromBackup();
      }
    } catch (fetchError) {
      // 网络错误监控
      this.reportError(fetchError, '网络请求', { url: AINewsConfig.dataPath });
      console.error('❌ 主文件网络请求失败:', fetchError);
      return await this.loadFromBackup();
    }
  }
  
  // 错误报告方法
  reportError(error, context, additionalInfo = {}) {
    const errorReport = {
      timestamp: new Date().toISOString(),
      error: error.toString(),
      context: context,
      additionalInfo: additionalInfo,
      userAgent: navigator.userAgent,
      url: window.location.href
    };
    
    // 发送到监控服务（这里可以替换为实际的监控服务）
    console.error('监控错误报告:', errorReport);
    
    // 在生产环境中，这里应该发送到错误监控服务
    //例如：Sentry, LogRocket等
  }
}
```

## 监控服务集成

### 1. Google Analytics 4

#### 配置GA4监控
```html
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'G-XXXXXXXXXX');
  
  // 自定义事件监控
  function trackCustomEvent(eventName, eventParams) {
    gtag('event', eventName, eventParams);
  }
  
  // 监控用户交互
  document.addEventListener('click', function(e) {
    if (e.target.classList.contains('news-filter-btn')) {
      trackCustomEvent('news_filter_click', {
        category: e.target.getAttribute('data-filter')
      });
    }
  });
</script>
```

### 2. Sentry 错误监控

#### 配置Sentry
```javascript
// 引入Sentry SDK
// <script src="https://browser.sentry-cdn.com/7.111.0/bundle.tracing.min.js" 
//         integrity="sha384-..." crossorigin="anonymous"></script>

Sentry.init({
  dsn: "YOUR_SENTRY_DSN",
  integrations: [
    new Sentry.BrowserTracing(),
  ],
  tracesSampleRate: 1.0,
});

// 监控性能
const transaction = Sentry.startTransaction({
  op: 'load',
  name: 'index.html',
});

// 监控数据加载
const span = transaction.startChild({
  op: 'http',
  description: 'Fetch Data',
});

fetch('/data/rss-data.json')
  .then(response => response.json())
  .then(data => {
    span.finish();
    transaction.finish();
  })
  .catch(error => {
    span.finish();
    transaction.finish();
    Sentry.captureException(error);
  });
```

## 自定义监控系统

### 1. 性能监控类
```javascript
class PerformanceMonitor {
  constructor() {
    this.metrics = {
      pageLoadTime: 0,
      dataLoadTime: {},
      userInteractions: [],
      errors: [],
      resourceLoadTime: {},
      firstContentfulPaint: null,
      largestContentfulPaint: null
    };
    
    this.init();
  }
  
  init() {
    // 监控页面加载时间
    window.addEventListener('load', () => {
      this.metrics.pageLoadTime = performance.now();
    });
    
    // 监控FCP和LCP
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.name === 'first-contentful-paint') {
          this.metrics.firstContentfulPaint = entry.startTime;
        }
      }
    }).observe({entryTypes: ['paint']});
    
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        this.metrics.largestContentfulPaint = entry.startTime;
      }
    }).observe({entryTypes: ['largest-contentful-paint']});
    
    // 监控长任务
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.duration > 50) { // 超过50ms的任务被视为长任务
          console.warn(`长任务检测:`, entry.duration, 'ms');
        }
      }
    }).observe({entryTypes: ['longtask']});
  }
  
  // 记录数据加载时间
  recordDataLoadTime(dataType, loadTime) {
    if (!this.metrics.dataLoadTime[dataType]) {
      this.metrics.dataLoadTime[dataType] = [];
    }
    this.metrics.dataLoadTime[dataType].push({
      timestamp: Date.now(),
      loadTime: loadTime
    });
    
    console.log(`${dataType} 加载时间: ${loadTime}ms`);
    
    // 如果加载时间过长，记录警告
    if (loadTime > 3000) {
      console.warn(`${dataType} 加载时间过长: ${loadTime}ms`);
    }
  }
  
  // 记录用户交互
  recordInteraction(type, element, additionalData = {}) {
    this.metrics.userInteractions.push({
      timestamp: Date.now(),
      type: type,
      element: element,
      data: additionalData
    });
  }
  
  // 记录错误
  recordError(error, context, additionalInfo = {}) {
    this.metrics.errors.push({
      timestamp: Date.now(),
      error: error.toString(),
      context: context,
      additionalInfo: additionalInfo
    });
    console.error('监控错误:', error, '上下文:', context);
  }
  
  // 发送监控数据到服务
  sendMetrics() {
    const data = {
      timestamp: Date.now(),
      metrics: this.metrics,
      userAgent: navigator.userAgent,
      url: window.location.href,
      performance: performance.toJSON ? performance.toJSON() : {}
    };
    
    // 发送到监控服务
    // 实际部署时替换为真实的监控服务端点
    fetch('/api/metrics', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    }).catch(err => {
      console.error('发送监控数据失败:', err);
    });
    
    return data;
  }
  
  // 获取当前监控数据
  getMetrics() {
    return this.metrics;
  }
}

// 全局监控实例
window.PerformanceMonitor = new PerformanceMonitor();
```

### 2. 数据加载监控
```javascript
// 扩展AINewsProcessor以集成性能监控
class AINewsProcessor {
  // ... 现有代码 ...
  
  async loadArticles() {
    const startTime = performance.now();
    
    try {
      const primaryResponse = await fetch(AINewsConfig.dataPath);
      const loadTime = performance.now() - startTime;
      
      // 记录数据加载时间到监控系统
      window.PerformanceMonitor.recordDataLoadTime('news', loadTime);
      
      if (primaryResponse.ok) {
        let data;
        try {
          data = await primaryResponse.json();
          
          if (data && data.articles && Array.isArray(data.articles) && data.articles.length > 0) {
            return this.processArticles(data.articles);
          } else {
            console.log('⚠️ 主数据格式错误或为空，使用备用数据');
            return await this.loadFromBackup();
          }
        } catch (jsonError) {
          window.PerformanceMonitor.recordError(jsonError, 'JSON解析', { 
            url: AINewsConfig.dataPath,
            loadTime: loadTime
          });
          return await this.loadFromBackup();
        }
      } else {
        window.PerformanceMonitor.recordError(`HTTP ${primaryResponse.status}`, 'HTTP请求', { 
          url: AINewsConfig.dataPath,
          status: primaryResponse.status,
          loadTime: loadTime
        });
        return await this.loadFromBackup();
      }
    } catch (fetchError) {
      const loadTime = performance.now() - startTime;
      window.PerformanceMonitor.recordError(fetchError, '网络请求', { 
        url: AINewsConfig.dataPath,
        loadTime: loadTime
      });
      return await this.loadFromBackup();
    }
  }
}
```

## 告警配置

### 1. 告警阈值设置

#### 性能指标告警
- 页面加载时间 > 3秒
- 数据加载时间 > 5秒
- JavaScript错误率 > 1%
- 资源加载失败率 > 5%

#### 业务指标告警
- 数据加载失败率 > 10%
- 缓存命中率 < 80%
- 用户交互失败率 > 2%

### 2. 告警通知机制
```javascript
class AlertSystem {
  constructor() {
    this.alertThresholds = {
      pageLoadTime: 3000,      // 3秒
      dataLoadTime: 5000,      // 5秒
      errorRate: 0.01,         // 1%
      resourceFailureRate: 0.05 // 5%
    };
    
    this.alertHistory = [];
  }
  
  // 检查是否需要告警
  checkAlerts(metrics) {
    const alerts = [];
    
    // 检查页面加载时间
    if (metrics.pageLoadTime > this.alertThresholds.pageLoadTime) {
      alerts.push({
        type: 'performance',
        severity: 'high',
        message: `页面加载时间过长: ${metrics.pageLoadTime}ms`,
        value: metrics.pageLoadTime,
        threshold: this.alertThresholds.pageLoadTime
      });
    }
    
    // 检查数据加载时间
    for (const [dataType, times] of Object.entries(metrics.dataLoadTime)) {
      if (times.length > 0) {
        const avgLoadTime = times.reduce((sum, t) => sum + t.loadTime, 0) / times.length;
        if (avgLoadTime > this.alertThresholds.dataLoadTime) {
          alerts.push({
            type: 'data_performance',
            severity: 'medium',
            message: `${dataType} 平均加载时间过长: ${avgLoadTime}ms`,
            value: avgLoadTime,
            threshold: this.alertThresholds.dataLoadTime
          });
        }
      }
    }
    
    // 检查错误率
    if (metrics.errors.length > 0) {
      const errorRate = metrics.errors.length / (metrics.userInteractions.length || 1);
      if (errorRate > this.alertThresholds.errorRate) {
        alerts.push({
          type: 'error_rate',
          severity: 'high',
          message: `错误率过高: ${(errorRate * 100).toFixed(2)}%`,
          value: errorRate,
          threshold: this.alertThresholds.errorRate
        });
      }
    }
    
    return alerts;
  }
  
  // 发送告警
  sendAlert(alert) {
    // 记录告警
    this.alertHistory.push({
      ...alert,
      timestamp: Date.now()
    });
    
    // 控制台输出
    console.error(`告警 [${alert.severity.toUpperCase()}]:`, alert.message);
    
    // 实际部署中发送到告警系统
    // 例如：发送邮件、短信、或集成到告警平台
    if (alert.severity === 'high') {
      // 紧急告警处理
      this.handleHighSeverityAlert(alert);
    }
  }
  
  handleHighSeverityAlert(alert) {
    // 高优先级告警的特殊处理
    console.error('高优先级告警:', alert);
    // 可以触发自动修复流程或通知管理员
  }
}

// 全局告警系统实例
window.AlertSystem = new AlertSystem();

// 定期检查告警
setInterval(() => {
  if (window.PerformanceMonitor) {
    const metrics = window.PerformanceMonitor.getMetrics();
    const alerts = window.AlertSystem.checkAlerts(metrics);
    
    alerts.forEach(alert => {
      window.AlertSystem.sendAlert(alert);
    });
  }
}, 60000); // 每分钟检查一次
```

## 监控仪表板

### 1. 实时监控数据展示
```html
<!-- 监控仪表板示例 -->
<div id="monitoring-dashboard" style="display:none;">
  <h3>系统监控仪表板</h3>
  <div class="metrics-grid">
    <div class="metric-card">
      <h4>页面加载时间</h4>
      <p id="page-load-time">-</p>
    </div>
    <div class="metric-card">
      <h4>新闻加载时间</h4>
      <p id="news-load-time">-</p>
    </div>
    <div class="metric-card">
      <h4>错误计数</h4>
      <p id="error-count">-</p>
    </div>
    <div class="metric-card">
      <h4>用户交互</h4>
      <p id="interaction-count">-</p>
    </div>
  </div>
  <button onclick="window.PerformanceMonitor.sendMetrics()">发送监控数据</button>
  <button onclick="showFullMetrics()">显示详细指标</button>
</div>

<script>
// 更新监控仪表板
function updateMonitoringDashboard() {
  if (window.PerformanceMonitor) {
    const metrics = window.PerformanceMonitor.getMetrics();
    
    document.getElementById('page-load-time').textContent = 
      metrics.pageLoadTime ? `${Math.round(metrics.pageLoadTime)}ms` : '-';
    
    // 计算新闻加载时间平均值
    const newsLoadTimes = metrics.dataLoadTime.news || [];
    if (newsLoadTimes.length > 0) {
      const avgTime = newsLoadTimes.reduce((sum, t) => sum + t.loadTime, 0) / newsLoadTimes.length;
      document.getElementById('news-load-time').textContent = `${Math.round(avgTime)}ms`;
    } else {
      document.getElementById('news-load-time').textContent = '-';
    }
    
    document.getElementById('error-count').textContent = metrics.errors.length;
    document.getElementById('interaction-count').textContent = metrics.userInteractions.length;
  }
}

// 显示详细指标
function showFullMetrics() {
  if (window.PerformanceMonitor) {
    console.table(window.PerformanceMonitor.getMetrics());
  }
}

// 定期更新仪表板
setInterval(updateMonitoringDashboard, 5000);

// 开发环境显示监控面板
if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
  document.getElementById('monitoring-dashboard').style.display = 'block';
}
</script>
```

## 监控数据存储

### 1. 本地存储
```javascript
class LocalMetricsStorage {
  constructor() {
    this.storageKey = 'ainavhub_metrics';
    this.maxRecords = 1000; // 最大记录数
  }
  
  // 保存指标
  saveMetrics(metrics) {
    try {
      const existingData = this.getStoredMetrics();
      existingData.push({
        ...metrics,
        timestamp: Date.now()
      });
      
      // 限制存储记录数量
      if (existingData.length > this.maxRecords) {
        existingData.splice(0, existingData.length - this.maxRecords);
      }
      
      localStorage.setItem(this.storageKey, JSON.stringify(existingData));
    } catch (e) {
      console.error('保存监控数据失败:', e);
    }
  }
  
  // 获取存储的指标
  getStoredMetrics() {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('读取监控数据失败:', e);
      return [];
    }
  }
  
  // 清理旧数据
  cleanupOldData() {
    const data = this.getStoredMetrics();
    const cutoffTime = Date.now() - (7 * 24 * 60 * 60 * 1000); // 7天前
    const filteredData = data.filter(record => record.timestamp > cutoffTime);
    
    if (filteredData.length !== data.length) {
      localStorage.setItem(this.storageKey, JSON.stringify(filteredData));
    }
  }
}

// 全局存储实例
window.LocalMetricsStorage = new LocalMetricsStorage();

// 定期保存监控数据
setInterval(() => {
  if (window.PerformanceMonitor) {
    const metrics = window.PerformanceMonitor.getMetrics();
    window.LocalMetricsStorage.saveMetrics(metrics);
  }
}, 30000); // 每30秒保存一次
```

## 监控最佳实践

### 1. 数据采样策略
- 性能数据：全量收集
- 用户行为：按比例采样（例如10%）
- 错误数据：全量收集

### 2. 隐私保护
- 不收集敏感信息
- 匿名化用户数据
- 符合隐私法规

### 3. 监控数据保留
- 实时数据：24小时
- 汇总数据：30天
- 重要告警：90天

### 4. 成本控制
- 合理设置采样率
- 数据压缩传输
- 选择性收集指标