import addModal from './modal/modal';
import redManagerImportModal from './import/modal'
// import toast from '../../../components/modal/toast/toast';

export class RedListManagerController {
    constructor($injector, $scope) {
        'ngInject';
        this.injector = $injector;
        this.toaster = this.injector.get('toaster');
        this.adminAPIService = $injector.get('adminAPIService');
        this.$scope = $scope;
        this.$state = $injector.get('$state');
        this.selectAll = this.selectAll.bind(this);
        this.init();
        this.dicData = JSON.parse(localStorage.getItem('dicData'));
        this.rankList = this.dicData.result.user_rank && this.dicData.result.user_rank.map(item => {item.value = item.code;return item})|| [];
        this.userTypeList = this.dicData.result.user_rank  && this.dicData.result.entity_name.map(item => {item.value = item.code;return item}) || [];
        this.rankList.length > 0 && this.rankList.unshift({name:'全部',value:''})
        this.userTypeList.length > 0 && this.userTypeList.unshift({name:'全部',value:''})
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
            // 实体类型  保密级别
            entityType:'',
            secrecyLevel:'',
            searchBarPlaceholder:'请输入实体名称或标识',
            
            hasDateSearch: false,
            hasEditTop: true,
            hasSearch: true,
            hasAdd: true,
            hasImport: true,
            hasDelete: true,
            hasOp: true,
            hideIndex: true,
            hasMemberOp: false,
            isRedManager:true,
            theadList: [
                {
                    name: '实体名称',
                    size: 'normal'
                },
                {
                    name: '实体标识',
                    size: 'normal'
                },
                {
                    name: '实体类型',
                    size: 'normal'
                },
                {
                    name: '最近操作时间',
                    size: 'normal',
                    hasSort:'true',
                    sort:'desc',
                    key:'sort'
                },
                {
                    name: '级别',
                    size: 'normal'
                },{
                    name: '操作',
                    size: 'normal'
                }
            ],

            tbodyList: [
                {
                    key: 'name',
                    size: 'normal'
                },
                {
                    key: 'sfzh',
                    size: 'normal'
                },
                {
                    key: 'entityName',
                    size: 'normal'
                },
                {
                    key: 'utime',
                    size: 'normal'
                },
                {
                    key: 'rankName',
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
        this.data.allSelected = false;
        const params = {
            pageNo: this.pageParam.pageNo,
            pageSize: this.pageParam.pageSize,
            searchContent: this.data.searchContent,
            type:this.data.entityType,
            rank:this.data.secrecyLevel,
            }
        this.data.theadList.forEach(theadItem => {
            if(theadItem.hasSort){
                params[theadItem.key] = theadItem.sort;
            }
        })
        this.adminAPIService.getRedList(params).then((result) => {
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

    selectMember(member) {
        member.selected = !member.selected;
    }

    importData() {
        new redManagerImportModal(this.injector)
        .$promise.then(res => {
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
    // 添加红名单人员
    addMember() {
        new addModal(this.injector).$promise.then((res) => {
            if (res === 1) {
                this.getMemberList();
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

    selectAll() {
        this.data.dataList.forEach((item) => {
            item.selected = this.data.allSelected;
        });
    }
    //搜索功能
    onSearchBtnSearch(){
        this.search_submit_title();
    }
    // 点击table排序
    tableSortClick(sortItem){
        sortItem.sort = sortItem.sort == 'desc'? 'asc':'desc';
        this.getMemberList();
    }

    //根据ID删除角色信息
    getDeleteData(item) {
        let service = this.injector.get('adminAPIService');

        let keys = item? [item.id]:this.selectedArray;
        service.deleteRedList({keys}).then((res) => {
            if (res.status === 200) {
                if (res.data.status === 0) {
                    this.getMemberList();
                    // new toast(this.injector, {
                    //     str: '删除成功',
                    //     position: 'right-top'
                    // }).success();
                    this.toaster.pop({type:'success',title:'删除成功'});

                    this.data.allSelected = false;
                }
            }
        });
    }


    //删除按钮点击事件  可能是上方的 也可能是列表中的删除
    deleteClick(item) {
        let $this = this;
        console.log(item);
        $this.getCheckedIds();
        if(this.selectedArray.length != 0 || item){
            $this.injector.get('puiModal').confirm({
                title: '删除提示',
                content: '是否删除该条记录'
            }).then(() => {
                this.getDeleteData(item);
            });
        }else{
            // new toast(this.injector, {
            //     str: '请至少选择一项进行删除',
            //     position: 'right-top'
            // }).warn();
            this.toaster.pop({type:'warning',title:'请至少选择一项进行删除'});
        }
    }

    //修改按钮点击事件
    // updateClick(id) {
    //     this.getUserInfo(id);
    // }

    //获取已选中的数组Id
    getCheckedIds() {

        this.selectedArray = [];
        this.data.dataList.forEach((item) => {
            if (item.selected) {
                this.selectedArray.push(item.id)
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
    // 编辑按钮
    updateClick(item){
        console.log(item.id)
        new addModal(this.injector,item.id).$promise.then((res) => {
            if(res){
                this.toaster.success('修改成功');
                this.getMemberList();
            }
        })

    }
    changePage() {
        this.getMemberList();
    }
}
