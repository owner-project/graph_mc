export class LogManagerController {
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
            pageSize: 20,
            total: 0
        }
        $this.data = {
            startTime: null,
            endTime: null,
            searchContent: "",
            dataList: '',
            currentDate: new Date().getTime(),

            hasDateSearch: true,
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
                    name: '操作人',
                    size: 'normal'
                },
                {
                    name: '所属部门',
                    size: 'normal'
                },
                {
                    name: '操作',
                    size: 'normal'
                },
                {
                    name: '操作时间',
                    size: 'normal'
                },
                {
                    name: '操作参数',
                    size: 'normal'
                },
                {
                    name: '结果',
                    size: 'normal'
                }
            ],

            tbodyList: [
                {
                    key: 'operator',
                    size: 'normal'
                },
                {
                    key: 'departmentName',
                    size: 'normal'
                },
                {
                    key: 'operate',
                    size: 'normal'
                },
                {
                    key: 'operateTime',
                    size: 'normal'
                },
                {
                    key: 'operateParam',
                    size: 'normal'
                },
                {
                    key: 'result',
                    size: 'normal'
                }
            ]
        }
        $this.getLogList();
    }

    search_submit_title() {
        let $this = this;
        $this.pageParam.pageNo = 1;
        $this.getLogList()
    }

    selectAll() {
        this.data.dataList.forEach((item) => {
            item.selected = this.data.allSelected;
        });
    }

    search_submit() {
        let $this = this;
        $this.getLogList()
    }

    myKeyup() {
        this.pageParam.pageNo = 1;
        this.getLogList();
    }
    myClose(){
        this.pageParam.pageNo = 1;
        this.data.searchContent = "";
        this.getLogList();
    }
    getLogList() {
        let $this = this;
        let service = $this.injector.get('logManagerService');
        service.getDataList(
            {
                pageNo: $this.pageParam.pageNo,
                pageSize: $this.pageParam.pageSize,
                startDate: $this.data.startTime,
                endDate: $this.data.endTime,
                searchContent: $this.data.searchContent
            }
        ).then((res) => {
            this.injector.get('util').loadingEnd();
            if (res.status === 200) {
                if (res.data.status === 0) {
                    $this.data.dataList = res.data.data.list;
                    $this.pageParam.total = res.data.data.total;
                }
            }
        });
    }

    changePage() {
        this.getLogList();
    }

}
