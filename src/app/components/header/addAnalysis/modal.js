export default class addNodeModal {
    constructor($injector, analysis) {
        this.injector = $injector;
        this.$modal = $injector.get('$modal')({
            backdrop: 'static',
            keyboard: false,
            placement: 'center',
            templateUrl: 'app/components/header/addAnalysis/modal.html',
            onHide: () => {
                this.$modal.destroy();
                this.$modal = null;
            }
        });
        this.$modal.$scope.data = {
            analysis: analysis
        };
        this.init();
    }

    init() {
        this.bindFn();
    }

    close() {
        this.destroy();
    }

    bindFn() {
        const self = this;
        const scope = self.$modal.$scope;
        scope.fn = {
            dismiss: function () {
                self.close();
            },
            toPorpoise: function (item) {
                const $state = self.injector.get('$state');
                $state.go('main.porpoise', {
                    type: 'snapshot',
                    id: encodeURIComponent(item.id)
                });
                localStorage.setItem('canUpdateGraph',"true")
                self.close();
                
            }
        }
    }

    destroy() {
        this.$modal.hide();
    }

}
