export class AssetManagerController {
    constructor($injector, $scope) {
        'ngInject';
        this.injector = $injector;
        this.$scope = $scope;
        this.$state = $injector.get('$state');
        this.init();
    }

    init() {
        let $this = this;
        $this.pageParam = {
            pageNo: 1,
            pageSize: 10,
            total: 0
        }
        this.data = {
            allSelected: false,

            hasDateSearch: false,
            hasSearch: true,
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
                    name: '源数据名称',
                    size: 'normal'
                },
                {
                    name: '更新时间',
                    size: 'normal'
                },
                {
                    name: '数量',
                    size: 'normal'
                }
            ],

            tbodyList: [
                {
                    key: 'pname',
                    size: 'normal'
                },
                {
                    key: 'updateDate',
                    size: 'normal'
                },
                {
                    key: 'num',
                    size: 'normal'
                }
            ]
        };
        this.selectedArray = [];
        this.getAuthList();
    }

    selectAll() {
        this.data.dataList.forEach((item) => {
            item.selected = this.data.allSelected;
        });
    }

    //获取角色列表
    getAuthList() {
        let $this = this;
        let service = $this.injector.get('assetManagerService');
        service.getSourceData(
            {
                pageNo: $this.pageParam.pageNo,
                pageSize: $this.pageParam.pageSize,
                pname: $this.data.searchContent
            }
        ).then((res) => {
            this.injector.get('util').loadingEnd();
            if (res.status === 200) {
                if (res.data.status === 0) {
                    this.data.dataList = res.data.data.list;
                    this.pageParam.total = res.data.data.total;
                }
            }
        });
    }

    myKeyup() {
        this.pageParam.pageNo = 1;
        this.getAuthList();
    }

    myClose(){
        this.pageParam.pageNo = 1;
        this.data.searchContent = "";
        this.getAuthList();
    }
    changePage() {
        this.getAuthList();
    }


}
