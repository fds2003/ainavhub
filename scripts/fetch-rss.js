#!/usr/bin/env node

/**
 * AI资讯导航 - RSS数据抓取脚本
 * 通用版 AiNavHub 项目脚本
 *
 * 功能：
 * - 从多个AI相关RSS源抓取新闻
 * - 智能内容评分和筛选
 * - 生成前端可直接使用的JSON数据
 * - 支持错误处理和日志记录
 */

const fs = require('fs');
const path = require('path');

// RSS解析器（使用轻量级实现）
class RSSParser {
  constructor() {
    this.sources = [
      {
        name: 'ArXiv AI 研究',
        url: 'https://export.arxiv.org/rss/cs.AI',
        category: '学术研究',
        weight: 0.9,
        enabled: true
      },
      {
        name: 'MIT人工智能新闻',
        url: 'https://news.mit.edu/rss/topic/artificial-intelligence',
        category: '学术动态',
        weight: 0.85,
        enabled: true
      },
      {
        name: 'AI 趋势',
        url: 'https://www.aitrends.com/feed/',
        category: '行业趋势',
        weight: 0.8,
        enabled: true
      },
      {
        name: 'VentureBeat AI',
        url: 'https://venturebeat.com/ai/feed/',
        category: '商业资讯',
        weight: 0.8,
        enabled: true
      }
    ];

    this.aiKeywords = {
      tier1: {
        'artificial intelligence': 5, 'AI': 4, 'machine learning': 4, 'deep learning': 4,
        'neural network': 3, 'neural networks': 3, 'LLM': 3, 'GPT': 3, 'ChatGPT': 3,
        'computer vision': 3, 'natural language processing': 3, 'NLP': 3,
        'robotics': 2.5, 'automation': 2.5, 'algorithm': 2
      },
      tier2: {
        'transformer': 2, 'bert': 2, 'dall-e': 2, 'stable diffusion': 2,
        'reinforcement learning': 2, 'supervised learning': 2, 'unsupervised learning': 2,
        'data science': 1.5, 'big data': 1.5, 'cloud computing': 1, 'edge computing': 1
      }
    };
  }

  parseRSSXml(xmlText, source) {
    try {
      // 简化的XML解析
      const items = [];
      const channelMatch = xmlText.match(/<channel[^>]*>([\s\S]*?)<\/channel>/);
      if (!channelMatch) return items;

      const channelText = channelMatch[1];
      const sourceName = source.name;
      const sourceCategory = source.category;

      // 提取单个新闻项
      const itemRegex = /<item[^>]*>([\s\S]*?)<\/item>/gi;
      let match;
      let count = 0;

      while ((match = itemRegex.exec(channelText)) !== null && count < 8) {
        const itemText = match[1];

        const title = this.extractTag(itemText, 'title');
        const link = this.extractTag(itemText, 'link');
        const description = this.extractTag(itemText, 'description');
        const pubDate = this.extractTag(itemText, 'pubDate');

        if (title && link) {
          const aiScore = this.calculateAIScore(title + ' ' + description);

          if (aiScore >= 3) { // 只保留AI相关度较高的内容
            const cleanedTitle = this.cleanText(title);
            const cleanedDescription = this.cleanText(description || title);
            
            // 暂时不进行实时翻译，只添加原文
            // 翻译将在fetchRSSData方法中统一异步执行
            const article = {
              title: cleanedTitle,
              link: link.trim(),
              description: cleanedDescription,
              pubDate: this.parseDate(pubDate),
              source: sourceName,
              category: sourceCategory,
              aiScore: Math.round(aiScore * 10) / 10
            };
            
            items.push(article);
            count++;
          }
        }
      }

      return items;
    } catch (error) {
      console.error(`解析RSS失败 [${source.name}]:`, error.message);
      return [];
    }
  }

  extractTag(text, tagName) {
    // 支持多种XML格式
    const patterns = [
      new RegExp(`<${tagName}\\s*[^>]*>([\\s\\S]*?)<\/${tagName}>`, 'i'),
      new RegExp(`<${tagName}>([\\s\\S]*?)<\/${tagName}>`, 'i')
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }
    return '';
  }

