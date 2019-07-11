import addMemberModal from './ticketTableModal';
// import toast from '../../components/modal/toast/toast'
export class TicketTableController {
    constructor($injector, $scope,toaster) {
        'ngInject';
        this.inject = $injector;
        this.$scope = $scope;
        this.toaster = toaster
        this.$scope.option = {};
        this.jsonData = {
            option1: [],
            option2: [],
            option3: [],
            option4: [],
            option5: [],
            resultData: []
        }
        this.init();
    }

    init() {
        // let $this = this;
        this.listInit();
    }


    listInit() {
        const $this =  this;
        $this.inject.get('voiceAPIService').getTicketList(globalLoading()).then(res => {
           if (res.status === 200) {
            if (res.data.status === 0) {
                $this.jsonData.option1 = res.data.data.head;
                $this.jsonData.resultData = res.data.data.data;
            }
        }
        }, error => {
        });
    }

    importExl(type) {
        let $this = this;
        new importExlModal($this.inject,type);
    }

    ticketTableSubmit() {
        let $this = this;

        if(!$this.$scope.option.value1){
            
            // new toast(this.inject,{
            //     str: `请选择计费号码`
            // }).warn()
            this.toaster.warning('请选择计费号码')

            return false
        }
        if(!$this.$scope.option.value2){
            // new toast(this.inject,{
            //     str: `请选择通话类型`
            // }).warn()
            this.toaster.warning('请选择通话类型')
            return false
        }
        if(!$this.$scope.option.value3){
            // new toast(this.inject,{
            //     str: `请选择对方号码`
            // }).warn()
            this.toaster.warning('请选择对方号码')

            return false
        }
        if(!$this.$scope.option.value4){
            // new toast(this.inject,{
            //     str: `请选择开始时间`
            // }).warn()
            this.toaster.warning('请选择开始时间')

            return false
        }        
        if(!$this.$scope.option.value5){
            // new toast(this.inject,{
            //     str: `请选择通话时长`
            // }).warn()
            this.toaster.warning('请选择通话时长')
            return false
        }
        if(!$this.$scope.option.value6){
            // new toast(this.inject,{
            //     str: `请选择小区代码`
            // }).warn()
            this.toaster.warning('请选择小区代码')
            return false
        }
        if(!$this.$scope.option.value7){
            // new toast(this.inject,{
            //     str: `请选择基站代码`
            // }).warn()
            this.toaster.warning('请选择基站代码')

            return false
        }

        let data = [$this.$scope.option.value1,$this.$scope.option.value2,$this.$scope.option.value3,$this.$scope.option.value4,$this.$scope.option.value5,$this.$scope.option.value6,$this.$scope.option.value7];
        new addMemberModal(this.inject,data).$promise.then((res) => {

        });
    }
}
