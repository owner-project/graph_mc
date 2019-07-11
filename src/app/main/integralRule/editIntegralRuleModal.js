export default class addAuthModal {
    constructor($injector, resolveData) {
        this.injector = $injector;
        this.resolveData = resolveData;

        this.$modal = $injector.get('$modal')({
            backdrop: 'static',
            keyboard: false,
            placement: 'center',
            templateUrl: 'app/main/integralRule/editIntegralRuleModal.tpl.html',
            onHide: () => {
                this.$modal.destroy();
                this.$modal = null;
            }
        });
        this.$modal.$scope.data = {};
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
        const scopeData = this.$modal.$scope.data = angular.copy(this.resolveData);
        this.$modal.$scope.fn = {
            close: function(data) {
                self.close(data);
            },
            dismiss: function () {
                self.$defer.reject();
                self.destroy();
            },
            sure: function () {
                const params = {
                    id: self.resolveData.id,
                    mc: scopeData.mc,
                    jftj: scopeData.jftj,
                    pId: scopeData.pId,
                    xq: scopeData.xq,
                    exp: scopeData.exp
                };
                self.injector.get('applicationAPIService').editIntegralRule(params).then(result => {
                    console.log(result);
                    self.close();
                }, error => {
                });
            }
        }
    }

    destroy() {
        this.$modal.hide();
    }

}
