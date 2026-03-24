export const NAVBAR = [
    {
        name: '首页',
        path: '/'
    },
    {
        name: '核心服务',
        path: '/services'
    },
    {
        name: 'OPC百科',
        path: '/opc-intro'
    },
    {
        name: '政策地图',
        path: '/policy-map'
    },
    {
        name: '成功案例',
        path: '/cases'
    },
    {
        name: '社区动态',
        path: '/community'
    },
    {
        name: '关于我们',
        path: '/about'
    },
    {
        name: '资讯中心',
        path: '/information',
        component: 'information'
    },
    {
        name: '管理后台',
        path: '/admin',
        component: 'admin'
    }
]

export const SIDEBAR = [
    {
        module: 'personal',
        hidden: true,
        children: [
            {
                name: '个人中心',
                path: '/user',
                children: [
                    {
                        name: '个人信息',
                        path: 'info'
                    },
                    {
                        name: '我的收藏',
                        path: 'collection'
                    }
                ]
            },

            {
                name: '账户设置',
                path: '/account',
                children: [
                    {
                        name: '账户安全',
                        path: 'security'
                    }
                ]
            }
        ]
    }
]
