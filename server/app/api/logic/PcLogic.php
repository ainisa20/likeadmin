<?php
// +----------------------------------------------------------------------
// | likeadmin快速开发前后端分离管理后台（PHP版）
// +----------------------------------------------------------------------
// | 欢迎阅读学习系统程序代码，建议反馈是我们前进的动力
// | 开源版本可自由商用，可去除界面版权logo
// | gitee下载：https://gitee.com/likeshop_gitee/likeadmin
// | github下载：https://github.com/likeshop-github/likeadmin
// | 访问官网：https://www.likeadmin.cn
// | likeadmin团队 版权所有 拥有最终解释权
// +----------------------------------------------------------------------
// | author: likeadminTeam
// +----------------------------------------------------------------------

namespace app\api\logic;


use app\common\enum\YesNoEnum;
use app\common\logic\BaseLogic;
use app\common\model\article\Article;
use app\common\model\article\ArticleCate;
use app\common\model\article\ArticleCollect;
use app\common\model\decorate\DecoratePage;
use app\common\service\ConfigService;
use app\common\service\FileService;


/**
 * index
 * Class IndexLogic
 * @package app\api\logic
 */
class PcLogic extends BaseLogic
{

    /**
     * @notes 首页数据
     * @return array
     * @throws \think\db\exception\DataNotFoundException
     * @throws \think\db\exception\DbException
     * @throws \think\db\exception\ModelNotFoundException
     * @author 段誉
     * @date 2022/9/21 19:15
     */
    public static function getIndexData()
    {
        // 装修配置 - 直接返回原始 data，让前端做兼容解析
        $decoratePage = DecoratePage::findOrEmpty(4)->toArray();
        // 最新资讯
        $newArticle = self::getLimitArticle('new', 7);
        // 全部资讯
        $allArticle = self::getLimitArticle('all', 5);
        // 热门资讯
        $hotArticle = self::getLimitArticle('hot', 8);

        return [
            'page' => $decoratePage,
            'all' => $allArticle,
            'new' => $newArticle,
            'hot' => $hotArticle
        ];
    }


    /**
     * @notes 获取文章
     * @param string $sortType
     * @param int $limit
     * @return mixed
     * @author 段誉
     * @date 2022/10/19 9:53
     */
    public static function getLimitArticle(string $sortType, int $limit = 0, int $cate = 0, int $excludeId = 0)
    {
        // 查询字段
        $field = [
            'id', 'cid', 'title', 'desc', 'abstract', 'image',
            'author', 'click_actual', 'click_virtual', 'create_time'
        ];

        // 排序条件
        $orderRaw = 'sort desc, id desc';
        if ($sortType == 'new') {
            $orderRaw = 'sort desc, id desc';
        }
        if ($sortType == 'hot') {
            $orderRaw = 'click_actual + click_virtual desc, id desc';
        }

        // 查询条件
        $where[] = ['is_show', '=', YesNoEnum::YES];
        if (!empty($cate)) {
            $where[] = ['cid', '=', $cate];
        }
        if (!empty($excludeId)) {
            $where[] = ['id', '<>', $excludeId];
        }

        $article = Article::field($field)
            ->where($where)
            ->append(['click'])
            ->orderRaw($orderRaw)
            ->hidden(['click_actual', 'click_virtual']);

        if ($limit) {
            $article->limit($limit);
        }

        return $article->select()->toArray();
    }


