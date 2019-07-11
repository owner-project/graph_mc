/**
 * @description 左侧菜单组件
 */
class recordLeftMenuController{
    constructor($injector, $scope,toaster){
        'ngInject';
        this.$scope = $scope;
        this.injector = $injector;
        this.toast = toaster;
        this.peopleService =  this.injector.get('peopleService')
        this.$state = this.injector.get('$state');
        this.$util = this.injector.get('util');
        this.searchWord = '';
        // 每页请求的数量
        this.PAGE_COUNT = 20;
        this.leftMenuDataList = []
        this.selectedRecord = null;
        // 右侧菜单所有数据 map结构
        this.rightMenuDataMap =  {};
        this.ISSEARCHED = false;
        this.ISSHOWSEARCHFROMSERVER = false;
        // this.selectedLeftItem = this.leftMenuDataList[0];
        // 右侧菜单当前数据赋值 初始值
        this.rightMenuData  = []
    }

    $onInit(){
        // 初始化的时候进行的请求  判断是否从图析页面跳入
        if(this.$state.params.key === 'fromGraph'){
            let keyList =  JSON.parse(localStorage.getItem('porpoiseNodeIds'));
            // localStorage.removeItem('porpoiseNodeIds');
            this.initLoadMenu(keyList,true)
        }
        else{
            if(this.$state.params.type !== 'normal'){
                let searchWord = `${this.$state.params.type}/${this.$state.params.key}`;
                this.initLoadMenu(searchWord,true,true)
            }else{
                this.initLoadMenu(this.searchWord)
            }
        }
        // 设置菜单的高度,防止超出滚动
        let mainViewHeight = angular.element('.main-view').height();
        angular.element('#record-left-menu-component').height(`${mainViewHeight}px`)
    }
    // 进行本地搜索
    onSearch(e){
        let keyWord = this.searchWord;
        this.ISSHOWSEARCHFROMSERVER = false;
        if(!this.ISSEARCHED){
            this.ISSEARCHED = true;
            this.oldRightMenuDataMap = _.cloneDeep(this.rightMenuDataMap);
            this.oldLeftMenuDataList = _.cloneDeep(this.leftMenuDataList);
        }
        if(!keyWord){
            if(!(e.type =='click' && !$(e.currentTarget).hasClass('focus'))){
                this.toast.warning('请输入关键字')
                setTimeout(() => {
                    if(e.type =='click'){
                        $(e.currentTarget).find('input').trigger('focus');
                    }else{
                        $(e.currentTarget).trigger('focus');
                    }
                })
            }
            return false;
        }
        let newRightMenuDataMap = {}
        let newLeftMenuDataList = [];
        this.oldLeftMenuDataList.forEach(entityItem => {
            let entityType = entityItem.type
            if(entityItem.isInit && this.oldRightMenuDataMap[entityType].length > 0){
                let filterTypeList = this.oldRightMenuDataMap[entityType].filter(item => {
                    return item.name && item.name.indexOf(keyWord) !== -1 || item.key && item.key.indexOf(keyWord) !== -1;
                });
                if(filterTypeList.length > 0){
                    newRightMenuDataMap[entityType] = filterTypeList;
                    let newEntityItem = _.cloneDeep(entityItem);
                    newLeftMenuDataList.push(newEntityItem);
                }
            }
        })

        this.rightMenuDataMap = newRightMenuDataMap;
        this.leftMenuDataList = newLeftMenuDataList;
        if(newLeftMenuDataList.length >0){
            this.selectedLeftItem = newLeftMenuDataList[0]
            this.rightMenuData = newRightMenuDataMap[this.selectedLeftItem ['type']] || [];
            this.selectedLeftItem.isEnd = true;
        }else{
            this.selectedLeftItem = null;
            this.rightMenuData  = [];
        }
    }
    //全局搜索,点击搜索框中的全局搜索时触发
    searchFromServer(){
        this.ISSEARCHED = false;
        this.ISSHOWSEARCHFROMSERVER = false;
        this.initLoadMenu(this.searchWord)
    }
    // searchBar 点击关闭 清空输入框时
    searchOnClose(event){
        if(this.ISSEARCHED){
            this.rightMenuDataMap = this.oldRightMenuDataMap;
            this.leftMenuDataList = this.oldLeftMenuDataList;
            this.selectedLeftItem = this.leftMenuDataList[0];
            this.rightMenuData = this.rightMenuDataMap[this.selectedLeftItem ['type']];
        }
    }
    // searchBar 发生改变 change的时候
    searchOnChange($event){
        this.ISSHOWSEARCHFROMSERVER = true;
        if(this.ISSEARCHED && $event === '' ){
            this.searchOnClose($event)
        }
    }
    searchOnFocus($event){
        this.ISSHOWSEARCHFROMSERVER = true;
    }
    /**
     * @description 选择左侧菜单
     */
    selectLeftMenu(item,excludeDangan = false,selectOne = false){
        if(!item){
            this.rightMenuData = [];
            this.selectedLeftItem = null;
            return false
        }
        this.selectedLeftItem = item;
        if(!item.isInit){
            this.loadSelectType(item).then((result)=> {
                item.total = result.total;
                item.isEnd = item.pageNo * this.PAGE_COUNT >= result.total? true:false;
                this.rightMenuDataMap[this.selectedLeftItem.type] = result.list;
                this.rightMenuData = this.rightMenuDataMap[this.selectedLeftItem.type] || [];
            })
        }else{
            this.rightMenuData = this.rightMenuDataMap[this.selectedLeftItem.type] || [];
            if(typeof excludeDangan === 'boolean' && excludeDangan){
                this.selectRecord(this.rightMenuData[0])
            }
            if(selectOne){
                this.selectGeneralize = false;
                this.selectedRecord = this.rightMenuData[0]
            }
            if(typeof excludeDangan === 'object' && excludeDangan){
                this.selectRecord(excludeDangan)
            }
        }
    }
    /**
     * @description 选择具体档案
     */
    selectRecord(record){
        if(!record){
            return false;
        }
        this.selectGeneralize = false;
        let  selectType = this.selectedLeftItem.type
        this.$state.transitionTo('main.file',{key:record.key,type:selectType}, {
            reload: false,
            inherit: false,
            notify: false,
            location: 'replace',
        }).then(resolve => {
            this.selectedRecord = record;
            this.onSelectRecord({record:record,type:selectType})
        });

    }

