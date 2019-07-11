
export default class addNodeModal {
    constructor($injector, resolveData) {
        this.injector = $injector;
        this.resolveData = resolveData;
        this.$modal = $injector.get('$modal')({
            backdrop: 'static',
            keyboard: false,
            placement: 'center',
            templateUrl: 'app/main/admin/knowledgeManager/addressType/modal/modal.html',
            onHide: () => {
                this.$modal.destroy();
                this.$modal = null;
            }
        });
        this.$modal.$scope.data = {
            addressId: "",
            addressName: "",
            address: ""
        };
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
        if(self.resolveData){
            self.$modal.$scope.data.addressId = self.resolveData.addressId;
            self.$modal.$scope.data.addressName = self.resolveData.addressName;
            self.$modal.$scope.data.address = self.resolveData.address;
            self.$modal.$scope.data.id = self.resolveData.id;
        }
        this.$modal.$scope.fn = {
            close: function(data) {
                self.close(data);
            },
            dismiss: function () {
                self.close();
            },
            sure: function () {
                // console.log(self.$modal.$scope);
                if(!self.resolveData) {
                    let service = self.injector.get('addressTypeService');
                    service.getAddData({
                        addressId: self.$modal.$scope.data.addressId,
                        addressName: self.$modal.$scope.data.addressName,
                        address: self.$modal.$scope.data.address
                    }).then((res) => {
                        if(res.status === 200) {
                            if(res.data.status === 0) {
                                self.close(1);
                            }
                        }
                    })
                }else { //修改
                    let service = self.injector.get('addressTypeService');
                    service.getUpdateData({
                        addressId: self.$modal.$scope.data.addressId,
                        addressName: self.$modal.$scope.data.addressName,
                        address: self.$modal.$scope.data.address,
                        id: self.$modal.$scope.data.id
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
