import newImportModal  from '../../../porpoise/import/modal'

export default class redManagerImportModal extends newImportModal { 
    constructor($injector){
        super($injector);
        this.data.templateFileUrl = 'static/import_red_list.xls';
        const self = this;
        const data = this.$modal.$scope.data;
        this.$modal.$scope.fn.sure = function () {
            const importService = self.injector.get('adminAPIService');
            const $interval = self.injector.get('$interval');
            // 如果已经上传完成
            if (data.uploaded) {

                const params = {
                    type:'save'
                };
                importService.importRedList(params).then(result => {
                    if (result.data && result.data.status === 0) {
                        self.close(1);
                    }else{
                        self.toaster.pop({type:'error',title:result.data.message || '保存失败'});
                    }
                })
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


            data.uploading = true;
            data.btnStr = '正在上传';
            data.file.percentage = 0;

            const timer = $interval(function () {
                data.file.percentage += 1;
            }, 40, 99);

            const params = {
                upload: data.file,
                type:'upload'
            };
            // importRedList
            importService.importRedList(params).then(result => {
                if (result.data && result.data.status === 0) {
                    data.uploaded = true;
                    data.btnStr = '确定';
                    data.result = result.data;
                    data.uploadTitle = result.data.data.title[0];
                    let  dataMap = result.data.data.data;
                    data.uploadContent = []
                    dataMap.forEach(item => {
                        let itemList = [item.name,item.sfzh,item.type,item.rank]
                        data.uploadContent.push(itemList)
                    });
                    data.file.percentage = 100;
                } else {
                    data.btnStr = '上传文件';
                    data.file.percentage = 0;
                    // new toast(self.injector, {str: result.data.msg || '上传失败'}).error();
                    self.toaster.pop({type:'error',title:result.data.message || '上传失败'});

                }
                data.uploading = false;
                $interval.cancel(timer);
            }, error => {
                data.uploading = false;
                data.btnStr = '上传文件';
                $interval.cancel(timer);
            });
        };
        this.$modal.$scope.fn.downloadFile = function ($event) {
            $event.stopPropagation();
            self.injector.get('adminAPIService').getRedListTemplateFile().then(res => {
                if (res.status === 200) {
                    const blob = new Blob([res.data], {type: "application/vnd.ms-excel;charset=utf-8"});
                    const objectUrl = URL.createObjectURL(blob);
                    const element = document.createElement('a');
                    element.setAttribute('download', `红名单模板.xls`);
                    element.setAttribute('href', objectUrl);
    
                    element.style.display = 'none';
                    document.body.appendChild(element);
    
                    element.click();
                }
            })
          }
    }
}