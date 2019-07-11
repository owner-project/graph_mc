export function otherManagerService($injector) {
    'ngInject';

    let service = {
        //登录后页面左上角logo配置
        addLogo: (data) => {
            let http = $injector.get('$http');
            return http.post('/admin_api/weblogo/addLogo', data);
        },
        deleteLogo: (data) => {
            let http = $injector.get('$http');
            return http.post('/admin_api/weblogo/deleteLogo', data);
        },
        setShowLogo: (data) => {
            let http = $injector.get('$http');
            return http.post('/admin_api/weblogo/setShowLogo', data);
        },
        listsLogo: (data) => {
            let http = $injector.get('$http');
            return http.get('/admin_api/weblogo/listsLogo', data);
        },
        //以下为首页logo配置接口
        addLoginLogo: (data) => {
            let http = $injector.get('$http');
            return http.post('/admin_api/loginlogo/addLogo', data);
        },
        deleteLoginLogo: (data) => {
            let http = $injector.get('$http');
            return http.post('/admin_api/loginlogo/deleteLogo', data);
        },
        setShowLoginLogo: (data) => {
            let http = $injector.get('$http');
            return http.post('/admin_api/loginlogo/setShowLogo', data);
        },
        listsLoginLogo: (data) => {
            let http = $injector.get('$http');
            return http({
                url:'/admin_api/loginlogo/listsLogo',
                params:{type:data.type},
                method:"GET"
            })
        }
    };

    return service;

}
