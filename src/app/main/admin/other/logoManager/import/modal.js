// import toast from '../../../../../components/modal/toast/toast';

export default class importModal {
    constructor($injector, resolveData) {
        this.injector = $injector;
        this.toaster = this.injector.get('toaster');
        this.resolveData = resolveData;
        this.$modal = $injector.get('$modal')({
            backdrop: 'static',
            keyboard: false,
            placement: 'center',
            templateUrl: 'app/main/admin/other/logoManager/import/modal.html',
            onHide: () => {
                this.$modal.destroy();
                this.$modal = null;
            }
        });
        this.$modal.$scope.data = {
            file: undefined,
            uploaded: false,
            btnStr: '确定导入',
            event: undefined,
            uploading: false,
            percentage: 0,
            name: "",
            result: {}
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
                data.btnStr = '确定导入';
            },
            chooseFile: function ($event) {
                $event.preventDefault();
                $event.stopPropagation();
                $($event.target).parents('.form-item').find('input').click();
            },
            sure: function () {
                const otherManagerService = self.injector.get('otherManagerService');
                const $interval = self.injector.get('$interval');

                if (data.uploaded) {
                    self.close(data.result);
                    return;
                }
                if (!data.name) {
                    // new toast(self.injector, {
                    //     str: '请输入名称',
                    //     position: 'right-top'
                    // }).warn();
                    self.toaster.pop({type:'warning',title:'请输入名称'});
                    return;
                }
                if (!data.file) {
                    // new toast(self.injector, {
                    //     str: '请选择文件',
                    //     position: 'right-top'
                    // }).warn();
                    self.toaster.pop({type:'warning',title:'请选择文件'});

                    return;
                }
                if (data.file.type !== "image/png" && data.file.type !== "image/jpeg") {
                    // new toast(self.injector, {
                    //     str: '请上传正确的图片类型',
                    //     position: 'right-top'
                    // }).warn();
                    self.toaster.pop({type:'warning',title:'请上传正确的图片类型'});

                    return;
                }
                if (data.file.size > 15000) {
                    // new toast(self.injector, {
                    //     str: '文件大小不超过15K',
                    //     position: 'right-top'
                    // }).warn();
                    self.toaster.pop({type:'warning',title:'文件大小不超过15K'});

                    return;
                }
                data.uploading = true;
                data.btnStr = '正在上传';
                const file = data.file;
                const reader = new FileReader();
                let base64url = null;
                let params = null;
                reader.readAsDataURL(file);
                reader.onload = function () {
                    base64url = reader.result;
                    params = {
                        "image": base64url,
                        "name": data.name
                    };
                    data.file.percentage = 0;
                    const timer = $interval(function () {
                        data.file.percentage += 1;
                    }, 40, 99);
                    otherManagerService.addLogo(params).then(result => {
                        if (result.data && result.data.status === 0) {
                            data.uploaded = true;
                            data.btnStr = '确定';
                            data.file.percentage = 100;
                            self.close(result);
                        } else {
                            data.btnStr = '确定导入';
                            data.file.percentage = 0;
                            // new toast(self.injector, {
                            //     str: result.data.message || '上传失败'
                            // }).error();
                            self.toaster.pop({type:'error',title: result.data.message || '上传失败'});
                        }
                        data.uploading = false;
                        $interval.cancel(timer);
                    }, error => {
                        data.uploading = false;
                        data.btnStr = '上传文件';
                        $interval.cancel(timer);
                    });
                }

            }
        }
    }

    destroy() {
        this.$modal.hide();
    }

}
