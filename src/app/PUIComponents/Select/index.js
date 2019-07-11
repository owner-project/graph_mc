import 'jquery';
import 'selectize';
export default function ($timeout) {
    'ngInject';

    let linkFuc = (scope, element, attr, ngModelController) => {
        let selectize;

        $(element).selectize({
            plugins: angular.isDefined(attr.multiple) ? ['remove_button'] : [],
            labelField: scope.labelField || 'name',
            searchField: [scope.labelField || 'name'],
            valueField: scope.valueField || 'value',
            highlight: false,
            dropdownParent: scope.dropdownParent || null,
            placeholder: scope.placeholder || '',
            maxItems: angular.isDefined(attr.multiple) ? (angular.isDefined(attr.maxItems) ? scope.maxItems : null) : 1,
            options: scope.options || [],
            onInitialize() {
                selectize = element[0].selectize;

                scope.$watch('placeholder', function () {
                    selectize.settings.placeholder = scope.placeholder;
                    selectize.updatePlaceholder();
                });

                scope.$watch('ngDisabled', function (disabled) {
                    disabled ? selectize.disable() : selectize.enable();
                });

                scope.$watchCollection('options', function setSelectizeOptions(curr, prev) {
                    if (curr) {
                        // selectize.clearOptions();
                        angular.forEach(prev, function(opt){
                            if(curr.indexOf(opt) === -1){
                                const value = opt[selectize.settings.valueField];
                                selectize.removeOption(value, true);
                            }
                        });

                        selectize.addOption(curr);

                        if (!angular.equals(selectize.items, scope.ngModel)) {
                            selectize.setValue(scope.ngModel, true);
                        }
                    }
                });

                scope.$watch('ngModel', function setSelectizeValue() {
                    if (!angular.equals(selectize.items, scope.ngModel)) {
                        selectize.setValue(scope.ngModel, true);
                        if (scope.ngModel == undefined) {
                            selectize.showInput();
                        }
                    }
                });

                if (scope.type === 'border'){
                   selectize.$control.addClass('border');
                }

                if (!angular.isDefined(attr.multiple) && !angular.isDefined(attr.search)) {
                    selectize.$control_input.attr('readonly', 'readonly');
                }

                if (scope.placement === 'right') {
                    selectize.$dropdown.addClass('right');
                }
            },
            onChange() {
                let value = angular.copy(this.items);

                if (this.settings.maxItems == 1) {
                    value = value[0]
                }

                ngModelController.$setViewValue( value );
            },
            onItemAdd(value, $item) {
                this.onChange()
            },
            onItemRemove(value) {

            }
        });

        //Override 选择时候的样式加载有BUG， 复写原方法
        const _refreshOptions = $(element).data().selectize.refreshOptions;

        $(element).data().selectize.refreshOptions = function () {
            _refreshOptions.apply(this, arguments);

            if (!this.settings.hideSelected) {
                for (let key in this.options) {//原方法未先清除selected class
                    if (this.options.hasOwnProperty(key)) {
                        this.getOption(this.options[key][this.settings.valueField]).removeClass('selected');
                    }
                }

                for (let i = 0, n = this.items.length; i < n; i++) {
                    this.getOption(this.items[i]).addClass('selected');
                }
            }
        };

        //Override
        const _render = $(element).data().selectize.render;

        $(element).data().selectize.render = function (templateName, data) {
            const html = _render.apply(this, arguments);

            if (templateName === 'option' || templateName === 'item') {
                $(html).attr('title', data[this.settings.labelField] || '');
            }

            return html;
        };


        element.on('$destroy', function () {
            if (selectize) {
                selectize.destroy();
                selectize = null;
            }
        });
    };

    let directive = {
        restrict: 'EA',
        replace: true,
        require: 'ngModel',
        scope: {
            type: '@',
            valueField: '@',
            labelField: '@',
            placement: '@',
            dropdownParent: '@',
            placeholder: '@',
            search: '@',
            ngModel: '=',
            maxItems: '=',
            options: '=',
            ngDisabled: '=',
        },
        templateUrl: 'app/PUIComponents/Select/template.html',
        link: linkFuc
    };

    return directive;
}
