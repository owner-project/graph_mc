// 
export default class focusManagerReasonEditModal {
    constructor($injector){
        this.$injector = $injector;
        this.toaster = $injector.get('toaster');
        this.$modal = $injector.get('$modal')({
            backdrop: 'static',
            keyboard: false,
            placement: 'center',
            templateUrl: 'app/main/admin/focusManager/focusManagerReasonEdit/focusManagerReasonEdit.modal.html',
            onHide: () => {
                this.$modal.destroy();
                this.$modal = null;
            }
        });
        this.$modal.$scope.data = {
            editReason: '',
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
                if(data.editReason == ''){
                    _this.toaster.warning('请输入关注理由');
                    return false;
                }else{
                    // 确定
                    _this.$defer.resolve(data.editReason);
                    _this.destroy();
                }
            },
        }
    }

}