# 资讯自动化数据导入工具

用于AI智能体将搜索结果自动写入资讯数据库的Python自动化脚本。

## 功能特性

- ✅ 支持批量导入文章数据
- ✅ 自动数据验证（必填字段、长度检查、类型检查）
- ✅ 防SQL注入和XSS攻击
- ✅ 事务支持，失败自动回滚
- ✅ 详细日志记录
- ✅ 分类存在性检查
- ✅ 图片URL自动处理
- ✅ 完善的错误处理和重试机制

## 安装依赖

```bash
pip install mysql-connector-python
```

## 配置

### 数据库配置

**方式1：使用命令行参数**
```bash
python article_auto_writer.py \
  --host localhost \
  --port 3306 \
  --database likeadmin \
  --user root \
  --password your_password
```

**方式2：使用配置文件**

创建 `config.json`：
```json
{
  "database": {
    "host": "localhost",
    "port": 3306,
    "database": "likeadmin",
    "user": "root",
    "password": "your_password"
  },
  "article": {
    "default_cid": 1,
    "default_is_show": 1,
    "default_sort": 0,
    "default_click_virtual": 0
  }
}
```

然后运行：
```bash
python article_auto_writer.py --config config.json --data articles.json
```

## 数据格式

创建一个JSON文件（如 `articles.json`）：

```json
[
  {
    "title": "文章标题",
    "desc": "简短描述",
    "abstract": "文章摘要",
    "content": "<p>HTML格式内容</p>",
    "author": "作者名",
    "cid": 1,
    "image": "https://example.com/image.jpg",
    "click_virtual": 10,
    "is_show": 1,
    "sort": 0
  }
]
```

## 使用方法

### 1. 查看所有分类
```bash
python article_auto_writer.py \
  --host localhost \
  --password your_password \
  --list-categories
```

输出示例：
```
=== Article Categories ===
ID: 1 | Name: 科技     | Sort: 0 | Show: 1 | Created: 2022-09-16 08:34:40
ID: 2 | Name: 生活     | Sort: 0 | Show: 1 | Created: 2022-09-16 08:34:40
ID: 3 | Name: 好物     | Sort: 0 | Show: 1 | Created: 2024-09-23 05:54:18
```

### 2. 生成示例数据
```bash
python article_auto_writer.py --sample
```

会生成 `sample_articles.json` 文件，包含示例文章数据。

### 3. 导入文章数据
```bash
python article_auto_writer.py \
  --host localhost \
  --password your_password \
  --data sample_articles.json
```

### 4. 使用配置文件
```bash
python article_auto_writer.py \
  --config config.json \
  --data articles.json
```

## 字段说明

| 字段 | 类型 | 必填 | 说明 | 示例 |
|------|------|------|------|------|
| `title` | string | ✅ | 文章标题，1-255字符 | "人工智能在医疗领域的应用" |
| `cid` | int | ✅ | 分类ID，必须存在 | 1 |
| `is_show` | int | ✅ | 是否显示，0或1 | 1 |
| `abstract` | string | ✅ | 文章摘要 | "本文探讨了AI技术的最新进展..." |
| `desc` | string | ❌ | 简短描述 | "AI技术改变医疗行业" |
| `content` | string | ❌ | HTML格式内容 | "<p>人工智能技术...</p>" |
| `author` | string | ❌ | 作者名 | "AI观察员" |
| `image` | string | ❌ | 图片URL或本地路径 | "https://example.com/image.jpg" |
| `click_virtual` | int | ❌ | 虚拟浏览量，默认0 | 100 |
| `sort` | int | ❌ | 排序值，默认0 | 100 |

## AI智能体集成示例

