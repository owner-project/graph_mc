export default class voiceTableModal {
    constructor($injector, resolveData) {
        this.injector = $injector;
        this.resolveData = resolveData;
        this.$modal = $injector.get('$modal')({
            backdrop: 'static',
            keyboard: false,
            templateUrl: 'app/main/voiceTable/voiceTableModal.tpl.html',
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
        this.bindFn();
    }

    close(data) {
        this.$defer.resolve(data);
        this.destroy();
    }

    bindFn() {
        const self = this;
        this.$modal.$scope.fn = {
            close: function (data) {
                self.close(data);
            },
            dismiss: function () {
                self.close();
            },
            sure: function () {
                let submitVoiceTable = self.injector.get('voiceAPIService').submitVoiceTable;
                submitVoiceTable({
                    firstKey: self.resolveData[0],
                    firstName: self.resolveData[1],
                    secondKey: self.resolveData[2],
                    secondName: self.resolveData[3],
                    relevance: self.resolveData[4],
                    recordName: self.$modal.$scope.data.recordName,
                    description: self.$modal.$scope.data.description
                }).then(res => {
                    if (res.status === 200) {
                        if (res.data.status === 0) {
                            self.close();
                            let state = self.injector.get('$state');
                            state.transitionTo('main.phoneBook', {id: res.data.data, type: 2}, {
                                reload: false,
                                inherit: true,
                                notify: true,
                                relative: state.$current,
                                location: true
                            });
                        }
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
