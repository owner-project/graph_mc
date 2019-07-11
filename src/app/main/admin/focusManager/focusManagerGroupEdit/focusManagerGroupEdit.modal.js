export default class focusManagerGroupEditModal {
    // 编辑分组名称 1 与新建分组 0 
    constructor($injector,type=0,groupInfo){
        this.$injector = $injector;
        this.toaster = $injector.get('toaster');
        this.$rootScope = $injector.get('$rootScope');
        this.editType = type
        this.groupInfo = groupInfo;
        this.focusManagerService  = $injector.get('focusManagerService')
        this.$modal = $injector.get('$modal')({
            backdrop: 'static',
            keyboard: false,
            placement: 'center',
            templateUrl: 'app/main/admin/focusManager/focusManagerGroupEdit/focusManagerGroupEdit.modal.html',
            onHide: () => {
                this.$modal.destroy();
                this.$modal = null;
            }
        });
        this.$modal.$scope.data = {
            typeText:type == 0? '新建':'编辑',
            editGroupName: type == 0? '' : groupInfo.name,
        };
        this.$defer = $injector.get('$q').defer();
        this.$promise = this.$defer.promise;
        this.bindFn()
    }
    close(data) {
        this.$defer.reject(data);
        this.destroy()
    }
    destroy() {
        this.$modal.hide();
    }
    bindFn(){
        const _this = this;
        const data = this.$modal.$scope.data;
        this.$modal.$scope.fn = {
            close: function (data) {
                _this.close(data);
            },
            dismiss: function () {
                // 取消
                _this.close();
            },
            sure: function () {
                let editGroupName = data.editGroupName.trim() 
                if(editGroupName == ''){
                    _this.toaster.warning('请输入分组名称');
                    return false;
                }else if(editGroupName.length > 20){
                    _this.toaster.warning('分组名称不能超过20个字符');
                    return false
                }else{
                    // 编辑
                    if(_this.editType){
                        let  params = {
                            type:'update',
                            id:_this.groupInfo.id,
                            name:editGroupName
                        }
                        _this.focusManagerService.editFocusGroup(params).then(res => {
                            if(res.status == 200 && res.data.status == 0){
                                _this.toaster.success('操作成功')
                                _this.groupInfo.name = editGroupName;
                                _this.$defer.resolve(editGroupName);
                                _this.destroy();
                            }else{
                                _this.toaster.error(res.data.message || '后台异常,请重试');
                            }
                        })
                    }else{
                        //增加
                        _this.focusManagerService.editFocusGroup({name:editGroupName,type:'add'}).then(res => {
                            if(res.status == 200 && res.data.status == 0){
                                _this.toaster.success('创建成功');
                                let  newGroup = res.data.data;
                                if(_this.$rootScope.focusGroupInfo){
                                    _this.$rootScope.focusGroupInfo.list.unshift(newGroup);
                                    _this.$defer.resolve(editGroupName);
                                    _this.destroy();
                                }
                            }else{
                                _this.toaster.error(res.data.message || '后台异常,请重试');
                            }
                        })
                    }

                }
            },
        }
    }

}