    /**
     * @description  加载更多
     */
    loadMore(){
        if(this.rightMenuData.isEnd){
            return false
        }
        this.selectedLeftItem.pageNo = this.selectedLeftItem.pageNo?  this.selectedLeftItem.pageNo+1 :'1'
        // 加载的逻辑
        this.loadSelectType(this.selectedLeftItem ).then((result) => {
            this.selectedLeftItem.total = result.total;
            this.selectedLeftItem.isEnd = this.selectedLeftItem.pageNo * this.PAGE_COUNT >= result.total ? true:false;
            this.rightMenuDataMap[this.selectedLeftItem.type]=this.rightMenuDataMap[this.selectedLeftItem.type].concat(result.list);
            this.rightMenuData = this.rightMenuDataMap[this.selectedLeftItem.type] || [];
        })

    }
    /**
     * @description 加载type类型 加载更多
     */
    loadSelectType(item){
        return new Promise((resolve,reject) => {
            this.$util.innerLoadingStart('menu-main','#24263C');
            let pageNo = item.pageNo?item.pageNo:'1';
            this.peopleService.getLeftMenuInfo({
                type:item.type,
                keyword:this.searchWord?[].concat(this.searchWord):[],
                pageNo:pageNo,
                pageSize:this.PAGE_COUNT
            }).then(res => {
                this.$util.innerLoadingEnd()
                if(res.data.status == 0){
                    item.isInit = true;
                    let total = res.data.data[0]['total']
                    let list = res.data.data[0]['data'];
                    resolve({total,list})
                }else{
                    reject()
                }
            })
        })

    }
    /**
     * @description 初识化数据  搜索时候 
     * @param excludeDangan 是否从档案跳入
     * @param selectOne 是否需要选择一个,但是不触发事件
     */
    initLoadMenu(keyword ='',excludeDangan=false,selectOne=false){
        let isFromGraph = this.$state.params.key === 'fromGraph';
        // 当从其他地方跳过来的时候,分页的大小进行调整
        let pageSize = this.PAGE_COUNT;
        if(isFromGraph){
            pageSize = keyword.length > pageSize? keyword.length:pageSize;
        }
        this.$util.innerLoadingStart('menu-main','#24263C');
        this.peopleService.getLeftMenuInfo({
            type:'',
            keyword:[].concat(keyword),
            pageNo:'1',
            pageSize:pageSize,
            excludeDangan:excludeDangan
        }).then(res => {
            this.$util.innerLoadingEnd()
            if(res.data.status == 0){
                let dataList = res.data.data;
                let fromGraph = Array.isArray(keyword)
                if(fromGraph){
                    var graphFirstKey = keyword[0].split('/')[1]
                }
                let dataMap = {};
                let menuList = [];
                let selectLeftData = null;
                let selectRightData = null;
                dataList.forEach(item => {
                    let pageNo = item.pageNo || 1;
                    let listItem = {
                        name:item.name,
                        type:item.type,
                        pageNo:pageNo,
                        isEnd:excludeDangan?true:pageNo * this.PAGE_COUNT >= item.total ? true:false,
                    }
                    // 如果有数据的情况下
                    if(item.data && item.data.length != 0){
                        listItem.isInit = true;
                        // 如果是跳转进来或者搜索keyword不为空 数组是push  否则有数据的放到前面
                        (fromGraph || keyword)?menuList.push(listItem):menuList.unshift(listItem)

                        dataMap[item.type] = item.data;
                        //如果是跳转进来的 去判断第一项数据是否存在
                        if(fromGraph){
                         let filterData = item.data.filter(subItem => subItem.key == graphFirstKey)
                         if(filterData.length > 0){
                             selectLeftData = listItem;
                             selectRightData = filterData[0]
                         }
                        }
                    }else{
                        listItem.isInit = false;
                        menuList.push(listItem)
                    }

                })
                    this.leftMenuDataList = menuList;
                    this.rightMenuDataMap = dataMap;
                    // 此处 selectLeftData 为了表示从档案跳入时默认选中第一项的左侧的类型
                    // selectRightData 从档案跳入选中右侧
                    this.selectLeftMenu(selectLeftData || this.leftMenuDataList[0],selectRightData || fromGraph?true:false,selectOne);
            }
        })
    }
    /**
     * @description  选择概览时的操作
     */
    handleSelectGeneralize(){
        this.selectGeneralize = true;
        this.$state.transitionTo('main.file',
        {key:'fromInit',type:'normal'},{
            reload: false,
            inherit: false,
            notify: false,
            location: 'replace',
        }
        )
        this.selectedRecord = null;
    }

}


export const recordLeftMenuComponent = {
    bindings:{
        selectGeneralize:'=',
        onSelectRecord:'&',
        isJump:'=',
        showGeneralize:'=',
        showSearch:'='
    },
    controller: recordLeftMenuController,
    controllerAs: 'recordMenu',
    templateUrl: 'app/main/people/recordLeftMenu/recordLeftMenu.component.html',
};