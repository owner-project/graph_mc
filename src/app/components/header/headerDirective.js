import addMemberModal from './passwordDialog/passwordDialogModal';
import temporaryFileSetModal from './temporaryFileSetDialog/temporaryFileSetModal';
import mainPageSettingModal from './mainPageSettingModal';
import AddAnalysisModal from './addAnalysis/modal'

export function HeaderDirective() {
    'ngInject';

    let directive = {
        restrict: 'EA',
        scope: {},
        templateUrl: 'app/components/header/header.html',
        controller: HeaderController,
        controllerAs: 'header',
        bindToController: true,
        compile:function (ele,attr) {
            return function (scope,ele,attr,controller) {
                setTimeout(() => {
                    if($('.header-application').length>0){
                        controller.$tooltip($('.header-application'),{
                            title:"常用应用",
                            trigger:'hover',
                            placement:'left',
                        });
                    }
                    if($('.header-setting').length>0){
                        controller.$tooltip($('.header-setting'),{
                            title:"设置",
                            trigger:'hover',
                            placement:'left'
                        })
                    }
                },50)

              }
          }
    };

    return directive;
}

class HeaderController {
    constructor($injector, $state, $rootScope, cache, loginService,$tooltip,$scope) {
        'ngInject';
        this.inject = $injector;
        this.state = $state;
        this.root = $rootScope;
        this.cache = cache;
        this.login = loginService;
        this.showSetting = false;
        this.showApplication = false;
        this.showMy = false;
        this.showRelation = false;
        this.user = {};
        this.config = null;
        this.toaster = this.inject.get('toaster');
        this.headerData = {
            myAppList: [],
            appIconMap: {
                "main.voiceList": 'assets/images/theme_star_blue/application/vm.png',
                "main.gcrCertificateChain": 'assets/images/theme_star_blue/application/gcr.png',
                "main.enterpriseOverview": 'assets/images/theme_star_blue/application/qiye.png',
                "main.gangMining": 'assets/images/theme_star_blue/application/tuanhuo.png',
                "main.personalModeling": 'assets/images/theme_star_blue/application/zhongdian.png',
                "main.textmining": 'assets/images/theme_star_blue/application/cba.png',
                "main.tradeList": 'assets/images/theme_star_blue/application/jy.png'

            }
        };
        this.jsonData = {
            analysis: []
        };
        this.$tooltip = $tooltip;
        this.userCenterInfo = {
            isPermission:true,
            url:'',
            data:[]
        }

        // 是否显示实体头像
        this.userImageSetSwitch = false;
        this.headerService = this.inject.get('headerService');
        this.settingBeforeShow = this.onSettingBeforeShow.bind(this);
        this.init();
    }

    /**
     * @description 页面初始化
     *
     * @memberof HeaderController
     */
    init() {
        const $rootScope = this.inject.get('$rootScope');
        const cache = this.inject.get('cache');
        this.getAllApplication();
        this.headerService.getCurrentLogo().then(result => {
            if (result.data && result.data.status === 0 && result.data.data) {
                angular.element('.header-logo').css('background-image', `url(${result.data.data.image})`)
            }
        });
        if(!cache.getLoginStatus() || cache.getLoginStatus() === 'false') {
            $rootScope.userInfoDefer.promise.then(result => {
                /**
                 * @desc  只有是用户中心的才需要进行的操作,而且是在获取用户信息成功之后
                 */
                if($rootScope.GLOBAL_SETTING_INFO.is_ucenter == 1) {
                    this.headerService.getUserLinkList().then(result => {
                        if(result.status == 200 && result.data.code == 0 ){
                            this.userCenterInfo = result.data.result;
                            console.log(this.userCenterInfo);
                            if(!this.userCenterInfo.isPermission){
                                window.location.replace(this.userCenterInfo.url);
                            }
                        }else{
                            this.userLinkListArray = [];
                        }
                    })
                }
                this.user = this.cache.getLoginDataCache();
                // let info = {}
                // this.user.config.forEach(configItem => {
                //     info[configItem.name] = configItem
                // });

                if(this.user && this.user.permissionName ){
                    this.config =  this.user.config || {};
                    let headerPermission = this.user.permissionName.filter(permission => {
                        return /^header:/.test(permission);
                    });
                    let adminPermission = this.user.permissionName.filter(permission => {
                        return /^admin:/.test(permission);
                    });
                    headerPermission = headerPermission.map(permission => {
                        const p = permission.split(':');
                        return p.slice(1);
                    });
                    adminPermission = adminPermission.map(permission => {
                        const p = permission.split(':');
                        return p.slice(1);
                    });
                    this.headerAuth = {
                        nav: {}
                    }
                    this.adminAuth = {
                        menu: {}
                    }
                    headerPermission.forEach(p => {
                        this.headerAuth[p[0]][p[1]] = true;
                    });
                    adminPermission.forEach(p => {
                        this.adminAuth[p[0]][p[1]] = true;
                    });
                    this.headerAuth.nav.admin = adminPermission.length >= 0;
                }
            });
        }
    }
    /**
     * @description 选择皮肤点击事件
     *
     * @param {any} type
     * @memberof HeaderController
     */
    chooseSkin(type) {
        if (type === this.theme) {
            return;
        }
        const $rootScope = this.inject.get('$rootScope');
        this.inject.get('util').loadingStart();
        this.theme = type;
        $('body').removeClass('theme_star_blue').removeClass('theme_elegance_white').addClass(`theme_${this.theme}`);
        this.headerService.setTheme(this.theme).then(result => {
            this.inject.get('util').loadingEnd();
            $rootScope.$broadcast('updateTheme');
            this.toaster.pop({type:'success',title:'设置成功'});
        }, error => {
            this.toaster.pop({type:'error',title:'设置失败'});

        });
    }

