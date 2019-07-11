export function headerService($injector,$http) {
    'ngInject';
    const http = $http;
    let httpService = {
        /**
         * @desc 修改密码
         */
        updatePassword: function (params = {}) {
            return http.post('/admin_api/user/changePwd', params);
        },
        getMainPageApplication() {
            return http.get('/admin_api/app/get_all_appinfos');
        },
        setMainPageApplication(params) {
            return http.post('/admin_api/app/home_apps', params);
        },
        setTemporaryFileTime(params) {
            return http.post('/admin_api/app/saveTmpFileTime', params);
        },
        getTemporaryFileTime() {
            return http.get('/admin_api/app/getTmpFileTime');
        },
        getTheme() {
            return http.get('/admin_api/user/theme');
        },
        setTheme(theme) {
            return http.post('/admin_api/user/theme', {theme});
        },
        getCurrentLogo: (data) => {
            return http.get('/admin_api/weblogo/getCurrentLogo', data);
        },
        getCurrentLoginLogo: (data) => {
            return http.get('/admin_api/loginlogo/getCurrentLogo', data);
        },
        getUserThemeAndIamge: () => {
            return http.get('/admin_api/user/getUserThemeAndIamge');
        },
        saveUserImage: (data) => {
            return http.post('/admin_api/user/saveUserImage', data);
        },
        getUserLinkList (){
            return http.get('/admin_api/ucenter/products');
        }
    }

    return httpService;
}
