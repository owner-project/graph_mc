// import toast from '../components/modal/toast/toast';
import cookie from 'js-cookie';

export class LoginController {
	constructor ($injector) {
		'ngInject';
		this.inject = $injector;
		this.isLogin = false;
    	this.init();
		this.rememberPassword = false;
		this.toaster = this.inject.get('toaster')
		this.state = this.inject.get('$state');
		const $location = this.inject.get('$location');
		this.cache = this.inject.get('cache');
		const r_type = $location.$$search.r_type;

		if ($location.$$search) {
			if ($location.$$search.t === 'pki') {
				this.loginPKI();
			} else if ($location.$$search.token_bdp) {
				this.loginBDP();
			} else {
				switch(r_type) {
          			case 'person_card_graph':
						this.cache.changeLoginStatus(true);
						this.save_and_tograph();
						this.cache.setHeaderHide();
              			break;
					default:
						this.login_init();
				}
			}
		}
		else {
			this.login_init();
		}

	}

	login_init() {
		const state = this.inject.get('$state');
		const user = this.cache.getLoginDataCache();
		const $this = this;
		if (user) {
		    state.go('main.home');
		} else {
		    if (cookie.get('username')) {
		        this.username = cookie.get('username');
		    }

		    if (cookie.get('rememberPassword')) {
		        this.rememberPassword = true;
		        this.password = atob(cookie.get('password'));
		    }
		}
		document.onkeydown = function(e) {
			e = e || event;
			if(e.keyCode == 13) {
				_.debounce(() => {
					$this.login(e)
				},1000)
			}
		}
	}

	/**
	 * @description 页面初始化
	 *
	 * @memberof LoginController
	 */
	init() {
		let $this = this;
		$this.error = {};
		$this.errorTip = {};
		const loginService = $this.inject.get('loginService');
		loginService.getAllDic().then(res => {
			if(res.status == 200){
				let root = $this.inject.get('$rootScope');
				root.dicData = res.data
				localStorage.setItem('dicData',JSON.stringify(root.dicData))
			}
			else{
				root.dicData = localStorage.getItem('dicData') || null
			}
		})
	}

	/**
	 * @description 登录校验
	 *
	 * @returns
	 * @memberof LoginController
	 */
	checkLogin() {
		let canLogin = true;
		let util = this.inject.get('util');
		this.username = util.trim(this.username);
		if(!this.username) {
			this.error.username = true;
			this.errorTip.username = '用户名不能为空';
			canLogin = false;
		}
		if(!this.password) {
			this.error.password = true;
			this.errorTip.password = '密码不能为空';
			canLogin = false;
		}
		return canLogin;
	}

	/**
	 * @description 错误提示重置
	 *
	 * @memberof LoginController
	 */
	focus() {
		this.error.username = false;
		this.errorTip.username = '';
		this.error.password = false;
		this.errorTip.password = '';
	}

	loginPKI() {
        let loginService = this.inject.get('loginService');
        let $location = this.inject.get('$location');

        const params = {
            policeId: $location.$$search.n
        };

        loginService.loginPKI(params).then(result => {
            if (result.status === 200 && result.data.status === 0) {
				let t = new Date()
				let currentTime = t.getFullYear().toString() + (t.getMonth()+1) + t.getDate() + t.getHours() + t.getMinutes() + t.getSeconds()
				result.data.data.loginTime = currentTime
                this.cache.loginDataCache(result.data.data);
				this.cache.changeLoginStatus(false);
                const path = $location.$$search.l;
                if (path) {
                    location.hash = path;
                } else {
                    this.state.transitionTo('main.home', {}, {
                        reload: false,
                        inherit: true,
                        notify: true,
                        relative: this.state.$current,
                        location: true
                    });
                }
                // new toast(this.inject, {
                //     str: '登录成功',
                //     position: 'right-top'
                // }).success();
				this.toaster.pop({type:'success',title:'登录成功'});

            }
        }, error => {
            //
        });
	}

    save_and_tograph() {
        const $location = this.inject.get('$location');
        const person_card = $location.$$search.person_card.split('-');

        if(person_card && person_card.length > 0) {
            this.cache.peronCardToGraphDataCache(person_card);
        }

        this.inject.get('$timeout')(() => {
            this.state.go('main.personcardtograph');
        }, 500);
    }

	loginBDP() {
		const loginService = this.inject.get('loginService');
		const $location = this.inject.get('$location');
		const token = $location.$$search.token_bdp;
		const type = $location.$$search.type;
		loginService.getInputSSO(token).then(res => {
			if(res.status === 200 && res.data.status === 0) {
				let t = new Date()
				let currentTime = t.getFullYear().toString() + (t.getMonth()+1) + t.getDate() + t.getHours() + t.getMinutes() + t.getSeconds()
				res.data.user.loginTime = currentTime
				this.cache.loginDataCache(res.data.user);
				this.cache.changeLoginStatus(false);
				if (res.data.titleList) {
					this.cache.bdpDataCache(res.data.titleList);
				}
				// 如果存在type 且type为 tag_import 需要跳到首页,并带上importId  进行打标签
				if(type && type == 'tag_import'){
					const href = this.state.href('main.home');
					const importId = $location.$$search.importId;
					location.href = `${href}?importId=${importId}`;
					return false;
				}
				const href = this.state.href('main.porpoise');
				location.href = href + '?bdpGo=1';
			}
		})
	}

	/**
	 * @description 登录
	 *
	 * @param {any} e
	 * @memberof LoginController
	 */
	login(e) {
		let $this = this;
		e.stopPropagation();
		this.isLogin = true;
		let login = this.inject.get('loginService');
		let root = this.inject.get('$rootScope');
		root.urlData.chooseMenu = 'home'
		if(this.checkLogin()) {
			login.login({
				username: this.username,
				password: this.password,
                rememberMe: this.rememberPassword
			}).then((data) => {
				this.isLogin = false;
				this.cache.changeLoginStatus(false);
				if(data.status === 200) {
					if(data.data.status === 0) {
						let t = new Date()
						let currentTime = t.getFullYear().toString() + (t.getMonth()+1) + t.getDate() + t.getHours() + t.getMinutes() + t.getSeconds()
						data.data.data.loginTime = currentTime
						this.cache.loginDataCache(data.data.data);
						if (this.rememberPassword) {
						    cookie.set('rememberPassword', true, {expires: 7});
                            cookie.set('password', btoa(this.password), {expires: 7});
                        } else {
                            cookie.remove('rememberPassword');
                            cookie.remove('password');
                        }

                        cookie.set('username', this.username, {expires: 20});

                        this.state.transitionTo('main.home', {}, {
							reload: false,
							inherit: true,
							notify: true,
							relative: this.state.$current,
							location: true
						});
							// new toast($this.inject, {
							// 	str: '登录成功',
							// 	position: 'right-top'
							// }).success()
							this.toaster.pop({type:'success',title:'登录成功'});
					}
					else {
						$this.error.password = true;
						$this.errorTip.password = data.data.msg;
					}
				}
			});
		}
		else {
			$this.isLogin = false;
		}
	}
}