### OpenAI GPT示例
```python
import openai
import json
import subprocess

# 1. AI搜索和内容生成
response = openai.ChatCompletion.create(
    model="gpt-4",
    messages=[
        {
            "role": "user",
            "content": "搜索最新的AI技术进展，写成5篇资讯文章，返回JSON格式"
        }
    ]
)

# 2. 解析为结构化数据
articles = parse_ai_response(response)

# 3. 写入数据库
with open('articles.json', 'w', encoding='utf-8') as f:
    json.dump(articles, f, ensure_ascii=False, indent=2)

subprocess.run([
    'python', 'article_auto_writer.py',
    '--password', 'your_password',
    '--data', 'articles.json'
])
```

### Claude API示例
```python
import anthropic
import json
import subprocess

client = anthropic.Anthropic()

# 生成文章
message = client.messages.create(
    model="claude-3-opus-20240229",
    max_tokens=4096,
    messages=[{
        "role": "user",
        "content": "生成5篇关于量子计算的资讯文章，返回JSON格式"
    }]
)

# 提取文章数据
articles = extract_articles_from_claude(message)

# 导入数据库
with open('articles.json', 'w', encoding='utf-8') as f:
    json.dump(articles, f, ensure_ascii=False, indent=2)

subprocess.run([
    'python', 'article_auto_writer.py',
    '--password', 'your_password',
    '--data', 'articles.json'
])
```

### 每日自动化工作流
```python
#!/usr/bin/env python3
import json
import subprocess
from datetime import datetime

def daily_news_automation():
    """每日新闻自动化流程"""

    # 1. 查看可用分类
    result = subprocess.run([
        'python', 'article_auto_writer.py',
        '--password', 'moon5201314',
        '--list-categories'
    ], capture_output=True, text=True)

    print("可用分类：")
    print(result.stdout)

    # 2. 生成文章（这里接入你的AI逻辑）
    articles = [
        {
            "title": "今日AI新闻1",
            "desc": "AI技术的最新突破",
            "abstract": "研究人员在自然语言处理领域取得重大进展...",
            "content": "<p>详细内容...</p>",
            "author": "AI智能体",
            "cid": 1,
            "image": "",
            "click_virtual": 50,
            "is_show": 1,
            "sort": 100
        },
        # 更多文章...
    ]

    # 3. 保存数据
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    filename = f'articles_{timestamp}.json'

    with open(filename, 'w', encoding='utf-8') as f:
        json.dump(articles, f, ensure_ascii=False, indent=2)

    # 4. 导入数据库
    result = subprocess.run([
        'python', 'article_auto_writer.py',
        '--password', 'moon5201314',
        '--data', filename
    ], capture_output=True, text=True)

    print("导入结果：")
    print(result.stdout)

if __name__ == '__main__':
    daily_news_automation()
```

## 错误处理

脚本会自动处理以下错误：
- ❌ 数据库连接失败
- ❌ 必填字段缺失
- ❌ 字段长度超限
- ❌ 分类不存在
- ❌ SQL注入/ XSS攻击
- ❌ 事务失败自动回滚

所有错误都会记录到 `article_import.log` 文件。

### 日志示例
```
[2026-03-26 10:30:00] [info] 数据库连接成功
[2026-03-26 10:30:00] [info] 开始批量插入 3 篇文章
[2026-03-26 10:30:00] [info] 处理进度: 1/3
[2026-03-26 10:30:00] [success] 成功插入文章: ID=4, Title=人工智能在医疗领域的应用
[2026-03-26 10:30:01] [info] 处理进度: 2/3
[2026-03-26 10:30:01] [error] 数据验证失败: 分类ID 99 不存在
[2026-03-26 10:30:01] [error] 文章数据: {"title":"测试","cid":99,...}
[2026-03-26 10:30:02] [info] 处理进度: 3/3
[2026-03-26 10:30:02] [success] 成功插入文章: ID=5, Title=量子计算：下一代计算革命
[2026-03-26 10:30:02] [info] 批量插入完成: 成功=2, 失败=1, 总数=3
```

## 安全特性

- ✅ 使用参数化查询防止SQL注入
- ✅ HTML内容过滤防止XSS攻击
- ✅ 字段长度限制防止溢出
- ✅ 分类存在性验证
- ✅ 事务支持保证数据一致性
- ✅ 特殊字符转义

