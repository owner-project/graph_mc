export default function ($timeout) {
    'ngInject';

    let linkFuc = (scope, element, attr, ngModelController) => {

    };

    let directive = {
        restrict: 'EA',
        replace: true,
        scope: {
            percent: '=',
            strokeWidth: '@',
            hideInfo: '@'
        },
        templateUrl: 'app/PUIComponents/Progress/template.html',
        link: linkFuc
    };

    return directive;
}
