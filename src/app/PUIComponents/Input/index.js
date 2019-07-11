export default function ($timeout) {
    'ngInject';

    let linkFuc = (scope, element, attr, ngModelController) => {
        ngModelController.$render = function () {
            scope.value = ngModelController.$viewValue;
        };

        scope.$watch('value', function (newValue) {
            ngModelController.$setViewValue(scope.value);
        });

        scope.$onFocus = function ($event) {
            attr.ngFocus && scope.ngFocus({$event});
        };

        scope.$onBlur = function ($event) {
            attr.ngBlur && scope.ngBlur({$event});
        };

        scope.$onKeyDown = function ($event) {
            const keyCode = $event.which;

            attr.ngKeydown && scope.ngKeydown({$event});
            if (keyCode === 13) {
                attr.onEnter && scope.onEnter({$event});
            }
        };
    };

    let directive = {
        restrict: 'EA',
        replace: true,
        require: 'ngModel',
        scope: {
            size: '@',
            type: '@',
            ngDisabled: '=',
            placeholder: '@',
            ngFocus: '&',
            ngBlur: '&',
            onEnter: '&',
            ngKeydown: '&'
        },
        templateUrl: 'app/PUIComponents/Input/template.html',
        link: linkFuc
    };

    return directive;
}
