import addModal from './modal/modal';
// import toast from '../../../../components/modal/toast/toast';
export class PeopleTypeController {
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
            pageSize:20,
            total : 0
        }
        this.data = {
            allSelected: false,

            hasDateSearch: false,
            hasSearch: true,
            hasEditTop: true,
            hasAdd: true,
            hasDelete: false,
            tableLayout:'fixed',
            hasOp: true,
            opStyle:{
                width:'120px',
                'min-width':'120px'
            },
            hasMemberOp: false,

            theadList: [
                {
                    name: '序号',
                    size: 'small'
                },
                {
                    name: '类型编号',
                    size: 'normal'
                },
                {
                    name: '类型名称',
                    size: 'normal',
                    style:{
                        width:'18%'
                    }
                },
                {
                    name: '规则描述',
                    size: 'normal',
                    style:{
                        width:'18%'
                    }
                },
                {
                    name: '来源表',
                    size: 'normal',
                    style:{
                        width:'18%'
                    }
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
                    size: 'op',
                    style:{
                        width:'120px',
                        'min-width':'120px'
                    }
                }
            ],

            tbodyList: [
                {
                    key: 'typeId',
                    size: 'normal'
                },
                {
                    key: 'typeName',
                    size: 'normal',
                    className:"one-line-show",
                    showTooltip:true,
                },
                {
                    key: 'ruleDesc',
                    size: 'normal',
                    className:"one-line-show",
                    showTooltip:true,

                },
                {
                    key: 'tableName',
                    size: 'normal',
                    className:"one-line-show",
                    showTooltip:true,
                },
                {
                    key: 'createData',
                    size: 'normal'
                },
                {
                    key: 'updateData',
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

    //获取角色列表
    getAuthList() {
        let $this = this;
        let service = $this.injector.get('peopleTypeService');
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
        let service = $this.injector.get('peopleTypeService');
        if(roleId) {
            service.getDataList(
                {
                    id: roleId,
                }
            ).then((res) => {
                if(res.status === 200) {
                    if(res.data.status === 0) {
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
        let service = $this.injector.get('peopleTypeService');
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
    deleteClick({id}){
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
    myClose(){
        this.pageParam.pageNo = 1;
        this.data.searchContent = "";
        this.getAuthList();
    }
    myKeyup() {
        this.pageParam.pageNo = 1;
        this.getAuthList();
    }

    changePage() {
        this.getAuthList();
    }
}
