export default class addAuthModal {
    constructor($injector, resolveData) {
        this.injector = $injector;
        this.resolveData = resolveData;
        this.$modal = $injector.get('$modal')({
            backdrop: 'static',
            keyboard: false,
            templateUrl: 'app/main/admin/authManager/modal/modal.html',
            onHide: () => {
                this.$modal.destroy();
                this.$modal = null;
            }
        });
        this.$modal.$scope.data = {};
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
        self.$modal.$scope.data = self.resolveData;
        const scope = self.$modal.$scope;

        this.$modal.$scope.fn = {
            close: function(data) {
                self.close(data);
            },
            dismiss: function () {
                self.close();
            },
            sure: function () {
                if(!self.resolveData) {
                    let service = self.injector.get('authManagerService');
                    service.getAddData({
                        permissionName: scope.data.permissionName,
                        permissionNote: scope.data.permissionNote
                    }).then((res) => {
                        if(res.status === 200) {
                            if(res.data.status === 0) {
                                self.close(1);
                            }
                        }
                    })
                }else {
                    let service = self.injector.get('authManagerService');
                    service.getUpdateData({
                        permissionId: self.$modal.$scope.data.permissionId,
                        permissionName: self.$modal.$scope.data.permissionName,
                        permissionNote: self.$modal.$scope.data.permissionNote
                    }).then((res) => {
                        if(res.status === 200) {
                            if(res.data.status === 0) {
                                self.close(1);
                            }
                        }
                    })
                }
            }
        }
    }

    destroy() {
        this.$modal.hide();
    }

}
