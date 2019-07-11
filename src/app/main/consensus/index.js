import cData from '../../../static/consensus.json';
export class consensusController {
    constructor($injector) {
        'ngInject';
        this.data = cData;        
    }

    chooseReport(e, item) {
        e.stopPropagation();
        this.chooseItem = this.data.data[item.id];
    }
}