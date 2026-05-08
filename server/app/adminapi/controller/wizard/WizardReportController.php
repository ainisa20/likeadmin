<?php

namespace app\adminapi\controller\wizard;

use app\adminapi\controller\BaseAdminController;
use app\adminapi\lists\wizard\WizardReportLists;
use app\adminapi\logic\wizard\WizardReportLogic;

class WizardReportController extends BaseAdminController
{
    public function lists()
    {
        return $this->dataLists(new WizardReportLists());
    }

    public function detail()
    {
        $params = $this->request->get();
        $result = WizardReportLogic::detail($params);
        return $this->data($result);
    }

    public function delete()
    {
        $params = $this->request->post();
        WizardReportLogic::delete($params);
        return $this->success('删除成功');
    }

    public function updateStatus()
    {
        $params = $this->request->post();
        WizardReportLogic::updateStatus($params);
        return $this->success('更新成功');
    }

    public function updateRemark()
    {
        $params = $this->request->post();
        WizardReportLogic::updateRemark($params);
        return $this->success('备注成功');
    }
}
