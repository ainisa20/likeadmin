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

namespace app\adminapi\controller\assessment;

use app\adminapi\controller\BaseAdminController;
use app\adminapi\lists\assessment\AssessmentLists;
use app\adminapi\logic\assessment\AssessmentLogic;

class AssessmentController extends BaseAdminController
{
    public function lists()
    {
        return $this->dataLists(new AssessmentLists());
    }

    public function detail()
    {
        $params = $this->request->get();
        $result = AssessmentLogic::detail($params);
        return $this->data($result);
    }

    public function delete()
    {
        $params = $this->request->post();
        AssessmentLogic::delete($params);
        return $this->success('删除成功');
    }

    public function updateStatus()
    {
        $params = $this->request->post();
        AssessmentLogic::updateStatus($params);
        return $this->success('更新成功');
    }

    public function updateRemark()
    {
        $params = $this->request->post();
        AssessmentLogic::updateRemark($params);
        return $this->success('备注成功');
    }
}
