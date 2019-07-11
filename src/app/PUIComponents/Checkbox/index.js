export default function ($timeout) {
    'ngInject';

    let linkFuc = (scope, element, attr, ngModelController) => {
        ngModelController.$render = function () {
            scope.value = ngModelController.$viewValue;
        };
        scope.$watch('value', function (newValue) {
                ngModelController.$setViewValue(scope.value);
        });

        scope.check = function ($event) {
            $event.stopPropagation();
            if (!scope.ngDisabled) {
                scope.value = !scope.value;
            }
        };
    };

    let directive = {
        restrict: 'EA',
        replace: true,
        require: 'ngModel',
        scope: {
            ngModel: '=',
            indeterminate: '=',
            ngDisabled: '=',
            labelText:'=',
        },
        templateUrl: 'app/PUIComponents/Checkbox/template.html',
        link: linkFuc
    };

    return directive;
}
