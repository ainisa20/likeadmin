<?php

namespace app\api\logic;

class CalculateLogic
{
    public static function calculate(string $identity, string $region, string $employee): array
    {
        $subsidies = [];
        $basicCount = 0;
        $advancedCount = 0;

        if ($identity === 'student') {
            $subsidies[] = [
                'name' => '求职创业补贴（一次性）',
                'amount_low' => 3000,
                'amount_high' => 3000,
                'condition' => '2026届毕业生，在校期间申请',
                'is_advanced' => false,
            ];
            $basicCount++;
        }

        if ($identity !== 'student') {
            $subsidies[] = [
                'name' => '初创企业补贴（一次性）',
                'amount_low' => 10000,
                'amount_high' => 10000,
                'condition' => '社保连续满6个月后可申请（在校学生除外）',
                'is_advanced' => false,
            ];
            $basicCount++;

            $subsidies[] = [
                'name' => '社会保险补贴（单位部分）',
                'amount_low' => 15000,
                'amount_high' => 25000,
                'condition' => '社保满3个月即可申请，按最低标准单位部分100%补贴，最长36个月，先缴后补，按季度发放',
                'is_advanced' => false,
            ];
            $basicCount++;
        }

        if (in_array($identity, ['student', 'graduate', 'both'])) {
            $subsidies[] = [
                'name' => '创业场租补贴（青年人才）',
                'amount_low' => 8000,
                'amount_high' => 14400,
                'condition' => '每年最高7800元，最长3年；可叠加不超过10㎡免租金6个月创业空间',
                'is_advanced' => false,
            ];
            $basicCount++;
        }

        if ($employee === '1-3') {
            $subsidies[] = [
                'name' => '创业带动就业补贴',
                'amount_low' => 2000,
                'amount_high' => 6000,
                'condition' => '招用3人以下按每人2000元，需签订1年劳动合同且社保满6个月',
                'is_advanced' => false,
            ];
            $basicCount++;
        } elseif ($employee === '4+') {
            $subsidies[] = [
                'name' => '创业带动就业补贴',
                'amount_low' => 9000,
                'amount_high' => 30000,
                'condition' => '招用4人及以上每净增1人3000元，总额最高3万',
                'is_advanced' => false,
            ];
            $basicCount++;
        }

        if (($identity === 'opc' || $identity === 'both') && in_array($region, ['luohu', 'longgang', 'nanshan'])) {
            $regionName = ['luohu' => '罗湖', 'longgang' => '龙岗', 'nanshan' => '南山'][$region] ?? '该区';
            $subsidies[] = [
                'name' => "青年人才入户补贴（{$regionName}）",
                'amount_low' => 30000,
                'amount_high' => 100000,
                'condition' => '博士最高10万元、硕士最高5万元、本科最高3万元。市级统一标准，由各区人社部门受理',
                'is_advanced' => false,
            ];
            $basicCount++;
        }

        if ($identity === 'opc' || $identity === 'both') {
            if ($region === 'luohu') {
                $subsidies[] = [
                    'name' => '优质人才团队奖励（罗湖）',
                    'amount_low' => 50000,
                    'amount_high' => 1000000,
                    'condition' => '高层次人才团队经认定最高100万元（评审竞争激烈）',
                    'is_advanced' => true,
                ];
                $advancedCount++;

                $subsidies[] = [
                    'name' => '股权跟投支持（罗湖）',
                    'amount_low' => 0,
                    'amount_high' => 10000000,
                    'condition' => '按投资机构投资金额最高50%跟投，最高1000万元（需已获机构投资）',
                    'is_advanced' => true,
                ];
                $advancedCount++;
            }

            if ($region === 'longgang') {
                $subsidies[] = [
                    'name' => '关键代码贡献补贴（龙岗）',
                    'amount_low' => 50000,
                    'amount_high' => 2000000,
                    'condition' => '向国际主流开源社区贡献关键代码，经认定最高200万元',
                    'is_advanced' => true,
                ];
                $advancedCount++;

                $subsidies[] = [
                    'name' => 'AIGC模型调用补贴（龙岗）',
                    'amount_low' => 30000,
                    'amount_high' => 1000000,
                    'condition' => '按实际模型调用费用30%补贴，每年最高100万元',
                    'is_advanced' => true,
                ];
                $advancedCount++;

                $subsidies[] = [
                    'name' => '示范应用项目奖励（龙岗）',
                    'amount_low' => 50000,
                    'amount_high' => 4000000,
                    'condition' => '每年遴选示范场景项目，最高按投入50%给予不超过400万元支持',
                    'is_advanced' => true,
                ];
                $advancedCount++;

                $subsidies[] = [
                    'name' => 'OPC黑客松/大赛获奖（龙岗）',
                    'amount_low' => 10000,
                    'amount_high' => 500000,
                    'condition' => '在龙岗区主办赛事中获奖的OPC团队，最高50万元',
                    'is_advanced' => true,
                ];
                $advancedCount++;
            }

            if ($region === 'guangming') {
                $subsidies[] = [
                    'name' => '算力券补贴（光明）',
                    'amount_low' => 50000,
                    'amount_high' => 6000000,
                    'condition' => '按年度采购算力费用30%补贴，最高600万元，连续资助3年',
                    'is_advanced' => true,
                ];
                $advancedCount++;

                $subsidies[] = [
                    'name' => '青年人才创业资助（光明）',
                    'amount_low' => 30000,
                    'amount_high' => 500000,
                    'condition' => '高校工科学生/青年科技人才最高可获50万元启动资金',
                    'is_advanced' => true,
                ];
                $advancedCount++;
            }

            if ($region === 'other') {
                $subsidies[] = [
                    'name' => '市级训力券',
                    'amount_low' => 50000,
                    'amount_high' => 10000000,
                    'condition' => '资助模型训练，每年发放最高5亿元，对初创企业提高资助比例至60%',
                    'is_advanced' => true,
                ];
                $advancedCount++;

                $subsidies[] = [
                    'name' => '市级模型券',
                    'amount_low' => 30000,
                    'amount_high' => 2000000,
                    'condition' => '资助API调用、智能体搭建等研发工作，每年最高1亿元，最高200万元',
                    'is_advanced' => true,
                ];
                $advancedCount++;

                $subsidies[] = [
                    'name' => '市级语料券',
                    'amount_low' => 30000,
                    'amount_high' => 2000000,
                    'condition' => '按语料采购总费用30%资助，最高200万元',
                    'is_advanced' => true,
                ];
                $advancedCount++;
            }
        }

        $basicLow = array_sum(array_map(fn($s) => $s['is_advanced'] ? 0 : $s['amount_low'], $subsidies));
        $basicHigh = array_sum(array_map(fn($s) => $s['is_advanced'] ? 0 : $s['amount_high'], $subsidies));
        $totalLow = array_sum(array_map(fn($s) => $s['amount_low'], $subsidies));
        $totalHigh = array_sum(array_map(fn($s) => $s['amount_high'], $subsidies));

        $costs = [
            ['name' => '① 企业注册相关', 'amount' => '0~500元', 'note' => '工商注册免费，印章刻制约300~500元'],
            ['name' => '② 云服务器', 'amount' => '38~199元/年', 'note' => '阿里云轻量 2核2G 38元/年'],
            ['name' => '③ 域名', 'amount' => '1~85元/年', 'note' => '.cn 35-38元; .com 83元'],
            ['name' => '④ AI编程工具', 'amount' => '7.9~40元/月', 'note' => '阿里云百炼 Coding Plan Lite首月7.9元'],
            ['name' => '⑤ 大模型调用', 'amount' => '0~300元', 'note' => '可用市级模型券（最高200万）冲抵'],
            ['name' => '⑥ 代记账报税', 'amount' => '0元', 'note' => '已包含于3200元服务包中'],
            ['name' => '社保投入（个人部分）', 'amount' => '约7,000元/6个月', 'note' => '深圳社保最低缴费基数6,727元/月估算'],
            ['name' => '生活费+预留资金', 'amount' => '建议30,000~60,000元', 'note' => '建议预留6个月生活费'],
        ];

        $minInvest = 37339;
        $netBenefit = $basicLow - $minInvest;
        $netBenefitStr = $netBenefit > 0 ? '+' . self::fmtNumber($netBenefit) . '元 起' : self::fmtNumber($netBenefit) . '元';

        return [
            'total_low' => $basicLow,
            'total_high' => $basicHigh,
            'total_low_all' => $totalLow,
            'total_high_all' => $totalHigh,
            'basic_count' => $basicCount,
            'advanced_count' => $advancedCount,
            'subsidies' => $subsidies,
            'costs' => $costs,
            'net_benefit' => $netBenefitStr,
            'loan_info' => '个人基础额度最高30万元，带动5人以上就业可提至60万元（申请前12个月内）',
        ];
    }

    private static function fmtNumber(int $n): string
    {
        if ($n >= 10000) {
            return number_format($n / 10000, 1) . '万';
        }
        return number_format($n);
    }
}