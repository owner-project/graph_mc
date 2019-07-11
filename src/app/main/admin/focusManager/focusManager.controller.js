import focusManagerMoveToModal from './focusManagerMoveToModal/focusManagerMoveTo.modal';
import focusManagerGroupEditModal from './focusManagerGroupEdit/focusManagerGroupEdit.modal';
import focusManagerReasonEditModal from "./focusManagerReasonEdit/focusManagerReasonEdit.modal";
import focusManagerConfirmModal from "./focusManagerConfirm/focusManagerConfirm.modal"
export class focusManagerController {
    constructor($injector, $scope, toaster, $rootScope,focusManagerService,util,$state){
        'ngInject'; 
        this.$scope = $scope;
        this.toaster = toaster;
        this.injector = $injector;
        this.$util = util;
        this.$rootScope = $rootScope;
        this.$state = $state

        this.searchContent = "";
        this.checkboxValue = false;
        this.focusManagerService = focusManagerService;
        this.selectedGroup = null;
        this.focusList = [];
        this.pageParam = {
            desc:'desc',
            pageSize: 20,
            pageNo: 1,
            total: 0,
        }
        this.init(true)
    }
    // 初始化
    init(force = false) {
        this.pageParam.desc ='desc';
        this.pageParam.pageNo = 1;
        this.searchContent = '';
        this.focusManagerService.getFocusGroup(force).then(res=> {
            this.focusGroup = res.list;
            if(this.focusGroup.length > 0){
                if(this.selectedGroup){
                    let preSelect = this.focusGroup.filter(item => {return item.id == this.selectedGroup.id && item.name == this.selectedGroup.name});
                    if(preSelect.length > 0){
                        this.selectedGroup = preSelect[0];
                    }else{
                        this.selectedGroup = this.focusGroup[0];
                    }
                }else{
                    this.selectedGroup = this.focusGroup[0];
                }
                this.getFocusGroupEntitiesList();
            }else{
                this.selectedGroup = null;
                this.focusList = [];
            }
        })

    }
    // 获取默认图片
    getDefaultImg(tag){
        let type = ''
        switch(tag){
            case '0101':
                type = 'person';
                break
            case '0404':  
                type = 'internetcafe';
                break
            case '0301':  
                type = 'phone';
                break
            case '0201':  
                type = 'vehicle';
                break
            case '1601':  
                type = 'case';
                break
            case '0601':  
                type = 'company';
                break
        }
        if(type == ''){
            return ''
        }
        return `assets/images/theme_star_blue/people/default-${type}.png`
    }
    // 获取关注实体的列表
    getFocusGroupEntitiesList(){
        let  param ={
            groupid:this.selectedGroup.id,
            pageno:this.pageParam.pageNo,
            pagesize:this.pageParam.pageSize,
            keyword:this.searchContent,
            order:this.pageParam.desc
        }
        this.$util.innerLoadingStart('focus-manage','#24263C');
        this.focusManagerService.getFocusGroupEntities(param).then(res => {
            this.$util.innerLoadingEnd()
            if(res.status && res.data.status == 0){
                this.focusList = res.data.data.map(item => {
                    if(item.image){
                        item.image = `data:image/jpg;base64,${item.image}`;
                    }else{
                        item.image = this.getDefaultImg(item.type)
                    }
                    return item;
                });
                this.pageParam.total = res.data.count;
            }else{
                this.toaster('获取失败,请重试');
                this.focusList = [];
                this.pageParam.total = 0;
            }
        }).catch(err => {
            this.$util.innerLoadingEnd()
        })
    }
    // 搜索
    onSearch($event) {
        this.pageParam.pageNo =1;
        this.pageParam.desc = 'desc';
        this.getFocusGroupEntitiesList()
    }
    // 分页改变
    changePage($event) {
        this.getFocusGroupEntitiesList();
    }
    // 选择关注组
    selectFocusGroupHandle(group) {
        if (this.selectedGroup !== group) {
            this.selectedGroup = group;
            this.pageParam.pageNo = 0;
            this.pageParam.desc = 'desc';
            this.searchContent = '';
            this.getFocusGroupEntitiesList();
        }
    }
    // 移动多选实体到分组
    moveFocusTo() {
        let selectEntities = this.focusList.filter(item => {
            return item.isSelected;
        });
        if(selectEntities.length == 0){
            this.toaster.warning('请选择要移动的实体');
            return false;
        }
        new focusManagerMoveToModal(this.injector, selectEntities).$promise.then(res => {
            if(res){
                this.init(true)
            }
        });
    }
    // 取消多选实体关注
    unFocusHandle() {
        let selectEntities = this.focusList.filter(item => {
            return item.isSelected;
        });
        if(selectEntities.length == 0){
            this.toaster.warning('请选择要取消关注的实体');
            return false;
        }
        new focusManagerConfirmModal(this.injector,{title:'取消关注',text:'是否取消关注'}).$promise.then(confirm => {
            if(confirm){
                let params ={
                    data:selectEntities.map(item => item.id),
                    operateType:'delete'
                }
                this.focusManagerService.focusEntityListHandle(params).then(res => {
                    if(res.status == 200 && res.data.status == 0){
                        this.toaster.success('操作成功');
                        this.init(true)
                    }else{
                        this.toaster.error(res.data.message || '后台异常,请重试');
                        
                    }
                })
            }
        })
    }
    // 创建新分组
    createNewGroup(){
        new focusManagerGroupEditModal(this.injector).$promise.then(groupName => {

        })
    }
    //编辑分组名称
    editSelectGroupName(){
        // 当前选择不能为全部
        new focusManagerGroupEditModal(this.injector,1,this.selectedGroup).$promise.then(groupName => {

        })
    }
    //删除分组
    deleteSelectGroup(){
        new focusManagerConfirmModal(this.injector,{title:"删除分组",text:'确认删除该分组以及分组下所有实体?'}).$promise.then(sure => {
            if(sure){
                let deleteParam = {
                    ids:[this.selectedGroup.id]
                }
                this.focusManagerService.deleteFocusGroup(deleteParam).then(res => {
                    if(res.status ==200 && res.data.status ==0){
                        this.toaster.success('删除成功');
                        this.init(true);
                    }else{
                        this.toaster.error(res.data.message || '后台异常,请重试');
                        
                    }
                })
            }
        })
        
    }

