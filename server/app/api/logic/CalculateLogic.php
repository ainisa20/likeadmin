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
            ['name' => '① 企业注册相关', 'amount' => '1000~2000元', 'note' => '工商注册免费，印章刻制约300~500元'],
            ['name' => '② 云服务器', 'amount' => '38~199元/年', 'note' => '阿里云轻量 2核2G 38元/年'],
            ['name' => '③ 域名', 'amount' => '1~85元/年', 'note' => '.cn 35-38元; .com 83元'],
            ['name' => '④ AI编程工具', 'amount' => '7.9~40元/月', 'note' => '阿里云百炼 Coding Plan Lite首月7.9元'],
            ['name' => '⑤ 大模型调用', 'amount' => '0~300元', 'note' => '可用市级模型券（最高200万）冲抵'],
            ['name' => '⑥ 代记账报税', 'amount' => '1500～2500元', 'note' => '与九章数智合作，全栈服务包3200元含该服务'],
            ['name' => '⑦ 基础龙虾部署', 'amount' => '2000～3000元', 'note' => '与九章数智合作，全栈服务包3200元享免费部署，送龙虾面板工具'],
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

    /**
     * 计算技术方案：云服务器配置 + AI工具链 + 成本估算
     * @param bool $needServer 是否需要云服务器
     * @param string $aiCallsPerDay AI日均调用次数（万次左右 / 10万次以上 / 不需要）
     * @param bool $overseas 是否面向海外市场
     * @param string $budget 启动资金区间
     */
    public static function techPlan(bool $needServer, string $aiCallsPerDay, string $budget = ''): array
    {
        $servers = [];
        $monthlyServerCost = 0;

        if ($needServer) {
            // 根据预算和调用量选推荐配置（基于阿里云/腾讯云 2025 年轻量应用服务器实际价格）
            $servers = self::pickServerConfig($aiCallsPerDay, $budget);
            $monthlyServerCost = $servers['recommended']['monthly_cost'];
        }

        $aiTools = self::pickAiToolchain($aiCallsPerDay);
        $monthlyAiCost = $aiTools['monthly_cost'];

        $devTools = self::pickDevTools();

        $totalMonthly = $monthlyServerCost + $monthlyAiCost + $devTools['monthly_cost'];
        $totalYearly = $totalMonthly * 12;

        return [
            'need_server' => $needServer,
            'servers' => $servers,
            'ai_tools' => $aiTools,
            'dev_tools' => $devTools,
            'monthly_cost' => $totalMonthly,
            'yearly_cost' => $totalYearly,
            'monthly_breakdown' => [
                ['item' => '云服务器', 'cost' => $monthlyServerCost, 'note' => ''],
                ['item' => 'AI模型调用', 'cost' => $monthlyAiCost, 'note' => $monthlyAiCost === 0 ? '可使用免费额度或市级模型券冲抵' : ''],
                ['item' => '开发工具', 'cost' => $devTools['monthly_cost'], 'note' => $devTools['monthly_cost'] === 0 ? '使用免费开发工具即可起步' : ''],
            ],
        ];
    }

    /**
     * 基于真实阿里云/腾讯云轻量应用服务器价格推荐配置
     */
    private static function pickServerConfig(string $aiCallsPerDay, string $budget): array
    {
        // 阿里云轻量应用服务器 2025 年价格（新用户专享/续费价）
        $configs = [
            'starter' => [
                'name' => '入门型（开发/测试）',
                'spec' => '2核2G 3M带宽 50GB SSD',
                'provider' => '阿里云轻量应用服务器',
                'yearly_cost' => 99,
                'monthly_cost' => 3,
                'suitable_for' => '个人开发测试、低流量MVP验证',
                'ref_url' => 'https://www.aliyun.com/product/swas',
            ],
            'basic' => [
                'name' => '基础型（小规模上线）',
                'spec' => '2核4G 5M带宽 60GB SSD',
                'provider' => '阿里云轻量应用服务器',
                'yearly_cost' => 108,
                'monthly_cost' => 9,
                'suitable_for' => '日活<1000的小型应用、API服务',
                'ref_url' => 'https://www.aliyun.com/product/swas',
            ],
            'standard' => [
                'name' => '标准型（正式运营）',
                'spec' => '2核8G 8M带宽 100GB SSD',
                'provider' => '腾讯云轻量应用服务器',
                'yearly_cost' => 366,
                'monthly_cost' => 30,
                'suitable_for' => '日均API调用<5万次、中小型SaaS',
                'ref_url' => 'https://cloud.tencent.com/product/lighthouse',
            ],
            'pro' => [
                'name' => '进阶型（高并发场景）',
                'spec' => '4核8G 10M带宽 120GB SSD',
                'provider' => '阿里云 ECS / 腾讯云 CVM',
                'yearly_cost' => 899,
                'monthly_cost' => 75,
                'suitable_for' => '日均API调用5-20万次、多模块业务系统',
                'ref_url' => 'https://www.aliyun.com/product/ecs',
            ],
            'enterprise' => [
                'name' => '企业型（大规模运营）',
                'spec' => '4核16G 12M带宽 200GB SSD',
                'provider' => '阿里云 ECS',
                'yearly_cost' => 2399,
                'monthly_cost' => 200,
                'suitable_for' => '日均API调用20万+、需要GPU推理或多服务集群',
                'ref_url' => 'https://www.aliyun.com/product/ecs',
            ],
        ];

        // 根据AI调用量和预算选推荐档位
        $recommended = 'basic';
        if ($aiCallsPerDay === '10万次以上') {
            $recommended = 'pro';
        } elseif ($aiCallsPerDay === '万次左右') {
            $recommended = 'standard';
        } elseif ($aiCallsPerDay === '不需要') {
            $recommended = 'starter';
        }

        // 预算有限时降级
        if ($budget === '-1万' && in_array($recommended, ['pro', 'enterprise'])) {
            $recommended = 'basic';
        } elseif ($budget === '-5万' && $recommended === 'enterprise') {
            $recommended = 'pro';
        }

        return [
            'recommended_key' => $recommended,
            'recommended' => $configs[$recommended],
            'all_configs' => $configs,
        ];
    }

    /**
     * AI 工具链 + 模型调用费用（基于国内主流大模型 API 2025 年定价）
     */
    private static function pickAiToolchain(string $aiCallsPerDay): array
    {
        // 主流模型 API 定价（2025 年实际价格，单位：元/百万Token）
        $models = [
            'qwen-turbo' => [
                'name' => '通义千问 Turbo（推荐起步）',
                'provider' => '阿里云百炼',
                'input_price' => 0.3,
                'output_price' => 0.6,
                'suitable_for' => '通用对话、文案生成、客服场景',
            ],
            'deepseek-v3' => [
                'name' => 'DeepSeek V3',
                'provider' => 'DeepSeek 官方',
                'input_price' => 1.0,
                'output_price' => 2.0,
                'suitable_for' => '复杂推理、代码生成、分析报告',
            ],
            'qwen-plus' => [
                'name' => '通义千问 Plus',
                'provider' => '阿里云百炼',
                'input_price' => 0.8,
                'output_price' => 2.0,
                'suitable_for' => '高质量内容生成、多轮对话',
            ],
            'doubao-pro' => [
                'name' => '豆包 Pro',
                'provider' => '字节跳动火山引擎',
                'input_price' => 0.8,
                'output_price' => 2.0,
                'suitable_for' => '多模态理解、内容审核、营销文案',
            ],
            'glm-4-flash' => [
                'name' => 'GLM-4 Flash（免费额度）',
                'provider' => '智谱 AI',
                'input_price' => 0.1,
                'output_price' => 0.1,
                'suitable_for' => '低成本试错、开发测试',
            ],
        ];

        // 根据调用量估算月费（假设每次调用 ~1K input + 0.5K output tokens）
        $monthlyCost = 0;
        $recommendedModel = 'qwen-turbo';

        if ($aiCallsPerDay === '万次左右') {
            // 1万次/天 × 30天 = 30万次/月
            // qwen-turbo: (300000 × 1000 × 0.3 + 300000 × 500 × 0.6) / 1000000 ≈ 180元/月
            $monthlyCost = 180;
            $recommendedModel = 'qwen-turbo';
        } elseif ($aiCallsPerDay === '10万次以上') {
            // 10万次/天 × 30天 = 300万次/月
            // qwen-turbo: 约1800元/月 → 建议用 deepseek 或谈批量折扣
            $monthlyCost = 1800;
            $recommendedModel = 'deepseek-v3';
        } elseif ($aiCallsPerDay === '不需要') {
            $monthlyCost = 0;
            $recommendedModel = 'glm-4-flash';
        }

        return [
            'recommended_model' => $recommendedModel,
            'models' => $models,
            'monthly_cost' => $monthlyCost,
            'free_options' => [
                '阿里云百炼新用户赠送100万Token免费额度',
                '智谱AI新用户赠送250万Token',
                '深圳可申请市级模型券（最高200万元）冲抵API费用',
            ],
        ];
    }

    /**
     * 海外市场所需工具和成本
     */
    private static function pickOverseasTools(): array
    {
        return [
            'items' => [
                [
                    'name' => 'Cloudflare（CDN + DNS）',
                    'cost' => '免费（Pro $20/月）',
                    'monthly_cost' => 0,
                    'purpose' => '全球加速、DDoS防护、SSL',
                ],
                [
                    'name' => 'AWS Lightsail（海外节点）',
                    'cost' => '$3.50~5/月起',
                    'monthly_cost' => 30,
                    'purpose' => '海外用户就近接入，降低延迟',
                ],
                [
                    'name' => '.com 国际域名',
                    'cost' => '约83元/年',
                    'monthly_cost' => 7,
                    'purpose' => '海外品牌形象',
                ],
            ],
            'monthly_cost' => 37,
        ];
    }

    /**
     * 开发工具链
     */
    private static function pickDevTools(): array
    {
        return [
            'items' => [
                [
                    'name' => 'AI编程助手（Cursor / Trae）',
                    'cost' => '免费~20美元/月',
                    'monthly_cost' => 0,
                    'note' => '免费版功能已足够起步阶段使用',
                ],
                [
                    'name' => '代码托管（GitHub）',
                    'cost' => '免费',
                    'monthly_cost' => 0,
                    'note' => 'Private仓库免费，Actions CI/CD免费额度2000分钟/月',
                ],
                [
                    'name' => '域名 + SSL',
                    'cost' => '约83元/年',
                    'monthly_cost' => 7,
                    'note' => '.com域名约83元/年，SSL证书免费（Let\'s Encrypt）',
                ],
            ],
            'monthly_cost' => 7,
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