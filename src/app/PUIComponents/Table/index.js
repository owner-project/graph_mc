export default function ($timeout) {
    'ngInject';

    let linkFuc = (scope, element, attr, ngModelController) => {
        $(element).find('table').width(element.get(0).getBoundingClientRect().width);
        $(element).addClass('pui-table');

        if (attr.type) {
            $(element).addClass('pui-table-' + attr.type);
        }

        if (attr.hasOwnProperty('opacity')) {
            $(element).addClass('opacity');
        }

        $(window).on('resize.pui-table', function () {
           $(element).find('table').width(element.get(0).getBoundingClientRect().width || '100%');
        });

        element.on('$destroy', function () {
            $(window).off('resize.pui-table');
        });
    };

    let directive = {
        restrict: 'EA',
        link: linkFuc
    };

    return directive;
}
