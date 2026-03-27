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

namespace app\adminapi\logic\assessment;

use app\common\logic\BaseLogic;
use app\common\model\assessment\Assessment;

class AssessmentLogic extends BaseLogic
{
    public static function detail(array $params): array
    {
        return Assessment::findOrEmpty($params['id'])->toArray();
    }

    public static function delete(array $params): bool
    {
        return Assessment::destroy($params['id']);
    }

    public static function updateStatus(array $params): bool
    {
        $assessment = Assessment::find($params['id']);
        if (!$assessment) {
            self::setError('记录不存在');
            return false;
        }
        $assessment->status = $params['status'];
        return $assessment->save() !== false;
    }

    public static function updateRemark(array $params): bool
    {
        $assessment = Assessment::find($params['id']);
        if (!$assessment) {
            self::setError('记录不存在');
            return false;
        }
        $assessment->remark = $params['remark'] ?? '';
        return $assessment->save() !== false;
    }
}
