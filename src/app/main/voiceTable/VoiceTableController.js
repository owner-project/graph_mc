import addMemberModal from './voiceTableModal';
export class VoiceTableController {
    constructor($injector, $scope) {
        'ngInject';
        this.inject = $injector;
        this.$scope = $scope;
        this.$scope.option = {};
        this.jsonData = {
            option1: [],
            option2: [],
            option3: [],
            option4: [],
            option5: [],
            resultData1: [],
            resultData2: []
        }
        this.init();
    }

    init() {
        this.listInit();
    }


    listInit() {
        const $this =  this;
        $this.inject.get('voiceAPIService').getVoiceTable(globalLoading()).then(res => {
            if (res.status === 200) {
                if (res.data.status === 0) {
                    $this.jsonData.option2 = $this.jsonData.option1 = res.data.data[0].head;
                    $this.jsonData.option5 = $this.jsonData.option4 = $this.jsonData.option3 = res.data.data[1].head;
                    $this.jsonData.resultData1 = res.data.data[0].data;
                    $this.jsonData.resultData2 = res.data.data[1].data;
                }
            }
        }, error => {});
    }

    importExl(type) {
        new importExlModal(this.inject,type);
    }

    voiceTableSubmit() {
        const $this = this;
        let data = [$this.$scope.option.value1, $this.$scope.option.value2, $this.$scope.option.value3, $this.$scope.option.value4, $this.$scope.option.value5];
        new addMemberModal(this.inject, data);
    }
}
