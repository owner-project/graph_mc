export default class importExlModal {
    constructor($injector, data) {
        this.$modal = $injector.get('$modal')({
            backdrop: 'static',
            keyboard: false,
            templateUrl: 'app/main/deleteDialog/index.html',
            animation: 'am-fade-and-scale',
            onHide: () => {
                this.$modal.destroy();
                this.$modal = null;
            }
        });
        this.injector = $injector;
        this.$defer = $injector.get('$q').defer();
        this.$promise = this.$defer.promise;
        this.$modal.$scope.data = {};
        this.init();
    }

    init() {
        let $this = this;
        let fileData = $this.$modal.$scope.data;
        fileData.tip = '确定导入';
        this.bindFn();
    }

    close(data) {
        this.$defer.resolve(data);
        this.destroy();
    }

    bindFn() {
        let self = this;
        this.$modal.$scope.fn = {
            close: function (data) {
                self.close(data);
            },
            dismiss: function () {
                self.close();
            },
            sure: function () {
                self.close(1);
            }
        }
    }

    destroy() {
        this.$modal.hide();
    }

}
