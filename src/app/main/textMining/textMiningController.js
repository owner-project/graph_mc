import moment from 'moment';
// import toast from '../../components/modal/toast/toast';

export class textMiningController {
    constructor($injector) {
        'ngInject';
        this.inject = $injector;
        this.toaster = this.inject.get('toaster');
        this.init();
        const debounce = $injector.get('util').debounce;
        this.keyDownSearchBase = debounce(this.keyDownSearchBase.bind(this), 500);
        this.keyDownSearchCB = debounce(this.keyDownSearchCB.bind(this), 500);
        this.keyDownSearchRelation = debounce(this.keyDownSearchRelation.bind(this), 500);
    }

    init() {
        this.chooseType = 'base';
        this.series = {
            loading: false,
            showAddKeyWord: false,
            keyWord: '',
            start: '',
            end: '',
            keyWordArr: []
        };
        this.tool = {
            pnea: {
                text: '',
                result: []
            },
            englishCheck: {
                text: '',
                result: []
            },
            textMatch: {
                keyword: '',
                text: '',
                result: ''
            }
        };
        this.relationMap = {
            nodes: [],
            links: []
        };
        this.gjc = [];
    }

    chooseTag(e, type) {
        const $this = this;
        if ($this.chooseType === type) {
        }
        else {
            switch (type) {
                case 'base':
                    $this.chooseType = type;
                    $this.searchBase();
                    break;
                case 'cb':
                    $this.chooseType = type;
                    $this.searchCB();
                    break;
                case 'relation':
                    $this.chooseType = type;
                    $this.searchRelation();
                    break;
                case 'tool':
                    $this.chooseType = type;
                    break;
            }
        }
    }

    showKeyWordInput() {
        this.series.showAddKeyWord = true;
        setTimeout(() => {
            angular.element('#seriesKeyWordInput').focus();
        }, 100);
    }

    addKeyWord($event) {
        if ($event.which === 13 || $event.keyCode === 13) {
            this.series.showAddKeyWord = false;
            if (this.series.keyWord.trim().length) {
                this.series.keyWordArr.push(this.series.keyWord);
                this.series.keyWord = '';
            }
        }
    }

    handleSeriesSearch() {
        const params = {
            key_words: this.series.keyWordArr,
            range_dates: {
                assign_date: []
            }
        };
        if (this.series.start && this.series.end) {
            console.log(this.series.end, this.series.start);
            params.range_dates.assign_date[0] = Math.floor(moment(this.series.start).startOf('day').valueOf() / 1000);
            params.range_dates.assign_date[1] = Math.floor(moment(this.series.end).endOf('day').valueOf() / 1000);
        }
        this.inject.get('textMiningService').getcbDataFilter(params).then((res) => {
            if (res.status === 200) {
                if (res.data.status === 0) {
                    this.resData = res.data.data;
                }
            }
        });
    }

    keyDownSearchBase() {
        this.searchBase();
    }

    keyDownSearchCB() {
        this.searchCB();
    }

    keyDownSearchRelation() {
        this.searchRelation();
    }

    searchBase() {
        const $this = this;
        $this.inject.get('textMiningService').getBaseData({text: $this.searchText}).then((res) => {
            if (res.status === 200) {
                if (res.data.status === 0) {
                    $this.resData = res.data.data;
                }
            }
        });
    }

    searchCB() {
        const $this = this;
        this.resData = [];
        this.series.loading = true;
        this.inject.get('textMiningService').getBaseData({text: this.searchText}).then((res) => {
            if (res.status === 200) {
                if (res.data.status === 0) {
                    this.series.keyWordArr = res.data.data.stc.reduce((prev, current) => {
                        return prev.concat(current.value);
                    }, []);
                }
                this.inject.get('textMiningService').getcbData({text: $this.searchText}).then((res) => {
                    if (res.status === 200) {
                        if (res.data.status === 0) {
                            $this.resData = res.data.data;
                        }
                    }
                    this.series.loading = false;
                }, error => {
                    this.series.loading = false;
                });
            }
        }, error => {
            this.series.loading = false;
        });
    }

    searchRelation() {
        const $this = this;
        $this.inject.get('textMiningService').getRelationData({text: $this.searchText}).then((res) => {
            if (res.status === 200) {
                if (res.data.status === 0) {
                    if (res.data.data.stclb && res.data.data.stclb.length) {
                        res.data.data.stclb = res.data.data.stclb.reduce((prev, current) => {
                            return prev.concat(current.value);
                        }, []);
                    }
                    $this.resData = res.data.data;
                    this.relationMap.nodes = res.data.data.st.map(item => ({
                        id: item.id,
                        name: item.stc,
                        type: 1
                    }));
                    this.relationMap.links = res.data.data.gx.map(item => ({
                        id: item.id,
                        from: item.fromid,
                        to: item.toid,
                        label: ''
                    }));
                }
            }
        });
    }

    submitPNEA() {
        this.tool.pnea.result = [];
        this.inject.get('textMiningService').appraiseParse({content: this.tool.pnea.text}).then(result => {
            if (result.status === 200 && result.data.status === 0) {
                const parser = new DOMParser();
                const doc = parser.parseFromString(result.data.data, 'text/html');
                if (doc.querySelectorAll('table tr')) {
                    doc.querySelectorAll('table tr').forEach((tr, index) => {
                        if (index > 0) {
                            const res = [];

                            tr.querySelectorAll('td').forEach((td, i) => {
                                if (i !== 0) {
                                    res[i - 1] = td.innerText
                                }
                            });

                            this.tool.pnea.result.push(res);
                        }
                    });
                } else {
                    // new toast(this.inject, {str: '没有结果'}).warn();
                    this.toaster.pop({type:'warning',title:'没有结果'});
                }

            }
        }, error => {
            //
        });
    }

    submitEnglishCheck() {
        this.tool.englishCheck.result = [];
        this.inject.get('textMiningService').correctEnglish({content: this.tool.englishCheck.text}).then(result => {
            if (result.status === 200 && result.data.status === 0) {
                const parser = new DOMParser();
                const doc = parser.parseFromString(result.data.data, 'text/html');
                if (doc.querySelectorAll('table tr')) {
                    doc.querySelectorAll('table tr').forEach((tr, index) => {
                        if (index > 0) {
                            const res = {};

                            tr.querySelectorAll('td').forEach((td, i) => {
                                if (i === 1) {
                                    res.originWord = td.innerText;
                                } else if (i === 2) {
                                    res.mayWord = td.innerText;
                                }
                            });

                            this.tool.englishCheck.result.push(res);
                        }
                    });
                } else {
                    // new toast(this.inject, {str: '没有结果'}).warn();
                    this.toaster.pop({type:'warning',title:'没有结果'});

                }

            }
        }, error => {
            //
        });
    }

    submitTextMatch() {
        this.inject.get('textMiningService').textMatch({word: this.tool.textMatch.keyword, content: this.tool.textMatch.text}).then(result => {
            if (result.status === 200 && result.data.status === 0) {
                const parser = new DOMParser();
                const doc = parser.parseFromString(result.data.data, 'text/html');
                if (doc.querySelector('.panel .panel-body')) {
                    this.tool.textMatch.result = doc.querySelector('.panel .panel-body').innerHTML;
                } else {
                    // new toast(this.inject, {str: '没有结果'}).warn();
                    this.toaster.pop({type:'warning',title:'没有结果'});

                }
            }
        }, error => {
            //
        });
    }

    englishTextFocus() {
        this.tool.englishCheck.result = [];
    }

}