  parseDate(dateStr) {
    if (!dateStr) return new Date().toISOString();

    try {
      const date = new Date(dateStr);
      return isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
    } catch {
      return new Date().toISOString();
    }
  }

  calculateAIScore(text) {
    if (!text) return 0;

    const lowerText = text.toLowerCase();
    let score = 0;

    // 计算第一层级关键词得分
    for (const [keyword, weight] of Object.entries(this.aiKeywords.tier1)) {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      const matches = lowerText.match(regex);
      if (matches) {
        score += weight * matches.length;
      }
    }

    // 计算第二层级关键词得分
    for (const [keyword, weight] of Object.entries(this.aiKeywords.tier2)) {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      const matches = lowerText.match(regex);
      if (matches) {
        score += weight * matches.length;
      }
    }

    return score;
  }

  cleanText(text) {
    if (!text) return '';

    return text
      .replace(/<[^>]+>/g, '')           // 移除HTML标签
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&apos;/g, "'")
      .replace(/&#39;/g, "'")
      .replace(/&#34;/g, '"')
      .trim()
      .slice(0, 500);                    // 限制描述长度
  }

  async translateToChinese(text) {
    // 使用免费的翻译服务或API
    // 为了在无外部依赖的情况下实现中文标题显示，我们可以使用一个简单的方法
    // 这里先使用一个模拟翻译函数，实际部署时可以用适当的翻译API
    
    // 如果有环境变量配置了翻译API，则使用API进行翻译
    if (process.env.TRANSLATION_API_KEY) {
      try {
        // 模拟调用翻译API，具体实现取决于使用的翻译服务
        // 这里提供一个通用的框架
        const response = await fetch('https://api-free.deepl.com/v2/translate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `DeepL-Auth-Key ${process.env.TRANSLATION_API_KEY}`
          },
          body: JSON.stringify({
            text: [text],
            target_lang: 'ZH'
          })
        });
        
        const result = await response.json();
        return result.translations[0].text;
      } catch (error) {
        console.error('翻译API调用失败:', error.message);
        // 如果API调用失败，使用备用的关键词翻译
        return this.fallbackTranslate(text);
      }
    } else {
      // 如果没有配置翻译API，使用备用的关键词翻译
      return this.fallbackTranslate(text);
    }
  }

  fallbackTranslate(text) {
    // 创建一个基本的AI术语翻译映射表
    const translationMap = {
      'artificial intelligence': '人工智能',
      'AI': '人工智能',
      'machine learning': '机器学习',
      'deep learning': '深度学习',
      'neural network': '神经网络',
      'neural networks': '神经网络',
      'LLM': '大语言模型',
      'GPT': 'GPT',
      'ChatGPT': 'ChatGPT',
      'computer vision': '计算机视觉',
      'natural language processing': '自然语言处理',
      'NLP': '自然语言处理',
      'robotics': '机器人技术',
      'automation': '自动化',
      'algorithm': '算法',
      'transformer': 'Transformer',
      'bert': 'BERT',
      'dall-e': 'DALL-E',
      'stable diffusion': 'Stable Diffusion',
      'reinforcement learning': '强化学习',
      'supervised learning': '监督学习',
      'unsupervised learning': '无监督学习',
      'data science': '数据科学',
      'big data': '大数据',
      'cloud computing': '云计算',
      'edge computing': '边缘计算',
      'AI model': 'AI模型',
      'large language model': '大语言模型',
      'prompt': '提示词',
      'embedding': '嵌入',
      'token': '令牌',
      'attention': '注意力机制',
      'training': '训练',
      'inference': '推理',
      'fine-tuning': '微调',
      'dataset': '数据集',
      'accuracy': '准确率',
      'precision': '精确率',
      'recall': '召回率',
      'f1 score': 'F1分数',
      'performance': '性能',
      'optimization': '优化',
      'framework': '框架',
      'library': '库',
      'tool': '工具',
      'platform': '平台',
      'application': '应用',
      'system': '系统',
      'technology': '技术',
      'research': '研究',
      'development': '开发',
      'innovation': '创新',
      'future': '未来',
      'trend': '趋势',
      'insight': '洞察',
      'analysis': '分析',
      'prediction': '预测',
      'challenge': '挑战',
      'opportunity': '机遇',
      'solution': '解决方案',
      'case study': '案例研究',
      'best practices': '最佳实践',
      'ethical': '伦理',
      'responsible': '负责任',
      'trustworthy': '可信',
      'accountability': '问责制',
      'hiring': '招聘',
      'bias': '偏见',
      'discrimination': '歧视',
      'fairness': '公平性',
      'security': '安全',
      'privacy': '隐私',
      'protection': '保护',
      'regulation': '监管',
      'policy': '政策',
      'governance': '治理',
      'framework': '框架',
      'standard': '标准',
      'compliance': '合规',
      'ethics': '伦理',
      'values': '价值观',
      'human': '人类',
      'collaboration': '协作',
      'partnership': '合作伙伴关系',
      'integration': '集成',
      'implementation': '实施',
      'deployment': '部署',
      'maintenance': '维护',
      'monitoring': '监控',
      'evaluation': '评估',
      'improvement': '改进',
      'advancement': '进展',
      'progress': '进步',
      'breakthrough': '突破',
      'discovery': '发现',
      'exploration': '探索',
      'experiment': '实验',
      'study': '研究',
      'finding': '发现',
      'result': '结果',
      'outcome': '成果',
      'impact': '影响',
      'benefit': '益处',
      'risk': '风险',
      'threat': '威胁',
      'vulnerability': '脆弱性',
      'robustness': '鲁棒性',
      'reliability': '可靠性',
      'stability': '稳定性',
      'efficiency': '效率',
      'scalability': '可扩展性',
      'adaptability': '适应性',
      'flexibility': '灵活性',
      'usability': '可用性',
      'accessibility': '可访问性',
      'affordability': '可负担性',
      'sustainability': '可持续性',
      'transparency': '透明度',
      'explainability': '可解释性',
      'interpretability': '可解释性'
    };

    let translatedText = text;

    // 按长度排序，先翻译较长的术语，避免短词干扰长词
    const sortedTerms = Object.keys(translationMap).sort((a, b) => b.length - a.length);

    for (const term of sortedTerms) {
      const regex = new RegExp(term, 'gi');
      translatedText = translatedText.replace(regex, (match) => {
        // 保持原始的大小写格式
        if (match === match.toUpperCase()) {
          return translationMap[term].toUpperCase();
        } else if (match === match.toLowerCase()) {
          return translationMap[term].toLowerCase();
        } else if (match[0] === match[0].toUpperCase()) {
          // 首字母大写
          return translationMap[term].charAt(0).toUpperCase() + translationMap[term].slice(1);
        } else {
          return translationMap[term];
        }
      });
    }

    // 如果翻译结果和原文一样，说明没有匹配到关键词，可以考虑使用更高级的翻译方式
    if (translatedText === text) {
      console.log(`⚠️  未能翻译标题: "${text}" (关键词库中未找到匹配项)`);
      return text; // 返回原文
    }

    return translatedText;
  }

  async fetchWithSimpleHttp(url, timeout = 10000) {
    return new Promise((resolve, reject) => {
      const http = require('http');
      const https = require('https');

      const client = url.startsWith('https') ? https : http;

      const req = client.get(url, { timeout }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(data);
          } else {
            reject(new Error(`HTTP ${res.statusCode}`));
          }
        });
      });

      req.on('error', reject);
      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });
    });
  }

  async fetchRSSData() {
    console.log('🚀 开始抓取AI新闻数据...');

    const allArticles = [];
    const startTime = Date.now();
    let successCount = 0;
    let failedCount = 0;

    for (const source of this.sources.filter(s => s.enabled)) {
      try {
        console.log(`📡 正在获取: ${source.name}`);

        const xmlContent = await this.fetchWithSimpleHttp(source.url, 15000);
        const articles = this.parseRSSXml(xmlContent, source);

        allArticles.push(...articles);
        successCount++;
        console.log(`  ✅ ${source.name}: 获取到 ${articles.length} 条新闻`);

      } catch (error) {
        failedCount++;
        console.log(`  ❌ ${source.name}: ${error.message}`);
      }
    }

    // 对所有标题进行翻译（如果配置了翻译API）
    console.log('🌐 正在翻译标题为中文...');
    const translationPromises = allArticles.map(async (article) => {
      if (process.env.TRANSLATION_API_KEY) {
        article.title_zh = await this.translateToChinese(article.title);
      } else {
        // 如果没有配置翻译API，使用原文
        article.title_zh = article.title;
      }
      return article;
    });
    
    await Promise.all(translationPromises);
    console.log('✅ 标题翻译完成');

    const duration = Date.now() - startTime;
    console.log(`\n📊 抓取完成: 总计 ${allArticles.length} 条新闻 (${duration}ms)`);
    console.log(`✅ 成功: ${successCount}  |  ❌ 失败: ${failedCount}`);

    return allArticles;
  }

  generateSummary(articles) {
    // 按时间排序
    articles.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));

    // 按分数再排序，确保高质量内容在前
    articles.sort((a, b) => b.aiScore - a.aiScore);

    const uniqueArticles = this.removeDuplicates(articles);

    return {
      articles: uniqueArticles.slice(0, 20), // 只保留20条最佳内容
      metadata: {
        totalCount: uniqueArticles.length,
        generatedAt: new Date().toISOString(),
        sources: this.sources.filter(s => s.enabled).map(s => ({
          name: s.name,
          category: s.category,
          weight: s.weight
        })),
        keywords: this.aiKeywords
      },
      summary: {
        researchArticles: uniqueArticles.filter(a => a.category.includes('研究')).length,
        industryArticles: uniqueArticles.filter(a => a.category.includes('行业')).length,
        academicArticles: uniqueArticles.filter(a => a.category.includes('学术')).length,
        averageScore: uniqueArticles.reduce((sum, a) => sum + a.aiScore, 0) / uniqueArticles.length
      }
    };
  }

  removeDuplicates(articles) {
    const seen = new Set();
    return articles.filter(article => {
      const key = article.title.toLowerCase().replace(/\s+/g, ' ').trim();
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }
}

// 主执行函数
async function main() {
  console.log('🤖 AiNavHub RSS数据抓取器');
  console.log('=' .repeat(50));

  try {
    const parser = new RSSParser();
    const articles = await parser.fetchRSSData();

    if (articles.length === 0) {
      console.log('⚠️  警告: 没有获取到任何新闻数据，检查网络连接和RSS源');
      process.exit(1);
    }

    const summary = parser.generateSummary(articles);

    // 确保数据目录存在
    const dataDir = path.join(__dirname, '..', 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    // 保存数据文件
    const outputPath = path.join(dataDir, 'rss-data.json');
    fs.writeFileSync(outputPath, JSON.stringify(summary, null, 2));

    // 同时创建备用格式的数据
    backupData = {
      articles: summary.articles.map(a => ({
        title: a.title,
        title_zh: a.title_zh || a.title,  // 中文标题，如果不存在则使用原文
        description: a.description,
        link: a.link,
        source: a.source,
        category: a.category,
        date: a.pubDate.split('T')[0]
      }))
    };

    fs.writeFileSync(
      path.join(dataDir, 'rss-data-simple.json'),
      JSON.stringify(backupData, null, 2)
    );

    console.log('\n✅ 数据成功保存到:');
    console.log(`  📁 ${outputPath}`);
    console.log(`  📁 ${path.join(dataDir, 'rss-data-simple.json')}`);

    // 输出统计信息
    if (summary.summary) {
      console.log('\n📈 内容统计:');
      console.log(`  🔬 研究内容: ${summary.summary.researchArticles} 条`);
      console.log(`  🏢 行业资讯: ${summary.summary.industryArticles} 条`);
      console.log(`  🎓 学术动态: ${summary.summary.academicArticles} 条`);
      console.log(`  ⭐ 平均评分: ${summary.summary.averageScore.toFixed(1)}`);
    }

    console.log('\n🎉 RSS数据抓取完成！数据已准备就绪。');

  } catch (error) {
    console.error('\n❌ RSS数据抓取失败:', error.message);
    process.exit(1);
  }
}

// 如果是直接运行此脚本
if (require.main === module) {
  main();
}

module.exports = RSSParser;