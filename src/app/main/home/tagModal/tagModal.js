import TagModalAlert from './tagModalAlert';
import toast from "../../../components/modal/toast/toast";
export default class TagModal {
    constructor(inject) {
        this.inject = inject;
        this.$state = this.inject.get('$state');
        this.toaster = this.inject.get('toaster');
        this.$location = this.inject.get('$location');
        this.importId = this.$location.$$search.importId;
        this.homeService = this.inject.get('homeService');
        this.$util = this.inject.get('util');
        this.tagOptionList = [];

        this.$modal = this.inject.get('$modal')({
            backdrop: 'static',
            keyboard: false,
            placement: 'top',
            templateUrl: 'app/main/home/tagModal/tagModal.html',
            onHide: () => {
                this.$modal.destroy();
                this.$modal = null;
            }
        });
        this.$modal.$scope.data = {
            tagName: '',
            tagDescription: '',
            tagField: '',
            tagOptionList: []
        }
        // 获取标签列表
        this.homeService.getTagTitle(this.importId).then(res => {
            if (res.data.status == 0) {
                this.$modal.$scope.data.tagOptionList = res.data.data.map(item => {
                    return {
                        name: item,
                        value: item
                    }
                })
            }
        })
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
    /**
     * @description 添加标签
     */
    addTag() {
        if (this.$modal.$scope.data.tagField == '') {
            this.toaster.warning('请选择实体标识字段')
            // new toast(this.inject, {
            //     str: '请选择实体标识字段'
            // }).warn();
            return false
        }
        if (this.$modal.$scope.data.tagName == '') {
            this.toaster.warning('请输入标签名称')
            // new toast(this.inject, {
            //     str: '请输入标签名称'
            // }).warn();
            return false
        }
        if (this.$modal.$scope.data.tagDescription == '') {
            this.toaster.warning('请输入业务说明')

            // new toast(this.inject, {
            //     str: '请输入业务说明'
            // }).warn();
            return false
        }
        this.$util.innerLoadingStart('add-tag-modal', '#24263C'); //加载loading
        let params = {
            importId: this.importId,
            idTitle: this.$modal.$scope.data.tagField,
            desc: this.$modal.$scope.data.tagDescription,
            label: this.$modal.$scope.data.tagName,
        }
        this.homeService.markTag(params).then(res => {
            this.$util.innerLoadingEnd()
            console.log(res)
            if(res.status == 200){
                this.destroy()
                new TagModalAlert(this.inject, res.data.data.successCount || 0, res.data.data.failCount || 0)
            }else{
                this.toaster.error(res.statusText||'添加失败')
                // new toast(this.inject, {
                //     str:res.statusText||'添加失败'
                // }).error();
            }
        })
    }
}
