// import toast from '../../../components/modal/toast/toast';
export default class directionalModal {
    constructor($injector, resolveData, chooseList) {
        this.injector = $injector;
        this.toaster = this.injector.get('toaster');
        this.config = null;
        this.$modal = $injector.get('$modal')({
            backdrop: 'static',
            keyboard: false,
            placement: 'center',
            templateUrl: 'app/main/porpoise/directional/modal.html',
            onHide: () => {
                this.$modal.destroy();
                this.$modal = null;
            }
        });
        const dicDataResult = JSON.parse(localStorage.getItem('dicData'))
        if(dicDataResult) {
            const dicData = dicDataResult.result
            this.config = dicData.config
        }
        if(this.config && !!this.config[15]){
            var code = this.config[15].code.split(',')
        }
        else{
            var code = [1,2,3,4,5,6]
        }
        this.$modal.$scope.data = {
            options: {
                nodeList: resolveData,
                depthList: [
                    {
                        id: code[0],
                        name: code[0]
                    },
                    {
                        id: code[1],
                        name: code[1]
                    },
                    {
                        id: code[2],
                        name: code[2]
                    },
                    {
                        id: code[3],
                        name: code[3]
                    },
                    {
                        id: code[4],
                        name: code[4]
                    },
                    {
                        id: code[5],
                        name: code[5]
                    },
                ]
            },
            putData: {
                node: null
            }
        };
        this.$defer = $injector.get('$q').defer();
        this.$promise = this.$defer.promise;
        this.init();
        if (chooseList && chooseList.length > 0) {
            this.$modal.$scope.data.putData.node = chooseList[0].id;
        }
    }

    init() {
        this.bindFn();
    }

    close(data) {
        this.$defer.resolve(data);
        this.destroy();
    }

    bindFn() {
        const self = this;
        const scope = self.$modal.$scope;
        scope.fn = {
            close: function (data) {
                self.close(data);
            },
            dismiss: function () {
                self.close();
            },
            sure: function () {
                if(scope.data.putData.node && scope.data.putData.depth) {
                    self.close(scope.data.putData);
                }
                else{
                    // new toast(self.injector, {
                    //     str: '请选择实体和拓展层级'
                    // }).warn();
                    self.toaster.pop({type:'warning',title:'请选择实体和拓展层级'});
                }
            }
        }
    }

    destroy() {
        this.$modal.hide();
    }

}
