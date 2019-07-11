export default function ($timeout) {
    'ngInject';

    let linkFuc = (scope, element, attr, ngModelController) => {
        scope.$open = false;
        scope.$maxWidth = scope.maxWidth || '128';

        ngModelController.$render = function () {
            scope.value = ngModelController.$viewValue;

            if (scope.value) {
                scope.$open = true;

                setTimeout(() => {
                    $(element).find('input').focus();
                }, 30);
            }
        };

        scope.$watch('value', function (newValue) {
            ngModelController.$setViewValue(scope.value);
        });

        scope.$toggle = function ($event,flag) {
            scope.$open = flag;
            if (flag) {
                setTimeout(() => {
                    $(element).find('input').focus();
                }, 30);
            }
        };

        scope.$onFocus = function ($event) {
            attr.onFocus && scope.onFocus({$event});
        };

        scope.$onBlur = function ($event) {

            attr.onBlur && scope.onBlur({$event});
        };

        scope.$onKeyDown = function ($event) {
            const keyCode = $event.which;
            if (keyCode === 13 && (scope.value.trim() !== '' || this.emptySearch)) { 
                scope.$onSearch($event);
                if(scope.enterBlur){
                    $(element).find('input').trigger('blur');
                }
            }
        };
        scope.$openInput = function($event){
            scope.placeholderText = attr.placeholder || '';
            if(!$(element).hasClass('focus')){
                setTimeout(() => {
                    $(element).addClass('focus');
                    $(element).find('input').trigger('focus');
                })
            }
            // 点击搜索icon的时候
            if($($event.target).hasClass('pui-search-icon')){
                scope.$onSearch($event);
            }
        }

        scope.$onSearch = function ($event) {
            $event.stopPropagation();
            if(this.value.trim() == ''){
                if(this.emptySearch){
                    attr.onSearch && scope.onSearch({$event});
                    if(scope.enterBlur){
                        $(element).find('input').trigger('blur');
                    }
                }else{
                    console.log("不允许空搜索")
                    return;
                }
            }else{
                attr.onSearch && scope.onSearch({$event});
                if(scope.enterBlur){
                    $(element).find('input').trigger('blur');
                }
            }
        };
        scope.$onClose = function ($event) {
            attr.onClose && scope.onClose({$event});
            scope.$open = false;
            scope.value = ''
        };
        scope.$onChange = function ($event) {
            if(scope.value == ''){
                attr.onClose && scope.onClose({$event});
            }else{
                attr.onChange && scope.onChange({$event})
            }
          }
    };

    let directive = {
        restrict: 'EA',
        replace: true,
        require: 'ngModel',
        scope: {
            maxWidth: '@',
            size: '@',
            type: '@',
            width:'@',
            enterBlur:'@',
            placeholder: '@',
            onFocus: '&',
            onBlur: '&',
            onSearch: '&',
            onChange:'&',
            onClose: '&',
            emptySearch:'@'
        },
        templateUrl: 'app/PUIComponents/Searchbar/template.html',
        link: linkFuc
    };

    return directive;
}
