// import toast from '../../../../components/modal/toast/toast';
export default class addNodeModal {
    constructor($injector, resolveData) {
        this.injector = $injector;
        this.toaster = this.injector.get('toaster');
        this.resolveData = resolveData;
        this.$modal = $injector.get('$modal')({
            backdrop: 'static',
            keyboard: false,
            placement: 'center',
            templateUrl: 'app/main/admin/roleManager/modal/modal.html',
            onHide: () => {
                this.$modal.destroy();
                this.$modal = null;
            }
        });
        this.$modal.$scope.data = {
            htmlText: "",
            levelList: [
                {value: 1, label: '级别一'},
                {value: 2, label: '级别二'},
                {value: 3, label: '级别三'},
                {value: 4, label: '级别四', isChecked: true}
            ]
        };
        this.$defer = $injector.get('$q').defer();
        this.$promise = this.$defer.promise;
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

        if(self.resolveData){
            angular.forEach(self.resolveData.permissionList, function(data,index,array){
                if (self.resolveData.permissionIds && self.resolveData.permissionIds.length > 0) {
                    data.isChecked = self.resolveData.permissionIds.includes(data.permissionId);
                }
            });
            angular.forEach(data.levelList, function(level, index, array){
                level.isChecked = level.value == self.resolveData.level;
            });
            _.assign(self.$modal.$scope.data, self.resolveData);
        }else {
            //获取权限列表
            self.injector.get('authManagerService').getDataList({}).then((res) => {
                if(res.status === 200) {
                    if(res.data.status === 0) {
                        self.$modal.$scope.data.permissionList = res.data.data.list;
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
                    permissionIds: []
                };
                angular.forEach(scope.data.permissionList, (n) => {
                    if (n.isChecked) {
                        putData.permissionIds.push(n.permissionId);
                    }
                });
                angular.forEach(scope.data.levelList, (n) => {
                    if(n.isChecked) {
                        putData.level = n.value;
                    }
                });
                putData.roleName = scope.data.roleName || '';
                if(putData.roleName == ''){
                    // new toast(self.injector, {
                    //     str: '请输入角色名',
                    //     position: 'right-top'
                    // }).warn();
                    self.toaster.pop({type:'warning',title:'请输入角色名'});
                    return
                }
                if(putData.permissionIds.length == 0){
                    // new toast(self.injector, {
                    //     str: '请至少选择一个角色',
                    //     position: 'right-top'
                    // }).warn();
                    self.toaster.pop({type:'warning',title:'请至少选择一个角色'});
                    return
                }
                if(!self.resolveData) {//新增
                    self.injector.get('roleManagerService').getAddData(putData).then((res) => {
                        if(res.status === 200) {
                            if(res.data.status === 0) {
                                self.close(1);
                            }
                        }
                    })
                }else { //修改
                    putData.roleId = scope.data.roleId || '';
                    self.injector.get('roleManagerService').getUpdateData(putData).then((res) => {
                        if(res.status === 200) {
                            if(res.data.status === 0) {
                                self.close(1);
                            }
                        }
                    })
                }
            },

        }
    }

    destroy() {
        this.$modal.hide();
    }

}
