export function settingService($injector) {
    'ngInject';

    const http = $injector.get('$http');
    const rootScope =  $injector.get('$rootScope');
    const service = {
        getSettings: () => {
            return http.get('/admin_api/system/info');
        },
        saveSettings: (data) => {
            return http.post('/admin_api/system/set', data);
        },
        getGlobalSetting:async function () { 
            // return new Promise((resolve,reject) => {
            await   this.getSettings().then(res => {
                    if(res.status == 200 && res.data.status == 0){
                        rootScope.GLOBAL_SETTING_INFO = res.data.data;
                        // resolve();
                    }else{
                        rootScope.GLOBAL_SETTING_INFO = {};
                        // reject();
                    }
                })
            // }) 
         }
    };

    return service;

}