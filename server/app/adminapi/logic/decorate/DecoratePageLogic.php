<?php
// +----------------------------------------------------------------------
// | likeadmin快速开发前后端分离管理后台（PHP版）
// +----------------------------------------------------------------------
// | 欢迎阅读学习系统程序代码，建议反馈是我们前进的动力
// | 开源版本可自由商用，可去除界面版权logo
// | gitee下载：https://gitee.com/likeshop_gitee/likeadmin
// | github下载：https://github.com/likeshop-github/likeadmin
// | 访问官网：https://www.likeadmin.cn
// | likeadmin团队 版权所有 拥有最终解释权
// +----------------------------------------------------------------------
// | author: likeadminTeam
// +----------------------------------------------------------------------
namespace app\adminapi\logic\decorate;


use app\common\logic\BaseLogic;
use app\common\model\decorate\DecoratePage;


/**
 * 装修页面
 * Class DecoratePageLogic
 * @package app\adminapi\logic\theme
 */
class DecoratePageLogic extends BaseLogic
{


    /**
     * @notes 获取详情
     * @param $id
     * @return array
     * @author 段誉
     * @date 2022/9/14 18:41
     */
    public static function getDetail($id)
    {
        return DecoratePage::findOrEmpty($id)->toArray();
    }


    /**
     * @notes 保存装修配置
     * @param $params
     * @return bool
     * @author 段誉
     * @date 2022/9/15 9:37
     */
    public static function save($params)
    {
        $pageData = DecoratePage::where(['id' => $params['id']])->findOrEmpty();
        if ($pageData->isEmpty()) {
            self::$error = '信息不存在';
            return false;
        }
        DecoratePage::update([
            'id' => $params['id'],
            'type' => $params['type'],
            'data' => $params['data'],
            'meta' => $params['meta'] ?? '',
        ]);
        return true;
    }

    public static function getPageList(): array
    {
        // PC页面：type >= 4 且非系统风格(type=5)
        $pages = DecoratePage::field(['id', 'type', 'name', 'meta'])
            ->where('type', '>=', 4)
            ->where('type', '<>', 5)
            ->order('id', 'asc')
            ->select()
            ->toArray();

        $result = [];
        foreach ($pages as $page) {
            $id = $page['id'];
            $meta = json_decode($page['meta'] ?? '', true);
            // 首页固定路径 /，其他页面从 meta.pc_path 读取或生成默认路径
            $path = $id == 4 ? '/' : ($meta['pc_path'] ?? '/pc/page' . $id);
            $result[] = [
                'id' => $id,
                'name' => $page['name'] ?: '页面' . $id,
                'path' => $path,
            ];
        }
        return $result;
    }
}