    /**
     * @description 菜单跳转,只是改变url,路由配置在route.js
     *
     * @param {any} e
     * @param {any} type
     * @memberof HeaderController
     */
    stateChoose(e, type) {
        e.stopPropagation();
        if (!type) {
            return;
        }
        const chooseType = (type === 'relation') ? 'porpoise' : type;
        const state = this.inject.get('$state');
        let stateData = {};
        if(chooseType === 'porpoise') {
            this.showRelation = false;
            stateData =  { type: 'normal', id: 'initial' };
            window.open(state.href('main.' + chooseType, stateData), '_blank');
            return;
        } else {
            if (state.current.name === "main.porpoise") {
                if (localStorage.getItem("canLeavePorpoise") == 'false') {
                    const c = confirm("确认离开当前页面吗？未保存的数据将会丢失")
                    if (!c) {
                        return
                    }
                }

            }
            if(chooseType == 'file'){
                stateData =  { type: 'normal', key: 'fromInit' };
            }
            this.inject.get('$rootScope').urlData.chooseMenu = type;
            state.transitionTo('main.' + chooseType, stateData, {
                reload: true,
                inherit: true,
                notify: true,
                relative: state.$current,
                location: true,
            });
        }
    }

    /**
     * @description 登出
     *
     * @param {any} e
     * @memberof HeaderController
     */
    logout(e) {
        if(e){
        e.stopPropagation();}
        this.inject.get('puiModal').confirm({
            title: '提示',
            content: '是否确认退出？'
        }).then(result => {
            this.login.logout();
        });
    }
    /**
     * @description 跳转到指定的产品
     * @param {$event} $event 
     * @param {product} 产品 
     */
    jumpToProduct($event,product){
        $event.stopPropagation();
        window.location.href = product.url;
    }

    // 点击常用应用跳转
    toApp(app) {
        const $state = this.inject.get('$state')
        console.log(app.route)
        this.inject.get('$rootScope').urlData.chooseMenu = app.route.split(".")[1];
        $state.transitionTo(app.route, {
            reload: true,
            inherit: true,
            notify: true,
            relative: $state.$current,
            location: true,
        });
        
    }

    //点击图析历史
    showAnalysis() {
        let $this = this;
        const cooperateService = this.inject.get('cooperateService');
        cooperateService.getJudgeList(globalLoading({
            pageNo: 1,
            pageSize: 6,
            searchContent: {},
            type: 1
        })).then(result => {
            if (result.data && result.data.status == 0) {
                $this.jsonData.analysis = result.data.data.data;
                new AddAnalysisModal($this.inject, $this.jsonData.analysis);
            }
        }, error => {
            //
        });
    }

    getAllApplication() {
        // 获取常用应用
        this.headerService.getMainPageApplication().then(result => {
            if (result.data && result.data.status === 0) {
                this.headerData.myAppList = result.data.data.filter(i => {
                    i.icon = this.headerData.appIconMap[i.route];
                    return i.selected;
                });
            }
        });
    }
    imageSwitch(e) {
        e.stopPropagation();
        let param = {
            is_load_image: !this.userImageSetSwitch
        }
        this.headerService.saveUserImage(param).then(result => {
            if (result.data && result.data.status === 0) {
                this.userImageSetSwitch = !this.userImageSetSwitch;
            }
        });
    }
    onSettingBeforeShow(){
            // 获取是否显示头像数据
            this.headerService.getUserThemeAndIamge().then(result => {
                if (result.data && result.data.status === 0) {
                    this.userImageSetSwitch = result.data.data.is_load_image
                }
            });
    }
    // setting(e) {
    //     let $this = this;
    //     e.stopPropagation();
    //     $this.showApplication = false;
    //     $this.showMy = false;
    //     $this.showSetting = !$this.showSetting;
    //     if ($this.showSetting) {
    //         // 获取是否显示头像数据
    //         this.headerService.getUserThemeAndIamge().then(result => {
    //             if (result.data && result.data.status === 0) {
    //                 this.userImageSetSwitch = result.data.data.is_load_image
    //             }
    //         });
    //         angular.element('.header-setting-main').fadeIn(300);
    //         $(document.body).bind('click', (e) => {
    //             if (!$this.showSetting) {
    //                 $(document.body).unbind('click');
    //             } else {
    //                 angular.element('.header-setting-main').fadeOut(300);
    //                 $this.showSetting = false //2018-06-26,fix:更新dom的同时更新状态,不然会导致点击两下才展示的问题
    //             }
    //         });
    //     } else {
    //         angular.element('.header-setting-main').fadeOut(300);
    //         $(document.body).unbind('click');
    //         $this.showSetting = false //2018-06-26,fix:更新dom的同时更新状态,不然会导致点击两下才展示的问题
    //     }
    // }

    mainPageSetting($event) {
        $event.stopPropagation();

        new mainPageSettingModal(this.inject).$promise.then(data => {
            if (data && data.refresh) {
                this.inject.get('$rootScope').$broadcast('homeRefreshApp');
                this.getAllApplication();
            }
        });
    }

    passwordDialog(e) {
        let $this = this;
        new addMemberModal(this.inject).$promise.then((res) => {
            if (res == 1) {
                $this.logout();
            }

        });
    }
    fileTemporarySetting(e) {
        let $this = this;
        new temporaryFileSetModal(this.inject).$promise.then((data) => {
            if (data && data.refresh) {
                // 重新加载页面
                this.state.reload();
            }
        });
    }
}
