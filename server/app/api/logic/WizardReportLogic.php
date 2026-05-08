<?php

namespace app\api\logic;

use app\common\model\wizard\WizardReport;

class WizardReportLogic
{
    public static function save(array $params): array
    {
        $data = [
            'name'          => $params['name'] ?? '',
            'phone'         => $params['phone'] ?? '',
            'direction'     => $params['direction'] ?? '',
            'identity_type' => $params['identityType'] ?? '',
            'region'        => $params['region'] ?? '',
            'budget'        => $params['budget'] ?? '',
            'employee_count'=> $params['employeeCount'] ?? '',
            'need_server'   => intval($params['needServer'] ?? 0),
            'ai_calls'      => $params['aiCalls'] ?? '',
            'overseas'      => intval($params['overseas'] ?? 0),
            'register_time' => $params['registerTime'] ?? '',
            'services'      => is_array($params['services'] ?? '') ? implode(',', $params['services']) : ($params['services'] ?? ''),
            'theme_name'    => $params['themeName'] ?? '',
            'scope_ids'     => is_array($params['scopeIds'] ?? '') ? implode(',', $params['scopeIds']) : ($params['scopeIds'] ?? ''),
            'report_content'=> $params['reportContent'] ?? '',
            'subsidy_data'  => $params['subsidyData'] ?? null,
            'tech_data'     => $params['techData'] ?? null,
            'ip'            => request()->ip(),
            'create_time'   => time(),
        ];

        $record = WizardReport::create($data);
        return ['id' => $record->id];
    }
}
