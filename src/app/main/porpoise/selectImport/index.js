import toast from '../../../components/modal/toast/toast';

export default class selectImportModal {
    constructor($injector, resolveData) {
        this.injector = $injector;
        this.resolveData = resolveData;
        this.$modal = $injector.get('$modal')({
            backdrop: 'static',
            keyboard: false,
            placement: 'center',
            templateUrl: 'app/main/porpoise/selectImport/template.html',
            onHide: () => {
                this.$modal.destroy();
                this.$modal = null;
            }
        });
        this.$modal.$scope.data = {
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

        this.$modal.$scope.fn = {
            close: function (data) {
                self.close(data);
            },
            dismiss: function () {
                self.close();
            },
            sure: function (type) {
                self.close(type);
            }
        }
    }

    destroy() {
        this.$modal.hide();
    }

}
