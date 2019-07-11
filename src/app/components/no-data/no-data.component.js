class noDataComponentController {
    constructor($injector) {
        'ngInject';
        this.inject = this.$injector;
        this.text = '暂无数据'
    }
    $onInit(){

    }
    $onChanges(changeObj){

    }
}

export const noDataComponent = {
    bindings: {
        text:'<',
        absoluteCenter:'<'
    },
    controller: noDataComponentController,
    controllerAs:'ndc',
    template: `
        <div class="noDataComponent" ng-class="{'absolute-center':ndc.absoluteCenter}">
            <svg width="160" height="160" viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg" style="display:block;margin:0 auto">
                <path opacity="0.5" fill-rule="evenodd" clip-rule="evenodd" d="M57.5 65H85V61.6667H57.5V65ZM91.6665 65H102.5V61.6667H91.6665V65ZM57.5 77.5H70V74.1667H57.5V77.5ZM75 77.5H84.1665V74.1667H75V77.5ZM91.6665 77.5H102.5V74.1667H91.6665V77.5ZM57.5 86.6667H66.6665V83.3333H57.5V86.6667ZM75 86.6667H85.8335V83.3333H75V86.6667ZM91.6665 86.6667H100V83.3333H91.6665V86.6667Z" fill="#1F5BBF"/>
                <path d="M95 52.5H118.333V57.5H98.3333C96.4924 57.5 95 56.0076 95 54.1667V52.5Z" fill="black" fill-opacity="0.15"/>
                <path d="M91.25 25L118.75 52.5H94.5833C92.7424 52.5 91.25 51.0076 91.25 49.1667V25Z" fill="#1B345C"/>
                <path d="M119.167 52.5V120.167C119.167 122.376 117.376 124.167 115.167 124.167H44.8335C42.6244 124.167 40.8335 122.376 40.8335 120.167V29C40.8335 26.7909 42.6244 25 44.8335 25H91.6668M119.167 52.5L91.6668 25M119.167 52.5H95.6668C93.4577 52.5 91.6668 50.7091 91.6668 48.5V25" stroke="#1F5BBF" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="5 5"/>
                <ellipse cx="80.0002" cy="137.083" rx="39.1667" ry="3.75" fill="black" fill-opacity="0.15"/>
                <circle opacity="0.5" cx="29.5832" cy="114.583" r="2.91667" stroke="#1F5BBF" stroke-width="1.66667"/>
                <path opacity="0.5" d="M135.417 21.25L141.25 27.0834M141.25 21.25L135.417 27.0834" stroke="#1F5BBF" stroke-width="1.66667"/>
                <path opacity="0.5" d="M5.8335 54.8148L10.9651 50L13.3335 56.6667L5.8335 54.8148Z" stroke="#1F5BBF" stroke-width="1.66667"/>
                <rect x="121.241" y="118.783" width="6.97071" height="5.83333" transform="rotate(45 121.241 118.783)" fill="#1B345C" stroke="#1F5BBF" stroke-width="1.66667"/>
                <rect x="143.085" y="138.628" width="22.5077" height="8.66068" rx="3.33333" transform="scale(-1 1) rotate(-45 143.085 138.628)" fill="#2979FF" fill-opacity="0.18" stroke="#1F5BBF" stroke-width="1.66667"/>
                <circle cx="102.5" cy="104.167" r="25" fill="#1B345C" stroke="#1F5BBF" stroke-width="1.66667"/>
                <circle cx="102.5" cy="104.167" r="18.3333" fill="#2979FF" fill-opacity="0.18" stroke="#1F5BBF" stroke-width="1.66667"/>
                <path opacity="0.5" d="M96.6665 101.296C96.6665 97.8189 99.4647 95 102.917 95C106.368 95 109.167 97.8189 109.167 101.296C109.167 104.774 106.368 107.593 102.917 107.593V110.833M102.917 112.5V115.833" stroke="#1F5BBF" stroke-width="3.33333"/>
                <path fill-rule="evenodd" clip-rule="evenodd" d="M132.526 84.4851C132.178 84.05 131.783 83.6546 131.348 83.3065L135.485 79.1688C135.902 79.5368 136.296 79.9305 136.664 80.3473L132.526 84.4851ZM134.121 88.3333C134.151 88.6069 134.167 88.8849 134.167 89.1667C134.167 89.4483 134.151 89.7263 134.121 89.9999H139.973C139.99 89.7244 139.998 89.4465 139.998 89.1667C139.998 88.8868 139.99 88.6089 139.973 88.3333H134.121ZM125.833 75.8612V81.7125C126.106 81.6822 126.385 81.6667 126.667 81.6667C126.948 81.6667 127.226 81.6822 127.5 81.7124L127.5 75.8612C127.225 75.8442 126.947 75.8356 126.667 75.8356C126.387 75.8356 126.109 75.8442 125.833 75.8612Z" fill="#1F5BBF"/>
                </svg>
                <span>{{ndc.text || '暂无数据'}}</span>
    </div>
    `
}