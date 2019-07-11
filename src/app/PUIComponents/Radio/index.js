export default function ($timeout) {
    'ngInject';

    let linkFuc = (scope, element, attr, ngModelController) => {
        if (angular.isUndefined(scope.value)) {
            scope.expValue = true;
        } else {
            scope.expValue = scope.value;
        }

        ngModelController.$render = function () {
            scope.$value = ngModelController.$viewValue == scope.expValue;
        };

        scope.check = function ($event) {
            $event.stopPropagation();
            if (!scope.ngDisabled) {
                if (ngModelController.$viewValue != scope.expValue) {
                    scope.$value = true;
                    ngModelController.$setViewValue(scope.expValue);
                }
            }
        };
    };

    let directive = {
        restrict: 'EA',
        replace: true,
        require: 'ngModel',
        scope: {
            value: '=',
            ngModel: '=',
            ngDisabled: '='
        },
        templateUrl: 'app/PUIComponents/Radio/template.html',
        link: linkFuc
    };

    return directive;
}
