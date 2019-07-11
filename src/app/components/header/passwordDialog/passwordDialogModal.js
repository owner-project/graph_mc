export default class passwordDialogModal {
    constructor($injector,resData) {
        this.$modal = $injector.get('$modal')({
            backdrop: 'static',
            keyboard: false,
            templateUrl: 'app/components/header/passwordDialog/passwordDialogModal.tpl.html',
            onHide: () => {
                this.$modal.destroy();
                this.$modal = null;
            }
        });
        this.resData = resData;
        this.injector = $injector;
        this.$defer = $injector.get('$q').defer();
        this.$promise = this.$defer.promise;
        this.$modal.$scope.data = {};
        this.toaster = this.injector.get('toaster');
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

        this.$modal.$scope.fn = {
            close: function(data) {
                self.close(data);
            },
            dismiss: function () {
                self.close();
            },
            sure: function () {
                if(self.$modal.$scope.data.oldPassword&&self.$modal.$scope.data.password&&self.$modal.$scope.data.password2) {
                    if(self.$modal.$scope.data.password==self.$modal.$scope.data.password2) {
                        self.updatePassword();
                    }else {
                        self.toaster.error('新密码输入不一致');
                    }
                }else {
                    self.toaster.error('请完整信息');
                }
            }
        }
    }

     /*
     * 修改密码
     */
    updatePassword() {
        let $this =  this;
        let updatePassword = $this.injector.get('headerService').updatePassword;
        let user = angular.copy(localStorage.user);
        let userId = JSON.parse(user.replace(/%<%/g, '{').replace(/%>%/g, '}')).userId;

        updatePassword({
            oldPassword: $this.$modal.$scope.data.oldPassword,
            newPassword: $this.$modal.$scope.data.password,
            userId: userId

        }).then(res => {
           if (res.status === 200) {
            if (res.data.status === 0) {
                $this.close(1);
            } else {
                $this.toaster.error(res.data.msg);
            }
        }
        }, error => {

        });
    }


    destroy() {
        this.$modal.hide();
    }

}
