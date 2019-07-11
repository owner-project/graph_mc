export function selectFolder($injector, $rootScope, cooperateService, $q,toaster) {
    'ngInject';

    let linkFuc = (scope, element, attr) => {
        scope.data = {
            folder: [],
            selectFolder: {},
            openAddFolder: false,
            addFolder: {
                name: ''
            }
        };

        scope.data.folder = [{
            id: '',
            name: '根目录',
            open: false,
            path: '根目录',
            children: [],
            status: 1
        }];

        const getChildFolder = (parentFolder, $event) => {
            if ($event) {
                $event.stopPropagation();
            }
            const params = {
                id: parentFolder.id,
                type: attr.type
            };
            if (params.type === 'graphshot') {
                params.graphShotType = 1;
            }
            cooperateService.getFolder(params).then(result => {
                parentFolder.children = result.data.data.folder;
                parentFolder.children.forEach(f => {
                    f.path = parentFolder.path + '/' + f.name;
                    f.children = [];
                    f.open = false;
                })
            }, error => {
                //
            });

        };
        scope.fn = {
            showAddFolder(e) {
                e.stopPropagation()
                scope.data.openAddFolder = !scope.data.openAddFolder
            },
            openFolder(folder, e) {
                e.stopPropagation();
                if (!folder.status) {
                    return;
                }
                if (!folder.open) {
                    getChildFolder(folder);
                }
                folder.open = !folder.open;
            },
            selectFolder(folder, $event) {
                if ($event) {
                    $event.stopPropagation();
                }
                scope.data.selectFolder = folder;
                attr.onSelect && scope.onSelect({folder});
            },
            addFolder(e) {
                e.stopPropagation();
                if (scope.data.selectFolder.id === undefined) {
                    toaster.pop({type:'error',title:'请选择新建的父级文件夹'});
                    return;
                }
                if (!scope.data.addFolder.name) {
                    toaster.pop({type:'error',title:'请输入文件夹名称'});
                    return;
                }

                const params = {
                    name: scope.data.addFolder.name,
                    parentId: scope.data.selectFolder.id,
                    type: attr.type
                };
                cooperateService.addFolder(params).then(result => {
                    if (result.status === 200 && result.data.status === 0) {
                        scope.data.openAddFolder = false;
                        scope.data.addFolder.name = '';
                        toaster.pop({type:'success',title:'创建成功'});
                        if (scope.data.selectFolder.open) {
                            getChildFolder(scope.data.selectFolder);
                        }
                    } else {
                        toaster.pop({type: 'error',title: result.data.message});
                    }
                });
            },
            cancelAddFolder(e) {
                e.stopPropagation();
                scope.data.openAddFolder = false;
            },
            stopPropa(e) {
                e.stopPropagation();
            }
        };
        const init = () => {
            scope.data.folder[0].open = true;
            getChildFolder(scope.data.folder[0]);
            scope.fn.selectFolder(scope.data.folder[0])
        };
        init();
    };

    let directive = {
        restrict: 'EA',
        replace: true,
        scope: {
            type: '@',
            from: '@',
            onSelect: '&'
        },
        templateUrl: 'app/components/selectFolder/template.html',
        link: linkFuc
    };

    return directive;
}
