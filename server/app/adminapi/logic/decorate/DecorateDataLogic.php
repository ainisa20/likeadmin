<?php
// +----------------------------------------------------------------------
// | likeadmin快速开发前后端分离管理后台（PHP版）
// +----------------------------------------------------------------------
// | 欢迎阅读学习系统程序代码，建议反馈是我们前进的动力
// | 开源版本可自由商用，可去除界面版权logo
// | gitee下载：https://gitee.com/likeshop_gitee/likeadmin
// | github下载：https://github.com/likeshop-github/likeadmin
// | 访问官网：https://www.likeadmin.cn
// | likeadmin团队 版权所有，拥有最终解释权
// +----------------------------------------------------------------------
// | author: likeadminTeam
// +----------------------------------------------------------------------
namespace app\adminapi\logic\decorate;

use app\common\logic\BaseLogic;
use app\common\model\article\Article;
use app\common\model\decorate\DecoratePage;

/**
 * 装修页-数据
 * Class DecorateDataLogic
 * @package app\adminapi\logic\decorate
 */
class DecorateDataLogic extends BaseLogic
{

    /**
     * @notes 获取文章列表
     * @param $limit
     * @return array
     * @throws \think\db\exception\DataNotFoundException
     * @throws \think\db\exception\DbException
     * @throws \think\db\exception\ModelNotFoundException
     * @author 段誉
     * @date 2022/9/22 16:49
     */
    public static function getArticleLists($limit): array
    {
        $field = 'id,title,desc,abstract,image,author,content,
        click_virtual,click_actual,create_time';

        return Article::where(['is_show' => 1])
            ->field($field)
            ->order(['id' => 'desc'])
            ->limit($limit)
            ->append(['click'])
            ->hidden(['click_virtual', 'click_actual'])
            ->select()->toArray();
    }

    /**
     * @notes pc设置
     * @return array
     * @author mjf
     * @date 2024/3/14 18:13
     */
    public static function pc(): array
    {
        $pcPage = DecoratePage::findOrEmpty(4)->toArray();
        $updateTime = !empty($pcPage['update_time']) ? $pcPage['update_time'] : date('Y-m-d H:i:s');

        // 获取 Dify 配置
        $difyConfig = self::getDifyConfig($pcPage);

        return [
            'update_time' => $updateTime,
            'pc_url' => request()->domain() . '/pc/',
            'dify_config' => $difyConfig
        ];
    }

    /**
     * @notes 获取 Dify 配置
     * @param $pcPage
     * @return array
     * @author raeazL
     * @date 2026/04/04
     */
    private static function getDifyConfig($pcPage): array
    {
        $defaultConfig = [
            'enabled' => false,
            'token' => '',
            'baseUrl' => 'http://localhost',
            'buttonColor' => '#1C64F2',
            'windowWidth' => '24',
            'windowHeight' => '40',
        ];

        if (empty($pcPage['meta'])) {
            return $defaultConfig;
        }

        $meta = json_decode($pcPage['meta'], true);
        if (isset($meta['dify_config'])) {
            return array_merge($defaultConfig, $meta['dify_config']);
        }

        return $defaultConfig;
    }

    /**
     * @notes 保存 Dify 配置
     * @param $params
     * @return bool
     * @author raeazL
     * @date 2026/04/04
     */
    public static function saveDifyConfig($params): bool
    {
        $pcPage = DecoratePage::findOrEmpty(4);
        if ($pcPage->isEmpty()) {
            self::$error = 'PC端装修配置不存在';
            return false;
        }

        // 获取现有的 meta 配置
        $meta = [];
        if (!empty($pcPage->meta)) {
            $meta = json_decode($pcPage->meta, true);
        }

        // 更新 Dify 配置
        $meta['dify_config'] = [
            'enabled' => isset($params['enabled']) && ($params['enabled'] === true || $params['enabled'] === 'true' || $params['enabled'] === 1 || $params['enabled'] === '1'),
            'token' => $params['token'] ?? '',
            'baseUrl' => $params['baseUrl'] ?? 'http://localhost',
            'buttonColor' => $params['buttonColor'] ?? '#1C64F2',
            'windowWidth' => $params['windowWidth'] ?? '24',
            'windowHeight' => $params['windowHeight'] ?? '40',
        ];

        // 保存到数据库
        $pcPage->meta = json_encode($meta, JSON_UNESCAPED_UNICODE);
        $pcPage->save();

        return true;
    }




}