    /**
     * @notes 获取配置
     * @return array
     * @throws \think\db\exception\DataNotFoundException
     * @throws \think\db\exception\DbException
     * @throws \think\db\exception\ModelNotFoundException
     * @author 段誉
     * @date 2022/9/21 19:38
     */
    public static function getConfigData()
    {
        // 登录配置
        $loginConfig = [
            // 登录方式
            'login_way' => ConfigService::get('login', 'login_way', config('project.login.login_way')),
            // 注册强制绑定手机
            'coerce_mobile' => ConfigService::get('login', 'coerce_mobile', config('project.login.coerce_mobile')),
            // 政策协议
            'login_agreement' => ConfigService::get('login', 'login_agreement', config('project.login.login_agreement')),
            // 第三方登录 开关
            'third_auth' => ConfigService::get('login', 'third_auth', config('project.login.third_auth')),
            // 微信授权登录
            'wechat_auth' => ConfigService::get('login', 'wechat_auth', config('project.login.wechat_auth')),
            // qq授权登录
            'qq_auth' => ConfigService::get('login', 'qq_auth', config('project.login.qq_auth')),
        ];

        // 网站信息
        $website = [
            'shop_name' => ConfigService::get('website', 'shop_name'),
            'shop_logo' => FileService::getFileUrl(ConfigService::get('website', 'shop_logo')),
            'pc_logo' => FileService::getFileUrl(ConfigService::get('website', 'pc_logo')),
            'pc_title' => ConfigService::get('website', 'pc_title'),
            'pc_ico' => FileService::getFileUrl(ConfigService::get('website', 'pc_ico')),
            'pc_desc' => ConfigService::get('website', 'pc_desc'),
            'pc_keywords' => ConfigService::get('website', 'pc_keywords'),
        ];

        // 站点统计
        $siteStatistics = [
            'clarity_code' => ConfigService::get('siteStatistics', 'clarity_code'),
        ];

        // 备案信息
        $copyright = ConfigService::get('copyright', 'config', []);

        // 公众号二维码
        $oaQrCode = ConfigService::get('oa_setting', 'qr_code', '');
        $oaQrCode = empty($oaQrCode) ? $oaQrCode : FileService::getFileUrl($oaQrCode);
        // 小程序二维码
        $mnpQrCode = ConfigService::get('mnp_setting', 'qr_code', '');
        $mnpQrCode = empty($mnpQrCode) ? $mnpQrCode : FileService::getFileUrl($mnpQrCode);

        return [
            'domain' => FileService::getFileUrl(),
            'login' => $loginConfig,
            'website' => $website,
            'siteStatistics' => $siteStatistics,
            'version' => config('project.version'),
            'copyright' => $copyright,
            'admin_url' => request()->domain() . '/admin/',
            'qrcode' => [
                'oa' => $oaQrCode,
                'mnp' => $mnpQrCode,
            ],
            'dify' => self::getDifyConfig(),
            'theme_config' => self::getThemeConfig(),
            'page_schema_version' => self::getPageSchemaVersion(),
        ];
    }


    /**
     * @notes 资讯中心
     * @return array
     * @throws \think\db\exception\DataNotFoundException
     * @throws \think\db\exception\DbException
     * @throws \think\db\exception\ModelNotFoundException
     * @author 段誉
     * @date 2022/10/19 16:55
     */
    public static function getInfoCenter()
    {
        $data = ArticleCate::field(['id', 'name'])
            ->with(['article' => function ($query) {
                $query->hidden(['content', 'click_virtual', 'click_actual'])
                    ->order(['sort' => 'desc', 'id' => 'desc'])
                    ->append(['click'])
                    ->where(['is_show' => YesNoEnum::YES])
                    ->limit(10);
            }])
            ->where(['is_show' => YesNoEnum::YES])
            ->order(['sort' => 'desc', 'id' => 'desc'])
            ->select()
            ->toArray();

        return $data;
    }


    /**
     * @notes 获取文章详情
     * @param $userId
     * @param $articleId
     * @param string $source
     * @return array
     * @author 段誉
     * @date 2022/10/20 15:18
     */
    public static function getArticleDetail($userId, $articleId, $source = 'default')
    {
        // 文章详情
        $detail = Article::getArticleDetailArr($articleId);

        // 根据来源列表查找对应列表
        $nowIndex = 0;
        $lists = self::getLimitArticle($source, 0, $detail['cid']);
        foreach ($lists as $key => $item) {
            if ($item['id'] == $articleId) {
                $nowIndex = $key;
            }
        }
        // 上一篇
        $detail['last'] = $lists[$nowIndex - 1] ?? [];
        // 下一篇
        $detail['next'] = $lists[$nowIndex + 1] ?? [];

        // 最新资讯
        $detail['new'] = self::getLimitArticle('new', 8, $detail['cid'], $detail['id']);
        // 关注状态
        $detail['collect'] = ArticleCollect::isCollectArticle($userId, $articleId);
        // 分类名
        $detail['cate_name'] = ArticleCate::where('id', $detail['cid'])->value('name');

        return $detail;
    }

