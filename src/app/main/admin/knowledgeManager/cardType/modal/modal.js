
export default class addNodeModal {
    constructor($injector, resolveData) {
        this.injector = $injector;
        this.resolveData = resolveData;
        this.$modal = $injector.get('$modal')({
            backdrop: 'static',
            keyboard: false,
            placement: 'center',
            templateUrl: 'app/main/admin/knowledgeManager/cardType/modal/modal.html',
            onHide: () => {
                this.$modal.destroy();
                this.$modal = null;
            }
        });
        this.$modal.$scope.data = {
            ruleId: "",
            ruleName: "",
            ruleContent: ""
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
            self.$modal.$scope.data.ruleId = self.resolveData.ruleId;
            self.$modal.$scope.data.ruleName = self.resolveData.ruleName;
            self.$modal.$scope.data.ruleContent = self.resolveData.ruleContent;
            self.$modal.$scope.data.id = self.resolveData.id;
        }
        this.$modal.$scope.fn = {
            close: function(data) {
                self.close(data);
            },
            dismiss: function () {
                self.close();
            },
            sure: function () {
                console.log(self.$modal.$scope);
                if(!self.resolveData) {//新增
                    let service = self.injector.get('cardTypeService');
                    service.getAddData({
                        ruleId: self.$modal.$scope.data.ruleId,
                        ruleName: self.$modal.$scope.data.ruleName,
                        ruleContent: self.$modal.$scope.data.ruleContent
                    }).then((res) => {
                        if(res.status === 200) {
                            if(res.data.status === 0) {
                                self.close(1);
                            }
                        }
                    })
                }else { //修改

                    let service = self.injector.get('cardTypeService');
                    service.getUpdateData({
                        ruleId: self.$modal.$scope.data.ruleId,
                        ruleName: self.$modal.$scope.data.ruleName,
                        ruleContent: self.$modal.$scope.data.ruleContent,
                        id: self.$modal.$scope.data.id
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
