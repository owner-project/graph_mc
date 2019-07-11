import pushJudgeModal from './push/modal';
import addFolderModal from './addFolder/modal';
import editFileModal from './editFile/modal';
import selectFolderModal from './selectFolder/modal';

export class CooperateController {
  constructor($injector, $scope){
      'ngInject';
      this.$scope = $scope;
      this.inject = $injector;
      this.toaster = this.inject.get('toaster')
      // 右侧分页数据
      this.pager = {
          pageNo: 1,
          pageSize: 10,
          total: 0
      };
      // 搜索参数
      this.search = {
          folderId: '',
          searchContent: {
              content: null
          },
          chooseType: 1
      };
      // 左侧树分页数据
      this.treePager = {
        pageNo: 1,
        pageSize: 10,
        total: 0
      }
      // 左侧树菜单
      this.leftMenuDataList = [{
        name: '我的',
        chooseType: 1
      }, {
        name: '推送',
        chooseType: 2
      }, {
        name: '共享',
        chooseType: 3
      }, {
        name: '临时',
        chooseType: 4
      }];
      // 左侧树数据
      this.currentFolder = [1];
      // 当前选中节点
      this.currentSelect = {}
      // 面包屑导航
      this.crumbList = []
      // 是否全选
      this.allSelected = false
      this.init();
  }

  init () {
    this.inject.get('$rootScope').urlData.chooseMenu = 'cooperate';
    this.initData()
  };

  initData () {
    this.initCrumbList()
    this.search.folderId = ''
    this.pager.pageNo = 1
    this.getData().then((res) => {
      this.resetCurrentFolder(this.list.folder, this.list.file)
      this.treePager.total = _.cloneDeep(res.count)
      this.treeList = _.cloneDeep(res.data)
    })
  }

  initCrumbList () {
    this.crumbList = [{
      name: '根目录',
      type: 'folder',
      id: ''
    }];
  }

  /**
   * @description 选择左侧菜单
   */
  selectLeftMenu(item) {
    if (item.chooseType === this.search.chooseType) {
      return false
    }
    this.currentFolder = [1]
    this.search.chooseType = item.chooseType
    this.pager.pageNo = 1
    this.treePager.pageNo = 1
    this.search.folderId = ''
    this.search.searchContent.content = ''
    this.initCrumbList()
    if (item.chooseType !== 4) {
      this.getData().then((res) => {
        this.resetCurrentFolder(this.list.folder, this.list.file)
        this.treePager.total = _.cloneDeep(res.count)
        this.treeList = _.cloneDeep(res.data)
      })
    } else {
      this.getTemporaryData(this.pager.pageNo, 'all').then((res) => {
        this.pager.total = res.count;
        this.list.file = res.data;
        this.treePager.total = _.cloneDeep(res.count);
        this.treeList.file = _.cloneDeep(res.data);
        this.resetCurrentFolder([], this.treeList.file)
      })
    }
  }

