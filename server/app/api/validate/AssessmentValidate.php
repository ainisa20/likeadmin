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
        'content' => 'max:500',
    ];

    protected $message = [
        'name.require' => '请输入姓名',
        'phone.require' => '请输入您的手机号',
        'phone.regex' => '手机号格式不正确',
        'content.max' => '留言内容不能超过500个字符',
    ];

    public function sceneSubmit()
    {
        return $this->only(['name', 'phone', 'content']);
    }
}
