import autosize from '../libs/autosize.js';

export default function ($timeout) {
    'ngInject';

    let linkFuc = (scope, element, attr, ngModelController) => {
        const textarea = element.find('textarea').get(0);

        ngModelController.$formatters.push(function (modelValue) {
            if (angular.isDefined(attr.autoHeight)) {
                $timeout(() => {
                    autosize.update(textarea);
                }, 20);
            }
            return modelValue;
        });

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
            attr.ngKeydown && scope.ngKeydown({$event});
        };

        if (angular.isDefined(attr.autoHeight)) {
            autosize(textarea);
        }

        element.on('$destroy', function () {
            if (angular.isDefined(attr.autoHeight)) {
                autosize.destroy(textarea);
            }
        });
    };

    let directive = {
        restrict: 'EA',
        replace: true,
        require: 'ngModel',
        scope: {
            autoHeight: '@',
            ngDisabled: '=',
            placeholder: '@',
            ngFocus: '&',
            ngBlur: '&',
            ngKeydown: '&'
        },
        templateUrl: 'app/PUIComponents/Textarea/template.html',
        link: linkFuc
    };

    return directive;
}
