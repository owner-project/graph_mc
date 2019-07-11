import addModal from './modal/modal';
// import toast from '../../../components/modal/toast/toast';
export class RoleManagerController {
    constructor($injector, $scope) {
        'ngInject';
        this.injector = $injector;
        this.toaster = this.injector.get('toaster');
        this.$scope = $scope;
        this.$state = $injector.get('$state');
        this.selectAll = this.selectAll.bind(this);
        this.init();
    }

    init() {
        let $this = this;
        $this.pageParam = {
            pageNo: 1,
            pageSize:20,
            total : 0
        }
        this.data = {
            allSelected: false,

            hasDateSearch: false,
            hasSearch: false,
            hasEditTop: true,
            hasAdd: true,
            hasDelete: false,

            hasOp: true,
            hasMemberOp: false,

            theadList: [
                {
                    name: '序号',
                    size: 'small'
                },
                {
                    name: '角色名称',
                    size: 'normal'
                },
                {
                    name: '权限',
                    size: 'normal'
                },
                {
                    name: '创建时间',
                    size: 'normal'
                },
                {
                    name: '更新时间',
                    size: 'normal'
                },
                {
                    name: '操作',
                    size: 'op'
                }
            ],

            tbodyList: [
                {
                    key: 'roleName',
                    size: 'normal'
                },
                {
                    key: 'permissions',
                    size: 'normal'
                },
                {
                    key: 'createtime',
                    size: 'normal'
                },
                {
                    key: 'updatetime',
                    size: 'normal'
                }
            ]
        };
        this.selectedArray = [];
        this.getAuthList();
    }

    addMember() {
        let $this = this;
        new addModal($this.injector).$promise.then((res) => {
            if(res===1){
                $this.getAuthList();
                // new toast(this.injector, {
                //     str: '添加成功',
                //     position: 'right-top'
                // }).success();
                this.toaster.pop({type:'success',title:'添加成功'});
            }else if(res===2) {
                // new toast(this.injector, {
                //     str: '添加失败',
                //     position: 'right-top'
                // }).error();
                this.toaster.pop({type:'error',title:'添加失败'});

            }
        });

    }

    selectAll() {
        this.data.dataList.forEach((item) => {
            item.selected = this.data.allSelected;
        });
    }
    myClose(){
        this.pageParam.pageNo = 1;
        this.data.searchContent = "";
        this.getAuthList();
    }
    //获取角色列表
    getAuthList() {
        let $this = this;
        let service = $this.injector.get('roleManagerService');
            service.getDataList(
                {
                    pageNo: $this.pageParam.pageNo,
                    pageSize: $this.pageParam.pageSize,
                    permissionName: null
                }
            ).then((res) => {
                this.injector.get('util').loadingEnd();
                if(res.status === 200) {
                    if(res.data.status === 0) {
                        this.data.dataList = res.data.data.list
                        $this.pageParam.total = res.data.data.total;
                    }
                }
            });
    }

    //根据ID获取角色信息
    getAuthInfo(roleId) {
        let $this = this;
        let service = $this.injector.get('roleManagerService');
        if(roleId) {
            service.getDataInfo(
                {
                    roleId: roleId
                }
            ).then((res) => {
                if(res.status === 200) {
                    if(res.data.status === 0) {
                        let $this = this;
                        new addModal($this.injector,res.data.data).$promise.then((res) => {
                            if(res===1){
                                $this.getAuthList();
                                // new toast(this.injector, {
                                //     str: '修改成功',
                                //     position: 'right-top'
                                // }).success();
                                this.toaster.pop({type:'success',title:'修改成功'});

                            }else if(res===2) {
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

    //根据ID删除角色信息
    getDeleteData(id) {
        let $this = this;
        let service = $this.injector.get('roleManagerService');
        $this.selectedArray = [];
        $this.selectedArray.push(id);
        let ids = [$this.selectedArray[0].roleId];//2018-06-28:fix--修复删除角色接口传参不对的问题
            service.getDeleteData(
                {
                    ids: ids
                }
            ).then((res) => {
                if(res.status === 200) {
                    if(res.data.status === 0) {
                        $this.getAuthList();
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
    deleteClick(id){
        let $this = this;
        $this.injector.get('puiModal').confirm({
            title: '删除提示',
            content: '是否删除该条记录'
        }).then(() => {
            this.getDeleteData(id);
        });
    }

    //修改按钮点击事件
    updateClick({roleId}){
        let $this = this;
        this.getAuthInfo(roleId);
    }

    changePage() {
        this.getAuthList();
    }
}
