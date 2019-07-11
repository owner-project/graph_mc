import globalLoading from '../components/globalLoading/index';

export function httpInterceptor($injector) {
    'ngInject';
    let interceptor = {
        request: (config) => {
            let loadingBar = $injector.get('cfpLoadingBar');
            loadingBar.start();

            globalLoading.show(config, function (loading) {
                const util = $injector.get('util');
                config.loadingId = loading.id;

                util.loadingStart();
            });

            return config;
        },
        response: (response) => {
            let loadingBar = $injector.get('cfpLoadingBar');
            loadingBar.complete();

            if (response.config && response.config.loadingId) {
                globalLoading.close(response.config.loadingId, function () {
                    const util = $injector.get('util');

                    util.loadingEnd();
                });
            }

            return response;
        },
        responseError: (response) => {
            let loadingBar = $injector.get('cfpLoadingBar');
            loadingBar.complete();

            if (response.config && response.config.loadingId) {
                globalLoading.close(response.config.loadingId, function () {
                    const util = $injector.get('util');

                    util.loadingEnd();
                });
            }
            if (response.status === 401) {
                const globalSetting = $injector.get('$rootScope').GLOBAL_SETTING_INFO;
                if(globalSetting && globalSetting.is_ucenter == 1){
                    const loginService = $injector.get('loginService');
                    loginService.ucLogin();
                }else{
                    let state = $injector.get('$state');
                    localStorage.clear();
                    state.transitionTo('login');
                }

            }
            return response;
        }
    };

    return interceptor;
}
