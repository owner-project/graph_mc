// import toast from '../../../components/modal/toast/toast';

export default class importExlModal {
    constructor($injector,type) {
        this.$modal = $injector.get('$modal')({
            backdrop: 'static',
            keyboard: false,
            placement: 'center',
            templateUrl: 'app/main/voiceList/importExl/index.html',
            onHide: () => {
                this.$modal.destroy();
                this.$modal = null;
            }
        });
        this.injector = $injector;
        this.toaster = this.injector.get('toaster');
        this.$defer = $injector.get('$q').defer();
        this.$promise = this.$defer.promise;

        this.$modal.$scope.data = {
            type: 2, //1.上传话单 2.上传嫌犯通讯录
            currentStep: 1,
            // 嫌犯通讯录导入数据预览和描述
            voiceData: {
                jsonData: {
                    option1: [],
                    option2: [],
                    option3: [],
                    option4: [],
                    option5: [],
                    resultData1: [],
                    resultData2: []
                },
                option: {},
                importDes: {
                    recordName: '',
                    description: ''
                },
                uploading: false, //是否正在上传
                status: false, //是否已上传
            },
            // 话单导入导入数据预览和描述
            ticketData: {
                jsonData: {
                    option1: [],
                    option2: [],
                    option3: [],
                    option4: [],
                    option5: [],
                    resultData: []
                },
                option: {},
                importDes: {
                    recordName: '',
                    description: ''
                },
                uploading: false, //是否正在上传
                status: false, //是否已上传
            }
        };
        this.init();
    }

    init() {
        let $this = this;
        let fileData = $this.$modal.$scope.data;
        fileData.tip = '确定导入';
        this.bindFn();
    }

    close(data) {
        this.$defer.resolve(data);
        this.$modal.$scope = {};
        this.destroy();
    }

