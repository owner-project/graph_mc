export default class clock {
    constructor(){
        this.waitTIme = 2*60*60*1000;//超时登出时间设置
    }

    init() {
        window.clock = new Date().getTime();
    }

    triggerClock() {
        if((new Date().getTime() - window.clock) > (this.waitTIme)) {
            return true;
        }
        return false;
    }

}
