
// import toast from "../../../../components/modal/toast/toast";

export default class addNodeModal {
    constructor($injector, entityId ="",) {
        this.injector = $injector;
        this.toaster = this.injector.get('toaster');
        this.$modal = $injector.get('$modal')({
            backdrop: 'static',
            keyboard: false,
            placement: 'center',
            templateUrl: 'app/main/admin/redListManager/modal/modal.html',
            onHide: () => {
                this.$modal.destroy();
                this.$modal = null;
            }
        });
        this.$modal.$scope.data = {
            htmlText: ""
        };
        this.$defer = $injector.get('$q').defer();
        this.$promise = this.$defer.promise;
        this.dicData = JSON.parse(localStorage.getItem('dicData'));
        this.$modal.$scope.data = {
            rankOptions: this.dicData.result.user_rank.map(item => {item.value = item.code;return item})|| [],
            userTypeList:this.dicData.result.entity_name.map(item => {item.value = item.code;return item}) || [],
            rank: "",
            entityType:'',
            name:'',
            // 身份证
            sfzh:''
        };
        if(!!entityId){
            this.entityId = entityId;
            this.injector.get('adminAPIService').getRedListItemInfo(entityId).then(res => {
                if(res.status ==200 && res.data.status ==0){
                    this.$modal.$scope.data.rank = res.data.data.rank;
                    this.$modal.$scope.data.name = res.data.data.name;
                    this.$modal.$scope.data.sfzh = res.data.data.sfzh;
                    this.$modal.$scope.data.entityType = res.data.data.type;
                }
            })
        }
        this.init();
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
        const data = this.$modal.$scope.data;

        this.$modal.$scope.fn = {
            close: function(data) {
                self.close(data);
            },
            dismiss: function () {
                self.close();
            },
            sure: function () {

                if (!data.name) {
                    // new toast(self.injector, {
                    //     str: '请填写姓名'
                    // }).error();
                    self.toaster.pop({type:'error',title:'请填写实体名称'});
                    return;
                }
                if (!data.sfzh) {
                    // new toast(self.injector, {
                    //     str: '请填写身份证'
                    // }).error();
                    self.toaster.pop({type:'error',title:'请填写实体标识'});
                    return;
                }
                const putData = {};
                
                putData.name = data.name;
                putData.sfzh = data.sfzh;
                putData.rank = data.rank;
                putData.type = data.entityType;
                if(self.entityId){
                    putData.id = self.entityId;
                }
                self.injector.get('adminAPIService').editRedList(putData).then((res) => {
                    if(res.status === 200) {
                        if(res.data.status === 0) {
                            self.close(1);
                        }
                    }
                });

            }
        }
    }

    destroy() {
        this.$modal.hide();
    }
}
