export default function () {
    'ngInject';

    let linkFuc = (scope, element, attr, ngModelController, transclude) => {
        
    };

    let directive = {
        restrict: 'EA',
        replace: true,
        transclude: true,
        templateUrl: 'app/PUIComponents/Steps/template.html',
        link: linkFuc
    };

    return directive;
}
