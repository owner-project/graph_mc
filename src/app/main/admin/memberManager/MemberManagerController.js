import addModal from './modal/modal';
// import toast from '../../../components/modal/toast/toast';

export class MemberManagerController {
    constructor($injector, $scope,$rootScope) {
        'ngInject';
        this.injector = $injector;
        this.toaster = this.injector.get('toaster')
        this.adminAPIService = $injector.get('adminAPIService');
        this.$scope = $scope;
        this.globalSetting = $rootScope.GLOBAL_SETTING_INFO
        this.$state = $injector.get('$state');
        this.selectAll = this.selectAll.bind(this);
        this.init();
    }

    init() {
        this.pageParam = {
            pageNo: 1,
            pageSize: 10,
            total: 0
        }
        this.selectedArray = [];
        this.data = {
            memberList: [],
            allSelected: false,
            searchContent: "",

            hasDateSearch: false,
            hasEditTop: true,
            hasSearch: true,
            // 如果是用户中心的 没有这两个按钮
            hasAdd: this.globalSetting == 0,
            hasDelete: this.globalSetting == 0,

            hasOp: false,
            hasMemberOp: true,
            theadList: [
                {
                    name: '序号',
                    size: 'small'
                },
                {
                    name: '警号',
                    size: 'normal'
                },
                {
                    name: '姓名',
                    size: 'normal'
                },
                {
                    name: '用户名',
                    size: 'normal'
                },
                {
                    name: '手机号',
                    size: 'normal'
                },
                {
                    name: '性别',
                    size: 'small',
                    style:{
                        width:'60px'
                    }
                },
                {
                    name: '角色',
                    size: 'normal'
                },
                {
                    name: '创建时间',
                    size: 'normal'
                },
                {
                    name: '操作',
                    size: 'op',
                    style:{
                        'width':'140px'
                    }
                }
            ],

            tbodyList: [
                {
                    key: 'policeId',
                    size: 'normal'
                },
                {
                    key: 'name',
                    size: 'normal'
                },
                {
                    key: 'username',
                    size: 'normal'
                },
                {
                    key: 'phone',
                    size: 'normal'
                },
                {
                    key: 'sex',
                    size: 'small',
                    style:{
                        width:'60px'
                    }
                },
                {
                    key: 'roleNames',
                    size: 'normal'
                },
                {
                    key: 'createtime',
                    size: 'normal'
                }
            ]
        };
        this.getMemberList();
    }


    search_submit_title() {
        this.pageParam.pageNo = 1;
        this.getMemberList();
    }
    myClose(){
        this.pageParam.pageNo = 1;
        this.data.searchContent = "";
        this.getMemberList();
    }
    getMemberList() {
        const defer = this.injector.get('$q').defer();

        const params = {
            departmentId: this.$state.params.departId,
            pageNo: this.pageParam.pageNo,
            pageSize: this.pageParam.pageSize,
            searchContent: this.data.searchContent
        }
        this.adminAPIService.getDepartmentMemberList(params).then((result) => {
            this.injector.get('util').loadingEnd();
            if (result.data && result.data.data) {
                this.data.dataList = result.data.data.list;
                this.pageParam.total = result.data.data.count;
                defer.resolve(result.data.data.count);
            }
        }, (error) => {
            defer.reject();
        });

        return defer.promise;
    }

    selectMember(member) {
        member.selected = !member.selected;
    }

    addMember() {
        let $this = this;
        new addModal(this.injector, this.$state.params.departId).$promise.then((res) => {
            if (res === 1) {
                $this.getMemberList();
                // new toast(this.injector, {
                //     str: '添加成功',
                //     position: 'right-top'
                // }).success();
                this.toaster.pop({type:'success',title:'添加成功'});
            } else if (res === 2) {
                // new toast(this.injector, {
                //     str: '添加失败',
                //     position: 'right-top'
                // }).error();
                this.toaster.pop({type:'error',title:'添加失败'});

            }
        });
    }

    myKeyup() {
        this.pageParam.pageNo = 1;
        this.search_submit_title();
    }

    resetPassword(userId) {
        let $this = this;
        $this.injector.get('puiModal').confirm({
            title: '重置提示',
            content: '是否将密码重置为警号？'
        }).then(() => {
            this.adminAPIService.resetPassword({
                userId: userId
            }).then((result) => {
                if (result.status === 200) {
                    if (result.data.status === 0) {
                        // new toast(this.injector, {
                        //     str: '密码已重置',
                        //     position: 'right-top'
                        // }).success();
                        this.toaster.pop({type:'success',title:'密码已重置'});

                    }
                }
            }, (error) => {
            });
        });

    }

    selectAll() {
        this.data.dataList.forEach((item) => {
            item.selected = this.data.allSelected;
        });
    }


    //根据ID删除角色信息
    getDeleteData() {
        let $this = this;
        let service = $this.injector.get('adminAPIService');

        service.deleteData(
            {
                ids: $this.selectedArray
            }
        ).then((res) => {
            if (res.status === 200) {
                if (res.data.status === 0) {
                    $this.getMemberList();
                    // new toast(this.injector, {
                    //     str: '删除成功',
                    //     position: 'right-top'
                    // }).success();
                    this.toaster.pop({type:'success',title:'删除成功'});
                }
            }
        });
    }


    //删除按钮点击事件
    deleteClick() {
        let $this = this;
        $this.getCheckedIds();
        if($this.selectedArray.length > 0){
            $this.injector.get('puiModal').confirm({
                title: '删除提示',
                content: '是否删除该条记录'
            }).then(() => {
                this.getDeleteData();
            });
        }
        else{
            // new toast(this.injector, {
            //     str: '请至少勾选一个待删除项',
            //     position: 'right-top'
            // }).warn();
            this.toaster.pop({type:'warning',title:'请至少勾选一个待删除项'});

        }

    }

    //修改按钮点击事件
    updateClick(id) {
        this.getUserInfo(id);
    }

    //获取已选中的数组Id
    getCheckedIds() {
        this.selectedArray = [];
        this.data.dataList.forEach((item) => {
            if (item.selected) {
                this.selectedArray.push(item.userId)
            }
        });
    }

    //根据ID获取用户信息
    getUserInfo(userId) {
        let $this = this;
        let service = $this.injector.get('adminAPIService');
        if (userId) {
            service.getUserInfo(
                {
                    userId: userId
                }
            ).then((res) => {
                if (res.status === 200) {
                    if (res.data.status === 0) {
                        let $this = this;
                        new addModal(this.injector, this.$state.params.departId, res.data.data).$promise.then((res) => {
                            if (res === 1) {
                                $this.getMemberList();
                                // new toast(this.injector, {
                                //     str: '修改成功',
                                //     position: 'right-top'
                                // }).success();
                                this.toaster.pop({type:'success',title:'修改成功'});

                            } else if (res === 2) {
                                // new toast(this.injector, {
                                //     str: '修改失败',
                                //     position: 'right-top'
                                // }).error();
                                this.toaster.pop({type:'error',title:'修改失败'});

                            }

                        });
                    }
                }
            });
        }
    }

    changePage() {
        this.data.allSelected = false;
        this.getMemberList();
    }
}
