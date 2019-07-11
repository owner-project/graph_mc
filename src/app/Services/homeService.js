export function homeService($injector) {
    'ngInject';
    const  http = $injector.get('$http');

    let service = {
        getAllSearchType: (data) => {
            return http.get('/admin_api/search/class/tab', data);
        },
        getResultData: (data) => {
            return http.post('/admin_api/person/search', data);
        },
        focus(params) {
            return http.post('/admin_api/my_focus/focus_on', params);
        },
        getMyFocus(params) {
            return http.get('/admin_api/my_focus/my_focuses', {params});
        },
        getBaiduSearch(params) {
            return http.get('/admin_api/craw/baidu_by_size', {params});
        },
        getBaiduHtml(url) {
            return http.get('/admin_api/craw', {params: {url}});
        },
        getRationTotal(params) {
            return http.get('/admin_api/count/getData',{params});
        },
        getSSO() {
            return http.get('/admin_api/user/login/SSO?domain=wh');
        },
        getTagTitle(importId){
            return http.get(`/admin_api/import/getTitle?importId=${importId}`)
        },
        markTag(params){
            return http.post('/admin_api/label/mark', params)
        },
        getRecognition(content){
            return http.post('/admin_api/v1/search/intelligent/recognition',{content})
        }
    };

    return service;

}
