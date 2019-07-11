export default class temporaryFileSetModal {
    constructor($injector) {
        this.$modal = $injector.get('$modal')({
            backdrop: 'static',
            keyboard: false,
            templateUrl: 'app/components/header/temporaryFileSetDialog/temporaryFileSetModal.tpl.html',
            onHide: () => {
                this.$modal.destroy();
                this.$modal = null;
            }
        });
        this.injector = $injector;
        this.toaster = this.injector.get('toaster');
        this.$state = this.injector.get('$state');
        this.$defer = $injector.get('$q').defer();
        this.$promise = this.$defer.promise;
        this.$modal.$scope.data = {
            timeVal: 0
        };
        this.headerService = this.injector.get('headerService')
        this.init();
    }

    init() {
        this.headerService.getTemporaryFileTime().then(result => {
            if (result.data && result.data.status === 0) {
                this.$modal.$scope.data.timeVal = result.data.data
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
        this.$modal.$scope.fn = {
            close: function(data) {
                self.close(data);
            },
            dismiss: function () {
                self.close();
            },
            sure: function () {
                let time = Number(self.$modal.$scope.data.timeVal)
                if(time >= 0) {
                    self.$modal.$scope.data.timeVal = parseInt(time)
                    self.headerService.setTemporaryFileTime({timeVal: parseInt(time)}).then(result => {
                        if (result.data && result.data.status === 0) {
                            self.toaster.pop({type:'success',title:'设置成功'});
                            if (self.$state.includes('main.porpoise')) {
                                self.close({refresh: true});
                            } else {
                                self.close();
                            }
                        } else {
                            self.toaster.pop({type:'error',title:result.data.message});
                        }
                    }, error => {
                        //
                    });
                } else {
                    self.toaster.error('请填写正整数，如果为0，将不保存临时文件');
                }
            }
        }
    }

    destroy() {
        this.$modal.hide();
    }

}
