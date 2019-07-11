import addMemberModal from './modal/modal';

export class AuthManagerController {
    constructor($injector, $scope) {
        'ngInject';
        this.injector = $injector;
        this.$scope = $scope;
        this.$state = $injector.get('$state');
        this.selectAll = this.selectAll.bind(this);
        this.init();
    }

    init() {
        this.pageParam = {
            pageNo: 1,
            pageSize:20,
            total : 0
        }
        this.data = {
            allSelected: false,

            hasDateSearch: false,
            hasSearch: false,
            hasEditTop: false,
            hasAdd: false,
            hasDelete: false,

            hasOp: false,
            hasMemberOp: false,

            theadList: [
                {
                    name: '序号',
                    size: 'small'
                },
                {
                    name: '权限名称',
                    size: 'normal'
                },
                {
                    name: '权限标签',
                    size: 'normal'
                },
                {
                    name: '创建时间',
                    size: 'normal'
                },
                {
                    name: '更新时间',
                    size: 'normal'
                }
            ],

            tbodyList: [
                {
                    key: 'permissionName',
                    size: 'normal'
                },
                {
                    key: 'permissionNote',
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
        new addMemberModal(this.injector).$promise.then((res) => {
            $this.getAuthList();
        });
    }

    selectAll() {
        this.data.dataList.forEach((item) => {
            item.selected = this.data.allSelected;
        });
    }

    //获取权限列表
    getAuthList() {
        let $this = this;
        let service = $this.injector.get('authManagerService');
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
                        this.data.dataList = res.data.data.list;
                        this.pageParam.total = res.data.data.total;
                    }
                }
            });
    }

    //根据ID获取权限信息
    getAuthInfo(permissionId) {
        let $this = this;
        let service = $this.injector.get('authManagerService');
        if(permissionId) {
            service.getDataInfo(
                {
                    permissionId: permissionId
                }
            ).then((res) => {
                if(res.status === 200) {
                    if(res.data.status === 0) {
                        let $this = this;
                        new addMemberModal(this.injector, res.data.data).$promise.then((res) => {
                            $this.getAuthList();
                        });
                    }
                }
            });
        }
    }

    //根据ID删除权限信息
    getDeleteData() {
        let $this = this;
        let service = $this.injector.get('authManagerService');
        let ids = $this.selectedArray;
            service.getDeleteData(
                {
                    ids: ids
                }
            ).then((res) => {
                if(res.status === 200) {
                    if(res.data.status === 0) {
                        $this.getAuthList();
                    }
                }
            });
    }

    //删除按钮点击事件
    deleteClick(){
        let $this = this;
        this.getSelectedArray();
        this.getDeleteData();
    }
    myClose(){
        this.pageParam.pageNo = 1;
        this.data.searchContent = "";
        this.getAuthList();
    }
    //修改按钮点击事件
    updateClick({id}){
        let $this = this;
        this.getSelectedArray();
        if($this.selectedArray.length==1){
            this.getAuthInfo($this.selectedArray[0]);
        }
    }

    //获取选中Id集合
    getSelectedArray(){
        let $this = this;
        $this.selectedArray.splice(0,$this.selectedArray.length)
        angular.forEach(this.data.dataList, function(data,index,array){
            if(data.selected){
                $this.selectedArray.push(data.permissionId);
            }
        });
    }

    changePage() {
        this.getAuthList();
    }
}
