export default function ($timeout) {
    'ngInject';

    let linkFuc = (scope, element, attr, ngModelController) => {
        scope.$watch('currentStep', function (newValue) {
            if (Number(attr.stepNumber) <= newValue) {
                element.addClass('active');
                element.prev().addClass('line-active');
            } else {
                element.prev().removeClass('line-active');
                element.removeClass('active');
            }
        });
    };

    let directive = {
        restrict: 'EA',
        replace: true,
        scope: {
            stepNumber: '@',
            stepTitle: '@',
            currentStep: '<'
        },
        templateUrl: 'app/PUIComponents/Step/template.html',
        link: linkFuc
    };

    return directive;
}