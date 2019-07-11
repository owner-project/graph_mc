export class AdminController {
    constructor($injector) {
        'ngInject';
        this.injector = $injector;
        const $state = this.injector.get('$state');
        const user = this.injector.get('cache').getLoginDataCache();

        this.data = {
            sideMenu: []
        };
        this.init();
    }

    init() {
        this.injector.get('$rootScope').urlData.chooseMenu = 'admin';
        this.initMenu();
    }

    initMenu() {
        let menu = [
            {
                title: '人员管理',
                route: 'memberManager',
                departmentId: 'p_1',
                departmentLevel: -1,
                departmentFatherId: '',
                child: [],
                open: false,
                style: 'icon-tree-menu-arrow-ry'
            },
            {
                title: '角色管理',
                route: 'roleManager',
                departmentLevel: -1,
                departmentId: 'p_2',
                departmentFatherId: '',
                child: [],
                style: 'icon-tree-menu-arrow-js'
            },
            {
                title: '红名单管理',
                route: 'redListManager',
                departmentLevel: -1,
                departmentId: 'p_2',
                departmentFatherId: '',
                child: [],
                style: 'icon-tree-menu-arrow-hmdgl'
            },
            {
                title: '功能列表',
                route: 'authManager',
                departmentLevel: -1,
                departmentId: 'p_3',
                departmentFatherId: '',
                child: [],
                style: 'icon-tree-menu-arrow-gn'
            },
            {
                title: '接入数据管理',
                route: 'assetManager',
                departmentLevel: -1,
                departmentId: 'p_4',
                departmentFatherId: '',
                open: false,
                child: [
                    {
                        title: '源数据管理',
                        departmentId: 'p_4_1',
                        departmentFatherId: 'p_4',
                        departmentLevel: 0,
                        route: 'assetManager',
                        routeParams: {
                            departId: 'p_4_1'
                        },
                        child: [],
                        open: false
                    },
                    {
                        title: '实体管理',
                        departmentId: 'p_4_2',
                        departmentFatherId: 'p_4',
                        departmentLevel: 0,
                        route: 'assetManager',
                        routeParams: {
                            departId: 'p_4_2'
                        },
                        child: [],
                        open: false
                    },
                    {
                        title: '关系管理',
                        departmentId: 'p_4_3',
                        departmentFatherId: 'p_4',
                        departmentLevel: 0,
                        route: 'assetManager',
                        routeParams: {
                            departId: 'p_4_3'
                        },
                        child: [],
                        open: false
                    },
                    {
                        title: '标签管理',
                        departmentId: 'p_4_4',
                        departmentFatherId: 'p_4',
                        routeParams: {
                            departId: 'p_4_4'
                        },
                        departmentLevel: 0,
                        route: 'assetManager',
                        child: [],
                        open: false
                    }
                ],
                style: 'icon-tree-menu-arrow-zygl'
            },
            {
                title: '知识库管理',
                route: 'knowledgeManager',
                departmentId: 'p_5',
                departmentLevel: -1,
                departmentFatherId: '',
                open: false,
                child: [
                    {
                        title: '实体类型',
                        route: 'knowledgeManager',
                        departmentId: 'p_5_1',
                        departmentFatherId: 'p_5',
                        routeParams: {
                            departId: 'p_5_1'
                        },
                        departmentLevel: 0,
                        child: [],
                        open: false
                    },
                    {
                        title: '关系类型',
                        route: 'knowledgeManager',
                        departmentId: 'p_5_2',
                        routeParams: {
                            departId: 'p_5_2'
                        },
                        departmentFatherId: 'p_5',
                        departmentLevel: 0,
                        child: [],
                        open: false
                    },
                    {
                        title: '地址库',
                        route: 'knowledgeManager',
                        departmentLevel: 0,
                        departmentId: 'p_5_3',
                        routeParams: {
                            departId: 'p_5_3'
                        },
                        departmentFatherId: 'p_5',
                        child: [],
                        open: false
                    },
                    {
                        title: '身份证号码规则库',
                        route: 'knowledgeManager',
                        departmentLevel: 0,
                        routeParams: {
                            departId: 'p_5_4'
                        },
                        departmentId: 'p_5_4',
                        departmentFatherId: 'p_5',
                        child: [],
                        open: false
                    },
                    {
                        title: '小区库',
                        route: 'knowledgeManager',
                        departmentLevel: 0,
                        departmentId: 'p_5_5',
                        routeParams: {
                            departId: 'p_5_5'
                        },
                        departmentFatherId: 'p_5',
                        child: [],
                        open: false
                    },
                    {
                        title: '车牌规则库',
                        route: 'knowledgeManager',
                        departmentLevel: 0,
                        departmentId: 'p_5_6',
                        routeParams: {
                            departId: 'p_5_6'
                        },
                        departmentFatherId: 'p_5',
                        child: [],
                        open: false
                    },
                    {
                        title: '手机规则库',
                        route: 'knowledgeManager',
                        departmentLevel: 0,
                        departmentId: 'p_5_7',
                        routeParams: {
                            departId: 'p_5_7'
                        },
                        departmentFatherId: 'p_5',
                        child: [],
                        open: false
                    }
                ],
                style: 'icon-tree-menu-arrow-zsgl'
            },
            {
                title: '日志管理',
                route: 'logManager',
                departmentLevel: -1,
                departmentFatherId: '',
                departmentId: 'p_6',
                child: [],
                style: 'icon-tree-menu-arrow-rzgl'
            },
            {
                title: '其他设置',
                route: 'otherManager',
                departmentLevel: -1,
                departmentFatherId: '',
                departmentId: 'p_7',
                style: 'icon-tree-menu-arrow-other',
                child: [{
                    title: '首页logo配置',
                    route: 'otherManager',
                    departmentId: 'p_7_1',
                    departmentFatherId: 'p_7',
                    routeParams: {
                        departId: 'p_7_1'
                    },
                    departmentLevel: 0,
                    child: [],
                    open: false
                },
                {
                    title: '登录页上侧logo',
                    route: 'otherManager',
                    departmentId: 'p_7_2',
                    departmentFatherId: 'p_7',
                    routeParams: {
                        departId: 'p_7_2'
                    },
                    departmentLevel: 0,
                    child: [],
                    open: false
                },{
                    title: '登录页左侧logo',
                    route: 'otherManager',
                    departmentId: 'p_7_4',
                    departmentFatherId: 'p_7',
                    routeParams: {
                        departId: 'p_7_4'
                    },
                    departmentLevel: 0,
                    child: [],
                    open: false
                },],
            },{
                title: '扩展项管理',
                route: 'extendManager',
                departmentLevel: -1,
                departmentFatherId: '',
                departmentId: 'p_8',
                child: [],
                style: 'icon-tree-menu-arrow-extend'
            }, 
            {
                title: '订阅管理',
                route: 'focusManager',
                departmentLevel: -1,
                departmentFatherId: '',
                departmentId: 'p_9',
                child: [],
                style: 'icon-tree-menu-arrow-focus'
            }, 
        ];
        const $rootScope = this.injector.get('$rootScope');
        const cache = this.injector.get('cache');
        const $state = this.injector.get('$state');

        $rootScope.userInfoDefer.promise.then(result => {
            const user = cache.getLoginDataCache();

            let adminPermission = user.permissionName.filter(permission => {
                return /^admin:/.test(permission);
            });
            // 测试环境 增加 关注管理
            // adminPermission.push('admin:menu:focus')


            if (adminPermission.length === 0) {
                $state.go('main.home');
                return;
            }
            adminPermission = adminPermission.map(permission => {
                const p = permission.split(':');
                return p.slice(1);
            });
            this.auth = {
                menu: {}
            };
            adminPermission.forEach(p => {
                this.auth[p[0]][p[1]] = true;
            });
            menu = menu.filter(menu => {
                return this.auth.menu[menu.route.split('Manager')[0]];
            });
            this.data.sideMenu = menu;
            if(this.auth.menu.member && this.auth.menu.extend){
                Promise.all([this.getSideMenuData('member'),this.getSideMenuData('extend')]).then(() => {
                    this.echoRoute();
                })

            }else if (this.auth.menu.member || this.auth.menu.extend) {
                if(this.auth.menu.member ){
                    this.getSideMenuData('member').then(() => {
                        this.echoRoute();
                    });
                }
                if(this.auth.menu.extend){
                    this.getSideMenuData('extend').then(() => {
                        this.echoRoute();
                    });
                }
            }else {
                this.echoRoute();
            }
        });
    } 

    getSideMenuData(type) {
        const defer = this.injector.get('$q').defer();
        this.injector.get('adminAPIService').getDepartmentList(globalLoading({type})).then((result) => {
            if (result.status === 200 && (result.data.status === 0 || result.data.code == 0 )) {
                const list = type === 'member'? result.data.data.list || [] : result.data.result || [];
                const parentDepartMap = {};
                const departTree = [];
                let routeName = type === 'member'? 'memberManager':'extendManager'
                function _formatDepartmentInfo(department) {
                    return Object.assign({}, department, {
                        id: department.departmentId,
                        route: routeName,
                        title: department.departmentName,
                        routeParams: {
                            departId: department.departmentId
                        }
                    })
                }
                list.forEach(function (element) {

                    if (element.departmentFatherId !== undefined) {
                        parentDepartMap[element.departmentFatherId]
                            ? parentDepartMap[element.departmentFatherId].push(_formatDepartmentInfo(element))
                            : parentDepartMap[element.departmentFatherId] = [_formatDepartmentInfo(element)];
                    }
                    if (element.departmentLevel === 0) {
                        departTree.push(_formatDepartmentInfo(element));
                    }
                }, this);
                function _makeTree(department) {
                    department.forEach(function (element) {
                        if (parentDepartMap[element.departmentId]) {
                            element.child = parentDepartMap[element.departmentId];
                            element.open = false;
                            _makeTree(element.child);
                        }
                    }, this);
                }
                _makeTree(departTree);
                this.data.sideMenu.forEach(menu => {
                    if(menu.route == routeName){
                        menu.child = departTree;
                    }
                })
                defer.resolve();
            }
        }, (error) => {
            defer.reject();
        });
        return defer.promise;
    }

    findMenuByRoute(route) {
        return this.data.sideMenu.filter(menu => {
            return menu.route === route;
        })[0];
    }

    echoRoute() {
        const $this = this;
        const state = this.injector.get('$state');
        let routeType = state.current.name.split('.')[2]
        const departId = state.params.departId;
        // 选中第一个菜单
        // if (!this.auth.menu[routeType.split('Manager')[0]]) {
        //     routeType = this.data.sideMenu[0].route;
        // }
        if(routeType){
            switch(routeType) {
                case 'memberManager':
                case 'assetManager':
                case "extendManager":
                case 'knowledgeManager':
                    if (departId) {
                        $this.findDepartment(departId, routeType, {
                            child: $this.data.sideMenu
                        });
                        if (!$this.chooseMenu) {
                            $this.findInitDepartment({
                                child: this.findMenuByRoute(routeType).child
                            });
                            if($this.chooseMenu.route !== routeType){
                                return false;
                            }
                            state.go(`main.admin.${routeType}`, {
                                departId: $this.chooseMenu.departmentId
                            });
                        }
                    }
                    else {
                        $this.data.sideMenu.forEach(item => {
                            if(item.route === routeType){
                                item.actived = true;
                                $this.findInitDepartment({
                                    child: item.child
                                });
                            }
                        })
                        if ($this.chooseMenu.route !== routeType) {
                            return false;
                        }
                        state.go(`main.admin.${routeType}`, {
                            departId: $this.chooseMenu.departmentId
                        });
                    }
                    break;
                case 'roleManager':
                case 'redListManager':
                case 'authManager':
                case 'logManager':
                    $this.chooseMenu = this.findMenuByRoute(routeType);
                    state.go(`main.admin.${routeType}`);
                    break;
                case 'otherManager':
                case "focusManager":
                    $this.chooseMenu = this.findMenuByRoute(routeType);
                    state.go(`main.admin.${routeType}`);
                    break;
    
            }
            let flag = $this.chooseMenu.departmentLevel - 1;
            if($this.chooseMenu.route === routeType){
                $this.openMenu(flag, $this.chooseMenu);
                $this.chooseMenu.actived = true;
            }
        }

    }

    openMenu(level, target) {
        const $this = this;
        if (level >= -2) {
            function findChooseMenu(item, target) {
                if(item.child && item.child.length > 0) {
                    item.child.forEach((n) => {
                        if (level === n.departmentLevel) {
                            if(level === -1) {
                                if (target.route === n.route) {
                                    n.open = true;
                                    level--;
                                    $this.openMenu(level, n);
                                }
                            }
                            if (target.departmentFatherId === n.departmentId) {
                                n.open = true;
                                level--;
                                $this.openMenu(level, n);
                            }
                        }
                        else {
                            findChooseMenu(n, target);
                        }
                    });
                }
            }
            findChooseMenu({
                child: $this.data.sideMenu
            }, target);
        }
    }

    findInitDepartment(item) {
        const $this = this;
        $this.chooseMenu = item;
        return false;
        if(item.child && item.child.length > 0) {
            for (let i in item.child) {
                return $this.findInitDepartment(item.child[i]);
            }
        }else {
            $this.chooseMenu = item;
            return ;
        }
    }

    findDepartment(id, type, item) {
        const $this = this;
        if(item.child && item.child.length > 0) {
            let res = null;
            _.each(item.child, (n) => {
                if (n.route === type) {
                    if (n.departmentId === id) {
                        $this.chooseMenu = n;
                        if(n.child&&n.child.length!==0){
                           n.open = true;
                        }
                    }
                    else {
                        $this.findDepartment(id, type, n);
                    }
                }
            });
        }
    }

    _getMemberManagerRouteParams(item) {
        const $this = this;
        if (item.child && item.child.length >= 1) {
            let activedItem = null;
            _.each(item.child, (n) => {
                if (n.actived) {
                    activedItem = n;
                }
            });
            return $this._getMemberManagerRouteParams(activedItem || item.child[0]);
        } else if (item.routeParams) {
            return item.routeParams || {};
        }
    }

    _activeMenuItem(item) {
        const $this = this;
        if (item.child && item.child.length >= 1) {
            item.open = !item.open;
            if(item.open) {
                let activedItem = null;
                _.each(item.child, (n) => {
                    if(n.actived) {
                        activedItem = n;
                    }
                });
                $this._activeMenuItem(activedItem || item.child[0]);
            }
        } else {
            item.actived = true;
        }
    }

    resetChoose(item) {
        const $this = this;
        if(item.child && item.child.length > 0) {
            _.each(item.child, (n) => {
                n.actived = false;
                $this.resetChoose(n);
            });
        }
        else {
            item.actived = false;
        }
    }
    //展开或者关闭菜单
    openOrCloseMenu($event,menu){
        $event.stopPropagation();
        menu.open = !menu.open;
    }

    changeRoute(e, menuItem) {
        e.stopPropagation();
        const $this = this;
        const $state = this.injector.get('$state');
        $this.resetChoose({
            child: $this.data.sideMenu
        });
        if(menuItem.route == "memberManager" || menuItem.route =="extendManager"){
            menuItem.actived = true;
            if(menuItem.child){
                menuItem.open = !menuItem.open;
            }else{
                menuItem.open = true;
            }
            let  routeParams = menuItem.routeParams;
            $state.go('main.admin.' + menuItem.route, routeParams);
            return false;
        }
        if (!menuItem.open) {
            $this._activeMenuItem(menuItem);
            let routeParams = $this._getMemberManagerRouteParams(menuItem);
            routeParams ? $state.go('main.admin.' + menuItem.route, routeParams):$state.go('main.admin.' + menuItem.route);
        }else {
            menuItem.open = false;
        }
    }
}
