-- ========================================
-- 迁移文件：添加 content 字段到评估申请表
-- 文件名：20260416_add_content_to_assessment.sql
-- 描述：为 la_assessment 表添加 content 字段，用于存储用户填写的留言内容
-- 作者：CMS Editor
-- 日期：2026-04-16
-- ========================================

-- 使用 likeadmin 数据库
USE likeadmin;

-- 添加 content 字段
-- 字段类型：TEXT，允许为空
-- 位置：在 stage 字段之后
-- 说明：用户填写的留言/备注内容，最多500个字符
ALTER TABLE `la_assessment`
ADD COLUMN `content` TEXT NULL COMMENT '用户留言内容（最多500字符）'
AFTER `stage`;

-- 验证修改
SELECT
    COLUMN_NAME,
    DATA_TYPE,
    IS_NULLABLE,
    COLUMN_DEFAULT,
    COLUMN_COMMENT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'likeadmin'
AND TABLE_NAME = 'la_assessment'
AND COLUMN_NAME = 'content';

-- 回滚说明（如需回滚，执行以下SQL）：
-- ALTER TABLE `la_assessment` DROP COLUMN `content`;