  /**
   * @description 重置CurrentFolder
   */
  resetCurrentFolder (folderList, fileList, item) {
    if (item) {
      item.children = []
      item.total = this.pager.total
    } else {
      this.currentFolder = []
    }
    if (folderList) {
      folderList.forEach(folder => {
        if (item) {
          item.children.push(folder)
        } else {
          this.currentFolder.push(folder)
        }
      })
    }
    if (fileList) {
      if (item) {
        item.fileCount = fileList.length
      }
      fileList.forEach(file => {
        if (item) {
          item.children.push(file)
        } else {
          this.currentFolder.push(file)
        }
      })
    }
  }
  // 回退到上一级目录
  popCrumbListFunc () {
    this.crumbJump(null, this.crumbList[this.crumbList.length-2], this.crumbList.length-2)
  }
  // 点击面包屑导航
  crumbJump(e, folder, index) {
    this.currentSelect = folder;
    if (e && angular.element(e.target).hasClass('last-nav')) {
      return false
    }
    this.crumbList.splice(index + 1);
    if (folder.name === '根目录') {
      this.search.searchContent.content = ''
      this.initData()
    } else {
      this.selectFolder(folder)
    }
  }
  /**
   * @description 点击节点
   */
  selectFolder (currentFolder) {
    // 清除高亮状态
    this.clearHighlightSelected(this.currentFolder)
    this.currentSelect = currentFolder
    if (currentFolder.type === 'folder') {
      this.search.folderId = currentFolder.id
      // 给选中的节点赋值
      this.pager.pageNo = 1
      this.getData().then(() => {
        if (currentFolder.id !== '') {
          this.traversingCurrentFolder(this.currentFolder)
        }
      })
    } else {
      this.search.folderId = currentFolder.folderId
      let file = []
      currentFolder.highlightSelected = true
      currentFolder.selected = false
      this.allSelected = false
      file.push(currentFolder)
      this.list.folder = []
      this.list.file = file
      this.pager.total = 1
      this.pager.pageNo = 1
    }
    // 重置面包屑导航
    this.initCrumbList()
    if (this.search.chooseType === 1) {
      this.getFolderTree(this.search.folderId).then(() => {
        this.folderParent.forEach((element) => {
          this.crumbList.push({
            name: element.name,
            type: 'folder',
            id: element.id
          })
        })
        if (currentFolder.type === 'file') {
          this.crumbList.push({
            name: currentFolder.themeName,
            type: 'file',
            id: currentFolder.id
          })
        }
      })
    }
  }
  // 遍历currentFolder展开点击的节点
  traversingCurrentFolder (tree) {
    tree.map((item) => {
      if (item.type === 'folder' && item.id === this.currentSelect.id) {
        item.expand = true
        item.highlightSelected = true
        this.resetCurrentFolder(this.list.folder, this.list.file, item)
      } else if (item.type === 'folder' && item.children.length !== 0) {
        this.traversingCurrentFolder(item.children)
      }
    })
  }
  // 递归清空树中所有选中状态
  clearHighlightSelected (tree) {
    tree.map((item) => {
      item.highlightSelected = false
      if (item.children) {
        this.clearHighlightSelected(item.children)
      }
    })
  }
  // 获取所点击节点的父级
  getFolderTree (id) {
    const params = {
      id: id
    };
    return new Promise((resolve, reject) => {
      this.inject.get('cooperateService').getFolderTree(params).then((res) => {
        if(res.status === 200) {
          if(res.data.status === 0) {
            this.folderParent = res.data.data.list
            resolve()
          }
        }
      });
    })
  }

  searchData(e) {
    e.stopPropagation();
    if (this.search.chooseType === 4) {
      this.getTemporaryData(1, 'tree', this.search.searchContent.content).then((res) => {
        if (!this.search.searchContent.content.trim()) {
          this.list.file = res.data;
          this.pager.pageNo = 1;
          this.pager.total = res.count;
        }
        this.treePager.total = _.cloneDeep(res.count)
        this.treeList.file = _.cloneDeep(res.data)
        this.treePager.pageNo = 1
        this.resetCurrentFolder([], res.data)
      })
    } else {
      if (this.search.searchContent.content && this.search.searchContent.content.trim()) {
        this.treePager.total = 0
        let searchTreeResult = []
        let params = {
          content: this.search.searchContent.content,
          type: this.search.chooseType
        }
        this.inject.get('util').innerLoadingStart('list-right', '#24263C')
        this.inject.get('cooperateService').searchResultTree(params).then((res) => {
          if(res.status === 200) {
            if(res.data.status === 0) {
              this.inject.get('util').innerLoadingEnd();
              if (res.data.data && res.data.data.length !== 0) {
                searchTreeResult = res.data.data
                this.traversingTree(searchTreeResult)
                this.currentFolder = searchTreeResult
              } else {
                this.currentFolder = []
              }
            }
          }
        });
      } else {
        this.initData()
      }
    }
  }
  // 搜索的项全部展开
  traversingTree (tree) {
    tree.map((item) => {
      if (item.type === 'folder') {
        item.expand = true
        if (item.children.length !== 0) {
          this.traversingTree(item.children)
        }
      }
    })
  }
  clickSearchInput () {
    angular.element('.search-wrap .search-btn').addClass('search-btn-active');
    angular.element('.search-wrap .search-input').addClass('search-input-active');
  }
  keyup (e) {
    let keycode = window.event ? e.keyCode : e.which;
    if (keycode === 13) {
      this.searchData(e)
    }
  }
  clearSearch () {
    this.search.searchContent.content = ''
  }

  changePage() {
    if (this.search.chooseType === 4) {
      this.getTemporaryData(this.pager.pageNo, 'all').then((res) => {
        this.list.file = res.data;
      })
    } else {
      this.getData();
    }
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
    return new Promise((resolve, reject) => {
      this.inject.get('cooperateService').getFolder(globalLoading(params)).then((res) => {
        if(res.status === 200) {
          if(res.data.status === 0) {
            this.list = res.data.data;
            this.allSelected = false
            if (this.list.folder) {
              this.list.folder.forEach((element) => {
                element.children = []
                element.type = 'folder'
              })
            }
            if (this.list.file) {
              this.list.file.forEach((element) => {
                element.type = 'file'
              })
            }
            this.pager.total = res.data.count;
            resolve(res.data)
          }
        }
      });
    })
  }

