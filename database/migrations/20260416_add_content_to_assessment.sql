-- ========================================
-- 迁移文件：简化评估申请表，去掉 stage 字段
-- 日期：2026-04-16
-- ========================================

USE likeadmin;

-- 添加 content 字段（如不存在）
SET @exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'likeadmin' AND TABLE_NAME = 'la_assessment' AND COLUMN_NAME = 'content');
SET @sql = IF(@exists = 0, 'ALTER TABLE `la_assessment` ADD COLUMN `content` TEXT NULL COMMENT ''用户留言内容（最多500字符）'' AFTER `phone`', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 删除 stage 字段
SET @exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'likeadmin' AND TABLE_NAME = 'la_assessment' AND COLUMN_NAME = 'stage');
SET @sql = IF(@exists > 0, 'ALTER TABLE `la_assessment` DROP COLUMN `stage`', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 删除 stage 索引
SET @exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS WHERE TABLE_SCHEMA = 'likeadmin' AND TABLE_NAME = 'la_assessment' AND INDEX_NAME = 'idx_stage');
SET @sql = IF(@exists > 0, 'ALTER TABLE `la_assessment` DROP INDEX `idx_stage`', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
