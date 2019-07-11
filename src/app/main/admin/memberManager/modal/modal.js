// import toast from '../../../../components/modal/toast/toast';

export default class addNodeModal {
    constructor($injector, departId, resolveData) {
        this.injector = $injector;
        this.toaster = this.injector.get('toaster');
        this.$rootScope = this.injector.get('$rootScope');

        this.$modal = $injector.get('$modal')({
            backdrop: 'static',
            keyboard: false,
            placement: 'center',
            templateUrl: 'app/main/admin/memberManager/modal/modal.html',
            onHide: () => {
                this.$modal.destroy();
                this.$modal = null;
            }
        });
        this.$defer = $injector.get('$q').defer();
        this.$promise = this.$defer.promise;
        this.resData = resolveData;
        this.departId = departId;
        let dicData = JSON.parse(localStorage.getItem('dicData'));
        let levelList = dicData.result.user_rank && dicData.result.user_rank.map(item => {item.value=item.code;item.label = item.name;return item}) || [];
        this.$modal.$scope.data = {
            sex: 0,
            levelList: levelList,
            globalSetting:this.$rootScope.GLOBAL_SETTING_INFO
        };
        this.init();
    }

    init() {
        this.bindFn();
    }

    close(data) {
        this.$defer.resolve(data);
        this.destroy();
    }

    bindFn() {
        const self = this;
        const data = this.$modal.$scope.data;
        if(self.resData){
            angular.forEach(self.resData.roleList, function(userData, index, array){
                userData.isChecked = self.resData.roleIds.includes(userData.roleId);
            });
            angular.forEach(data.levelList, function(level, index, array){
                level.isChecked = level.value == self.resData.level;
            });
            _.assign(self.$modal.$scope.data, self.resData);
        } else {
            self.injector.get('adminAPIService').getRoleList({}).then((res) => {
                if(res.status === 200) {
                    if(res.data.status === 0) {
                        self.$modal.$scope.data.roleList = res.data.list;
                    }
                }
            });
        }

        this.$modal.$scope.fn = {
            close: function(data) {
                self.close(data);
            },
            dismiss: function () {
                self.close();
            },
            changeLevel(item) {
                let checked;
                if (item) {
                    checked = item.isChecked;
                }
                data.levelList.forEach(item => {
                    item.isChecked = false;
                });
                if (item) {
                    item.isChecked = checked;
                }
            },
            sure: function () {
                const scope = self.$modal.$scope;
                let putData = {
                    roleIds: [],
                    level:[],
                };
                angular.forEach(scope.data.roleList, (n) => {
                    if(n.isChecked) {
                        putData.roleIds.push(n.roleId);
                    }
                });
                angular.forEach(scope.data.levelList, (n) => {
                    if(n.isChecked) {
                        putData.level = n.value;
                    }
                });
                putData.username = scope.data.username || '';
                putData.phone = scope.data.phone || '';
                putData.name = scope.data.name || '';
                putData.sex = scope.data.sex;
                putData.policeId = scope.data.policeId || '';
                putData.departmentId = self.departId || '';
                if(putData.username == ''){
                    // new toast(self.injector, {str: '请输入账号'}).warn();
                    self.toaster.pop({type:'warning',title:'请输入账号'});
                    return
                }
                if(putData.policeId == ''){
                    // new toast(self.injector, {str: '请输入警号'}).warn();
                    self.toaster.pop({type:'warning',title:'请输入警号'});

                    return
                }
                if(putData.roleIds.length == 0){
                    // new toast(self.injector, {str: '请至少选择一个角色'}).warn();
                    self.toaster.pop({type:'warning',title:'请至少选择一个角色'});

                    return
                }
                if(putData.level.length == 0){
                    // new toast(self.injector, {str: '请至少选择一个级别'}).warn();
                    self.toaster.pop({type:'warning',title:'请至少选择一个级别'});
                    return
                }
                if(!self.resData) {
                    self.injector.get('adminAPIService').addUser(putData).then((res) => {
                        if(res.status === 200) {
                            if(res.data.status === 0) {
                                self.close(1);
                            }
                            else{
                                // new toast(self.injector, {str: res.data.msg}).warn();
                                self.toaster.pop({type:'warning',title:res.data.msg});
                                return
                            }
                        }
                    });
                }else{
                    putData.userId = scope.data.userId || '';
                    self.injector.get('adminAPIService').updateUser(putData).then((res) => {
                        if(res.status === 200) {
                            if(res.data.status === 0) {
                                self.close(1);
                            }
                            else{
                                // new toast(self.injector, {str: res.data.msg}).warn();
                                self.toaster.pop({type:'warning',title:res.data.msg});

                                return
                            }
                        }
                    });
                }

            }
        }
    }

    destroy() {
        this.$modal.hide();
    }
}
