const MAX_REASON_LENGTH = 100;
export default class focusManagerAddFocusModal {
    constructor($injector, entityList) {
        this.injector = $injector;
        this.$rootScope = this.injector.get('$rootScope');
        this.toaster = this.injector.get('toaster');
        this.focusManagerService = this.injector.get('focusManagerService');
        this.entityList = entityList;
        this.focusGroupInfo = this.$rootScope.focusGroupInfo;
        this.$modal = $injector.get('$modal')({
            backdrop: 'static',
            keyboard: false,
            placement: 'center',
            templateUrl: 'app/main/admin/focusManager/focusManagerAddFocus/focusManagerAddFocus.modal.html',
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
                        addGroupName: '',
                        focusReason:'',
                        maxReasonLength:MAX_REASON_LENGTH,
                    };
                }else{
                    this.toaster.error(res.data.msg || '后台异常,请重试');
                }
            })

        }else{
            this.focusManagerService.getFocusGroup().then((result) => {
                this.$modal.$scope.data = {
                    focusGroup: [...this.$rootScope.focusGroupInfo.list].filter(item => item.name !== '全部'),
                    isShowAddGroup: false,
                    addGroupName: '',
                    focusReason:'',
                    maxReasonLength:MAX_REASON_LENGTH,
                };
            })
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
        this.$modal.$scope.fn = {
            close: function (data) {
                _this.close(data);
            },
            dismiss: function () {
                _this.close();
            },
            // 确定关注
            sure: function () {
                const data = _this.$modal.$scope.data;
                if(data.focusReason == ''){
                    _this.toaster.warning('请填写关注理由');
                    return false;
                }
                if(data.focusReason.length > MAX_REASON_LENGTH){
                    _this.toaster.warning(`关注理由不能超过${MAX_REASON_LENGTH}字`);
                    return false
                }
                let selectGroup = data.focusGroup.filter(item => item.isSelect);
                if(selectGroup.length == 0 ){
                    _this.toaster.warning('请选择关注组')
                    return false;
                }
                let params = {
                    data:_this.entityList,
                    desc:data.focusReason,
                    groupids:selectGroup.map(item => item.id),
                    operateType:'add'
                }
                _this.focusManagerService.focusEntityListHandle(params).then(res => {
                    if(res.status ==200 && res.data.status == 0){
                        if(_this.entityList.length ==1){
                            let focusGroupList = _this.$modal.$scope.data.focusGroup.filter(item => item.isSelect);
                            _this.$defer.resolve(focusGroupList);
                        }else{
                            _this.$defer.resolve(1);
                        }
                        _this.toaster.success('关注成功');
                        _this.destroy();
                    }else{
                        _this.toaster.error(res.data.message)
                    }
                })

            },
            // 创建group  
            createGroup() {
                let addGroupName = _this.$modal.$scope.data.addGroupName 
                if (addGroupName== '') {
                    _this.toaster.warning('请输入分组名称')
                    return false
                }else if(addGroupName.length > 20){
                    _this.toaster.warning('分组名称不能超过20个字符');
                    return false
                }else {
                    let newGroupName = _this.$modal.$scope.data.addGroupName;
                    let  params ={
                        name:newGroupName,
                        type:'add'
                    }
                    _this.focusManagerService.editFocusGroup(params).then(res => {
                        _this.focusManagerService.getFocusGroup(true)
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
