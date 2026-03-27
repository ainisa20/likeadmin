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

namespace app\api\controller;

use app\api\logic\AssessmentLogic;
use app\api\validate\AssessmentValidate;

class AssessmentController extends BaseApiController
{
    public array $notNeedLogin = ['submit'];

    public function submit()
    {
        $data = request()->post();
        
        $params = (new AssessmentValidate())->post()->goCheck('submit');
        $result = AssessmentLogic::submit($params);

        if ($result) {
            return $this->success('提交成功，我们将于24小时内联系您', [], 1, 0);
        }
        return $this->fail(AssessmentLogic::getError());
    }
}