## 性能基准

| 数据量 | 预期耗时 | 说明 |
|--------|----------|------|
| 1-10篇 | < 1秒 | 单条插入 |
| 10-100篇 | 1-3秒 | 批量插入 |
| 100-1000篇 | 3-10秒 | 批量插入 |
| 1000-10000篇 | 10-60秒 | 建议分批 |

## 常见问题

### Q: 如何处理图片上传？
A: 脚本支持完整URL。本地图片需要先上传到服务器或使用完整的HTTP URL。

### Q: 如何批量导入大量数据？
A: 直接在JSON数组中包含多篇文章即可，脚本会自动批量处理。建议每批不超过1000篇。

### Q: 数据验证失败怎么办？
A: 查看日志文件 `article_import.log`，会详细说明失败原因和具体数据。

### Q: 如何自定义字段？
A: 修改脚本中的 `validate_article()` 和 `insert_article()` 方法。

### Q: 如何在Docker环境中使用？
A: 将 `--host` 设置为 `localhost`，确保Docker端口映射正确（如13306）。

## Docker环境使用

如果你的数据库在Docker容器中运行：

```bash
# 使用映射的端口
python article_auto_writer.py \
  --host localhost \
  --port 13306 \
  --database likeadmin \
  --user root \
  --password your_password \
  --data articles.json
```

## 完整工作流示例

### 场景：AI智能体自动生成科技资讯

```python
#!/usr/bin/env python3
"""
AI智能体自动化工作流
每天自动生成并导入科技资讯
"""

import json
import subprocess
import requests
from datetime import datetime

class NewsAutomation:
    def __init__(self, db_password):
        self.db_password = db_password

    def fetch_tech_news(self):
        """从AI API获取科技新闻"""
        # 这里接入你的AI API
        # 示例：调用GPT-4生成文章
        return [
            {
                "title": "GPT-5即将发布：更强大的AI能力",
                "desc": "OpenAI下一代模型即将到来",
                "abstract": "据可靠消息，OpenAI将在近期发布GPT-5模型...",
                "content": "<p>详细内容...</p>",
                "author": "AI智能体",
                "cid": 1,
                "click_virtual": 100,
                "is_show": 1,
                "sort": 100
            }
        ]

    def check_categories(self):
        """检查可用分类"""
        result = subprocess.run([
            'python', 'article_auto_writer.py',
            '--password', self.db_password,
            '--list-categories'
        ], capture_output=True, text=True)

        print("=== 可用分类 ===")
        print(result.stdout)
        return result.returncode == 0

    def import_articles(self, articles):
        """导入文章到数据库"""
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f'auto_articles_{timestamp}.json'

        # 保存到文件
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(articles, f, ensure_ascii=False, indent=2)

        # 导入数据库
        result = subprocess.run([
            'python', 'article_auto_writer.py',
            '--password', self.db_password,
            '--data', filename
        ], capture_output=True, text=True)

        print("=== 导入结果 ===")
        print(result.stdout)

        if result.returncode != 0:
            print("错误：")
            print(result.stderr)

        return result.returncode == 0

    def run(self):
        """运行自动化流程"""
        print(f"\n{'='*50}")
        print(f"新闻自动化流程 - {datetime.now()}")
        print(f"{'='*50}\n")

        # 1. 检查分类
        if not self.check_categories():
            print("❌ 分类检查失败")
            return False

        # 2. 获取新闻
        print("📰 正在获取新闻...")
        articles = self.fetch_tech_news()
        print(f"✅ 获取到 {len(articles)} 篇文章")

        # 3. 导入数据库
        print("💾 正在导入数据库...")
        success = self.import_articles(articles)

        if success:
            print("✅ 导入成功！")
        else:
            print("❌ 导入失败")

        return success

# 使用示例
if __name__ == '__main__':
    automation = NewsAutomation(db_password='moon5201314')
    automation.run()
```

## 许可

MIT License
