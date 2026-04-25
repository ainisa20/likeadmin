-- ========================================
-- 版本更新：2.0.2.20260416
-- 功能：评估申请表（仅保留姓名、手机号、备注）
-- ========================================

SET FOREIGN_KEY_CHECKS=0;

-- 添加 content 字段到评估申请表（如不存在）
SET @exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'la_assessment' AND COLUMN_NAME = 'content');
SET @sql = IF(@exists = 0, 'ALTER TABLE `la_assessment` ADD COLUMN `content` TEXT NULL COMMENT ''用户留言内容（最多500字符）'' AFTER `phone`', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 删除 stage 字段（如存在）
SET @exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'la_assessment' AND COLUMN_NAME = 'stage');
SET @sql = IF(@exists > 0, 'ALTER TABLE `la_assessment` DROP COLUMN `stage`', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 删除 stage 索引（如存在）
SET @exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'la_assessment' AND INDEX_NAME = 'idx_stage');
SET @sql = IF(@exists > 0, 'ALTER TABLE `la_assessment` DROP INDEX `idx_stage`', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 更新表注释
ALTER TABLE `la_assessment` COMMENT '评估申请表';

SET FOREIGN_KEY_CHECKS=1;
