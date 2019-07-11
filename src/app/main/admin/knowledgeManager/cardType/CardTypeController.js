import addModal from './modal/modal';
// import toast from '../../../../components/modal/toast/toast';
export class CardTypeController {
    constructor($injector, $scope) {
        'ngInject';
        this.injector = $injector;
        this.toaster = this.injector.get('toaster')
        this.$scope = $scope;
        this.$state = $injector.get('$state');
        this.selectAll = this.selectAll.bind(this);
        this.init();
    }

    init() {
        let $this = this;
        $this.pageParam = {
            pageNo: 1,
            pageSize:10,
            total : 0
        }
        this.data = {
            allSelected: false,

            hasDateSearch: false,
            hasSearch: true,
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
                    name: '身份证规则编号',
                    size: 'normal'
                },
                {
                    name: '身份证规则名称',
                    size: 'normal'
                },
                {
                    name: '规则内容',
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
                    key: 'ruleId',
                    size: 'normal'
                },
                {
                    key: 'ruleName',
                    size: 'normal'
                },
                {
                    key: 'ruleContent',
                    size: 'normal'
                },
                {
                    key: 'createDate',
                    size: 'normal'
                },
                {
                    key: 'updateDate',
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
        let service = $this.injector.get('cardTypeService');
            service.getDataList(
                {
                  pageNo: $this.pageParam.pageNo,
                  pageSize: $this.pageParam.pageSize,
                    searchContent:$this.data.searchContent
                }
            ).then((res) => {
                this.injector.get('util').loadingEnd();
                if(res.status === 200) {
                    if(res.data.status === 0) {
                        this.data.dataList = res.data.data.list;
                        this.pageParam.total = res.data.data.total;
                    }
                }
            });
    }

    //根据ID获取角色信息
    getAuthInfo(roleId) {
        console.log(roleId);
        let $this = this;
        let service = $this.injector.get('cardTypeService');
        if(roleId) {
            service.getDataList(
                {
                    id: roleId,
                }
            ).then((res) => {
                if(res.status === 200) {
                    if(res.data.status === 0) {
                        console.log(res);
                        let $this = this;
                        //console.log($this.injector,res.data.data);
                        new addModal($this.injector,res.data.data.list[0]).$promise.then((res) => {
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
        let service = $this.injector.get('cardTypeService');
        $this.selectedArray = [];
        $this.selectedArray.push(id);
        let ids = $this.selectedArray;
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
    updateClick({id}){
        let $this = this;
        this.getAuthInfo(id);
    }

    myKeyup() {
        this.pageParam.pageNo = 1;
        this.getAuthList();
    }

    changePage() {
        this.getAuthList();
    }
}
