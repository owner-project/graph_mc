import newImportModal  from '../../porpoise/import/modal'

export default class importExlModal extends newImportModal {
    constructor($injector){
        super($injector);
        // 模板地址
        this.data.templateFileUrl = 'static/import_trade.xlsx';
        const self = this;
        const data = this.$modal.$scope.data;
        const fn = this.$modal.$scope.fn;
        data.title = '资金流水导入';
        data.importDes = {
            title: '',
            description: ''
        };
        fn.sure = function () {
            const $interval = self.injector.get('$interval');
            const importService = self.injector.get('tradeAPIService');
            if (data.uploaded) {
                data.currentStep = 2;
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
            importService.capitalFlowImport(params).then(result => {
                if (result.data && result.data.code === 0) {
                    data.uploaded = true;
                    data.btnStr = '确定';
                    data.result = result.data;
                    data.uploadTitle = result.data.result[0];
                    data.uploadContent = result.data.result.slice(1, 4);
                    data.file.percentage = 100;
                } else {
                    data.btnStr = '上传文件';
                    data.file.percentage = 0;
                    self.toaster.pop({type:'error',title:result.data.msg || '上传失败'});
                }
                data.uploading = false;
                $interval.cancel(timer);
            }, error => {
                data.uploading = false;
                data.btnStr = '上传文件';
                $interval.cancel(timer);
            });
        }
        fn.import = function () {
            if(data.importDes.description =='') {
                self.toaster.pop({type:'warning',title:'请输入描述'});
                return;
            }
            if(data.importDes.title =='') {
                self.toaster.pop({type:'warning',title:'请输入标题'});
                return;
            }

            const params = {
                upload: data.file,
                description: data.importDes.description,
                title: data.importDes.title,
            };

            const exlImportInfo = self.injector.get('tradeAPIService').exlImportInfo;

            exlImportInfo(globalLoading(params)).then((res) => {
                if(res.data.status == 0 ){
                    fn.close();
                    self.injector.get('$state').go('main.tradeReport', {
                        type: res.data.data.graphName
                    });
                }else{
                    self.toaster.pop({
                        type: 'warning',
                        title: '上传失败'
                    });
                }

            }, error => {
                self.toaster.pop({
                    type: 'warning',
                    title: '服务器出错,请稍后再试'
                });
            });
        }
    }
}