  getTreeData() {
    const params = {
      pageSize: this.treePager.pageSize,
      pageNo: this.treePager.pageNo,
      searchContent: angular.copy(this.search.searchContent),
      type: 'graphshot',
      id: '',
      graphShotType: this.search.chooseType
    }
    this.inject.get('util').innerLoadingStart('list-right', '#24263C'); //加载loading
    return new Promise((resolve, reject) => {
      this.inject.get('cooperateService').getFolder(params).then((res) => {
        if(res.status === 200) {
          if(res.data.status === 0) {
            this.inject.get('util').innerLoadingEnd();
            this.treeList = res.data.data
            resolve()
          }
        }
      })
    })
  }

  loadMore () {
    if (this.treeList.file.length < 10) {
      return
    }
    this.treePager.pageNo ++
    if (this.search.chooseType === 4) {
      this.getTemporaryData(this.treePager.pageNo, 'tree', this.search.searchContent.content).then((res) => {
        if (res.data) {
          this.treeList.file.length = _.cloneDeep(res.data.length)
          res.data.forEach(file => {
            var findIndex = _.findIndex(this.currentFolder, function(o) { return o.id == file.id; });
            if (findIndex === -1) {
              file.type = 'file'
              this.currentFolder.push(file)
            }
          })
        }
      })
    } else {
      this.getTreeData().then(() => {
        if (this.treeList.file) {
          this.treeList.file.forEach(file => {
            var findIndex = _.findIndex(this.currentFolder, function(o) { return o.id == file.id; });
            if (findIndex === -1) {
              file.type = 'file'
              this.currentFolder.push(file)
            }
          })
        }
      })
    }
  }
  // 获取临时文件
  getTemporaryData(pageNo, tag, content='') {
    const params = {
      pageSize: this.pager.pageSize,
      pageNo: pageNo,
      searchContent: content,
    };
    if (tag === 'all') {
      this.inject.get('util').innerLoadingStart('cooperate-main', '#24263C'); //加载loading
    } else {
      this.inject.get('util').innerLoadingStart('list-right', '#24263C'); //加载loading
    }
    return new Promise((resolve, reject) => {
      this.inject.get('cooperateService').getTmpFolder(params).then((res) => {
        this.inject.get('util').innerLoadingEnd();
        if(res.status === 200) {
          if(res.data.status === 0) {
            resolve(res.data)
          }
        }
      })
    })
  }
  // 创建文件夹
  addFolder() {
    new addFolderModal(this.inject, {parentId: this.search.folderId, type: 'graphshot'}).$promise.then(result => {
      if (result) {
        this.toaster.success({
          body:'创建成功'
        })
        this.getData().then(() => {
          this.addFolderToCurrent(this.currentFolder)
        })
      }
    })
  }
  // 创建文件夹后更新左侧树项
  addFolderToCurrent(tree) {
    // 如果是在根目录新建文件夹
    if (this.search.folderId === '') {
      var folder = tree.filter((element) => {
        return element.type === 'folder'
      })
      tree.splice(folder.length, 0, this.list.folder[this.list.folder.length-1])
      return
    }
    for (var i = 0; i < tree.length; i++) {
      if (tree[i].id === this.search.folderId) {
        var folder = tree[i].children.filter((element) => {
          return element.type === 'folder'
        })
        tree[i].children.splice(folder.length, 0, this.list.folder[this.list.folder.length-1])
        return
      } else if (tree[i].type === 'folder' && tree[i].children.length !== 0) {
        this.addFolderToCurrent(tree[i].children)
      }
    }
  }

