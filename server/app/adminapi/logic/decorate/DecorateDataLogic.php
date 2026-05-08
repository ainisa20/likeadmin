<?php
// +----------------------------------------------------------------------
// | likeadmin快速开发前后端分离管理后台（PHP版）
// +----------------------------------------------------------------------
// | 欢迎阅读学习系统程序代码，建议反馈是我们前进的动力
// | 开源版本可自由商用，可去除界面版权logo
// | gitee下载：https://gitee.com/likeshop_gitee/likeadmin
// | github下载：https://github.com/likeshop-github/likeadmin
// | 访问官网：https://www.likeadmin.cn
// | likeadmin团队 版权所有，拥有最终解释权
// +----------------------------------------------------------------------
// | author: likeadminTeam
// +----------------------------------------------------------------------
namespace app\adminapi\logic\decorate;

use app\common\logic\BaseLogic;
use app\common\model\article\Article;
use app\common\model\decorate\DecoratePage;

/**
 * 装修页-数据
 * Class DecorateDataLogic
 * @package app\adminapi\logic\decorate
 */
class DecorateDataLogic extends BaseLogic
{

    /**
     * @notes 获取文章列表
     * @param $limit
     * @return array
     * @throws \think\db\exception\DataNotFoundException
     * @throws \think\db\exception\DbException
     * @throws \think\db\exception\ModelNotFoundException
     * @author 段誉
     * @date 2022/9/22 16:49
     */
    public static function getArticleLists($limit): array
    {
        $field = 'id,title,desc,abstract,image,author,content,
        click_virtual,click_actual,create_time';

        return Article::where(['is_show' => 1])
            ->field($field)
            ->order(['id' => 'desc'])
            ->limit($limit)
            ->append(['click'])
            ->hidden(['click_virtual', 'click_actual'])
            ->select()->toArray();
    }

    /**
     * @notes pc设置
     * @return array
     * @author mjf
     * @date 2024/3/14 18:13
     */
    public static function pc(): array
    {
        $pcPage = DecoratePage::findOrEmpty(4)->toArray();
        $updateTime = !empty($pcPage['update_time']) ? $pcPage['update_time'] : date('Y-m-d H:i:s');

        // 解析 data 字段，检测 schema 版本
        $data = !empty($pcPage['data']) ? json_decode($pcPage['data'], true) : [];
        $isNewSchema = isset($data['sections']) && is_array($data['sections']);
        $schemaVersion = $isNewSchema ? ($data['_meta']['version'] ?? '1.0') : 'legacy';
        $sectionCount = $isNewSchema ? count($data['sections']) : 0;

        // 获取 Dify 配置
        $difyConfig = self::getDifyConfig($pcPage);

        // 获取主题配置
        $themeConfig = self::getThemeConfig($pcPage);

        return [
            'update_time' => $updateTime,
            'pc_url' => request()->domain() . '/pc/',
            'dify_config' => $difyConfig,
            'theme_config' => $themeConfig,
            'schema_version' => $schemaVersion,
            'section_count' => $sectionCount,
        ];
    }

    /**
     * @notes 获取主题配置
     * @param $pcPage
     * @return array
     * @author raeazL
     * @date 2026/04/16
     */
    private static function getThemeConfig($pcPage): array
    {
        $defaultConfig = [
            'mode' => 'preset',
            'presetId' => 1,
            'primaryColor' => '#4153ff',
            'minorColor' => '#7583ff',
            'pageBgColor' => '#f7f7f7',
            'headerBgColor' => '#4153ff',
            'headerTextColor' => 'white',
            'borderRadius' => 8,
        ];

        if (empty($pcPage['meta'])) {
            return $defaultConfig;
        }

        $meta = json_decode($pcPage['meta'], true);
        if (isset($meta['theme_config'])) {
            return array_merge($defaultConfig, $meta['theme_config']);
        }

        return $defaultConfig;
    }

    /**
     * @notes 获取 Dify 配置
     * @param $pcPage
     * @return array
     * @author raeazL
     * @date 2026/04/04
     */
    private static function getDifyConfig($pcPage): array
    {
        $defaultConfig = [
            'enabled' => false,
            'token' => '',
            'baseUrl' => '/dify-api',  // 使用 nginx 代理路径，避免 CORS 跨域
            'buttonColor' => '#1C64F2',
            'windowWidth' => '24',
            'windowHeight' => '40',
            'welcomeEnabled' => false,
            'welcomeText' => '',
            'suggestionsEnabled' => false,
            'suggestions' => ['', '', ''],
        ];

        if (empty($pcPage['meta'])) {
            return $defaultConfig;
        }

        $meta = json_decode($pcPage['meta'], true);
        if (isset($meta['dify_config'])) {
            $config = array_merge($defaultConfig, $meta['dify_config']);
            
            // 确保建议提问至少有3个
            if (!isset($config['suggestions']) || !is_array($config['suggestions'])) {
                $config['suggestions'] = ['', '', ''];
            }
            
            // 确保建议提问不超过5个
            if (count($config['suggestions']) > 5) {
                $config['suggestions'] = array_slice($config['suggestions'], 0, 5);
            }
            
            // 填充空的建议提问
            while (count($config['suggestions']) < 3) {
                $config['suggestions'][] = '';
            }
            
            return $config;
        }

        return $defaultConfig;
    }

