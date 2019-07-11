
export default class MyFocusList {
    constructor($injector, attentionList) {
        this.injector = $injector;
        this.toaster = this.injector.get('toaster');
        this.$modal = $injector.get('$modal')({
            backdrop: 'static',
            keyboard: false,
            placement: 'center',
            templateUrl: 'app/components/header/myFocusList/modal.html',
            onHide: () => {
                this.$modal.destroy();
                this.$modal = null;
            }
        });
        this.$modal.$scope.data = {
            attentionList: attentionList
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
            // 查看档案
            viewFocusItem: function (item) {
                const $state = self.injector.get('$state');
                let stateData = {}
                switch (item.type) {
                    case '0101':
                        stateData =  {type: 'person', key: item.focusid.split('/')[1]};
                        break;
                    case '0301':
                        stateData =  {type: 'phone', key: item.focusid.split('/')[1]};
                        break;
                    case '0404':
                        stateData =  {type: 'internetBarEntity', key: item.focusid.split('/')[1]};
                        break;
                    case '0601':
                        stateData =  {type: 'business', key: item.focusid.split('/')[1]};
                        break;
                    case '0201':
                        stateData =  {type: 'vehicle', key: item.focusid.split('/')[1]};
                        break;
                    case '1601':
                        stateData =  {type: 'legalCase', key: item.focusid.split('/')[1]};
                        break;
                }
                window.open($state.href('main.file' , stateData), '_blank');
            },
            // 查看图析
            into_porpoise(id,isToGis) {
                localStorage.setItem("isToGis", isToGis)
                localStorage.setItem('canUpdateGraph','false')
                const state = self.injector.get('$state');
                const stateData =  { type: 'normal', id: encodeURIComponent(id)};
                window.open(state.href('main.porpoise' , stateData), '_blank');
            },
            focus(e, item) {
                e.stopPropagation();
                let params = {
                    focusid: item.focusid,
                    title: item.title,
                    type: item.type,
                    isFocused: 1
                };
                self.injector.get('homeService').focus(params).then(result => {
                    if (result.data && result.data.status === 0) {
                        // new toast(self.injector, {
                        //     str: '取消关注成功'
                        // }).success();
                        self.toaster.pop({type:'success',title:'取消关注成功'});
                        scope.data.attentionList = scope.data.attentionList.filter((current) => {
                            return current.focusid != item.focusid;
                        })
                    } else {
                        // new toast(self.injector, {
                        //     str: '取消关注失败，请稍后再试'
                        // }).warn();
                        self.toaster.pop({type:'warning',title:'取消关注失败，请稍后再试'});
                    }
                }, error => {
                });
            }
        }
    }

    destroy() {
        this.$modal.hide();
    }

}
