import {fzlxMap} from "../../filters/filter";
import editIntegralRuleModal from './editIntegralRuleModal';

export class IntegralRuleController {
    constructor($injector){
        'ngInject';
        this.inject = $injector;
        this.applicationAPIService = $injector.get('applicationAPIService');
        this.pager = {
            pageSize: 20,
            pageNo: 1,
            total: 0
        };

        this.searchData = {
            name: '',
            type: -1
        };

        this.tableData  = {
            option: [],
            resultData: []
        };

        this.tableData.option = Object.values(fzlxMap).filter(i => i.id != -1).map(i => {
            return {
                name: i.name,
                value: i.id
            }
        });

        this.tableData.option.unshift({
            name: '全部',
            value: -1
        });
        this.init();
    }

    init(){
        this.getPageData().then(() => {
           this.ruleTableInit();
        });
    }

    changeStatus(item) {
        let $this = this;
        item.isCollspan = !item.isCollspan;
        $this.ruleTableInit();
    }

    getPageData() {
        const defer = this.inject.get('$q').defer();
        const params = {
            pageSize: this.pager.pageSize,
            pageNo: this.pager.pageNo,
            name: this.searchData.name.trim(),
        };
        if (this.searchData.type != -1) {
            params.type = this.searchData.type;
        }
        this.applicationAPIService.getIntegralRuleList(globalLoading(params)).then(result => {
            if (result.status === 200) {
                if (result.data && result.data.status === 0 && result.data.data) {
                    this.tableData.resultData = result.data.data.list;
                    this.pager.total = result.data.data.total;
                    this.ruleTableInit();
                }
            }
            defer.resolve();
        }, error => {
            defer.reject();
        });
        return defer.promise;
    }

    editRule(item) {
        new editIntegralRuleModal(this.inject, item).$promise.then(result => {
            this.getPageData();
        }, error => {
        });
    }

    ruleTableInit(){
        let $this = this;
        let nonius = 0;
        let checkNonius = (item) => {
            switch(nonius) {
                case 0:
                    item.className = "rule-li-color1";
                    nonius++;
                    break;
                case 1:
                    item.className = 'rule-li-color2';
                    nonius--;
                    break;
            }
        };
        angular.forEach($this.tableData.resultData, (item) => {
            checkNonius(item);
            if(item.isCollspan && angular.isArray(item.list) && item.list.length > 0) {
                angular.forEach(item.list, (item1) => {
                    checkNonius(item1);
                    if(item1.isCollspan && angular.isArray(item1.list) && item1.list.length > 0) {
                        angular.forEach(item1.list, (item2) => {
                            checkNonius(item2);
                        });
                    }
                });
            }
       });
    }
}
