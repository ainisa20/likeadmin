<?php

namespace app\adminapi\lists\wizard;

use app\adminapi\lists\BaseAdminDataLists;
use app\common\lists\ListsSearchInterface;
use app\common\lists\ListsSortInterface;
use app\common\model\wizard\WizardReport;

class WizardReportLists extends BaseAdminDataLists implements ListsSearchInterface, ListsSortInterface
{
    public function setSearch(): array
    {
        return [
            '=' => ['status', 'identity_type', 'region'],
            '%like%' => ['name', 'phone', 'direction']
        ];
    }

    public function setSortFields(): array
    {
        return ['create_time' => 'create_time', 'id' => 'id'];
    }

    public function setDefaultOrder(): array
    {
        return ['id' => 'desc'];
    }

    public function lists(): array
    {
        return WizardReport::where($this->searchWhere)
            ->field('id,name,phone,direction,identity_type,region,budget,theme_name,status,create_time')
            ->order($this->sortOrder)
            ->limit($this->limitOffset, $this->limitLength)
            ->select()
            ->toArray();
    }

    public function count(): int
    {
        return WizardReport::where($this->searchWhere)->count();
    }
}
