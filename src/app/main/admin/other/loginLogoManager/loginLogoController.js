import importModal from './import/modal'
// import toast from '../../../../components/modal/toast/toast';

export class loginLogoController {
    constructor($injector, $scope,$state,toaster) {
        'ngInject';
        this.injector = $injector;
        this.toaster = toaster
        this.otherManagerService = $injector.get('otherManagerService');
        this.$scope = $scope;
        this.$state = $state;
        this.selectAll = this.selectAll.bind(this);
        console.log(this.$state)
        // 如果是 7_2为  登录上方logo  否则为左侧logo
        this.sendType = this.$state.params.departId == 'p_7_2'?'loginUpLogo':'loginLeftLogo'
        this.init();
    }

    init() {
        this.pageParam = {
            pageNo: 1,
            pageSize: 20,
            total: 0
        }
        this.selectedArray = [];
        this.data = {
            memberList: [],
            allSelected: false,
            searchContent: "",
            hasDateSearch: false,
            hasEditTop: true,
            hasSearch: false,
            hasAdd: false,
            hasImport: true,
            hasDelete: false,
            hasImg:true,
            loginLogo:true,
            hasOp: false,
            hideIndex: false,
            hasMemberOp: false,

            theadList: [
                {
                    name: '序号',
                    size: 'normal'
                },
                {
                    name: 'logo名称',
                    size: 'normal'
                },
                {
                    name: '创建时间',
                    size: 'normal'
                },
                {
                    name: 'logo预览',
                    size: 'normal'
                },
                {
                    name: '操作',
                    size: 'normal'
                },
            ],

            tbodyList: [
                {
                    key: 'name',
                    size: 'normal'
                },
                {
                    key: 'create_time',
                    size: 'normal'
                },
                
            ]
        };
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
            pageNo: this.pageParam.pageNo,
            pageSize: this.pageParam.pageSize,
            searchContent: this.data.searchContent,
            type:this.sendType
        }
        this.otherManagerService.listsLoginLogo(params).then((result) => {
            this.injector.get('util').loadingEnd();
            if (result.data && result.data.data) {
                this.data.dataList = result.data.data;
                this.pageParam.total = result.data.count;
                defer.resolve(result.data.data.count);
            }
        }, (error) => {
            defer.reject();
        });

        return defer.promise;
    }

    importData() {
        new importModal(this.injector).$promise.then(res => {
            if (res) {
                // new toast(this.injector, {
                //     str: '添加成功',
                //     position: 'right-top'
                // }).success();
                this.toaster.pop({type:'success',title:'添加成功'});
                this.getMemberList();
            }
        });
    }
    selectAll() {
        this.data.dataList.forEach((item) => {
            item.selected = this.data.allSelected;
        });
    }


    //根据ID删除角色信息
    getDeleteData(id) {
        let service = this.injector.get('otherManagerService');
        this.selectedArray = [];
        this.selectedArray.push(id);
        service.deleteLoginLogo(
            {
                id: this.selectedArray[0].id,
                type:this.sendType
            }
        ).then((res) => {
            if (res.status === 200) {
                if (res.data.status === 0) {
                    this.getMemberList();
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
    deleteClick(id) {
        let $this = this;
        $this.getCheckedIds();
        $this.injector.get('puiModal').confirm({
            title: '删除提示',
            content: '是否删除该条记录'
        }).then(() => {
            this.getDeleteData(id);
        });

    }

    //修改按钮点击事件
    updateClick(id) {
        this.setLogo(id);
    }

    //获取已选中的数组Id
    getCheckedIds() {
        this.selectedArray = [];
        this.data.dataList.forEach((item) => {
            if (item.selected) {
                this.selectedArray.push(item.sfzh)
            }
        });
    }

    //根据ID获取用户信息
    setLogo(id) {
        let $this = this;
        let service = $this.injector.get('otherManagerService');
        $this.getCheckedIds();
        $this.injector.get('puiModal').confirm({
            title: '设置提示',
            content: '是否设置该图片为logo'
        }).then(() => {
            this.selectedArray = [];
            this.selectedArray.push(id);
            service.setShowLoginLogo({
                "id": this.selectedArray[0].id,
                "status":"1",
                type:this.sendType
            }).then((res) => {
            if (res.status === 200) {
                if (res.data.status === 0) {
                    this.getMemberList();
                    // new toast(this.injector, {
                    //     str: '设置成功',
                    //     position: 'right-top'
                    // }).success();
                    this.toaster.pop({type:'success',title:'设置成功'});
                }
            }
        });
        });
    }

    changePage() {
        this.getMemberList();
    }
}
