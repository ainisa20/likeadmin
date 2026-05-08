<?php

namespace app\adminapi\logic\wizard;

use app\common\logic\BaseLogic;
use app\common\model\wizard\WizardReport;

class WizardReportLogic extends BaseLogic
{
    public static function detail(array $params): array
    {
        return WizardReport::findOrEmpty($params['id'])->toArray();
    }

    public static function delete(array $params): bool
    {
        return WizardReport::destroy($params['id']);
    }

    public static function updateStatus(array $params): bool
    {
        $record = WizardReport::find($params['id']);
        if (!$record) {
            self::setError('记录不存在');
            return false;
        }
        $record->status = $params['status'];
        return $record->save() !== false;
    }

    public static function updateRemark(array $params): bool
    {
        $record = WizardReport::find($params['id']);
        if (!$record) {
            self::setError('记录不存在');
            return false;
        }
        $record->remark = $params['remark'] ?? '';
        return $record->save() !== false;
    }
}