    /**
     * @notes 保存配置（Dify配置 + 主题配置）
     * @param $params
     * @return bool
     * @author raeazL
     * @date 2026/04/04
     */
    public static function saveDifyConfig($params): bool
    {
        $pcPage = DecoratePage::findOrEmpty(4);
        if ($pcPage->isEmpty()) {
            self::$error = 'PC端装修配置不存在';
            return false;
        }

        // 获取现有的 meta 配置
        $meta = [];
        if (!empty($pcPage->meta)) {
            $meta = json_decode($pcPage->meta, true);
        }

        // 保存 Dify 配置
        if (isset($params['dify_config'])) {
            $difyParams = $params['dify_config'];
            $difyConfig = [
                'enabled' => isset($difyParams['enabled']) && ($difyParams['enabled'] === true || $difyParams['enabled'] === 'true' || $difyParams['enabled'] === 1 || $difyParams['enabled'] === '1'),
                'token' => $difyParams['token'] ?? '',
                'baseUrl' => $difyParams['baseUrl'] ?? 'http://localhost',
                'buttonColor' => $difyParams['buttonColor'] ?? '#1C64F2',
                'windowWidth' => $difyParams['windowWidth'] ?? '24',
                'windowHeight' => $difyParams['windowHeight'] ?? '40',
                'welcomeEnabled' => isset($difyParams['welcomeEnabled']) && ($difyParams['welcomeEnabled'] === true || $difyParams['welcomeEnabled'] === 'true' || $difyParams['welcomeEnabled'] === 1 || $difyParams['welcomeEnabled'] === '1'),
                'welcomeText' => $difyParams['welcomeText'] ?? '',
                'suggestionsEnabled' => isset($difyParams['suggestionsEnabled']) && ($difyParams['suggestionsEnabled'] === true || $difyParams['suggestionsEnabled'] === 'true' || $difyParams['suggestionsEnabled'] === 1 || $difyParams['suggestionsEnabled'] === '1'),
                'suggestions' => $difyParams['suggestions'] ?? [],
                'opcToken' => $difyParams['opcToken'] ?? '',
                'wizardEnabled' => isset($difyParams['wizardEnabled']) && ($difyParams['wizardEnabled'] === true || $difyParams['wizardEnabled'] === 'true' || $difyParams['wizardEnabled'] === 1 || $difyParams['wizardEnabled'] === '1'),
            ];
            
            // 验证建议提问
            if (!is_array($difyConfig['suggestions'])) {
                self::$error = '推荐提问必须是数组';
                return false;
            }
            
            // 确保建议提问数量在 3-5 个
            if (count($difyConfig['suggestions']) < 3) {
                self::$error = '推荐提问至少需要 3 个';
                return false;
            }
            
            if (count($difyConfig['suggestions']) > 5) {
                self::$error = '推荐提问最多只能有 5 个';
                return false;
            }
            
            // 验证每个建议提问的长度
            foreach ($difyConfig['suggestions'] as $suggestion) {
                if (mb_strlen($suggestion) > 50) {
                    self::$error = '每个推荐提问最多 50 个字符';
                    return false;
                }
            }
            
            // 过滤空建议提问
            $difyConfig['suggestions'] = array_values(array_filter($difyConfig['suggestions'], function($item) {
                return trim($item) !== '';
            }));
            
            // 重新确保至少有3个
            while (count($difyConfig['suggestions']) < 3) {
                $difyConfig['suggestions'][] = '';
            }
            
            $meta['dify_config'] = $difyConfig;
        }

        // 保存主题配置
        if (isset($params['theme_config'])) {
            $themeParams = $params['theme_config'];
            $meta['theme_config'] = [
            'mode' => $themeParams['mode'] ?? 'preset',
            'presetId' => $themeParams['presetId'] ?? 1,
            'primaryColor' => $themeParams['primaryColor'] ?? '#4153ff',
            'minorColor' => $themeParams['minorColor'] ?? '#7583ff',
            'pageBgColor' => $themeParams['pageBgColor'] ?? '#f7f7f7',
            'headerBgColor' => $themeParams['headerBgColor'] ?? '#4153ff',
            'headerTextColor' => $themeParams['headerTextColor'] ?? 'white',
            'borderRadius' => $themeParams['borderRadius'] ?? 8,
            'footerStyle' => $themeParams['footerStyle'] ?? 'gray',
            ];
        }

        // 保存到数据库
        $pcPage->meta = json_encode($meta, JSON_UNESCAPED_UNICODE);
        $pcPage->save();

        return true;
    }




}
