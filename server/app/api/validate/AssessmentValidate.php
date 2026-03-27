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

namespace app\api\validate;

use app\common\validate\BaseValidate;

class AssessmentValidate extends BaseValidate
{
    protected $rule = [
        'name' => 'require',
        'phone' => 'require|regex:/^1[3-9]\d{9}$/',
        'stage' => 'require|in:idea,direction,company,team',
    ];

    protected $message = [
        'name.require' => '请输入姓名',
        'phone.require' => '请输入您的手机号',
        'phone.regex' => '手机号格式不正确',
        'stage.require' => '请选择您的当前阶段',
        'stage.in' => '阶段选择无效',
    ];

    public function sceneSubmit()
    {
        return $this->only(['name', 'phone', 'stage']);
    }
}
