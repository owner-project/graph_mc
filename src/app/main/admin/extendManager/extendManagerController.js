import moment from 'moment'
export class ExtendManagerController {
    constructor($injector, $scope,toaster,extendManagerService,$state) {
        'ngInject';
        this.$injector = $injector;
        this.$scope = $scope;
        this.toaster = toaster;
        this.extendManagerService = extendManagerService;
        this.$state = $state
        // 页面的配置
        this.data = {
            hasSearch:true,
            searchContent:'',
            hideIndex:true,
            hasDelete:true,
            hasExtend:true,
            emptySearch:true,
            showTotalCount:true,
            allSelected:false,
            //下拉的属性选择
            extendSelected:-1,
            extendOption:[
                {value: -1, name: '全部'},
                {value: 1, name: '已配置'},
                {value: 0, name: '未配置'},
            ],
            theadList: [
                {
                    name: '扩展项名称',
                    size: 'normal'
                },
                {
                    name: '关系规则说明',
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
                    name: '状态',
                    size: 'normal'
                }
            ],
            tbodyList:[
                {
                    key:'nodeName',
                    size: 'normal'
                },
                {
                    key:'ruleDes',
                    size: 'normal',
                    showTooltip:true,
                    className:'lang-string'
                },
                {
                    key:'createTime',
                    size: 'normal'
                },
                {
                    key:'updateDate',
                    size: 'normal'
                }
            ]
        }
        // table的配置
        this.pageParam = {
            pageNo: 1,
            pageSize: 20,
            total: 0
        }
        this.getExtendList()
    }
    getExtendList(pageNo = 1){
        let params = {
            currPage: pageNo,
            pageSize:20,
            search:this.data.searchContent,
            isSelect:Number(this.data.extendSelected),
            nodeId:this.$state.params.departId
        }

        this.extendManagerService.getExtendPage(params).then(res => {
            if(res.data.code == 0){
                this.data.dataList  = res.data.result.content.map(item => {
                    item.createTime = moment(item.createTime).format('YYYY-MM-DD hh:mm:ss');
                    item.updateDate = moment(item.updateDate).format('YYYY-MM-DD hh:mm:ss')
                    return item
                });
                this.pageParam = {
                    pageNo:pageNo,
                    pageSize:20,
                    total:res.data.result.totalElements
                }
            }
        })
    }
    // 就是 onsearch
    myKeyup(event){
        this.getExtendList(1)
    }
    //更新关系 
    updateExtend(status){
        let selectExtendList = this.data.dataList.filter(item => item.selected);
        if(selectExtendList.length == 0){
            this.toaster.warning('请选择扩展项');
            return false;
        }
        let params = selectExtendList.map(item => {return {id:item.id,enable:status}})
        this.extendManagerService.changeExtendStatus(params).then(res => {
            if(res.data.code ==0){
                this.toaster.success('更新关系成功');
                this.getExtendList(this.pageParam.pageNo);
                this.data.allSelected = false;
            }
            else{
                this.toaster.warning(res.msg || '操作失败,请稍后重试');
                this.data.allSelected = false;
                this.selectAll()
            }
        })
    }
    //
    extendSelectChange(event){
        this.pageParam.pangeNo = 1;
        this.data.allSelected = false;
        this.getExtendList(this.pageParam.pageNo)
    }
    // 分页改变
    changePage(){
        this.data.allSelected = false;
        this.getExtendList(this.pageParam.pageNo)
    }
    //全选
    selectAll(){
        this.data.dataList.forEach(element => {
            element.selected = this.data.allSelected
        });
    }
}