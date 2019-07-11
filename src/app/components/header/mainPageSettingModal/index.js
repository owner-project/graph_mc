
export default class passwordDialogModal {
    constructor($injector) {
        this.$modal = $injector.get('$modal')({
            backdrop: 'static',
            placement: 'center',
            keyboard: false,
            templateUrl: 'app/components/header/mainPageSettingModal/template.html',
            onHide: () => {
                this.$modal.destroy();
                this.$modal = null;
            }
        });
        this.injector = $injector;
        this.toaster = this.injector.get('toaster');
        this.$defer = $injector.get('$q').defer();
        this.$promise = this.$defer.promise;
        this.init();
    }

    init() {
        const scopeData = this.$modal.$scope.data = {
            applicationList: [],
            selectedApplicationList: []
        };

        const headerService = this.injector.get('headerService');
        headerService.getMainPageApplication().then(result => {
            if (result.status === 200 && result.data.status == 0) {
                result.data.data.forEach(item => {
                    item.selected = !!item.selected;
                });
                scopeData.applicationList = result.data.data;
                scopeData.selectedApplicationList = scopeData.applicationList.filter(i => i.selected);
            }
        }, error => {
            //
        });
        this.bindFn();
    }

    close(data) {
        this.$defer.resolve(data);
        this.destroy();
    }

    bindFn() {
        const self = this;
        const scopeDate = this.$modal.$scope.data;
        const headerService = this.injector.get('headerService');

        this.$modal.$scope.fn = {
            close: function(data) {
                self.close(data);
            },
            dismiss: function () {
                self.close();
            },
            selected(item, change) {
                if (change) {
                    item.selected = !item.selected;
                }

                if (scopeDate.applicationList.filter(i => i.selected).length > 5) {
                    self.toaster.pop({type:'warning',title:'最多选择5个'});
                    // new toast(self.injector, {str: '最多选择5个'}).warn();
                    item.selected = false;
                    return;
                }

                scopeDate.selectedApplicationList = scopeDate.applicationList.filter(i => i.selected);
            },
            sure: function () {
                headerService.setMainPageApplication(scopeDate.selectedApplicationList.map(i => i.id)).then(result => {
                    // new toast(self.injector, {str: '设置成功'}).success();
                    self.toaster.pop({type:'success',title:'设置成功'});
                    self.close({refresh: true});
                }, error => {
                    //
                });
            },
            deleteItem(item) {
                item.selected = false;
                scopeDate.selectedApplicationList = scopeDate.selectedApplicationList.filter(i => i.id !== item.id);
            }
        }
    }

    destroy() {
        this.$modal.hide();
    }

}
