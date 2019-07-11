// import toast from '../../../components/modal/toast/toast';

export default class importModal {
    constructor($injector) {
        this.injector = $injector; 
        this.toaster = this.injector.get('toaster');
        this.$modal = $injector.get('$modal')({
            backdrop: 'static',
            keyboard: false,
            placement: 'center',
            templateUrl: 'app/main/porpoise/import/modal.html',
            onHide: () => {
                this.$modal.destroy();
                this.$modal = null;
            }
        });
        this.data = {
            // 模板文件位置
            templateFileUrl:'static/import.xls'
        }
        this.$modal.$scope.data = {
            file: undefined,
            uploaded: false,
            btnStr: '上传文件',
            uploading: false,
            percentage: 0,
            result: {},
            title: '模板导入',
            currentStep: 1
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
                data.btnStr = '上传文件';
            },
            chooseFile: function ($event) {
                $event.preventDefault();
                $event.stopPropagation();
                $($event.target).parents('.edge-box').find('input').click();
            },
            downloadFile: function ($event) {
                $event.stopPropagation();
                const element = document.createElement('a');
                element.setAttribute('href', encodeURI(self.data.templateFileUrl));

                element.style.display = 'none';
                document.body.appendChild(element);

                element.click();

                setTimeout(() => {
                    document.body.removeChild(element);
                }, 20);
            },
            sure: function () {
                const porpoiseService = self.injector.get('porpoiseService');
                const $interval = self.injector.get('$interval');

                if (data.uploaded) {
                    self.close(data.result);
                    return;
                }
                
                if (!data.file) {
                    self.toaster.pop({type:'warning',title:'请选择文件'});
                    return;
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

                porpoiseService.importRelationship(params).then(result => {
                    if (result.data && result.data.status === 0) {
                        data.uploaded = true;
                        data.btnStr = '确定';
                        data.result = result.data;
                        data.uploadTitle = result.data.data.title;
                        data.uploadContent = result.data.data.content;
                        data.file.percentage = 100;
                    } else {
                        data.btnStr = '上传文件';
                        data.file.percentage = 0;
                        // new toast(self.injector, {str: result.data.msg || '上传失败'}).error();
                        self.toaster.pop({type:'error',title:result.data.msg || '上传失败'});

                    }
                    data.uploading = false;
                    $interval.cancel(timer);
                }, error => {
                    data.uploading = false;
                    data.btnStr = '上传文件';
                    $interval.cancel(timer);
                });
            },
            gotoUpload: function () {
                data.currentStep = 1;
            }
        }
    }

    destroy() {
        this.$modal.hide();
    }

}
