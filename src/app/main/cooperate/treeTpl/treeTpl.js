import pushJudgeModal from '../push/modal';
import selectFolderModal from '../selectFolder/modal';
/**
 * @description 左侧树结构
 */
class treeTplController {
  constructor($injector, $scope, $timeout){
    'ngInject';
    this.$scope = $scope;
    this.injector = $injector
    this.toaster = this.injector.get('toaster')
    this.$timeout = $timeout
    this.$state = this.injector.get('$state')
    this.$util = this.injector.get('util')
    this.cooperateService = this.injector.get('cooperateService')
    this.treePager = {
      pageNo: 1,
      pageSize: 10,
      total: 0
    }
    this.search = {
      folderId: '',
      searchContent: {
        content: ''
      }
    }
    this.childTotal = 0
    if (this.currentFolder.children && this.currentFolder.children.length >= 0) {
      this.childTotal = this.currentFolder.children.filter(f => f.type === 'file').length
    }
  }
  // 点击三个点显示操作
  showOperationFunc (e) {
    e.stopPropagation()
    let eleParent = angular.element(e.target).parents('.list-right')
    let ele = angular.element(e.target).parent('.tree-body').find('.operation-list')
    eleParent.find('.operation-list').removeClass('active')
    ele.addClass('active')
    $(document.body).bind('click', () => {
      if (eleParent.find('.operation-list.active').length > 0) {
        eleParent.find('.operation-list').removeClass('active')
      } else {
        $(document.body).unbind('click')
      }
    });
  }
  // 点击节点，展开树
  expandFolder (e) {
    if (this.currentFolder.type === 'folder' && this.currentFolder.expand) {
      if (this.currentFolder.parentId === '') {
        this.currentFolder.expand = false
      }
      this.selectTreeItem({
        currentFolder: {
          type: 'folder',
          id: this.currentFolder.parentId
        }
      })
    } else {
      this.selectTreeItem({
        currentFolder: this.currentFolder
      })
    }
  }
  selectFolder (currentFolder) {
    this.selectTreeItem({
      currentFolder: currentFolder
    })
  }
  delete(e, file) {
    e.stopPropagation()
    if (file.type === 'folder') {
      this.deleteFolder(e, file)
    } else {
      this.deleteFile(e, file)
    }
  }
  // 删除图析
  deleteFile (e, file) {
    this.callParentDeleteFile({
      e: e,
      file: file
    })
  }
  // 删除文件夹
  deleteFolder (e, folder) {
    this.callParentDeleteFolder({
      e: e,
      folder: folder
    })
  }
  // 编辑文件/文件夹名称
  edit(e, file) {
    e.stopPropagation()
    this.callParentEditFile({
      e: e,
      file: file
    })
  }

  // 共享
  shareJudge(e, file) {
    e.stopPropagation();
    this.callParentShare({
      e: e,
      file: file
    });
  }
  // 移动
  moveTo(e, file) {
    e.stopPropagation()
    this.callParentMove({
      e: e,
      file: file
    })
  }
  // 推送
  pushJudge(e) {
    e.stopPropagation();
    new pushJudgeModal(this.injector, this.currentFolder).$promise.then((res) => {});
  }
  // 加载更多
  getTreeData() {
    const params = {
      pageSize: this.treePager.pageSize,
      pageNo: this.treePager.pageNo,
      searchContent: angular.copy(this.search.searchContent),
      type: 'graphshot',
      id: this.currentFolder.id,
      graphShotType: this.chooseType
    }
    this.injector.get('util').innerLoadingStart('list-right', '#24263C'); //加载loading
    return new Promise((resolve, reject) => {
      this.injector.get('cooperateService').getFolder(params).then((res) => {
        if(res.status === 200) {
          if(res.data.status === 0) {
            this.injector.get('util').innerLoadingEnd();
            this.treeList = res.data.data
            resolve()
          }
        }
      })
    })
  }

  loadMore () {
    if (this.currentFolder.fileCount < 10) {
      return
    }
    this.treePager.pageNo ++
    this.getTreeData().then(() => {
      this.currentFolder.fileCount = this.treeList.file.length
      if (this.treeList.file) {
        this.treeList.file.forEach(file => {
          var findIndex = _.findIndex(this.currentFolder.children, function(o) { return o.id == file.id; });
          if (findIndex === -1) {
            file.type = 'file'
            this.currentFolder.children.push(file)
          }
        })
      }
    })
  }
}

export const treeTplComponent = {
  bindings:{
    currentFolder: '<',
    chooseType: '<',
    selectTreeItem: '&',
    callParentMove: '&',
    callParentShare: '&',
    callParentDeleteFile: '&',
    callParentDeleteFolder: '&',
    callParentEditFile: '&'
  },
  controller: treeTplController,
  controllerAs: 'leftTree',
  templateUrl: 'app/main/cooperate/treeTpl/treeTpl.html'
};