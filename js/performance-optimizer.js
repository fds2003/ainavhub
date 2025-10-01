// 性能优化的缓存管理
class DataManager {
  constructor() {
    this.cacheTimeout = 30 * 60 * 1000; // 30分钟缓存
  }

  // 检查缓存是否有效
  isCacheValid(timestamp) {
    if (!timestamp) return false;
    return (Date.now() - timestamp) < this.cacheTimeout;
  }

  // 获取缓存数据
  getCachedData(key) {
    try {
      const cached = localStorage.getItem(key);
      if (cached) {
        const data = JSON.parse(cached);
        if (this.isCacheValid(data.timestamp)) {
          return data.value;
        } else {
          // 清除过期缓存
          localStorage.removeItem(key);
        }
      }
    } catch (e) {
      console.error('缓存读取错误:', e);
      localStorage.removeItem(key);
    }
    return null;
  }

  // 设置缓存数据
  setCachedData(key, value) {
    try {
      const data = {
        value: value,
        timestamp: Date.now(),
        version: '1.0'
      };
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.error('缓存存储错误:', e);
      // 如果存储失败，静默处理（通常是存储空间满了）
    }
  }
}

// 优化的DOM操作工具
class DOMOptimizer {
  // 批量DOM更新
  static batchUpdate(container, html) {
    // 创建文档片段以减少重排
    const fragment = document.createDocumentFragment();
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    
    // 将所有子节点移到文档片段中
    while(tempDiv.firstChild) {
      fragment.appendChild(tempDiv.firstChild);
    }
    
    // 一次性更新DOM
    container.innerHTML = '';
    container.appendChild(fragment);
  }

  // 防抖函数，用于搜索功能
  static debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
}

// 优化的数据加载器
class DataLoader {
  constructor() {
    this.cacheManager = new DataManager();
  }

