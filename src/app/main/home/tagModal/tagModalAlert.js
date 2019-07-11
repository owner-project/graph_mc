/**
 * 打标签页面中确定之后有返回结果之后的弹窗
 * 
 */
export default class TagModalAlert {
    constructor(inject,successNum,failNum){
        this.inject = inject;
        this.$modal = this.inject.get('$modal')({
            backdrop: 'static',
            keyboard: false,
            placement: 'top',
            templateUrl: 'app/main/home/tagModal/tagModalAlert.html',
            onHide: () => {
                this.$modal.destroy();
                this.$modal = null;
            }
        });
        this.$modal.$scope.data = {
            successNum,
            failNum
        }
        this.bindFn()
    }
    bindFn() {
        let ModalScope = this.$modal.$scope;
        let _this = this;
        ModalScope.fn = {
            dismiss: function () {
                _this.destroy();
            },
            addTag: function () {
                _this.addTag()
            }
        }
    }
    destroy() {
        this.$modal.hide();
    }
}