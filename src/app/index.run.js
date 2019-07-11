import clock from './utils/clock';
// import toast from './components/modal/toast/toast';

export function runBlock($injector) {
    'ngInject';
    const cache = $injector.get('cache');
    const loginService = $injector.get('loginService');
    const settingService = $injector.get('settingService');
    const $rootScope = $injector.get('$rootScope');
    const $q = $injector.get('$q');
    const toaster = $injector.get('toaster');
    cache.init();
    $injector.get('util').initReg();

    if (localStorage.getItem('theme')) {
        $('body').removeClass(`theme_star_blue`);
        $('body').addClass(`theme_${localStorage.getItem('theme')}`);
    }
    document.onkeydown = function(e) {//大坑,KG-80
        var e = e || event;
        if(e.keyCode == 13) {
            e.preventDefault ? e.preventDefault() : (e.returnValue = false);
        }
    }
    let initLoginInfo =  async () => {
        const defer = $q.defer();
        let user = cache.getLoginDataCache();
        $rootScope.userInfoDefer = defer;
        await settingService.getGlobalSetting();
        if(!user){
            Promise.all([loginService.getUserInfo(),loginService.setDicData()]).then((r) => {
                user = cache.getLoginDataCache();
                initInfoHandle();
            }) ;

        }else{
            initInfoHandle();
        }

        function initInfoHandle() {
            let state = $injector.get('$state');
            let timeout = $injector.get('$timeout');
            let $location = $injector.get('$location');
            let GLOBAL_SETTING_INFO = $rootScope.GLOBAL_SETTING_INFO;
            // 判断 localstorage 中未登录的情况
            if (!user) {
                if(GLOBAL_SETTING_INFO.is_ucenter == 1 && $location.$$url !== '/login?old=1'){
                    loginService.ucLogin();
                    defer.reject()
                    return false;
                }else if($location.$$url === '/login?old=1'){
                    defer.resolve();
                }
                defer.resolve();
                if(cache.getLoginStatus() === 'true')  {
                    cache.setHeaderHide();
                }else {
                    if ($location.$$path !== '/login') {
                        timeout(() => {
                            state.transitionTo('login', {}, {
                                reload: false,
                                inherit: true,
                                notify: true,
                                relative: state.$current,
                                location: true
                            });
                        });
                    }
                }
            }else {
                cache.setHeaderShow();
                cache.changeLoginStatus(false);
                // 不需要获取权限信息 权限信息保存在用户的信息接口里了
                // loginService.getPermission(globalLoading()).then(result => {
                //     if (result.status === 200 && result.data.status === 0) {
                //         let userInfo = cache.getLoginDataCache()
                //         cache.loginDataCache({...userInfo,...result.data.data});
                //     }
                    if ($location.$$path === '/login') {
                        timeout(() => {
                            state.transitionTo('main.home', {}, {
                                reload: false,
                                inherit: true,
                                notify: true,
                                location: true
                            });
                        });
                    }
                    defer.resolve();
                // }, error => {
                //     defer.resolve();
                // });
            }
          }
    };
    initLoginInfo();
    const clo = new clock();

    clo.init();

    function _logout() {
        _logout.trigger = true;
        const $state = $injector.get('$state');
        const loginService = $injector.get('loginService');
        const util = $injector.get('util');

        function _out() {
            util.closeAllModal();
            loginService.logout();
            localStorage.removeItem('user');
            localStorage.removeItem('templateGraphShot');
            $rootScope.isLoading = false
            $state.go('login');
            // new toast($injector, {
            //     str: '长时间未操作，登出系统',
            //     position: 'center'
            // }).warn();
            toaster.pop('warning','长时间未操作，登出系统')
            clo.init();
            
            if(!localStorage.getItem('user') && _logout.trigger){
                setTimeout(() => {
                    util.closeAllModal();
                    loginService.logout();
                    localStorage.removeItem('user');
                    localStorage.removeItem('templateGraphShot');
                    $rootScope.isLoading = false
                    $state.go('login');
                }, 100);
            }
            _logout.trigger = false;
        }

        if ($state.includes('main.porpoise')) {
            $rootScope.$broadcast('saveGraphTemporary');

            setTimeout(() => {
                _out();
            }, 10000);
        } else {
            _out();
        }
    }

    document.addEventListener('click', () => {
        if (clo.triggerClock() && $injector.get('$state').current.name !== 'login') {
            if (!_logout.trigger) {
                _logout();
            }
        } else {
            clo.init();
        }
    }, true);

    document.addEventListener('visibilitychange', (e) => {
        if (clo.triggerClock() && $injector.get('$state').current.name !== 'login') {
            if (!_logout.trigger) {
                _logout();
            }
        }
    }, true);
}
