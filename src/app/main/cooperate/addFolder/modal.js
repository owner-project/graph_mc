
// import toast from "../../../components/modal/toast/toast";

export default class addFolderModal {
    constructor($injector, resolveData) {
        this.injector = $injector;
        this.toaster = this.injector.get('toaster');
        this.$modal = $injector.get('$modal')({
            backdrop: 'static',
            keyboard: false,
            placement: 'center',
            templateUrl: 'app/main/cooperate/addFolder/modal.html',
            onHide: () => {
                this.$modal.destroy();
                this.$modal = null;
            }
        });
        this.$defer = $injector.get('$q').defer();
        this.$promise = this.$defer.promise;
        this.resData = resolveData;
        this.$modal.$scope.data = {
            name: ''
        };
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
        const data = this.$modal.$scope.data;

        this.$modal.$scope.fn = {
            close: function(data) {
                self.close(data);
            },
            dismiss: function () {
                self.close();
            },
            sure: function () {
                const putData = {};
                if (!data.name) {
                    // new toast(self.injector, {
                    //     str: '请填写文件夹名称'
                    // }).error();
                    self.toaster.pop({type:'error',title:'请填写文件夹名称'});
                    return;
                }

                putData.name = data.name;
                putData.parentId = self.resData.parentId;
                putData.type = self.resData.type;

                self.injector.get('cooperateService').addFolder(putData).then((res) => {
                    if(res.status === 200) {
                        if(res.data.status === 0) {
                            self.close(1);
                        } else {
                            // new toast(self.injector, {
                            //     str: res.data.message
                            // }).error();
                            self.toaster.pop({type:'error',title:res.data.message});

                        }
                    }
                });

            }
        }
    }

    destroy() {
        this.$modal.hide();
    }
}
