
export default class editFileModal {
    constructor($injector, resolveData) {
        this.injector = $injector;
        this.toaster = this.injector.get('toaster');
        this.$modal = $injector.get('$modal')({
            backdrop: 'static',
            keyboard: false,
            placement: 'center',
            templateUrl: 'app/main/cooperate/editFile/modal.html',
            onHide: () => {
                this.$modal.destroy();
                this.$modal = null;
            }
        });
        this.$defer = $injector.get('$q').defer();
        this.$promise = this.$defer.promise;
        this.resData = resolveData;
        let fileDes = ''
        if (this.resData.file.type === 'folder') {
            fileDes = '文件夹'
        } else {
            fileDes = '文件'
        }
        this.$modal.$scope.data = {
            name: this.resData.file.name || this.resData.file.themeName,
            title: fileDes
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
                    self.toaster.pop({type:'error',title:'请填写' + data.fileDes + '名称'});
                    return;
                }
                putData.name = data.name;
                putData.id = self.resData.file.id;
                putData.type = self.resData.file.type || 'file';
                putData.category = self.resData.file.category;
                if (putData.type === 'folder') {
                    putData.parentId = self.resData.file.parentId
                } else {
                    putData.parentId = self.resData.file.folderId || ''
                }
                self.injector.get('cooperateService').editFile(putData).then((res) => {
                    if(res.status === 200) {
                        if(res.data.status === 0) {
                            self.close(data.name);
                        } else {
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
