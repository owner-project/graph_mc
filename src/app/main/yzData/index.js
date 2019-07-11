import cgData from '../../../static/cg.json';
import fjData from '../../../static/fj.json';
import jdData from '../../../static/jd.json';
import pcsData from '../../../static/pcs.json';
import jwzData from '../../../static/jwz.json';
export class yzDataController {
    constructor($injector) {
        'ngInject';
        this.inject = $injector;
        this.bodyTypeList = {
            cg: cgData,
            fj: fjData,
            jd: jdData,
            pcs: pcsData,
            jwz: jwzData
        };
        this.yzList = [
            {
                name: '茶馆',
                id: 'cg'
            },
            {
                name: '房价',
                id: 'fj'
            },
            {
                name: '派出所',
                id: 'pcs'
            },
            {
                name: '军队',
                id: 'jd'
            },
            {
                name: '警务站',
                id: 'jwz'
            }
        ];
        this.chooseYz = '';
        this.yzBodyList =[];
        this.yzThList = {
            cg: [
                {
                    name: '名称',
                    key: 'name'
                },
                {
                    name: '链接',
                    key: 'href'
                }
            ],
            fj: [
                {
                    name: '名称',
                    key: 'name'
                },
                {
                    name: '地址',
                    key: 'address'
                },
                {
                    name: '价格',
                    key: 'price'
                },
                {
                    name: '链接',
                    key: 'href'
                }
            ],
            jd: [
                {
                    name: '名称',
                    key: 'name'
                }
            ],
            pcs: [
                {
                    name: '名称',
                    key: 'name'
                }
            ],
            jwz: [
                {
                    name: '编号',
                    key: 'num'
                },
                {
                    name: '名称',
                    key: 'name'
                },
                {
                    name: '地址',
                    key: 'address'
                },
                {
                    name: '周边地标',
                    key: 'zbdb'
                }
            ]
        };
    }

    chooseData() {
        this.yzBodyList = this.bodyTypeList[this.chooseYz];
    }

}