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

namespace app\api\logic;

use app\common\logic\BaseLogic;
use app\common\model\assessment\Assessment;

class AssessmentLogic extends BaseLogic
{
    public static function submit(array $params): bool
    {
        try {
            $request = request();
            $params['ip'] = $request->ip();
            $params['user_agent'] = $request->header('user-agent');

            $exists = Assessment::where('phone', $params['phone'])
                ->where('create_time', '>=', time() - 3600)
                ->find();

            if ($exists) {
                self::setError('您已提交过，请勿重复提交');
                return false;
            }

            Assessment::create($params);
            return true;

        } catch (\Exception $e) {
            self::setError('提交失败：' . $e->getMessage());
            return false;
        }
    }
}
