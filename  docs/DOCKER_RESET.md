# Docker 数据库重置指南

## 🔄 重置数据库步骤

当需要重新安装 LikeAdmin 系统时，执行以下步骤：

### 1. 删除所有表（保留数据库）

```bash
# 删除所有表
docker exec likeadmin-mysql mysql -uroot -p123456 -e "USE likeadmin; SET FOREIGN_KEY_CHECKS = 0; DROP TABLE IF EXISTS la_admin, la_admin_dept, la_admin_jobs, la_admin_role, la_admin_session, la_article, la_article_cate, la_article_collect, la_config, la_decorate_page, la_decorate_tabbar, la_dept, la_dev_crontab, la_dev_pay_config, la_dev_pay_way, la_dict_data, la_dict_type, la_file, la_file_cate, la_generate_column, la_generate_table, la_hot_search, la_jobs, la_notice_record, la_notice_setting, la_official_account_reply, la_operation_log, la_recharge_order, la_refund_log, la_refund_record, la_sms_log, la_system_menu, la_system_role, la_system_role_menu, la_user, la_user_account_log, la_user_auth, la_user_session; SET FOREIGN_KEY_CHECKS = 1;"
```

### 2. 删除安装锁文件

```bash
docker exec likeadmin-app rm -f /var/www/html/config/install.lock
```

### 3. 验证重置成功

```bash
# 检查数据库是否为空
docker exec likeadmin-mysql mysql -uroot -p123456 -e "USE likeadmin; SHOW TABLES;"

# 检查安装锁是否删除
docker exec likeadmin-app ls -la /var/www/html/config/install.lock
```

### 4. 访问安装程序

```
http://localhost:8088/install/install.php
```

## 📋 安装参数

在安装页面填写以下信息：

```
数据库主机：mysql
数据库端口：3306
数据库名：likeadmin
用户名：root
密码：123456
数据表前缀：la_
```

## 🐛 常见问题

### Connection refused

**原因**：.env 文件中数据库主机配置错误

**解决**：
```bash
# 修复配置
docker exec likeadmin-app sed -i 's/HOSTNAME = "127.0.0.1"/HOSTNAME = "mysql"/' /var/www/html/.env

# 验证
docker exec likeadmin-app grep HOSTNAME /var/www/html/.env
```

### Table doesn't exist

**原因**：数据库表未创建或未删除旧表

**解决**：执行上面的删除表步骤

### install.lock 存在

**原因**：系统已安装，需要重新安装

**解决**：
```bash
docker exec likeadmin-app rm -f /var/www/html/config/install.lock
```

## 💡 完整重置脚本

创建一个 `reset.sh` 脚本：

```bash
#!/bin/bash
echo "正在重置数据库..."

# 删除所有表（保留数据库）
docker exec likeadmin-mysql mysql -uroot -p123456 -e "USE likeadmin; SET FOREIGN_KEY_CHECKS = 0; DROP TABLE IF EXISTS la_admin, la_admin_dept, la_admin_jobs, la_admin_role, la_admin_session, la_article, la_article_cate, la_article_collect, la_config, la_decorate_page, la_decorate_tabbar, la_dept, la_dev_crontab, la_dev_pay_config, la_dev_pay_way, la_dict_data, la_dict_type, la_file, la_file_cate, la_generate_column, la_generate_table, la_hot_search, la_jobs, la_notice_record, la_notice_setting, la_official_account_reply, la_operation_log, la_recharge_order, la_refund_log, la_refund_record, la_sms_log, la_system_menu, la_system_role, la_system_role_menu, la_user, la_user_account_log, la_user_auth, la_user_session; SET FOREIGN_KEY_CHECKS = 1;"

# 删除安装锁
docker exec likeadmin-app rm -f /var/www/html/config/install.lock

# 修复配置
docker exec likeadmin-app sed -i 's/HOSTNAME = "127.0.0.1"/HOSTNAME = "mysql"/' /var/www/html/.env

echo "重置完成！"
echo "请访问：http://localhost:8088/install/install.php"
```

使用方法：
```bash
chmod +x reset.sh
./reset.sh
```

## 🎯 快速一键重置

```bash
# 删除所有表
docker exec likeadmin-mysql mysql -uroot -p123456 -e "USE likeadmin; SET FOREIGN_KEY_CHECKS = 0; DROP TABLE IF EXISTS la_admin, la_admin_dept, la_admin_jobs, la_admin_role, la_admin_session, la_article, la_article_cate, la_article_collect, la_config, la_decorate_page, la_decorate_tabbar, la_dept, la_dev_crontab, la_dev_pay_config, la_dev_pay_way, la_dict_data, la_dict_type, la_file, la_file_cate, la_generate_column, la_generate_table, la_hot_search, la_jobs, la_notice_record, la_notice_setting, la_official_account_reply, la_operation_log, la_recharge_order, la_refund_log, la_refund_record, la_sms_log, la_system_menu, la_system_role, la_system_role_menu, la_user, la_user_account_log, la_user_auth, la_user_session; SET FOREIGN_KEY_CHECKS = 1;" && docker exec likeadmin-app rm -f /var/www/html/config/install.lock
```
