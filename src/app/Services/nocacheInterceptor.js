export function nocacheInterceptor() {
    'ngInject';

    let interceptor = {
        request: (config)=> {
            return config;
        }
    }

    return interceptor;

}