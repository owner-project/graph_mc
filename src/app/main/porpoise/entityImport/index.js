// import toast from '../../../components/modal/toast/toast';

export default class entityImportModal {
    constructor($injector, resolveData) {
        this.injector = $injector;
        this.toaster = this.injector.get('toaster');
        this.$modal = $injector.get('$modal')({
            backdrop: 'static',
            keyboard: false,
            placement: 'center',
            templateUrl: 'app/main/porpoise/entityImport/template.html',
            onHide: () => {
                this.$modal.destroy();
                this.$modal = null;
            }
        });
        this.$modal.$scope.data = {
            file: undefined,
            uploaded: false,
            btnStr: '上传文件',
            uploading: false,
            percentage: 0,
            result: {},
            deleteFile: false
        };
        if (resolveData) {
            this.$modal.$scope.data = resolveData.uploadFileData;
        }
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
        const data = this.$modal.$scope.data;

        this.$modal.$scope.fn = {
            close: function (data) {
                self.close(data);
            },
            dismiss: function () {
                self.close();
            },
            deleteFile($event) {
                $event.preventDefault();
                data.file = undefined;
                data.uploaded = false;
                data.deleteFile = true;
                data.btnStr = '上传文件';
            },
            chooseFile: function ($event) {
                $event.preventDefault();
                $event.stopPropagation();
                $($event.target).parents('.edge-box').find('input').click();
            },
            sure: function () {
                const porpoiseService = self.injector.get('porpoiseService');
                const $interval = self.injector.get('$interval');

                if (data.uploaded) {
                    self.close(data);
                    return;
                }

                if (!data.file) {
                    self.toaster.warning('请选择文件');
                    return false;
                } else {
                    let fileName = data.file.name.split('.')[1];
                    if (!(fileName == 'xls' || fileName == 'xlsx' || fileName == 'csv')) {
                        self.toaster.warning('请上传 .xls 或 .xlsx 或 .csv 类型的文件');
                        return false;
                    }
                }

                data.uploading = true;
                data.btnStr = '正在上传';
                data.file.percentage = 0;

                const timer = $interval(function () {
                    data.file.percentage += 1;
                }, 40, 99);

                const params = {
                    upload: data.file
                };

                porpoiseService.importExcel(params).then(result => {
                    if (result.data && result.data.status === 0) {
                        data.uploaded = true;
                        data.btnStr = '下一步';
                        data.result = result.data.data.title;
                        data.uploadContent = result.data.data.cotent;
                        data.file.percentage = 100;
                    } else {
                        data.btnStr = '上传文件';
                        data.file.percentage = 0;
                        self.toaster.warning(result.data.message || '上传失败');

                    }
                    data.uploading = false;
                    $interval.cancel(timer);
                }, error => {
                    data.uploading = false;
                    data.btnStr = '上传文件';
                    data.file.percentage = 0;
                    $interval.cancel(timer);
                });
            }
        }
    }

    destroy() {
        this.$modal.hide();
    }

}
