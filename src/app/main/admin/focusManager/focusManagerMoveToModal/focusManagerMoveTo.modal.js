export default class focusManagerMoveToModal {
    constructor($injector, entityList) {
        this.injector = $injector;
        this.$rootScope = this.injector.get('$rootScope');
        this.toaster = this.injector.get('toaster');
        this.focusManagerService = this.injector.get('focusManagerService')
        this.entityList = entityList;
        this.focusGroupInfo = this.$rootScope.focusGroupInfo;
        this.$modal = $injector.get('$modal')({
            backdrop: 'static',
            keyboard: false,
            placement: 'center',
            templateUrl: 'app/main/admin/focusManager/focusManagerMoveToModal/focusManagerMoveTo.modal.html',
            onHide: () => {
                this.$modal.destroy();
                this.$modal = null;
            }
        });
        if(entityList.length ==1){
            let  entityId = entityList[0].focusid
            this.focusManagerService.getEntityFocusGroup(entityId).then(res => {
                if(res.status == 200 && res.data.status ==0){
                    this.$modal.$scope.data = {
                        focusGroup: res.data.data.map(item =>{item.isSelect = item.status;return item;}),
                        isShowAddGroup: false,
                        addGroupName: ''
                    };
                }else{
                    this.toaster.error(res.data.msg || '后台异常,请重试');
                }
            })

        }else{
            this.$modal.$scope.data = {
                focusGroup: _.cloneDeep(this.focusGroupInfo.list).filter(item => item.name !== '全部'),
                isShowAddGroup: false,
                addGroupName: ''
            };
        }
        this.$defer = $injector.get('$q').defer();
        this.$promise = this.$defer.promise;
        this.bindFn()
    }
    close(data) {
        this.$defer.reject(data);
        this.destroy()
    }

    bindFn() {
        const _this = this;
        const data = this.$modal.$scope.data;
        this.$modal.$scope.fn = {
            close: function (data) {
                _this.close(data);
            },
            dismiss: function () {
                _this.close();
            },
            sure: function () {
                let  selectGroup = []
                _this.$modal.$scope.data.focusGroup.forEach(item => {
                    if(item.isSelect){
                        selectGroup.push(item.id)
                    }
                });
                if(selectGroup.length == 0){
                    _this.toaster.warning('请选择要移动的分组')
                    return false
                }
                let params = {
                    data:_this.entityList,
                    groupids:selectGroup,
                    operateType:'move'
                }
                _this.focusManagerService.focusEntityListHandle(params).then(res => {
                    if(res.status == 200 && res.data.status == 0 ){
                        _this.toaster.success('操作成功')
                        // 移动选定的实体到指定分组
                        _this.$defer.resolve(1);
                        _this.destroy();
                    }else{
                        console.log(res);
                        _this.toaster.error(res.data.msg || '后台异常,请重试');
                    }
                })

            },
            // 创建group  
            createGroup() {
                let addGroupName = _this.$modal.$scope.data.addGroupName 
                if (addGroupName== '') {
                    _this.toaster.warning('请输入分组名称')
                }else if(addGroupName.length > 20){
                    _this.toaster.warning('分组名称不能超过20个字符');
                    return false;
                } else {
                    let newGroupName = _this.$modal.$scope.data.addGroupName;
                    // 接口创建关注组;
                    let  params ={
                        name:newGroupName,
                        type:'add'
                    }
                    _this.focusManagerService.editFocusGroup(params).then(res => {
                        if(res.status ==200 && res.data.status ==0){
                            _this.$modal.$scope.data.isShowAddGroup = false;
                            _this.$modal.$scope.data.addGroupName = '';
                            _this.toaster.success('创建成功');
                            // 返回创建的结果,push 到原来数组之中
                            let  newGroup = res.data.data;
                            _this.$modal.$scope.data.focusGroup.push(newGroup);
                            if(_this.$rootScope.focusGroupInfo){
                                _this.$rootScope.focusGroupInfo.list.unshift(newGroup);
                            }
                        }
                    })
                }
            }
        }
    }
    destroy() {
        this.$modal.hide();
    }
}
