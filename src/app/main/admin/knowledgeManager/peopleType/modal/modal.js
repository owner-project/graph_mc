// import toast from '../../../../../components/modal/toast/toast';
export default class addNodeModal {
    constructor($injector, resolveData) {
        this.injector = $injector;
        this.toaster = this.injector.get('toaster')
        this.resolveData = resolveData;
        this.$modal = $injector.get('$modal')({
            backdrop: 'static',
            keyboard: false,
            placement: 'center',
            templateUrl: 'app/main/admin/knowledgeManager/peopleType/modal/modal.html',
            onHide: () => {
                this.$modal.destroy();
                this.$modal = null;
            }
        });
        this.$modal.$scope.data = {
            typeId: "",
            typeName: "",
            ruleDesc: '',
            tableName: '',
            id: ""
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
        if(self.resolveData){
            self.$modal.$scope.data.typeId = self.resolveData.typeId;
            self.$modal.$scope.data.typeName = self.resolveData.typeName;
            self.$modal.$scope.data.id = self.resolveData.id;
            self.$modal.$scope.data.ruleDesc = self.resolveData.ruleDesc;
            self.$modal.$scope.data.tableName = self.resolveData.tableName;
        }
        this.$modal.$scope.fn = {
            close: function(data) {
                self.close(data);
            },
            dismiss: function () {
                self.close();
            },
            sure: function () {
                if(!self.resolveData) {//新增
                    let service = self.injector.get('peopleTypeService');
                    service.getAddData({
                        typeId: self.$modal.$scope.data.typeId,
                        typeName: self.$modal.$scope.data.typeName,
                        ruleDesc: self.$modal.$scope.data.ruleDesc,
                        tableName: self.$modal.$scope.data.tableName
                    }).then((res) => {
                        if(res.status === 200) {
                            if(res.data.status === 0) {
                                self.close(1);
                            }
                        }
                        else{
                            // new toast(self.injector, {
                            //     str: res.msg || '服务器内部错误,请稍后再试',
                            //     position: 'right-top'
                            // }).warn();
                            self.toaster.pop({type:'warning',title:res.msg || '服务器内部错误,请稍后再试'});
                        }
                    })
                }else { //修改

                    let service = self.injector.get('peopleTypeService');
                    service.getUpdateData({
                        typeId: self.$modal.$scope.data.typeId,
                        typeName: self.$modal.$scope.data.typeName,
                        id: self.$modal.$scope.data.id,
                        ruleDesc: self.$modal.$scope.data.ruleDesc,
                        tableName: self.$modal.$scope.data.tableName
                    }).then((res) => {
                        if(res.status === 200) {
                            if(res.data.status === 0) {
                                self.close(1);
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
