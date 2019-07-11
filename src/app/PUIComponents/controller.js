
export default class PUIController {
    constructor($injector, $timeout, puiModal) {
        'ngInject';

        this.data = {
            input: {
                value: '123',
                disabledValue: '我不可更改',
                change() {
                    console.log(this);
                },
                onFocus(event) {
                    console.log('on focus', event)
                },
                onBlur(event) {
                    console.log('on blur', event)
                }
            },
            datepicker: {
                value1: '',
                start: '',
                end: '',
                change() {
                    console.log(this);
                },
                focus() {
                    console.log('focus', this);
                },
                blur() {
                    console.log('blur', this);
                }
            },
            textarea: {
                value: '我是一段文字',
                autoHeightValue: '我会自适应更改高度',
                disabledValue: '我不可更改',
                change() {
                    console.log(this);
                }
            },
            select: {
                single: {
                    value: 2,
                    options: [{name: '哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈', value: 1}, {name: '呵呵呵呵呵呵呵呵呵呵呵呵呵呵呵呵呵呵', value: 2}],
                    change() {
                        console.log(this);
                    }
                },
                multiple: {
                    value: [1, 2],
                    options: [{name: '哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈', value: 1}, {name: '呵呵呵呵呵呵呵呵呵呵呵呵呵呵呵呵呵呵', value: 2}, {name: '啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊', value: 3}, {name: '啦啦啦啦啦啦啦啦啦啦啦啦啦啦啦啦啦啦啦啦啦啦啦啦', value: 4}],
                    change() {
                        console.log(this);
                    }
                }
            },
            radio: {
                value1: false,
                value2: false,
                change() {
                    console.log(this);
                }
            },
            checkbox: {
                value1: true,
                value2: true,
                allChecked: true,
                indeterminate: false,
                checkAll() {
                    if (this.allChecked) {
                        this.value1 = true;
                        this.value2 = true;
                        this.indeterminate = false;
                    } else {
                        this.value1 = false;
                        this.value2 = false;
                        this.indeterminate = false;
                    }
                },
                change() {
                    if (!this.value1 || !this.value2) {
                        this.indeterminate = true;
                        this.allChecked = false;
                    }
                    if (this.value1 && this.value2) {
                        this.indeterminate = false;
                        this.allChecked = true;
                    }
                    if (!this.value1 && !this.value2) {
                        this.indeterminate = false;
                        this.allChecked = false;
                    }
                }
            },
            button: {
                onClick($event) {
                    console.log($event);
                }
            },
            searchbar: {
                value: '1231',
                onSearch($event) {
                    console.log('search', $event);
                },
                onChange() {
                    console.log(this);
                }
            },
            modal: {
                confirm() {
                    puiModal.confirm({content: '确定删除？'}).then(confirm => {
                        console.log('ok');
                    }, cancel => {
                        console.log('cancel');
                    });
                }
            }
        };
    }
}
