<?php
// +----------------------------------------------------------------------
// | likeadmin快速开发前后端分离管理后台（PHP版）
// +----------------------------------------------------------------------
// | 欢迎阅读学习系统代码，建议反馈是我们前进的动力
// | 开源版本可自由商用，可去除界面版权logo
// | gitee下载：https://gitee.com/likeshop_gitee/likeadmin
// | github下载：https://github.com/likeshop-github/likeadmin
// | 访问官网：https://www.likeadmin.cn
// | likeadmin团队 版权所有 拥有最终解释权
// +----------------------------------------------------------------------
// | author: likeadminTeam
// +----------------------------------------------------------------------

namespace app\api\controller;

use app\api\logic\CalculateLogic;
use think\response\Json;

/**
 * 创业补贴计算
 * Class CalculateController
 * @package app\api\controller
 */
class CalculateController extends BaseApiController
{
    public array $notNeedLogin = ['calculate'];

    /**
     * 计算补贴金额
     * @return Json
     */
    public function calculate()
    {
        $identity = $this->request->post('identity/s', '');
        $region = $this->request->post('region/s', '');
        $employee = $this->request->post('employee/s', '');

        $result = CalculateLogic::calculate($identity, $region, $employee);

        // 技术方案参数（可选，前端传入时一并返回）
        $needServer = $this->request->post('needServer/b', null);
        $aiCallsPerDay = $this->request->post('aiCallsPerDay/s', '');
        $overseas = $this->request->post('overseas/b', false);
        $budget = $this->request->post('budget/s', '');

        if ($needServer !== null && $aiCallsPerDay !== '') {
            $result['tech_plan'] = CalculateLogic::techPlan($needServer, $aiCallsPerDay, $overseas, $budget);
        }

        return $this->data($result);
    }
}