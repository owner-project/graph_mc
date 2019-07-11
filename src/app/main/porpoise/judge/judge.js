export default class judgeModal {
    constructor($injector, resolveData, nodeData, route_id,gisData,gisTree) {
        this.injector = $injector;
        this.toaster = this.injector.get('toaster');
        this.resolveData = resolveData;
        this.nodeData = nodeData;
        this.route_id = route_id;
        this.gisData = gisData;
        this.gisTree = gisTree
        this.$modal = $injector.get('$modal')({
            backdrop: 'static',
            keyboard: false,
            placement: 'center',
            templateUrl: 'app/main/porpoise/judge/judge.html',
            onHide: () => {
                this.$modal.destroy();
                this.$modal = null;
            }
        });
        this.$modal.$scope.data = {
            putData: {
                folderId:'',
                description:''
            },
            route_id: this.route_id,
            showFolderTree: false
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
        const scope = self.$modal.$scope;
        scope.data.canUpdateGraph = localStorage.getItem('canUpdateGraph') == "true";
        self.injector.get('$timeout')(() => {
            angular.element('.folder-item')[0].children[1].click()//todo,应该改状态的
            angular.element('.jq_slice_img > img').attr('src', self.resolveData);
        }, 200);
        this.$modal.$scope.fn = {
            close: function (data) {
                self.close(data);
            },
            dismiss: function () {
                self.close();
            },
            selectFolder(folder = {id:''}) {
                scope.data.putData.path = folder.path
                scope.data.showFolderTree = false
                scope.data.putData.folderId = folder.id;
            },
            showFolderTreeFunc() {
                scope.data.showFolderTree = !scope.data.showFolderTree;
            },
            sure: function () {
                const putData = angular.copy(self.nodeData);
                angular.forEach(putData.vertices, (item) => {
                    delete item.show;
                });
                angular.forEach(putData.edges, (item) => {
                    delete item._source;
                    delete item._target;
                });

                if(!self.route_id) {
                    scope.data.chooseType = 2;
                }
                switch (scope.data.chooseType) {
                    case 1:
                        self.injector.get('porpoiseService').updateJudgeData({
                            data: putData,
                            id: decodeURIComponent(self.route_id),
                            screenShot: self.resolveData,
                            gisData:self.gisData,
                            gisTree:self.gisTree
                        }).then((res) => {
                            if (res.status === 200) {
                                if (res.data.status === 0) {
                                    self.toaster.pop({type:'success',title:'图析更新成功！'});
                                    self.close();
                                    self.injector.get('$state').
                                    transitionTo('main.porpoise', {
                                        type: 'snapshot',
                                        id: decodeURIComponent(self.route_id)
                                    }, {
                                        reload: false,
                                        inherit: true,
                                        notify: true,
                                        relative: self.injector.get('$state').$current,
                                        location: true
                                    });
                                    localStorage.setItem("canLeavePorpoise", "true")
                                }
                                else {
                                    self.toaster.pop({type:'warning',title:res.data.message});

                                }
                            }
                        });
                        break;
                    case 2:
                        if (!scope.data.putData.themeName) {
                            self.toaster.pop({type:'error',title:'请输入图析主题！'});

                            return;
                        }

                        if (scope.data.putData.folderId === undefined) {
                            self.toaster.pop({type:'error',title:'请选择目标文件夹！'});

                            return;
                        }
                        
                        self.injector.get('porpoiseService').saveJudge({
                            themeName: scope.data.putData.themeName,
                            description: scope.data.putData.description,
                            data: putData,
                            folderId: scope.data.putData.folderId,
                            screenShot: self.resolveData,
                            gisData:self.gisData,
                            gisTree:self.gisTree
                        }).then((res) => {
                            if (res.status === 200) {
                                localStorage.setItem("isToGis",'false')
                                if (res.data.status === 0) {
                                    self.toaster.pop({type:'success',title:'图析保存成功！'});
                                    self.close();
                                    if(res.data.data.shotId){
                                        self.injector.get('$state').transitionTo('main.porpoise', {
                                        type: 'snapshot',
                                        id: encodeURIComponent(res.data.data.shotId)
                                    }, {
                                        reload: false,
                                        inherit: true,
                                        notify: true,
                                        relative: self.injector.get('$state').$current,
                                        location: true
                                    });
                                    }
                                    
                                }
                                else {
                                    self.toaster.pop({type:'warning',title:res.data.message || "失败,请稍后再试"});

                                }
                            }
                        });
                        break;
                    
                }
            }
        }
    }

    destroy() {
        this.$modal.hide();
    }

}