  async loadWithCache(url, cacheKey) {
    // 首先尝试从缓存获取
    const cachedData = this.cacheManager.getCachedData(cacheKey);
    if (cachedData) {
      console.log(`✅ 从缓存加载: ${cacheKey}`);
      return cachedData;
    }

    // 如果缓存无效，则从网络加载
    try {
      console.log(`📡 加载数据: ${url}`);
      const response = await fetch(url, {
        method: 'GET',
        cache: 'force-cache', // 使用HTTP缓存
        headers: {
          'Cache-Control': 'max-age=300' // 5分钟HTTP缓存
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        this.cacheManager.setCachedData(cacheKey, data);
        console.log(`✅ 数据加载成功: ${cacheKey}`);
        return data;
      } else {
        console.error(`❌ HTTP错误: ${response.status} for ${url}`);
        return null;
      }
    } catch (error) {
      console.error(`❌ 网络请求失败: ${error.message} for ${url}`);
      return null;
    }
  }
}

// 优化的新闻处理器
class OptimizedNewsProcessor {
  constructor() {
    this.dataLoader = new DataLoader();
    this.articles = [];
    this.currentCategory = 'all';
    this.debouncedSearch = DOMOptimizer.debounce(this.performSearch.bind(this), 300);
  }

  async init() {
    console.log('🚀 启动优化的新闻系统...');
    
    // 加载新闻数据
    await this.loadArticles();
    
    // 初始渲染
    this.filterNews(this.currentCategory);
    
    // 更新时间显示
    this.updateLastUpdateTime();
    
    // 启动后台缓存预加载
    this.preloadData();
    
    console.log('✅ 优化的新闻系统启动完成');
  }

  async loadArticles() {
    try {
      // 尝试从主要数据源加载
      let data = await this.dataLoader.loadWithCache(
        './data/rss-data.json',
        'news_cache'
      );
      
      if (!data || !data.articles) {
        // 如果主要数据源失败，尝试备用数据源
        data = await this.dataLoader.loadWithCache(
          './data/rss-data-simple.json',
          'news_cache_backup'
        );
      }
      
      if (data && data.articles && Array.isArray(data.articles)) {
        this.articles = this.processArticles(data.articles);
        console.log(`📊 加载了 ${this.articles.length} 篇新闻`);
      } else {
        console.warn('⚠️ 无法加载新闻数据，使用备用数据');
        this.articles = this.processArticles(AINewsConfig.fallbackData);
      }
    } catch (error) {
      console.error('❌ 加载文章失败:', error);
      this.articles = this.processArticles(AINewsConfig.fallbackData);
    }
  }

  processArticles(rawArticles) {
    if (!rawArticles || !Array.isArray(rawArticles)) {
      return [];
    }

    return rawArticles.map(article => {
      try {
        const title = article.title || '无标题';
        const description = article.summary || article.description || title;
        const link = article.link || '#';
        const source = article.source || 'AI资讯聚合';
        const category = article.category || 'AI动态';
        const pubDate = article.pubDate || article.date || new Date().toISOString();
        const aiScore = article.aiScore || 5.0;

        // 生成中文摘要
        const summaryZh = this.generateChineseContent(title, description);

        // 推荐相关AI工具
        const relatedTools = this.findRelatedTools(title, description);

        return {
          id: btoa(title + link).replace(/[^a-zA-Z0-9]/g, '').substr(0, 16),
          title: title,
          titleZh: title.replace(/AI/g, '人工智能').substring(0, 60),
          summary: (description || title).substring(0, 180),
          summaryZh: summaryZh,
          url: link,
          source: source,
          category: category,
          publishTime: pubDate,
          aiScore: Math.min(Math.max(aiScore, 1), 10),
          author: article.author || 'AI资讯编辑',
          matchedTools: relatedTools
        };
      } catch (error) {
        console.warn('处理单篇文章失败:', error, article);
        return null;
      }
    }).filter(Boolean);
  }

  generateChineseContent(title, description) {
    const fullText = (title + ' ' + description).toLowerCase();

    // 如果是中文内容，直接返回摘要
    const chineseMatches = fullText.match(/[一-龥]+/g) || [];
    if (chineseMatches.length > 0 && chineseMatches.join('').length > 20) {
      return chineseMatches.join('').substring(0, 120) + '...';
    }

    // 智能中文摘要生成
    let summary = '';
    const keyPhrases = [
      'artificial intelligence', 'AI', 'machine learning', 'deep learning',
      'neural network', 'natural language', 'computer vision', 'robotics'
    ];

    if (keyPhrases.some(phrase => fullText.includes(phrase))) {
      summary = '人工智能领域最新进展：';
    } else {
      summary = 'AI相关资讯：';
    }

    const cleanDesc = description.replace(/<[^>]+>/g, '').substring(0, 80);
    return summary + cleanDesc + '...';
  }

  findRelatedTools(title, description) {
    const articleText = (title + ' ' + description).toLowerCase();
    const matchedTools = [];

    for (const tool of AINewsConfig.aiTools) {
      let score = 0;
      const matchedKeywords = [];

      for (const keyword of tool.keywords) {
        if (articleText.includes(keyword.toLowerCase())) {
          score += 1;
          matchedKeywords.push(keyword);
        }
      }

      if (score >= 1) {
        matchedTools.push({
          tool_name: tool.name,
          tool_category: tool.category,
          tool_url: '#',
          reason: `相关内容: ${matchedKeywords[0] || 'AI技术'}`,
          score: score
        });
      }
    }

    return matchedTools.sort((a, b) => b.score - a.score).slice(0, 3);
  }

  categorizeArticle(article) {
    const title = (article.title || '').toLowerCase();
    const description = (article.description || article.summary || '').toLowerCase();
    const fullText = (title + ' ' + description).toLowerCase();
    
    const industryKeywords = ['business', 'market', 'funding', 'company', 'investment', 'startup', 'enterprise', 'industry', 'commercial', 'launch', 'product'];
    const techKeywords = ['research', 'model', 'algorithm', 'technical', 'science', 'study', 'development', 'innovation', 'breakthrough', 'method', 'architecture'];
    const applicationKeywords = ['use', 'application', 'tool', 'platform', 'solution', 'product', 'implementation', 'real-world', 'practical', 'case study'];
    
    const industryCount = industryKeywords.filter(keyword => fullText.includes(keyword)).length;
    const techCount = techKeywords.filter(keyword => fullText.includes(keyword)).length;
    const appCount = applicationKeywords.filter(keyword => fullText.includes(keyword)).length;
    
    if (techCount >= industryCount && techCount >= appCount) {
      return '技术前沿';
    } else if (appCount >= industryCount && appCount >= techCount) {
      return '应用热点';
    } else if (industryCount > 0) {
      return '行业新闻';
    }
    
    return 'AI动态';
  }

  filterNews(category) {
    this.currentCategory = category;
    const container = document.getElementById('ai-news-content');
    if (!container) return;
    
    let articles = this.articles;
    
    if (category !== 'all') {
      articles = articles.filter(article => {
        const articleCategory = this.categorizeArticle(article);
        return articleCategory === category || 
               (category === 'industry' && articleCategory === '行业新闻') ||
               (category === 'tech' && articleCategory === '技术前沿') ||
               (category === 'application' && articleCategory === '应用热点');
      });
    }
    
    if (articles.length === 0) {
      DOMOptimizer.batchUpdate(container, this.generateEmptyState());
      return;
    }

    const html = articles.map(article => this.generateArticleHTML(article)).join('');
    DOMOptimizer.batchUpdate(container, html);
    
    // 更新活动过滤器状态
    this.updateActiveNewsFilter(category);
  }

  generateArticleHTML(article) {
    const publishDate = new Date(article.publishTime).toLocaleDateString('zh-CN');
    const aiScoreDisplay = Math.round(article.aiScore * 10) / 10;
    const category = this.categorizeArticle(article);

    return `
      <article class="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6 hover:shadow-lg transition-all duration-300 border-l-4 border-blue-500">
        <div class="flex flex-col space-y-4">
          <div class="flex items-start justify-between space-x-4">
            <h3 class="text-xl font-bold text-gray-900 dark:text-white leading-tight flex-1">
              <a href="${article.url}" target="_blank" rel="noopener"
                 class="block hover:text-blue-600 dark:hover:text-blue-400 transition-colors hover:underline">
                ${article.titleZh || article.title}
                <i class="fas fa-external-link-alt ml-2 text-xs"></i>
              </a>
            </h3>
            <div class="flex items-center space-x-2">
              <span class="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full border">
                <i class="fas fa-robot mr-1"></i>${aiScoreDisplay}/10
              </span>
              <span class="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">${category}</span>
            </div>
          </div>

          <div class="text-gray-700 dark:text-gray-300 text-sm leading-relaxed bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
            <i class="fas fa-language text-blue-600 mr-2"></i>
            ${article.summaryZh || article.summary}
          </div>

          <div class="flex flex-wrap items-center justify-between text-sm text-gray-600 dark:text-gray-400 gap-4">
            <div class="flex items-center space-x-4">
              <span class="flex items-center" title="发布时间">
                <i class="far fa-calendar-alt mr-2"></i> ${publishDate}
              </span>
              <span class="flex items-center" title="来源">
                <i class="far fa-newspaper mr-2"></i> ${article.source}
              </span>
              ${article.author ? `<span class="flex items-center" title="作者">
                <i class="far fa-user mr-2"></i> ${article.author}
              </span>` : ''}
            </div>

            ${article.matchedTools && article.matchedTools.length > 0 ?
              `<div class="flex items-center space-x-2">
                <span class="text-xs text-gray-500">相关推荐:</span>
                ${article.matchedTools.slice(0, 2).map(tool =>
                  `<span class="px-2 py-1 text-xs bg-green-100 text-green-800 rounded cursor-pointer"
                         title="${tool.reason || '相关AI技术'}">
                    <i class="fas fa-cog mr-1"></i>${tool.tool_name}
                  </span>`
                ).join('')}
              </div>` : ''
            }
          </div>
        </div>
      </article>
    `;
  }

  generateEmptyState() {
    return `
      <div class="text-center py-16 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
        <div class="text-6xl mb-6">📰</div>
        <h3 class="text-xl font-semibold text-gray-800 dark:text-white mb-2">暂无AI资讯</h3>
        <p class="text-gray-500 mb-4">我们正在为您准备最新的AI新闻，请稍后再试</p>
        <button onclick="location.reload()" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <i class="fas fa-redo mr-2"></i>重新加载
        </button>
      </div>
    `;
  }

  updateActiveNewsFilter(activeCategory) {
    const filterButtons = document.querySelectorAll('.news-filter-btn');
    filterButtons.forEach(btn => {
      if (btn.getAttribute('data-filter') === activeCategory) {
        btn.classList.remove('bg-gray-200', 'dark:bg-gray-700', 'text-gray-800', 'dark:text-gray-200');
        btn.classList.add('bg-blue-500', 'dark:bg-blue-600', 'text-white');
      } else {
        btn.classList.remove('bg-blue-500', 'dark:bg-blue-600', 'text-white');
        btn.classList.add('bg-gray-200', 'dark:bg-gray-700', 'text-gray-800', 'dark:text-gray-200');
      }
    });
  }

  updateLastUpdateTime() {
    const timeElement = document.getElementById('last-update-time');
    if (timeElement) {
      const now = new Date();
      const timeStr = now.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
      timeElement.textContent = '刚刚更新 - ' + timeStr;
    }
  }

  performSearch(query) {
    const container = document.getElementById('ai-news-content');
    if (!container) return;

    if (!query || query.trim() === '') {
      this.filterNews(this.currentCategory);
      return;
    }

    const searchTerm = query.toLowerCase();
    const filteredArticles = this.articles.filter(article => 
      (article.title && article.title.toLowerCase().includes(searchTerm)) || 
      (article.summary && article.summary.toLowerCase().includes(searchTerm)) ||
      (article.source && article.source.toLowerCase().includes(searchTerm)) ||
      (article.description && article.description.toLowerCase().includes(searchTerm))
    );

    if (filteredArticles.length === 0) {
      DOMOptimizer.batchUpdate(container, `
        <div class="text-center py-12">
          <i class="fas fa-search text-4xl text-gray-400 mb-4"></i>
          <p class="text-gray-500 dark:text-gray-400 text-lg">未找到与 "${query}" 相关的资讯</p>
          <p class="text-gray-400 dark:text-gray-500 mt-2">请尝试其他关键词</p>
        </div>
      `);
      return;
    }

    const html = filteredArticles.map(article => this.generateArticleHTML(article)).join('');
    DOMOptimizer.batchUpdate(container, html);
  }

  // 预加载数据以提高性能
  async preloadData() {
    setTimeout(async () => {
      console.log('🚀 开始预加载数据...');
      await this.dataLoader.loadWithCache('./data/tools.json', 'tools_cache');
      await this.dataLoader.loadWithCache('./data/products.json', 'products_cache');
      await this.dataLoader.loadWithCache('./data/learning-resources.json', 'learning_cache');
      await this.dataLoader.loadWithCache('./data/topics.json', 'topics_cache');
      console.log('✅ 数据预加载完成');
    }, 2000); // 在主内容加载后2秒开始预加载
  }

  // 手动更新数据
  async update() {
    console.log('🔄 开始手动更新数据...');
    
    // 清除相关缓存
    localStorage.removeItem('news_cache');
    localStorage.removeItem('news_cache_backup');
    
    // 重新加载数据
    await this.loadArticles();
    
    // 重新应用当前过滤器
    this.filterNews(this.currentCategory);
    
    // 更新时间戳
    this.updateLastUpdateTime();
    
    console.log('✅ 数据更新完成');
  }
}

// 全局优化接口
window.AIOptimizedSystem = {
  processor: null,
  isInitialized: false,

  init: async function() {
    if (this.isInitialized) {
      return true;
    }

    try {
      if (!this.processor) {
        this.processor = new OptimizedNewsProcessor();
      }

      await this.processor.init();
      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error('❌ 系统初始化失败:', error);
      this.isInitialized = false;
      return false;
    }
  },

  update: async function() {
    if (this.processor && this.isInitialized) {
      return await this.processor.update();
    }
    return this.init();
  },

  search: function(query) {
    if (this.processor && this.isInitialized) {
      this.processor.debouncedSearch(query);
    }
  }
};

// 优化的工具、产品、学习资源和专题加载
class ContentManager {
  constructor() {
    this.dataLoader = new DataLoader();
  }

  async loadTools() {
    try {
      const data = await this.dataLoader.loadWithCache('./data/tools.json', 'tools_cache');
      if (data && data.tools && Array.isArray(data.tools)) {
        AINewsConfig.aiTools = data.tools;
        console.log(`✅ 工具数据加载成功: ${data.tools.length} 个工具`);
        return data.tools;
      }
    } catch (error) {
      console.error('❌ 加载工具数据失败:', error);
    }
    return AINewsConfig.aiTools;
  }

  async loadProducts() {
    try {
      const data = await this.dataLoader.loadWithCache('./data/products.json', 'products_cache');
      if (data && data.products && Array.isArray(data.products)) {
        console.log(`✅ 产品数据加载成功: ${data.products.length} 个产品`);
        return data.products;
      }
    } catch (error) {
      console.error('❌ 加载产品数据失败:', error);
    }
    return [];
  }

  async loadLearningResources() {
    try {
      const data = await this.dataLoader.loadWithCache('./data/learning-resources.json', 'learning_cache');
      if (data && data.resources && Array.isArray(data.resources)) {
        console.log(`✅ 学习资源数据加载成功: ${data.resources.length} 个资源`);
        return data.resources;
      }
    } catch (error) {
      console.error('❌ 加载学习资源数据失败:', error);
    }
    return [];
  }

  async loadTopics() {
    try {
      const data = await this.dataLoader.loadWithCache('./data/topics.json', 'topics_cache');
      if (data && data.topics && Array.isArray(data.topics)) {
        console.log(`✅ 专题数据加载成功: ${data.topics.length} 个专题`);
        return data.topics;
      }
    } catch (error) {
      console.error('❌ 加载专题数据失败:', error);
    }
    return [];
  }
}