  // 移动 | 批量移动
  moveTo(e, file) {
    if (e) {
      e.stopPropagation()
    }
    let fileIds = []
    let selectFiles = []
    if (file) {
      fileIds = [file.id]
      selectFiles = [file]
    } else {
      fileIds = this.list.file.filter(f => f.selected).map(f => f.id);
      selectFiles = this.list.file.filter(f => f.selected)
    }
    if (!fileIds.length) {
      this.toaster.error({
        body:'请选择文件'
      })
      return;
    }
    new selectFolderModal(this.inject, {}).$promise.then(result => {
      if (result) {
        let moveto = result
        if (selectFiles[0].folderId === result.id) {
          return;
        }
        const params = {
          parentId: result.id,
          ids: fileIds
        }
        this.inject.get('cooperateService').moveToFolder(globalLoading(params)).then(result => {
          if (result.status === 200 && result.data.status === 0) {
            this.toaster.success({
              body:'移动成功'
            })
            if (this.currentSelect && selectFiles[0].id === this.currentSelect.id) {
              this.popCrumbListFunc()
            } else {
              this.getData()
            }
            // 获取要移动的文件数组
            this.moveFiles = []
            this.moveCurrentFolder(this.currentFolder, fileIds)

            // 判断是否是新建的文件夹
            if (moveto.id != '') {
              this.isNewFolder(this.currentFolder, moveto);
            }
            // 将移动的文件push到目标文件夹
            this.pushMoveFile(this.currentFolder, moveto.id)
          } else {
            this.toaster.error({
              body: result.data.message
            })
          }
        })
      }
    })
  }
  // 删除当前要移动的文件
  moveCurrentFolder (tree, ids) {
    for (var i = 0; i < tree.length; i++) {
      if (ids.indexOf(tree[i].id) > -1) {
        this.moveFiles.push(tree[i])
        tree.splice(i, 1)
        i--
      } else if (tree[i].type === 'folder' && tree[i].children.length !== 0) {
        this.moveCurrentFolder(tree[i].children, ids)
      }
    }
  }
  // 判断是否在弹窗中新建了文件
  isNewFolder (tree, moveto) {
    if (moveto.parentId == '') {
      let folder = tree.filter((item) => {
        return item.id === moveto.id
      })
      // 文件夹不存在则新建
      if (folder.length === 0) {
        let folders = tree.filter((item) => {
          return item.type === 'folder';
        })
        moveto.type = 'folder';
        tree.splice(folders.length, 0, moveto);
      }
      return;
    }
    for (var i = 0; i < tree.length; i++) {
      if (moveto.parentId === tree[i].id) {
        let folder = tree[i].children.filter((item) => {
          return item.id === moveto.id
        })
        // 文件夹不存在则新建
        if (folder.length === 0) {
          let folders = tree[i].children.filter((item) => {
            return item.type === 'folder';
          })
          moveto.type = 'folder';
          tree[i].children.splice(folders.length, 0, moveto);
        }
        return;
      } else if (tree[i].type === 'folder' && tree[i].children.length !== 0) {
        this.isNewFolder(tree, moveto)
      }
    }
  }
  // 将移动的文件push到目标文件夹
  pushMoveFile (tree, moveTo) {
    if (moveTo === '') {
      this.moveFiles.forEach((element) => {
        element.folderId = moveTo
        tree.push(element)
      })
      return;
    }
    for (var i = 0; i < tree.length; i++) {
      if (tree[i].id === moveTo) {
        this.moveFiles.forEach((element) => {
          element.folderId = moveTo
          tree[i].children.push(element)
        })
        return;
      } else if (tree[i].type === 'folder' && tree[i].children.length !== 0) {
        this.pushMoveFile(tree[i].children, moveTo)
      }
    }
  }
  // 共享 | 取消共享
  shareJudge(e, file, shareType) {
    e.stopPropagation();
    let $this = this
    let ids = []
    let shareText = ''
    let title = ''
    let type = ''
    if (file) {
      ids.push(file.id)
      shareText = (file.isShare) ? ('是否取消共享该条记录!') : ('是否共享该条记录')
      title = (file.isShare) ? ('取消共享提示') : ('共享提示')
      type = (file.isShare) ? ('no') : ('yes')
    } else {
      this.list.file.forEach((item) => {
        if (item.selected) {
          ids.push(item.id)
        }
      })
      if (shareType === "no") {
        shareText = '是否取消共享选中记录'
        title = '取消共享提示'
      } else {
        shareText = '是否共享选中记录'
        title = '共享提示'
      }
      type = shareType
    }
    if (!ids.length) {
      this.toaster.error({
        body: '请选择文件'
      })
      return;
    }
    $this.inject.get('puiModal').confirm({
      title: title,
      content: shareText
    }).then(() => {
      $this.inject.get('cooperateService').shareJudge({
        id: ids,
        type: type
      }).then((res) => {
        if(res.status === 200) {
          if(res.data.status === 0) {
            this.toaster.success({
              body: '操作成功'
            })
            this.shareCurrentFolder(this.currentFolder, ids, type)
            this.shareCurrentFolder(this.list.file, ids, type)
          }
        }
      })
    })
  }
  // 遍历currentFolder共享 | 取消共享节点
  shareCurrentFolder (tree, ids, type) {
    for (var i = 0; i < tree.length; i++) {
      if (ids.indexOf(tree[i].id) > -1) {
        if (type === 'yes') {
          tree[i].isShare = true
        } else {
          tree[i].isShare = false
        }
      } else if (tree[i].type === 'folder' && tree[i].children.length !== 0) {
        this.shareCurrentFolder(tree[i].children, ids, type)
      }
    }
  }
  // 删除图析
  deleteJudge(e, file) {
    e.stopPropagation();
    const $this = this;
    let ids = []
    let tip = ''
    const selectFiles = this.list.file.filter(f => f.selected)
    if (file) {
      ids.push(file.id)
      tip = '是否删除该条记录'
    } else {
      this.list.file.forEach((item) => {
        if (item.selected) {
          ids.push(item.id)
        }
      })
      tip = '是否删除选中记录'
    }
    if (!ids.length) {
      this.toaster.error({
        body: '请选择文件'
      })
      return;
    }
    $this.inject.get('puiModal').confirm({
      title: '删除提示',
      content: tip
    }).then(() => {
      $this.inject.get('cooperateService').deleteJudge({id: ids, type: this.search.chooseType}).then((res) => {
        if(res.status === 200 && res.data.status === 0) {
          this.toaster.success({
            body: '删除成功'
          })
          let selectId = ''
          if (file) {
            selectId = file.id
          } else {
            selectId = selectFiles[0].id
          }
          if (this.currentSelect && selectId === this.currentSelect.id && this.search.chooseType !== 4) {
            this.popCrumbListFunc()
          }
          if (this.search.chooseType === 4) {
            this.getTemporaryData(this.pager.pageNo, 'all').then((res) => {
              this.list.file = res.data;
              this.pager.total = res.count;
            })
          } else {
            this.getData()
          }
          this.allSelected = false
          this.delCurrentFolder(this.currentFolder, ids)
        }
      })
    });
  }
  // 删除文件夹
  deleteFolder(e, folder) {
    e.stopPropagation()
    const params = {
        ids: []
    }
    this.inject.get('puiModal').confirm({
        title: '提示',
        content: '是否删除文件夹？（会删除文件夹下所有文件）'
    }).then(result => {
        params.ids = [folder.id];
        this.inject.get('cooperateService').deleteFolder(globalLoading(params)).then((res) => {
            if(res.status === 200) {
              this.toaster.success({
                body: '删除成功'
              })
              if (this.currentSelect && folder.id === this.currentSelect.id) {
                this.popCrumbListFunc()
              }
              this.getData()
              this.delCurrentFolder(this.currentFolder, params.ids)
            }
        });
    });
  }
  // 遍历currentFolder删除 | 批量删除 节点
  delCurrentFolder (tree, ids) {
    for (var i = 0; i < tree.length; i++) {
      if (ids.indexOf(tree[i].id) > -1) {
        tree.splice(i, 1)
        i--
      } else if (tree[i].type === 'folder' && tree[i].children.length !== 0) {
        this.delCurrentFolder(tree[i].children, ids)
      }
    }
  }
  // 编辑文件/文件夹名称
  editFile(e, file) {
    if (this.search.chooseType === 1) {
      file.category = 'my'
    } else {
      file.category = 'temporary'
    }
    new editFileModal(this.inject, {file: file}).$promise.then(result => {
      if (result) {
        this.editCurrentFolder(this.list.file, file.id, result)
        this.editCurrentFolder(this.currentFolder, file.id, result)
        this.toaster.success({
          body:'修改成功'
        })
      }
    })
  }
  // 遍历currentFolder修改文件 | 文件夹名称
  editCurrentFolder (tree, id, result) {
    for (var i = 0; i < tree.length; i++) {
      if (tree[i].id === id) {
        if (this.search.chooseType === 4 || tree[i].type === 'file') {
          tree[i].themeName = result
        } else {
          tree[i].name = result
        }
        return;
      } else if (tree[i].type === 'folder' && tree[i].children.length !== 0) {
        this.editCurrentFolder(tree[i].children, id, result)
      }
    }
  }
  // 打开图析
  openJudge(e, item, isMine) {
    e.stopPropagation();
    let id = encodeURIComponent(item.id)
    if (this.search.chooseType === 4) {
      id = encodeURIComponent(item.id) + '&tmpfile'
    }
    let stateData = {type: 'snapshot', id: id};
    if (isMine) {
      localStorage.setItem('canUpdateGraph',"true")
    } else {
      localStorage.setItem('canUpdateGraph',"false")
    }
    window.open(this.inject.get('$state').href('main.porpoise' , stateData), '_blank');
  }
  // 推送
  pushJudge(e, file) {
    e.stopPropagation();
    new pushJudgeModal(this.inject, file).$promise.then((res) => {});
  }
  // 选中全部
  selectAll() {
    this.list.file.forEach((item) => {
      item.selected = this.allSelected;
    })
  }
}
