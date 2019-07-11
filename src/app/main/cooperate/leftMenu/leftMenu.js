/**
 * @description 左侧菜单组件
 */
class leftMenuController {
  constructor($injector, $scope){
    'ngInject';
    this.$scope = $scope;
    this.injector = $injector;
    this.$state = this.injector.get('$state');
    this.$util = this.injector.get('util');
    this.cooperateService =  this.injector.get('cooperateService')
    this.pager = {
      pageNo: 1,
      pageSize: 10,
      total: 0
    };
    this.search = {
        folderId: '',
        searchContent: {
            content: null
        },
        chooseType: 1
    };
    this.leftMenuDataList = [{
      name: '我的',
      chooseType: 1
    }, {
      name: '推送',
      chooseType: 2
    }, {
      name: '分享',
      chooseType: 3
    }];
    this.hasTemplateFile = false;
    this.currentFolder = []
    this.init()
  }
  init () {
    if (localStorage.getItem('templateGraphShot')) {
      this.hasTemplateFile = true;
      this.templateFile = JSON.parse(localStorage.getItem('templateGraphShot'));
      this.leftMenuDataList.push({
        name: '临时',
        chooseType: 4
      })
    }
  }
  $onChanges(changeObj) {
    let folderList = changeObj.folderList.currentValue.folder
    let fileList = changeObj.folderList.currentValue.file
    this.selectRightMenu(folderList, fileList, this.currentFolder)
  }
  /**
   * @description 选择右侧菜单
   */
  selectRightMenu (folderList, fileList, currentFolder) {
    if (folderList) {
      folderList.forEach(folder => {
        currentFolder.push({
          name: folder.name,
          children: [],
          parentId: ''
        })
      })
      currentFolder[0].expand = true
      currentFolder[0].class = 'active'
      this.search.folderId = folderList[0].id
      this.getData()
    }
    if (fileList) {
      fileList.forEach(file => {
        currentFolder.push({
          name: file.themeName
        })
      })
    }
  }
  /**
   * @description 选择左侧菜单
   */
  selectLeftMenu(item) {
    if (!item) {
      return false
    }
    this.search.chooseType = item.chooseType;
    this.changeTab({
      chooseType: item.chooseType
    })
  }
  getData() {
    const params = {
      pageSize: this.pager.pageSize,
      pageNo: this.pager.pageNo,
      searchContent: angular.copy(this.search.searchContent),
      type: 'graphshot',
      id: this.search.folderId,
      graphShotType: this.search.chooseType
    };
    this.cooperateService.getFolder(globalLoading(params)).then((res) => {
      if(res.status === 200) {
        if(res.data.status === 0) {
          //this.selectRightMenu(res.data.data.folder, res.data.data.file, this.currentFolder[0].children)
        }
      }
    });
  }
}

export const leftMenuComponent = {
    bindings: {
      folderList: '<',
      changeTab: '&'
    },
    controller: leftMenuController,
    controllerAs: 'leftMenu',
    templateUrl: 'app/main/cooperate/leftMenu/leftMenu.html'
}