export class loginService {
    constructor($http,cache,$rootScope,$state,toaster,util,$location) {
        'ngInject';
        this.init();
        this.http = $http;
        this.cache = cache;
        this.state = $state;
        this.toaster = toaster;
        this.$rootScope = $rootScope;
        this.util = util;
        this.$location = $location;

    }

    init() {

    }

    getPermission() {
        return this.http.get('/admin_api/user/get_permissions');
    }

    getAllDic() {
        return this.http.get('/admin_api/dic/get/all');
    }
    

    loginPKI(params) {
        return this.http.post('/admin_api/user/login/PKI', params);
    }

    login(data) {
        return this.http.post('/admin_api/user/do_login', data);
    }
    //后台获取用户的登录信息
    getUserInfo(){
        return  this.http.get('/admin_api/user/info').then(res => {
                if(res.data.status == 0){
                    this.cache.loginDataCache(res.data.data);
                }
            })

    }
    setDicData(){
        return new Promise((resolve) => {
            if(localStorage.getItem('dicData')){
                resolve()
            }else{
                this.http.get('/admin_api/dic/get/all').then(res => {
                    if(res.status == 200){
                        this.$rootScope.dicData = res.data
                        localStorage.setItem('dicData',JSON.stringify(res.data));
                        resolve()
                    }
                })
            }
        })
    }

    logout() {
        // 如果是用户中心的退出
        if(this.$rootScope.GLOBAL_SETTING_INFO.is_ucenter == 1){
            localStorage.clear();
            this.ucLogout();
        }else{
            return this.http.post('/admin_api/user/do_logout', {}).then(res => {
                if (res.status === 200) {
                    this.$rootScope.urlData.chooseMenu = 'home'
                    localStorage.clear();
                    this.state.go('login');
                    this.util.closeAllModal();
                    this.$rootScope.isLoading = false
                    this.toaster.pop({type:'success',title:'登出成功'});
                }
            });
        }

    }

    ucLogin(redirectUrl){
        let currentOrigin = window.location.origin;
        if(this.$location.$$url === '/login?old=1'){
            return false;
        }
        if(redirectUrl){
            window.location.href = `${currentOrigin}/admin_api/user/uc_login?currentUrl=${encodeURIComponent(redirectUrl)}`
        }else{
            window.location.href = `${currentOrigin}/admin_api/user/uc_login?currentUrl=${encodeURIComponent(currentOrigin+'/#/main/home')}`
        }
    }
    ucLogout(redirectUrl){
        let currentOrigin = window.location.origin;
        if(redirectUrl){
            window.location.href = `${currentOrigin}/admin_api/user/uc_logout?currentUrl=${encodeURIComponent(redirectUrl)}`
        }else{
            window.location.href = `${currentOrigin}/admin_api/user/uc_logout?currentUrl=${encodeURIComponent(currentOrigin+'/#/main/home')}`
        }
    }


    getInputSSO(token) {
        return this.http.get('/admin_api/user/login/bdp?token=' + token);
    }

    getPersonCardGraph(data) {
        return this.http.post('/admin_api/person/expand/third_party', data);
    }
}
