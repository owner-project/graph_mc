export default class selectFolderModal {
    constructor($injector, resolveData) {
        this.injector = $injector;
        this.toaster = this.injector.get('toaster');
        this.$modal = $injector.get('$modal')({
            backdrop: 'static',
            keyboard: false,
            placement: 'center',
            templateUrl: 'app/main/cooperate/selectFolder/modal.html',
            onHide: () => {
                this.$modal.destroy();
                this.$modal = null;
            }
        });
        this.$defer = $injector.get('$q').defer();
        this.$promise = this.$defer.promise;
        this.resData = resolveData;
        this.$modal.$scope.data = {
            folder: undefined
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
            selectFolder(folder) {
                data.folder = folder;
            },
            sure: function () {
                if (!data.folder) {
                    self.toaster.pop({type:'error',title:'请选择文件夹'});
                    return;
                }
                self.close(data.folder);
            }
        }
    }

    destroy() {
        this.$modal.hide();
    }
}
