#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
资讯自动化数据导入脚本
用于AI智能体将搜索结果自动写入资讯数据库

使用方法:
    python article_auto_writer.py --config config.json

数据格式:
    [
        {
            "title": "文章标题",
            "desc": "简短描述",
            "abstract": "文章摘要",
            "content": "HTML内容",
            "author": "作者名",
            "cid": 1,
            "image": "图片URL或本地路径",
            "click_virtual": 0,
            "is_show": 1,
            "sort": 0
        }
    ]
"""

import json
import mysql.connector
from mysql.connector import Error
from typing import List, Dict, Optional
from datetime import datetime
import logging
import argparse
import sys
from pathlib import Path

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
    handlers=[
        logging.FileHandler("article_import.log", encoding="utf-8"),
        logging.StreamHandler(sys.stdout),
    ],
)
logger = logging.getLogger(__name__)


class ArticleAutoWriter:
    """资讯自动化写入器"""

    def __init__(self, db_config: Dict):
        """
        初始化数据库连接

        Args:
            db_config: 数据库配置字典
                - host: 数据库主机
                - port: 端口
                - database: 数据库名
                - user: 用户名
                - password: 密码
        """
        self.db_config = db_config
        self.connection = None
        self.connect()

    def connect(self) -> bool:
        """建立数据库连接"""
        try:
            self.connection = mysql.connector.connect(
                host=self.db_config.get("host", "localhost"),
                port=self.db_config.get("port", 3306),
                database=self.db_config.get("database", "likeadmin"),
                user=self.db_config.get("user", "root"),
                password=self.db_config.get("password", ""),
                charset="utf8mb4",
                autocommit=False,
            )
            logger.info("数据库连接成功")
            return True
        except Error as e:
            logger.error(f"数据库连接失败: {e}")
            return False

    def validate_article(self, article: Dict) -> tuple[bool, str]:
        """
        验证文章数据

        Args:
            article: 文章数据字典

        Returns:
            (是否有效, 错误信息)
        """
        # 必填字段
        required_fields = ["title", "cid", "is_show"]
        for field in required_fields:
            if field not in article or article[field] is None:
                return False, f"必填字段 '{field}' 不能为空"

        # 标题长度验证
        title = article.get("title", "")
        if not isinstance(title, str) or len(title) == 0 or len(title) > 255:
            return False, "标题长度必须在1-255字符之间"

        # 分类ID验证
        cid = article.get("cid")
        if not isinstance(cid, int) or cid <= 0:
            return False, "分类ID必须是正整数"

        # is_show验证
        is_show = article.get("is_show")
        if is_show not in [0, 1]:
            return False, "is_show必须是0或1"

        # 可选字段类型检查
        if "sort" in article and not isinstance(article["sort"], int):
            return False, "sort必须是整数"

        if "click_virtual" in article and not isinstance(article["click_virtual"], int):
            return False, "click_virtual必须是整数"

        return True, ""

    def check_category_exists(self, cid: int) -> bool:
        """检查分类是否存在"""
        try:
            cursor = self.connection.cursor()
            cursor.execute(
                "SELECT id FROM la_article_cate WHERE id = %s AND delete_time IS NULL",
                (cid,),
            )
            result = cursor.fetchone()
            cursor.close()
            return result is not None
        except Error as e:
            logger.error(f"检查分类失败: {e}")
            return False

    def sanitize_content(self, content: str) -> str:
        """
        清理和格式化内容

        Args:
            content: 原始内容

        Returns:
            清理后的内容
        """
        if not content:
            return ""

        # 基本的HTML转义（防止SQL注入的额外保护）
        content = content.replace("\\", "\\\\")
        content = content.replace("'", "\\'")
        content = content.replace('"', '\\"')

        return content

    def process_image_url(self, image: Optional[str]) -> str:
        """
        处理图片URL

        Args:
            image: 图片URL或路径

        Returns:
            处理后的URL
        """
        if not image:
            return ""

        # 如果已经是完整URL，直接返回
        if image.startswith("http://") or image.startswith("https://"):
            return image

        # 如果是本地路径，转换为相对路径
        # 这里可以根据实际存储策略调整
        return image

    def insert_article(self, article: Dict) -> Optional[int]:
        """
        插入单篇文章

        Args:
            article: 文章数据

        Returns:
            插入的文章ID，失败返回None
        """
        # 验证数据
        is_valid, error_msg = self.validate_article(article)
        if not is_valid:
            logger.error(f"数据验证失败: {error_msg}")
            logger.error(f"文章数据: {json.dumps(article, ensure_ascii=False)}")
            return None

        # 检查分类
        if not self.check_category_exists(article["cid"]):
            logger.error(f"分类ID {article['cid']} 不存在")
            return None

        try:
            cursor = self.connection.cursor()

            # 准备数据
            now = int(datetime.now().timestamp())
            data = {
                "title": article["title"],
                "desc": article.get("desc", ""),
                "abstract": article.get("abstract", ""),
                "image": self.process_image_url(article.get("image")),
                "author": article.get("author", ""),
                "content": self.sanitize_content(article.get("content", "")),
                "click_virtual": article.get("click_virtual", 0),
                "click_actual": 0,
                "cid": article["cid"],
                "is_show": article["is_show"],
                "sort": article.get("sort", 0),
                "create_time": now,
                "update_time": now,
            }

            # 构建SQL
            sql = """
                INSERT INTO la_article (
                    title, desc, abstract, image, author, content,
                    click_virtual, click_actual, cid, is_show, sort,
                    create_time, update_time
                ) VALUES (
                    %(title)s, %(desc)s, %(abstract)s, %(image)s, %(author)s, %(content)s,
                    %(click_virtual)s, %(click_actual)s, %(cid)s, %(is_show)s, %(sort)s,
                    %(create_time)s, %(update_time)s
                )
            """

            cursor.execute(sql, data)
            self.connection.commit()
            article_id = cursor.lastrowid
            cursor.close()

            logger.info(f"成功插入文章: ID={article_id}, Title={article['title']}")
            return article_id

        except Error as e:
            self.connection.rollback()
            logger.error(f"插入文章失败: {e}")
            logger.error(f"文章数据: {json.dumps(article, ensure_ascii=False)}")
            return None

    def batch_insert(self, articles: List[Dict]) -> Dict[str, int]:
        """
        批量插入文章

        Args:
            articles: 文章数据列表

        Returns:
            统计信息字典
                - success: 成功数量
                - failed: 失败数量
                - total: 总数
        """
        total = len(articles)
        success = 0
        failed = 0

        logger.info(f"开始批量插入 {total} 篇文章")

        for i, article in enumerate(articles, 1):
            logger.info(f"处理进度: {i}/{total}")

            article_id = self.insert_article(article)
            if article_id:
                success += 1
            else:
                failed += 1

        logger.info(f"批量插入完成: 成功={success}, 失败={failed}, 总数={total}")

        return {"success": success, "failed": failed, "total": total}

    def get_categories(self) -> List[Dict]:
        """
        获取所有分类列表

        Returns:
            分类列表
        """
        try:
            cursor = self.connection.cursor(dictionary=True)
            cursor.execute(
                "SELECT id, name, sort, is_show FROM la_article_cate WHERE delete_time IS NULL ORDER BY sort, id"
            )
            categories = cursor.fetchall()
            cursor.close()
            return categories
        except Error as e:
            logger.error(f"获取分类失败: {e}")
            return []

    def close(self):
        """关闭数据库连接"""
        if self.connection and self.connection.is_connected():
            self.connection.close()
            logger.info("数据库连接已关闭")


def load_json_file(file_path: str) -> List[Dict]:
    """加载JSON文件"""
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            data = json.load(f)
            if not isinstance(data, list):
                logger.error("JSON文件根元素必须是数组")
                return []
            return data
    except FileNotFoundError:
        logger.error(f"文件不存在: {file_path}")
        return []
    except json.JSONDecodeError as e:
        logger.error(f"JSON解析失败: {e}")
        return []


def create_sample_data(output_file: str = "sample_articles.json"):
    """创建示例数据文件"""
    sample_data = [
        {
            "title": "人工智能在医疗领域的应用与发展",
            "desc": "AI技术正在revolutionize医疗行业",
            "abstract": "本文探讨了人工智能在疾病诊断、药物研发、个性化治疗等领域的最新应用，分析了技术挑战和发展前景。",
            "content": "<p>人工智能（AI）技术正在深刻改变医疗健康领域...</p>",
            "author": "AI智能体",
            "cid": 1,
            "image": "",
            "click_virtual": 10,
            "is_show": 1,
            "sort": 0,
        },
        {
            "title": "量子计算：下一代计算革命",
            "desc": "量子计算原理与未来展望",
            "abstract": "量子计算利用量子力学原理，在处理特定类型问题上展现出超越经典计算机的巨大潜力。",
            "content": "<p>量子计算是基于量子力学原理的新型计算范式...</p>",
            "author": "科技观察员",
            "cid": 1,
            "image": "",
            "click_virtual": 5,
            "is_show": 1,
            "sort": 0,
        },
    ]

    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(sample_data, f, ensure_ascii=False, indent=2)

    logger.info(f"示例数据已创建: {output_file}")
    return sample_data


def main():
    """主函数"""
    parser = argparse.ArgumentParser(description="资讯自动化数据导入工具")
    parser.add_argument("--config", type=str, help="配置文件路径 (JSON格式)")
    parser.add_argument("--data", type=str, help="文章数据文件路径 (JSON格式)")
    parser.add_argument("--sample", action="store_true", help="生成示例数据文件")
    parser.add_argument("--list-categories", action="store_true", help="列出所有分类")
    parser.add_argument("--host", type=str, default="localhost", help="数据库主机")
    parser.add_argument("--port", type=int, default=3306, help="数据库端口")
    parser.add_argument("--database", type=str, default="likeadmin", help="数据库名")
    parser.add_argument("--user", type=str, default="root", help="数据库用户")
    parser.add_argument("--password", type=str, required=True, help="数据库密码")

    args = parser.parse_args()

    # 如果是生成示例数据
    if args.sample:
        create_sample_data()
        return

    # 构建数据库配置
    db_config = {
        "host": args.host,
        "port": args.port,
        "database": args.database,
        "user": args.user,
        "password": args.password,
    }

    # 如果配置文件存在，使用配置文件
    if args.config and Path(args.config).exists():
        with open(args.config, "r", encoding="utf-8") as f:
            config = json.load(f)
            db_config.update(config.get("database", {}))

    # 初始化写入器
    writer = ArticleAutoWriter(db_config)

    try:
        # 列出分类
        if args.list_categories:
            categories = writer.get_categories()
            print("\n=== 资讯分类列表 ===")
            for cate in categories:
                print(
                    f"ID: {cate['id']} | 名称: {cate['name']} | 排序: {cate['sort']} | 显示: {cate['is_show']}"
                )
            return

        # 加载数据
        if not args.data:
            logger.error("请指定数据文件 --data 或使用 --sample 生成示例数据")
            return

        articles = load_json_file(args.data)
        if not articles:
            logger.error("未找到有效数据")
            return

        # 批量插入
        result = writer.batch_insert(articles)

        # 输出统计
        print("\n=== 导入统计 ===")
        print(f"总数: {result['total']}")
        print(f"成功: {result['success']}")
        print(f"失败: {result['failed']}")

    finally:
        writer.close()


if __name__ == "__main__":
    main()
