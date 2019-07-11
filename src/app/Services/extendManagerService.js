export function extendManagerService($injector,$http) {
    'ngInject';
    const http =$http;
    let httpService = {
        // 获取扩展的页面
        getExtendPage: (params) => {
            return http.post('/admin_api/v1/manager/expand/tree/page', params);
        },
        // 更改扩展项的状态
        changeExtendStatus: (params) => {
            return http.put('admin_api/v1/manager/expand/batch/info', params);
        },
    }
    return httpService;
}