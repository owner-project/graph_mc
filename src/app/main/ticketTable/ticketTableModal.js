import toast from '../../components/modal/toast/toast'
export default class ticketTableModal {
    constructor($injector, resolveData) {
        this.injector = $injector;
        this.resolveData = resolveData;
        this.toaster = this.injector.get('toaster');
        this.$util = this.injector.get('util')
        this.$modal = $injector.get('$modal')({
            backdrop: 'static',
            keyboard: false,
            templateUrl: 'app/main/ticketTable/ticketTableModal.tpl.html',
            onHide: () => {
                this.$modal.destroy();
                this.$modal = null;
            }
        });
        console.log(this.$modal);
        this.$modal.$scope.data = {};
        this.$defer = $injector.get('$q').defer();
        this.$promise = this.$defer.promise;

        this.init();
    }

    init() {
        this.bindFn(this);
    }

    close(data) {
        this.$defer.resolve(data);
        this.destroy();
    }

    bindFn(_this) {
        const self = this;
        this.$modal.$scope.fn = {
            close: function (data) {
                self.close(data);
            },
            dismiss: function () {
                self.close();
            },
            sure: function () {
                let submitTicketTable = self.injector.get('voiceAPIService').submitTicketTable;

                if(!self.$modal.$scope.data.recordName){
                    self.toaster.warning('请输入话单名称')
                    return false
                }
                let params = {
                    baseNumber: self.resolveData[0]|| "",
                    callType: self.resolveData[1]|| "",
                    otherNumber: self.resolveData[2]|| "",
                    beginTime: self.resolveData[3]|| "",
                    callTime: self.resolveData[4]|| "",
                    areaCode: self.resolveData[5]|| "",
                    stationCode: self.resolveData[6]|| "",
                    recordName: self.$modal.$scope.data.recordName || "",
                    description: self.$modal.$scope.data.description|| ""
                }
                self.$util.innerLoadingStart('ticket-table-modal','#24263C')
                submitTicketTable(params).then(res => {
                    self.$util.innerLoadingEnd()
                    if (res.status === 200) {
                        if (res.data.status === 0) {
                            self.close();
                            let state = self.injector.get('$state');
                            state.transitionTo('main.voiceModel', {id: res.data.data, type: 1}, {
                                reload: false,
                                inherit: true,
                                notify: true,
                                relative: state.$current,
                                location: true
                            });
                        }else{
                            self.toaster.error(res.data.message||'保存失败')
                        }
                    }
                }, error => {
                    self.$util.innerLoadingEnd()
                });

            }
        }
    }

    destroy() {
        this.$modal.hide();
    }

}
