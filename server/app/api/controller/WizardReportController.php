<?php

namespace app\api\controller;

use app\api\logic\WizardReportLogic;
use think\response\Json;

class WizardReportController extends BaseApiController
{
    public array $notNeedLogin = ['save'];

    public function save(): Json
    {
        $params = $this->request->post();
        $result = WizardReportLogic::save($params);
        return $this->success('保存成功', $result);
    }
}
