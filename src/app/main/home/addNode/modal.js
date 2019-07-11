// import toast from '../../../components/modal/toast/toast';

export default class addNodeModal {
    constructor($injector) {
        this.injector = $injector;
        this.toaster = this.injector.get('toaster');
        this.$modal = $injector.get('$modal')({
            backdrop: 'static',
            keyboard: false,
            placement: 'center',
            templateUrl: 'app/main/home/addNode/modal.html',
            onHide: () => {
                this.$modal.destroy();
                this.$modal = null;
            }
        });
        this.$modal.$scope.data = {
            attentionReason: '',
            wordsNum: 0
        };
        this.$defer = $injector.get('$q').defer();
        this.$promise = this.$defer.promise;
        this.init();
    }

    init() {
        const scope = this.$modal.$scope;
        this.bindFn();
    }

    close(data) {
        this.$defer.resolve(data);
        this.destroy();
    }

    bindFn() {
        const self = this;
        const scope = self.$modal.$scope;
        scope.fn = {
            dismiss: function () {
                self.close();
            },
            sure: function () {
                if (!scope.data.attentionReason) {
                    // new toast(self.injector, {str: '请填写关注理由'}).warn();
                    self.toaster.pop({type:'warning',title:'请填写关注理由'});
                    return;
                }
                self.close(scope.data.attentionReason);
            },
            inputWords: function () {
                if (scope.data.attentionReason.length >= 100) {
                    scope.data.attentionReason = scope.data.attentionReason.slice(0, 100)
                    scope.data.wordsNum = 100
                    // new toast(self.injector, {
                    //     str: '关注理由最多支持输入100字'
                    // }).warn()
                    self.toaster.pop({type:'warning',title:'关注理由最多支持输入100字'});
                    return
                }
                scope.data.wordsNum = scope.data.attentionReason.length
            }
        }
    }

    destroy() {
        this.$modal.hide();
    }

}