    // 编辑实体关注的理由
    editFocusEntity(entity) {
        new focusManagerReasonEditModal(this.injector).$promise.then(reason => {
            if(reason && reason !== '' && reason.trim() !== ''){
                let params = {
                    data:{
                            id:entity.id,
                            type:entity.type,
                            focusid:entity.focusid,
                            desc:reason,
                            groupid:entity.groupid,
                        },
                    operateType:'update'
                }
                this.focusManagerService.focusEntityListHandle(params).then(res => {
                    if(res.status == 200 && res.data.status == 0){
                        this.toaster.success('操作成功')
                        entity.desc = reason;
                    }else{
                        this.toaster.error(res.data.message || '后台异常,请重试');
                    }
                })
            }
        })

        console.log(entity)
    }
    // 移动实体到分组
    moveFocusEntityTo(entity) {
        // 移动完实体需要进行初始化获取分组和分组下实体
        let list =[
            entity
        ]
        new focusManagerMoveToModal(this.injector, list).$promise.then(res => {
            if(res){
                this.init(true)
            }
        });

    }
    // 取消关注实体的操作
    unFocusEntityHandle(entity) {
        new focusManagerConfirmModal(this.injector,{title:'取消关注',text:'是否取消关注'}).$promise.then(confirm => {
            if(confirm){
                console.log(confirm)
                let params = {
                    data:[entity.id],
                    operateType:'delete'
                }
                this.focusManagerService.focusEntityListHandle(params).then(res => {
                    if(res.status == 200 && res.data.status == 0){
                        this.toaster.success('操作成功');
                        this.init(true)
                    }else{
                        this.toaster.error(res.msg || '后台异常,请重试');
                    }
                })
            }
        })
    }
    //跳转到图析 
    jumpToRelation(entity){
        localStorage.setItem("isToGis",false)
        const stateData =  { type: 'normal', id: encodeURIComponent(entity.focusid)};
        window.open(this.$state.href('main.porpoise' , stateData), '_blank');
    }
    //跳转到档案
    jumpToRecord(entity){
        const stateData = {
            key: 'fromGraph',
            type: 'normal'
        };
        if (entity.focusid) {
            localStorage.setItem('porpoiseNodeIds', JSON.stringify([entity.focusid]))
            window.open(this.$state.href('main.file', stateData), '_blank');
        }
    }
    //更改排序规则
    changeSort(){
        this.pageParam.desc  = this.pageParam.desc == "desc"?'asc':'desc';
        this.pageParam.pageNo = 1;
        //重新搜索该分组下的数据
        this.getFocusGroupEntitiesList();
    }
}