    /**
     * @notes 获取 Dify 聊天机器人配置
     * @return array
     * @author raeazL
     * @date 2026/04/04
     */
    private static function getDifyConfig(): array
    {
        $defaultConfig = [
            'enabled' => false,
            'token' => '',
            'baseUrl' => 'http://localhost',
            'buttonColor' => '#1C64F2',
            'windowWidth' => '24',
            'windowHeight' => '40',
        ];

        try {
            // 获取 PC 页面装修数据
            $pcPage = \app\common\model\decorate\DecoratePage::findOrEmpty(4);

            if ($pcPage->isEmpty() || empty($pcPage->meta)) {
                return $defaultConfig;
            }

            $meta = json_decode($pcPage->meta, true);
            if (isset($meta['dify_config']) && is_array($meta['dify_config'])) {
                $config = array_merge($defaultConfig, $meta['dify_config']);
                // 确保 enabled 是布尔值
                $config['enabled'] = isset($meta['dify_config']['enabled']) &&
                                     ($meta['dify_config']['enabled'] === true ||
                                      $meta['dify_config']['enabled'] === 'true' ||
                                      $meta['dify_config']['enabled'] === '1' ||
                                      $meta['dify_config']['enabled'] === 1);
                return $config;
            }

            return $defaultConfig;
        } catch (\Exception $e) {
            // 出错时返回默认配置
            return $defaultConfig;
        }
    }

    /**
     * @notes 获取主题配置
     * @return array
     * @author raeazL
     * @date 2026/04/16
     */
    private static function getThemeConfig(): array
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
            'footerStyle' => 'gray',
        ];

        try {
            // 获取 PC 页面装修数据
            $pcPage = DecoratePage::findOrEmpty(4);

            if ($pcPage->isEmpty() || empty($pcPage->meta)) {
                return $defaultConfig;
            }

            $meta = json_decode($pcPage->meta, true);
            if (isset($meta['theme_config']) && is_array($meta['theme_config'])) {
                return array_merge($defaultConfig, $meta['theme_config']);
            }

            return $defaultConfig;
        } catch (\Exception $e) {
            // 出错时返回默认配置
            return $defaultConfig;
        }
    }

    /**
     * @notes 获取页面 schema 版本
     * @return string
     * @author raeazL
     * @date 2026/04/25
     */
    private static function getPageSchemaVersion(): string
    {
        try {
            // 获取 PC 页面装修数据 (id=4)
            $pcPage = DecoratePage::findOrEmpty(4);

            if ($pcPage->isEmpty() || empty($pcPage->data)) {
                return 'legacy';
            }

            // 解析 data 字段
            $data = json_decode($pcPage->data, true);

            // 检查是否为新 schema（包含 sections 数组）
            if (isset($data['sections']) && is_array($data['sections'])) {
                // 返回 _meta 中的版本号，默认为 '1.0'
                return $data['_meta']['version'] ?? '1.0';
            }

            // 旧格式
            return 'legacy';
        } catch (\Exception $e) {
            return 'legacy';
        }
    }

    public static function getPageData(int $pageId): array
    {
        $page = DecoratePage::findOrEmpty($pageId);
        if ($page->isEmpty()) {
            return [];
        }
        $pageData = $page->toArray();
        $newArticle = self::getLimitArticle('new', 7);
        $hotArticle = self::getLimitArticle('hot', 8);
        $allArticle = self::getLimitArticle('all', 5);
        return [
            'page' => $pageData,
            'new' => $newArticle,
            'hot' => $hotArticle,
            'all' => $allArticle,
        ];
    }

    public static function getPageList(): array
    {
        // PC页面：type >= 4 且非系统风格(type=5)
        $pages = DecoratePage::field(['id', 'type', 'name', 'meta'])
            ->where('type', '>=', 4)
            ->where('type', '<>', 5)
            ->order('id', 'asc')
            ->select()
            ->toArray();

        $result = [];
        foreach ($pages as $page) {
            $id = $page['id'];
            $meta = json_decode($page['meta'] ?? '', true);
            // 首页固定路径 /，其他页面从 meta.pc_path 读取或生成默认路径
            $path = $id == 4 ? '/' : ($meta['pc_path'] ?? '/pc/page' . $id);
            $result[] = [
                'id' => $id,
                'name' => $page['name'] ?: '页面' . $id,
                'path' => $path,
            ];
        }
        return $result;
    }

}
