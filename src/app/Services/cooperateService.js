export function cooperateService($injector) {
    'ngInject';
    const http = $injector.get('$http');
    const $q = $injector.get('$q');

    let httpService = {
        /**
         * @description 获取图析列表
         * @param data
         */
        getJudgeList: (data) => {
            return http.post('/admin_api/person/get_graphshot_list', data);
        },

        getFolder(params) {
            return http.post('/admin_api/folder/list', params);
        },

        getTmpFolder(params) {
            let reqUrl = '?content=' + params.searchContent + '&pageSize=' + params.pageSize + '&pageNo=' + params.pageNo
            return http.get('/admin_api/person/get_tmpgraphshot' + reqUrl);
        },

        addFolder(params) {
            return http.post('/admin_api/folder/save', params);
        },
        editFile(params) {
            return http.post('/admin_api/folder/update', params);
        },

        moveToFolder(params) {
            return http.post('/admin_api/person/update_graphshot', params);
        },

        deleteFolder(params) {
            return http.delete('/admin_api/folder/delete', {params});
        },

        shareJudge: (data) => {
            return http.post('/admin_api/person/share_graphshot', data);
        },

        pushJudge: (data) => {
            return http.post('/admin_api/person/push_graphshot', data);
        },

        deleteJudge: (data) => {
            if (data.type === 4) {
                return http.post('/admin_api/person/delete_tmpgraphshot', {id: data.id});
            } else {
                return http.post('/admin_api/person/delete_graphshot', {id: data.id});
            }
        },

        getBranch: (id) => {
            const reqUrl = (id) ? ('?pId=' + encodeURIComponent(id)) : ('')
            return http.get('/admin_api/department/getDepartmentByPId' + reqUrl);
        },

        getUsers: (data) => {
            return http.post('/admin_api/user/queryUser', data);
        },

        getDepartments: (data) => {
            return http.post('admin_api/department/getDepartmentByIds', data);
        },

        getJudgePushed: (data) => {
            return http.get('/admin_api/person/get_pushed_ids?id=' + encodeURIComponent(data.id));
        },
        getFolderTree: (data) => {
            return http.post('/admin_api/folder/getFolderTree', data);
        },
        searchResultTree: (data) => {
            return http.post('/admin_api/folder/searchResultTree', data);
        }
    };

    return httpService;
}
