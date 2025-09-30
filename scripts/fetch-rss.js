#!/usr/bin/env node

/**
 * AI资讯导航 - RSS数据抓取脚本
 * 专为fds2003的AiNavHub项目定制
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
            items.push({
              title: this.cleanText(title),
              link: link.trim(),
              description: this.cleanText(description || title),
              pubDate: this.parseDate(pubDate),
              source: sourceName,
              category: sourceCategory,
              aiScore: Math.round(aiScore * 10) / 10
            });
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
  console.log('🤖 AiNavHub RSS数据抓取器 - 专为fds2003定制');
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