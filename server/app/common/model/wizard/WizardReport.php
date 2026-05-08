<?php

namespace app\common\model\wizard;

use app\common\model\BaseModel;

class WizardReport extends BaseModel
{
    protected $name = 'wizard_report';

    protected $json = ['subsidy_data', 'tech_data'];
}
