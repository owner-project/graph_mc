// import toast from '../../../components/modal/toast/toast';
export default class pushJudgeModal {
    constructor($injector, resolveData) {
        this.injector = $injector;
        this.toaster = this.injector.get('toaster');
        this.resolveData = resolveData;
        this.$modal = $injector.get('$modal')({
            backdrop: 'static',
            keyboard: false,
            placement: 'center',
            templateUrl: 'app/main/cooperate/push/modal.html',
            onHide: () => {
                this.$modal.destroy();
                this.$modal = null;
            }
        });
        this.$modal.$scope.data = {
            options: {
                departmentList: [],
                usersList: []
            },
            putData: {},
            reqData: {
                policeIds: []
            },
            chooseDepartmentList: [],
            chooseUsersList: []
        };
        const scope = this.$modal.$scope;
        const util = $injector.get('util');
        const cooperateService = $injector.get('cooperateService');

        this.$defer = $injector.get('$q').defer();
        this.$promise = this.$defer.promise;
        this.injector.get('util').innerLoadingStart('jq_con_box', '#24263C');

        cooperateService.getJudgePushed({
            id: resolveData.id
        }).then((result) => {
            if (result.status === 200) {
                if (result.data.status === 0) {
                    let hasList = {};
                    result.data.data.forEach(item => {
                        if (item.type === 1) {
                            hasList['user'] = item.IDs;
                        }
                        else {
                            hasList['department'] = item.IDs;
                        }
                    });

                    scope.hasList = hasList;

                    cooperateService.getBranch().then((res) => {
                        util.innerLoadingEnd();
                        if(res.status === 200) {
                            if(res.data.status === 0 ){
                                if (hasList['department'] && hasList['department'].length > 0) {
                                    _.each(res.data.data, (item) => {
                                        if (util.isInArray(hasList['department'], item.departmentId)) {
                                            item.choosed = true;
                                            scope.data.chooseDepartmentList.push(item);
                                        } else {
                                            item.choosed = false;
                                        }
                                    });
                                }
                                scope.data.options.departmentList = res.data.data;

                                if (hasList['department'] && hasList['department'].length) {
                                    cooperateService.getDepartments({departmentIds: hasList['department']}).then(result => {
                                        if (result.status === 200 && result.data.status === 0) {
                                            result.data.data.forEach(item => {
                                                if (!util.isInArray(scope.data.chooseDepartmentList, {departmentId: item.departmentId}, 'departmentId')) {
                                                    scope.data.chooseDepartmentList.push(item);
                                                }
                                            });
                                        }

                                        util.innerLoadingEnd();
                                    });
                                }
                            }
                        }
                    });

                    cooperateService.getUsers(this.$modal.$scope.data.reqData).then((res) => {
                        if (res.status === 200) {
                            if (res.data.status === 0) {
                                if (hasList['user'] && hasList['user'].length > 0) {
                                    _.each(res.data.data, (item) => {
                                        if (util.isInArray(hasList['user'], item.userId + '')) {
                                            item.choosed = true;
                                            scope.data.chooseUsersList.push(item);
                                        } else {
                                            item.choosed = false;
                                        }
                                    });
                                }
                                scope.data.options.usersList = res.data.data;

                                if (hasList['user'] && hasList['user'].length) {
                                    cooperateService.getUsers({policeIds: hasList['user'], flag: 1}).then(result => {
                                        if (result.status === 200) {
                                            if (result.data.status === 0) {
                                                result.data.data.forEach((item) => {
                                                    if (!util.isInArray(scope.data.options.usersList, {userId: item.userId}, 'userId')) {
                                                        item.choosed = true;
                                                        scope.data.chooseUsersList.push(item);
                                                        scope.data.options.usersList.push(item);
                                                    }
                                                });
                                            }
                                        }
                                    });
                                }
                            }
                        }
                    });

                }
            }
        });
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
        scope.fn = {
            close: function (data) {
                self.close(data);
            },
            dismiss: function () {
                self.close();
            },
            sure: function () {
                let relation = {};
                relation.shotID = self.resolveData.id;
                relation.type = scope.data.putData.type;
                let temp = [];
                switch (relation.type) {
                    case 1:
                        _.each(scope.data.chooseUsersList, (item) => {
                            temp.push(item.userId + '');
                        });
                        break;
                    case 2:
                        _.each(scope.data.chooseDepartmentList, (item) => {
                            temp.push(item.departmentId);
                        });
                        break;
                    default:
                        break;
                }
                relation.IDs = temp;
                self.injector.get('cooperateService').pushJudge(relation).then((res) => {
                    if(res.status === 200) {
                        if(res.data.status === 0) {
                            // new toast(self.injector, {
                            //     str: '记录推送成功！',
                            //     position: 'center'
                            // }).success();
                            self.toaster.pop({type:'success',title:'记录推送成功！'});
                            self.close();
                        }
                    }
                });
            },
            changeDepartment(item) {
                if(item.choosed) {
                    scope.data.chooseDepartmentList.push(item);
                }
                else {
                    for (let i = 0; i < scope.data.chooseDepartmentList.length; i++) {
                        if (scope.data.chooseDepartmentList[i].departmentId === item.departmentId) {
                            scope.data.chooseDepartmentList.splice(i, 1);
                            i--;
                        }
                    }
                }
            },
            changeUsers(item) {
                if (item.choosed) {
                    scope.data.chooseUsersList.push(item);
                }
                else {
                    for (let i = 0; i < scope.data.chooseUsersList.length; i++) {
                        if (scope.data.chooseUsersList[i].policeId === item.policeId) {
                            scope.data.chooseUsersList.splice(i, 1);
                            i--;
                        }
                    }
                }
            },
            clickDepartment(e, item) {
                e.stopPropagation();
                if(!item.isOpen) {
                    if(!item.isGetChild) {
                        self.injector.get('cooperateService').getBranch(item.departmentId).then((res) => {
                            if (res.status === 200) {
                                if (res.data.status === 0) {
                                    item.isGetChild = true;
                                    item.child = res.data.data;
                                    if(item.child && item.child.length > 0) {
                                        _.each(item.child, (n) => {
                                            if (scope.data.chooseDepartmentList && scope.data.chooseDepartmentList.length > 0 && self.injector.get('util').isInArray(scope.data.chooseDepartmentList, {departmentId:  n.departmentId}, 'departmentId')) {
                                                n.choosed = true;
                                            }
                                        });
                                    }
                                }
                            }
                        });
                    }
                }
                item.isOpen = !item.isOpen;
                // item.choosed = !item.choosed;
                // scope.fn.changeDepartment(item);
            },
            clickUsers(e, item) {
                e.stopPropagation();
                item.choosed = !item.choosed;
                scope.fn.changeUsers(item);
            },
            deleteChooseDepartment(e, item) {
                e.stopPropagation();
                item.choosed = false;
                scope.fn.changeDepartment(item);
            },
            deleteChooseUsers(e, item) {
                e.stopPropagation();
                item.choosed = false;
                scope.fn.changeUsers(item);
            },
            searchUsers(e) {
                if(e.keyCode === 13) {
                    scope.data.reqData.policeIds = scope.data.policeIdStr.split(',');
                    self.injector.get('cooperateService').getUsers(scope.data.reqData).then((res) => {
                        if (res.status === 200) {
                            if (res.data.status === 0) {
                                _.each(res.data.data, (item) => {
                                    if (!self.injector.get('util').isInArray(scope.data.options.usersList, item, 'policeId')) {
                                        scope.data.options.usersList.push(item);
                                    }
                                });
                            }
                        }
                    });
                }
            }
        }
    }

    destroy() {
        this.$modal.hide();
    }

}