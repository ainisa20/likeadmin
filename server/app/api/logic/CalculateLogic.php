<?php

namespace app\api\logic;

class CalculateLogic
{
    public static function calculate(string $identity, string $region, string $employee): array
    {
        $subsidies = [];
        $costs = [];
        $totalLow = 0;
        $totalHigh = 0;
        $totalHighAll = 0;
        $basicCount = 0;
        $advancedCount = 0;

        // 基础成本（6个月）
        $costs[] = ['name' => '云服务器（入门配置）', 'amount' => '约1,800元', 'note' => '阿里云/腾讯云入门级实例'];
        $costs[] = ['name' => '工商注册+印章', 'amount' => '约800元', 'note' => '自己跑腿或代办'];
        $costs[] = ['name' => '首年代记账', 'amount' => '约2,000元', 'note' => '小规模纳税人'];
        $costs[] = ['name' => '域名+备案', 'amount' => '约200元', 'note' => '如需国内服务器'];
        $costs[] = ['name' => 'AI工具订阅', 'amount' => '约500元', 'note' => 'ChatGPT/Claude等'];

        $costTotal = 5300;

        // 求职创业补贴 - 应届生/毕业5年内
        if (in_array($identity, ['graduate', 'both'])) {
            $amountLow = 3000;
            $amountHigh = 3000;
            $totalLow += $amountLow;
            $totalHigh += $amountHigh;
            $totalHighAll += $amountHigh;
            $basicCount++;
            $subsidies[] = [
                'name' => '求职创业补贴',
                'amount_low' => $amountLow,
                'amount_high' => $amountHigh,
                'condition' => '应届或毕业5年内',
                'is_advanced' => false,
            ];
        }

        // 社保补贴 - 深户或非深户但有居住证
        if (in_array($identity, ['graduate', 'student', 'opc', 'both'])) {
            // 假设最低工资2360元，社保约30%
            $monthlyRefund = 2360 * 0.30 * 0.5;
            $sixMonthRefund = $monthlyRefund * 6;
            $amountLow = 2124;
            $amountHigh = 3000;
            $totalLow += $amountLow;
            $totalHigh += $amountHigh;
            $totalHighAll += $amountHigh;
            $basicCount++;
            $subsidies[] = [
                'name' => '社会保险补贴',
                'amount_low' => $amountLow,
                'amount_high' => $amountHigh,
                'condition' => '缴纳社保满3个月',
                'is_advanced' => false,
            ];
        }

        // 初创企业补贴 - 所有创业者
        if (in_array($identity, ['graduate', 'student', 'opc', 'both'])) {
            $amountLow = 10000;
            $amountHigh = 15000;
            $totalLow += $amountLow;
            $totalHigh += $amountHigh;
            $totalHighAll += $amountHigh;
            $basicCount++;
            $subsidies[] = [
                'name' => '初创企业补贴',
                'amount_low' => $amountLow,
                'amount_high' => $amountHigh,
                'condition' => '正常经营6个月',
                'is_advanced' => false,
            ];
        }

        // 创业带动就业补贴
        if ($employee === '1-3' || $employee === '4+') {
            $amountLow = 2000;
            $amountHigh = 3000;
            if ($employee === '4+') {
                $amountLow = 3000;
                $amountHigh = 4500;
            }
            $totalLow += $amountLow;
            $totalHigh += $amountHigh;
            $totalHighAll += $amountHigh;
            $basicCount++;
            $subsidies[] = [
                'name' => '创业带动就业补贴',
                'amount_low' => $amountLow,
                'amount_high' => $amountHigh,
                'condition' => '招用员工并缴纳社保',
                'is_advanced' => false,
            ];
        }

        // 场租补贴 - 罗湖区
        if ($region === 'luohu' && in_array($identity, ['graduate', 'student', 'both'])) {
            $amountLow = 4500;
            $amountHigh = 9000;
            $totalLow += $amountLow;
            $totalHigh += $amountHigh;
            $totalHighAll += $amountHigh;
            $basicCount++;
            $subsidies[] = [
                'name' => '罗湖区场租补贴',
                'amount_low' => $amountLow,
                'amount_high' => $amountHigh,
                'condition' => '租赁非商业用房',
                'is_advanced' => false,
            ];
        }

        // 青年人才入户补贴
        if (in_array($identity, ['graduate', 'student', 'both'])) {
            $amountLow = 20000;
            $amountHigh = 30000;
            $totalLow += $amountLow;
            $totalHigh += $amountHigh;
            $totalHighAll += $amountHigh;
            $advancedCount++;
            $subsidies[] = [
                'name' => '青年人才入户补贴',
                'amount_low' => $amountLow,
                'amount_high' => $amountHigh,
                'condition' => '本科以上+深圳入户',
                'is_advanced' => true,
            ];
        }

        // 罗湖区团队奖励
        if ($region === 'luohu' && $employee === '4+') {
            $amountLow = 50000;
            $amountHigh = 100000;
            $totalHighAll += $amountHigh;
            $advancedCount++;
            $subsidies[] = [
                'name' => '罗湖区创业团队奖励',
                'amount_low' => $amountLow,
                'amount_high' => $amountHigh,
                'condition' => '5人以上团队',
                'is_advanced' => true,
            ];
        }

        // 创业担保贷款（不直接给钱，但是重要）
        $totalHighAll += 300000; // 基础额度30万

        // 计算净收益
        $netBenefit = $totalLow - $costTotal;

        return [
            'total_low' => $totalLow,
            'total_high' => $totalHigh,
            'total_high_all' => $totalHighAll,
            'basic_count' => $basicCount,
            'advanced_count' => $advancedCount,
            'subsidies' => $subsidies,
            'costs' => $costs,
            'net_benefit' => $netBenefit > 0 ? '盈利' . $netBenefit . '元' : '亏损' . abs($netBenefit) . '元',
        ];
    }
}