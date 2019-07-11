
export default class addNodeModal {
    constructor($injector, resolveData) {
        this.injector = $injector;
        this.resolveData = resolveData;
        this.$modal = $injector.get('$modal')({
            backdrop: 'static',
            keyboard: false,
            placement: 'center',
            templateUrl: 'app/main/admin/knowledgeManager/relationType/modal/modal.html',
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
            id: "",
            isArrow: 0
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
            self.$modal.$scope.data.isArrow = self.resolveData.isArrow;
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
                    let service = self.injector.get('relationTypeService');
                    service.getAddData({
                        typeId: self.$modal.$scope.data.typeId,
                        typeName: self.$modal.$scope.data.typeName,
                        isArrow: self.$modal.$scope.data.isArrow,
                        ruleDesc: self.$modal.$scope.data.ruleDesc,
                        tableName: self.$modal.$scope.data.tableName
                    }).then((res) => {
                        if(res.status === 200) {
                            if(res.data.status === 0) {
                                self.close(1);
                            }
                        }
                    })
                }else { //修改

                    let service = self.injector.get('relationTypeService');
                    service.getUpdateData({
                        typeId: self.$modal.$scope.data.typeId,
                        typeName: self.$modal.$scope.data.typeName,
                        id: self.$modal.$scope.data.id,
                        isArrow: self.$modal.$scope.data.isArrow,
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
