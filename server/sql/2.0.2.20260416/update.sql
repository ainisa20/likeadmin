-- ========================================
-- 版本更新：2.0.2.20260416
-- 功能：PC端页面构建器 + 评估申请表优化
-- ========================================

SET FOREIGN_KEY_CHECKS=0;

-- ==========================================
-- 一、PC端页面数据迁移
-- ==========================================

-- 1. 更新 page id=4: 从旧banner格式迁移到新sections格式（仅当数据为旧格式时）
-- 旧格式以 [{ 开头，新格式以 {"settings" 开头
SET @old_data = (SELECT data FROM la_decorate_page WHERE id = 4 AND data LIKE '[{%');
SET @sql = IF(@old_data IS NOT NULL,
    'UPDATE la_decorate_page SET name = ''首页'', data = ''{"settings":{"maxWidth":"1200px","gap":"0px","backgroundColor":"#f5f7fa"},"sections":[{"id":"carousel-hero","type":"image-carousel","title":"首页轮播图","visible":true,"props":{"height":"420px","autoplay":true,"interval":4000,"items":[{"image":"/resource/image/adminapi/default/banner003.png","title":"专业解决方案，助力企业增长","link":"www.baidu.com"},{"image":"/resource/image/adminapi/default/banner002.png","title":"一站式服务，从咨询到落地","link":""},{"image":"/resource/image/adminapi/default/banner001.png","title":"一站式服务，从咨询到落地","link":""}]},"styles":{"padding":"0","backgroundColor":"#ffffff"}},{"id":"stats-company","type":"stats-bar","title":"公司数据","visible":true,"props":{"items":[{"value":"500+","label":"服务客户","icon":"🏢"},{"value":"98%","label":"客户满意度","icon":"⭐"},{"value":"10年+","label":"行业经验","icon":"📅"},{"value":"50+","label":"专业团队","icon":"👥"}]},"styles":{"padding":"40px 0","backgroundColor":"#ffffff"}},{"id":"features-core","type":"feature-grid","title":"核心优势","visible":true,"props":{"heading":"为什么选择我们","columns":3,"items":[{"icon":"🎯","title":"专业团队","description":"多年行业经验，深度理解业务需求"},{"icon":"🤝","title":"优质服务","description":"以客户为中心，全程贴心服务保障"},{"icon":"💼","title":"成功案例","description":"服务众多客户，积累了丰富的实战经验"}]},"styles":{"padding":"80px 0","backgroundColor":"#f5f7fa"}},{"id":"cards-latest","type":"card-list","title":"最新资讯","visible":true,"props":{"heading":"最新资讯","source":"article-latest","columns":3,"limit":6},"styles":{"padding":"80px 0","backgroundColor":"#ffffff"}},{"id":"form-contact","type":"contact-form","title":"联系表单","visible":true,"props":{"heading":"联系我们","subheading":"留下您的联系方式，我们将尽快与您取得联系","fields":[{"name":"name","label":"姓名","type":"text","required":true,"placeholder":"请输入您的姓名"},{"name":"phone","label":"手机号","type":"phone","required":true,"placeholder":"请输入您的手机号"},{"name":"content","label":"备注","type":"textarea","required":false,"placeholder":"请输入备注信息"}],"submitText":"提交","successMessage":"提交成功！我们将尽快与您联系"},"styles":{"padding":"80px 0","backgroundColor":"#f5f7fa"}},{"id":"cta-footer","type":"cta-section","title":"底部行动号召","visible":true,"props":{"heading":"准备好开始了吗？","subheading":"立即联系我们，获取免费咨询和专属方案","ctaText":"立即咨询","ctaLink":"#form-contact","backgroundColor":"#4153ff"},"styles":{}}]}'', update_time = UNIX_TIMESTAMP() WHERE id = 4 AND data LIKE ''[{%''',
    'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 2. 插入PC端新页面（如不存在）
-- 核心服务 (id=6)
INSERT IGNORE INTO `la_decorate_page` (`id`, `type`, `name`, `data`, `meta`, `create_time`, `update_time`) VALUES (6,6,'核心服务','{"sections": [{"id": "hero-services", "type": "hero-banner", "props": {"height": "320px", "heading": "我们的服务", "textAlign": "center", "subheading": "提供全方位的专业解决方案，满足您的各类需求", "backgroundColor": "#4153ff"}, "title": "服务页横幅", "styles": {}, "visible": true}, {"id": "features-services", "type": "feature-grid", "props": {"items": [{"icon": "🏗️", "title": "技术咨询", "description": "专业技术团队提供深度技术咨询和方案设计"}, {"icon": "📊", "title": "数据分析", "description": "基于数据驱动的决策支持，提升业务效率"}, {"icon": "🚀", "title": "产品开发", "description": "从需求分析到产品上线的全流程开发服务"}, {"icon": "🔧", "title": "运维保障", "description": "7×24小时运维监控，确保系统稳定运行"}, {"icon": "📈", "title": "增长策略", "description": "量身定制的增长策略，助力业务快速发展"}, {"icon": "🛡️", "title": "安全合规", "description": "全面的安全保障体系，符合行业合规要求"}], "columns": 3, "heading": "核心服务"}, "title": "服务列表", "styles": {"padding": "80px 0", "backgroundColor": "#ffffff"}, "visible": true}, {"id": "content-process", "type": "rich-text", "props": {"layout": "text-only", "content": "<p><strong>1. 需求沟通</strong> — 深入了解您的业务需求与痛点</p><p><strong>2. 方案设计</strong> — 量身定制解决方案并详细规划</p><p><strong>3. 项目实施</strong> — 专业团队高效执行，全程透明跟进</p><p><strong>4. 交付验收</strong> — 严格质量把控，确保交付标准</p><p><strong>5. 持续支持</strong> — 项目交付后提供长期技术支持</p>", "heading": "服务流程"}, "title": "服务流程", "styles": {"padding": "80px 0", "backgroundColor": "#f5f7fa"}, "visible": true}, {"id": "cta-contact", "type": "cta-section", "props": {"ctaLink": "/#form-contact", "ctaText": "立即咨询", "heading": "需要定制化服务？", "subheading": "联系我们的专业顾问，获取免费咨询服务", "backgroundColor": "#4153ff"}, "title": "联系我们", "styles": {}, "visible": true}], "settings": {"gap": "0px", "maxWidth": "1200px", "backgroundColor": "#f5f7fa"}}','{"pc_path": "/pc/services"}',UNIX_TIMESTAMP(),UNIX_TIMESTAMP());

-- 成功案例 (id=7)
INSERT IGNORE INTO `la_decorate_page` (`id`, `type`, `name`, `data`, `meta`, `create_time`, `update_time`) VALUES (7,7,'成功案例','{"sections": [{"id": "hero-cases", "type": "hero-banner", "props": {"height": "320px", "heading": "成功案例", "textAlign": "center", "subheading": "我们的专业服务已帮助众多企业实现业务增长", "backgroundColor": "#4153ff"}, "title": "案例页横幅", "styles": {}, "visible": true}, {"id": "cases-all", "type": "card-list", "props": {"limit": 12, "source": "article-latest", "columns": 3, "heading": "精选案例"}, "title": "案例展示", "styles": {"padding": "80px 0", "backgroundColor": "#ffffff"}, "visible": true}, {"id": "reviews-cases", "type": "testimonials", "props": {"items": [{"name": "张总", "role": "某科技公司 CEO", "rating": 5, "content": "服务专业，效率极高，推荐合作。"}, {"name": "李经理", "role": "某制造企业 运营总监", "rating": 5, "content": "解决方案很贴合实际需求，落地效果超出预期。"}, {"name": "王女士", "role": "某教育机构 创始人", "rating": 4, "content": "团队很负责任，从方案设计到实施全程跟进。"}], "columns": 3, "heading": "客户怎么说"}, "title": "客户评价", "styles": {"padding": "80px 0", "backgroundColor": "#f5f7fa"}, "visible": true}, {"id": "cta-cases", "type": "cta-section", "props": {"ctaLink": "/#form-contact", "ctaText": "联系我们", "heading": "想成为下一个成功案例？", "subheading": "联系我们，开始您的数字化转型之旅", "backgroundColor": "#4153ff"}, "title": "行动号召", "styles": {}, "visible": true}], "settings": {"gap": "0px", "maxWidth": "1200px", "backgroundColor": "#f5f7fa"}}','{"pc_path": "/pc/cases"}',UNIX_TIMESTAMP(),UNIX_TIMESTAMP());

-- 关于我们 (id=8)
INSERT IGNORE INTO `la_decorate_page` (`id`, `type`, `name`, `data`, `meta`, `create_time`, `update_time`) VALUES (8,8,'关于我们','{"sections": [{"id": "hero-about", "type": "hero-banner", "props": {"height": "320px", "heading": "关于我们", "textAlign": "center", "subheading": "专注于为企业提供专业的数字化解决方案", "backgroundColor": "#4153ff"}, "title": "关于页横幅", "styles": {}, "visible": true}, {"id": "content-intro", "type": "rich-text", "props": {"layout": "text-only", "content": "<p>我们是一家专注于<strong>企业数字化转型</strong>的服务公司。</p><p>自成立以来，已为超过 500 家企业提供专业解决方案，涵盖技术架构、产品设计和运营优化。我们坚信，好的技术服务应该像水一样——润物细无声地融入企业运营的每一个环节。</p>", "heading": "公司简介"}, "title": "公司简介", "styles": {"padding": "80px 0", "backgroundColor": "#ffffff"}, "visible": true}, {"id": "stats-about", "type": "stats-bar", "props": {"items": [{"icon": "🏢", "label": "成立年份", "value": "2015"}, {"icon": "⭐", "label": "服务客户", "value": "500+"}, {"icon": "👥", "label": "专业团队", "value": "50+"}, {"icon": "📈", "label": "客户续约率", "value": "99%"}]}, "title": "公司数据", "styles": {"padding": "40px 0", "backgroundColor": "#f5f7fa"}, "visible": true}, {"id": "features-values", "type": "feature-grid", "props": {"items": [{"icon": "💡", "title": "创新驱动", "description": "持续探索前沿技术，用创新推动业务发展"}, {"icon": "🤝", "title": "客户至上", "description": "深度理解客户需求，以结果为导向交付价值"}, {"icon": "🏆", "title": "追求卓越", "description": "严格质量标准，每一个细节都精益求精"}], "columns": 3, "heading": "核心价值观"}, "title": "核心价值观", "styles": {"padding": "80px 0", "backgroundColor": "#ffffff"}, "visible": true}, {"id": "form-about", "type": "contact-form", "props": {"fields": [{"name": "name", "type": "text", "label": "姓名", "required": true, "placeholder": "请输入您的姓名"}, {"name": "phone", "type": "phone", "label": "手机号", "required": true, "placeholder": "请输入您的手机号"}, {"name": "content", "type": "textarea", "label": "备注", "required": false, "placeholder": "请输入备注信息"}], "heading": "联系我们", "subheading": "留下您的联系方式，我们将尽快与您取得联系", "submitText": "提交", "successMessage": "提交成功！我们将尽快与您联系"}, "title": "联系表单", "styles": {"padding": "80px 0", "backgroundColor": "#f5f7fa"}, "visible": true}], "settings": {"gap": "0px", "maxWidth": "1200px", "backgroundColor": "#f5f7fa"}}','{"pc_path": "/pc/about"}',UNIX_TIMESTAMP(),UNIX_TIMESTAMP());

-- ==========================================
-- 二、评估申请表字段变更
-- ==========================================

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
