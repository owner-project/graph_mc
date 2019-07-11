import puiLayout from  './Layout'
import puiInput from './Input';
import puiDatepicker from './Datepicker';
import puiTextarea from './Textarea';
import puiSelect from './Select';
import puiRadio from './Radio';
import puiCheckbox from './Checkbox';
import puiButton from './Button';
import puiSearchbar from './Searchbar';
import puiModal from './Modal';
import puiProgress from './Progress';
import puiTable from './Table';
import puiSteps from './Steps';
import puiStep from './Step';

angular.module('puiComponents', [])
    .directive('puiLayout', puiLayout)
    .directive('puiInput', puiInput)
    .directive('puiDatepicker', puiDatepicker)
    .directive('puiTextarea', puiTextarea)
    .directive('puiSelect', puiSelect)
    .directive('puiRadio', puiRadio)
    .directive('puiCheckbox', puiCheckbox)
    .directive('puiButton', puiButton)
    .directive('puiSearchbar', puiSearchbar)
    .directive('puiProgress', puiProgress)
    .directive('puiTable', puiTable)
    .directive('puiSteps', puiSteps)
    .directive('puiStep', puiStep)
    .factory('puiModal', puiModal);