    bindFn() {
        let self = this;
        const scope = this.$modal.$scope;

        this.$modal.$scope.fn = {
            close: function (data) {
                self.close(data);
            },
            dismiss: function () {
                self.close();
            },
            sure: function () {
                if (scope.data.type == 2) {
                    if (!scope.data.voiceData.importDes.recordName) {
                        self.toaster.warning({
                            title: '请填写名称'
                        });
                        return false;
                    }
                    if (!scope.data.voiceData.importDes.description) {
                        self.toaster.warning({
                            title: '请填写描述'
                        });
                        return false;
                    }
                    let submitVoiceTable = self.injector.get('voiceAPIService').submitVoiceTable;
                    submitVoiceTable({
                        firstKey: scope.data.voiceData.option.value1,
                        firstName: scope.data.voiceData.option.value2,
                        secondKey: scope.data.voiceData.option.value3,
                        secondName: scope.data.voiceData.option.value4,
                        relevance: scope.data.voiceData.option.value5,
                        recordName: scope.data.voiceData.importDes.recordName,
                        description: scope.data.voiceData.importDes.description
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
                } else {
                    let submitTicketTable = self.injector.get('voiceAPIService').submitTicketTable;
                    if(!scope.data.ticketData.importDes.recordName){
                        self.toaster.warning('请输入话单名称')
                        return false
                    }
                    let params = {
                        baseNumber: scope.data.ticketData.option.value1,
                        callType: scope.data.ticketData.option.value2,
                        otherNumber: scope.data.ticketData.option.value3,
                        beginTime: scope.data.ticketData.option.value4,
                        callTime: scope.data.ticketData.option.value5,
                        areaCode: scope.data.ticketData.option.value6,
                        stationCode: scope.data.ticketData.option.value7,
                        recordName: scope.data.ticketData.importDes.recordName,
                        description: scope.data.ticketData.importDes.description|| ""
                    }
                    submitTicketTable(params).then(res => {
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
                    }, error => {});
                }
            },
            deleteFile($event, file) {
                if (scope.data.type == 1) {
                    scope.data.ticketData.status = false;
                } else {
                    scope.data.voiceData.status = false;
                }
                self.$modal.$scope.data[file] = undefined;
                $('#huaDanFileUploadInput').val('')
            },
            downloadFile($event) {
                $event.stopPropagation();
                const element = document.createElement('a');
                element.setAttribute('href', encodeURI('static/import_hd.xls'));

                element.style.display = 'none';
                document.body.appendChild(element);

                element.click();

                setTimeout(() => {
                    document.body.removeChild(element);
                }, 20);
            },
            changeImportType(type) {
                function _switch() {
                    scope.data.type = type;
                    if (type === 1) {
                        scope.data.ticketData.status = false;
                        scope.data.ticketData.uploading = false;
                        scope.data.voiceFile = undefined;
                    } else if (type === 2) {
                        scope.data.voiceData.status = false;
                        scope.data.voiceData.uploading = false;
                        scope.data.phoneNumberFile = undefined;
                        scope.data.phoneBookFile = undefined;
                    }
                }

                if (!scope.data.voiceData.uploading || !scope.data.ticketData.uploading) {
                    _switch();
                } else {
                    self.injector.get('puiModal').confirm({title: '提示', content: '正在上传确定切换?'}).then(confirm => {
                       _switch();
                    }, cancel => {
                        //
                    });
                }
            },
            chooseFile($event) {
                if (scope.data.type == 1) {
                    scope.data.ticketData.status = false;
                } else {
                    scope.data.voiceData.status = false;
                }
                $($event.target).parents('.upload-phone').find('input').click();
            },
            import() {
                const fileData = self.$modal.$scope.data;
                const exlImportInfo = self.injector.get('applicationAPIService').exlImportInfo;

                if (scope.data.voiceData.status || scope.data.ticketData.status) {
                    if (scope.data.type === 1 && scope.data.ticketData.status) {
                        self.injector.get('util').innerLoadingStart('porpoise-import-graph-modal', '#24263C');
                        self.injector.get('voiceAPIService').getTicketList(globalLoading()).then(res => {
                            if (res.status === 200) {
                             if (res.data.status === 0) {
                                self.injector.get('util').innerLoadingEnd();
                                scope.data.currentStep = 2;
                                scope.data.ticketData.jsonData.option1 = res.data.data.head;
                                scope.data.ticketData.jsonData.resultData = res.data.data.data.slice(0, 3);
                             }
                         }
                         }, error => {
                         });
                         return;
                        //self.injector.get('$state').go('main.ticketTable');
                    } else if (scope.data.type === 2 && scope.data.voiceData.status) {
                        self.injector.get('util').innerLoadingStart('porpoise-import-graph-modal', '#24263C');
                        self.injector.get('voiceAPIService').getVoiceTable(globalLoading()).then(res => {
                            if (res.status === 200) {
                                if (res.data.status === 0) {
                                    self.injector.get('util').innerLoadingEnd();
                                    scope.data.currentStep = 2;
                                    scope.data.voiceData.jsonData.option2 = scope.data.voiceData.jsonData.option1 = res.data.data[0].head;
                                    scope.data.voiceData.jsonData.option5 = scope.data.voiceData.jsonData.option4 = scope.data.voiceData.jsonData.option3 = res.data.data[1].head;
                                    scope.data.voiceData.jsonData.resultData1 = res.data.data[0].data.slice(0, 3);
                                    scope.data.voiceData.jsonData.resultData2 = res.data.data[1].data.slice(0, 3);
                                } else {
                                    self.toaster.pop({
                                        type: 'error',
                                        title: 'error'
                                    });
                                }
                            }
                        }, error => {});
                        return;
                        //self.injector.get('$state').go('main.voiceTable');
                    }
                }


                if (scope.data.type === 2) {
                    if (!scope.data.phoneBookFile || !scope.data.phoneNumberFile) {
                        self.toaster.pop({type:'warning',title:'请选择文件'});
                        return;
                    } else {
                        let phoneBookFileName = scope.data.phoneBookFile.name.split('.')[1];
                        let phoneNumberFileName = scope.data.phoneNumberFile.name.split('.')[1];
                        if (!(phoneBookFileName == 'xls' || phoneBookFileName == 'xlsx' || phoneBookFileName == 'csv')) {
                            self.toaster.warning('请上传 .xls 或 .xlsx 或 .csv 类型的文件');
                            return false;
                        }
                        if (!(phoneNumberFileName == 'xls' || phoneNumberFileName == 'xlsx' || phoneNumberFileName == 'csv')) {
                            self.toaster.warning('请上传 .xls 或 .xlsx 或 .csv 类型的文件');
                            return false;
                        }
                        scope.data.voiceData.uploading = true;
                    }
                } else if (scope.data.type === 1) {
                    if (!scope.data.voiceFile) {
                        self.toaster.pop({type:'warning',title:'请选择文件'});
                        return;
                    } else {
                        let voiceFileName = scope.data.voiceFile.name.split('.')[1];
                        if (!(voiceFileName == 'xls' || voiceFileName == 'xlsx' || voiceFileName == 'csv')) {
                            self.toaster.warning('请上传 .xls 或 .xlsx 或 .csv 类型的文件');
                            return false;
                        }
                        scope.data.ticketData.uploading = true;
                    }
                }

                const params = {
                    type: scope.data.type,
                    upload: scope.data.type === 2 ? fileData.phoneNumberFile : fileData.voiceFile
                };

                exlImportInfo(params).then((res) => {
                    if (scope.data.type === 1) {
                        fileData.voiceFile.percent = 100;
                    } else {
                        fileData.phoneNumberFile.percent = 100;
                    }

                    if (scope.data.type === 1) {
                        scope.data.ticketData.status = true;
                        scope.data.ticketData.uploading = false;
                    } else {
                        let bFileParams = {
                            type: scope.data.type,
                            upload: fileData.phoneBookFile
                        };

                        exlImportInfo(bFileParams).then(res => {
                            scope.data.voiceData.status = true;
                            scope.data.voiceData.uploading = false;

                            if (res.status === 200) {
                                if (res.data.status === 0) {
                                    fileData.jsonData = res.data.data;
                                    fileData.phoneBookFile.percent = 100;
                                }
                            }
                        }, error => {
                            scope.data.voiceData.status = false;
                            scope.data.voiceData.uploading = false;
                            scope.data.ticketData.status = false;
                            scope.data.ticketData.uploading = false;
                        });
                    }
                }, error => {
                    scope.data.voiceData.status = false;
                    scope.data.voiceData.uploading = false;
                    scope.data.ticketData.status = false;
                    scope.data.ticketData.uploading = false;
                });


                let interval = self.injector.get("$interval");
                let i = 1;
                let isSuccess = false;

                var timer = interval(function(){
                    if (scope.data.type === 1) {
                        if (!fileData.voiceFile.percent || (fileData.voiceFile.percent && fileData.voiceFile.percent < 100)) {
                            fileData.voiceFile.percent = i;
                        }
                    } else {
                        if (!fileData.phoneNumberFile.percent || (fileData.phoneNumberFile.percent && fileData.phoneNumberFile.percent < 100)) {
                            fileData.phoneNumberFile.percent = i;
                        }

                        if (!fileData.phoneBookFile.percent || (fileData.phoneBookFile.percent && fileData.phoneBookFile.percent < 100)) {
                            fileData.phoneBookFile.percent = i;
                        }
                    }

                    i++;
                }, 40, 99);
            },
            gotoUpload() {
                scope.data.currentStep = 1;
            },
            gotoSaveSetting() {
                if(scope.data.type == 2) {
                    if (!scope.data.voiceData.option.value1 || !scope.data.voiceData.option.value3) {
                        self.toaster.warning({
                            title: '请选择主键'
                        });
                        return false;
                    }
                    if (!scope.data.voiceData.option.value2 || !scope.data.voiceData.option.value4) {
                        self.toaster.warning({
                            title: '请选择名称'
                        });
                        return false;
                    }
                    if (!scope.data.voiceData.option.value5) {
                        self.toaster.warning({
                            title: '请选择关系'
                        });
                        return false;
                    }
                } else {
                    if(!scope.data.ticketData.option.value1){
                        self.toaster.warning('请选择计费号码')
                        return false
                    }
                    if(!scope.data.ticketData.option.value2){
                        self.toaster.warning('请选择通话类型')
                        return false
                    }
                    if(!scope.data.ticketData.option.value3){
                        self.toaster.warning('请选择对方号码')
                        return false
                    }
                    if(!scope.data.ticketData.option.value4){
                        self.toaster.warning('请选择开始时间')
                        return false
                    }        
                    if(!scope.data.ticketData.option.value5){
                        self.toaster.warning('请选择通话时长')
                        return false
                    }
                    if(!scope.data.ticketData.option.value6){
                        self.toaster.warning('请选择小区代码')
                        return false
                    }
                    if(!scope.data.ticketData.option.value7){
                        self.toaster.warning('请选择基站代码')
                        return false
                    }
                }
                scope.data.currentStep = 3;
            },
            gotoDataPreview() {
                scope.data.currentStep = 2;
            }
        }
    }

    destroy() {
        this.$modal.hide();
    }
}
