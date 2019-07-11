export default class focusManagerConfirmModal {
    constructor($injector, confirmInfo = {title:'提示',text:''}) {
        this.injector = $injector;
        this.$rootScope = this.injector.get('$rootScope');
        this.$modal = $injector.get('$modal')({
            backdrop: 'static',
            keyboard: false,
            placement: 'center',
            templateUrl: 'app/main/admin/focusManager/focusManagerConfirm/focusManagerConfirm.modal.html',
            onHide: () => {
                this.$modal.destroy();
                this.$modal = null;
            }
        });
        this.$modal.$scope.data = {
            title:confirmInfo.title,
            text:confirmInfo.text
        };
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
            close: function () {
                _this.close(0);
            },
            dismiss: function () {
                _this.close();
            },
            sure: function () {
                // 移动选定的实体到指定分组
                _this.$defer.resolve(1);
                _this.destroy();
            },
        }
    }
    destroy() {
        this.$modal.hide();
    }
}
