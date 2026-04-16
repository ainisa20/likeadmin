-- ========================================
-- 版本更新：2.0.2.20260416
-- 功能：为评估申请表添加留言内容字段
-- ========================================

SET FOREIGN_KEY_CHECKS=0;

-- 添加 content 字段到评估申请表
ALTER TABLE `la_assessment`
ADD COLUMN `content` TEXT NULL COMMENT '用户留言内容（最多500字符）'
AFTER `stage`;

SET FOREIGN_KEY_CHECKS=1;
