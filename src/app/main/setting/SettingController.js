export class SettingController {
  constructor ($injector, $scope,$rootScope) {
      'ngInject';
      this.$scope = $scope;
      this.inject = $injector;
      this.$rootScope = $rootScope;
      this.toaster = this.inject.get('toaster');
      this.settingService = this.inject.get('settingService');
      this.init();
  }

  init () {
    this.settingsData = [];
    this.inject.get('$rootScope').urlData.chooseMenu = 'setting';
    this.settingService.getSettings().then((res) => {
        if (res.status === 200) {
            if (res.data.status === 0) {
                angular.forEach(res.data.data, (val, key) => {
                    this.settingsData.push({
                        key: key,
                        val: val
                    })
                })
            } else {
                this.toaster.error({
                    title: res.data.message
                });
            }
        }
    })
  }
  addItem() {
    this.settingsData.push({
        key: '',
        val: ''
    });
  }
  saveItem() {
    let params = {};
    this.settingsData.forEach((item) => {
        params[item.key] = item.val;
    })
    this.settingService.saveSettings(params).then((res) => {
        if (res.status === 200) {
            if (res.data.status === 0) {
                this.toaster.success({
                    title: '修改成功'
                });
                this.settingService.getGlobalSetting();
            } else {
                this.toaster.error({
                    title: res.data.message
                });
            }
        }
    })
  }
}
