export default function ($timeout) {
    'ngInject';

    let linkFuc = (scope, element, attr, ngModelController) => {
        scope.click = function ($event) {
            if (!scope.ngDisabled) {
                angular.isDefined(attr.onClick) && scope.onClick({$event});
            }
        };
    };

    let directive = {
        restrict: 'EA',
        replace: true,
        transclude: true,
        scope: {
            size: '@',
            type: '@',
            onClick: '&',
            ngDisabled: '=',
            noShadow: '='
        },
        templateUrl: 'app/PUIComponents/Button/template.html',
        link: linkFuc
    };

    return directive;
}
