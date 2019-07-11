export function adminAPIService($injector) {
    'ngInject';
    const http = $injector.get('$http');

    let httpService = {
        getDepartmentList: function (params) {
            if(params.type === 'member'){
                return http.post('/admin_api/department/get_list',{});
            }else{
                // 扩展项的列表获取
                return http.get('admin_api/v1/manager/expand/nostructure/all')
            }

        },
        getDepartmentMemberList: function (params = {}) {
            return http.post('/admin_api/department/get_users', params);
        },
        getRedList: function (params) {
            return http.post('/admin_api/key_list/list', params);
        },
        editRedList: function (params) {
            return http.post('/admin_api/key_list/save', params);
        },
        getRedListTemplateFile(params = {} ){
            return http.post('/admin_api/key_list/loadRedListTemplet',params,{responseType: 'arraybuffer'});
        },
        importRedList: function (data) {
            const formData = new FormData();
            angular.forEach(data, function (value, key) {
                formData.append(key, value);
            });

            return http({
                method: 'POST',
                url: '/admin_api/key_list/import ',
                headers: {
                    'Content-Type': undefined
                },
                data: formData
            })
        },
        deleteRedList: function (params) {
            return http.delete('/admin_api/key_list/delete', {params});
        },
        getRoleList: function (params = {}) {
            return http.post('/admin_api/user/get_roleList', params);
        },
        addUser: function (params = {}) {
            return http.post('/admin_api/user/add', params);
        },
        getUserInfo: function (params = {}) {
            return http.post('/admin_api/user/get_info', params);
        },
        updateUser: function (params = {}) {
            return http.post('/admin_api/user/modify', params);
        },
        deleteData: function (params = {}) {
            return http.post('/admin_api/user/del', params);
        },
        resetPassword: function (params = {}) {
            return http.post('/admin_api/user/resetPwd', params);
        },
        //根据id获取红名单人员信息 
        getRedListItemInfo(id){
            let params ={
                id
            }
            return http.get('/admin_api/key_list/getInfoById', {params});
        }

    }

    return httpService;
}
