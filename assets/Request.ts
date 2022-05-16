const { ccclass, property } = cc._decorator;
@ccclass


export default class Request extends cc.Component {


	/**
	 * 如果在window['apiDoMain']设置了域名
	 * 则覆盖掉private domain
	 */
	constructor() {
		super();
		if (window['apiDoMain'] != '' && window['apiDoMain'] != null) {
			this.domain = window['apiDoMain'];
		}
	}

	static getApp() {
		!this.request ? this.request = new Request() : 1;
		return this.request;
	}


	static request: Request = null;


	/**
	 * 域名
	 */
	public domain: string = 'https://spine.sunstones.cc/';//测试域名
	// private domain: string = 'https://hotel.game.quanminxiaodian.com/index.php/api/';//测试域名


	/**
	 * 超时时间
	 */
	private timeout: number = 5000;


	/**
	 * 开启超时重试
	 */
	private retry: boolean = true;


	/**
	 * 超时重试次数上限
	 */
	private retryTime: number = 2;


	/**
	 * 访问类型
	 */
	private type: string = 'POST';


	/**
	 * 访问接口
	 * @param route 访问路径
	 * @param data 发送的数据
	 * @param call 回调
	 */
	open(route: string, data: any = null, call: Function = () => { }, retry: number = 0) {
		let xhr = new XMLHttpRequest();
		xhr.timeout = this.timeout;
		xhr.onload = () => {
			if (xhr.readyState == 4 && xhr.status == 200) {
				let json;
				try {
					json = JSON.parse(xhr.responseText);
				} catch (error) {
					json = xhr.responseText;
				}
				call(json);
			} else {
				if (this.retry) {
					if (retry >= this.retryTime) {
					} else {
						this.scheduleOnce(() => {
							this.open(route, data, call, retry + 1);
						}, 0.5);
					}
				}
			}
		};
		xhr.ontimeout = () => {
			if (this.retry) {
				if (retry >= this.retryTime) {
				} else {
					this.open(route, data, call, retry + 1);
				}
			}
		}
		xhr.onerror = (err: any) => {
		};
		let str = null;
		if (data) str = JSON.stringify(data);
		let timeStamp = this.getTimeStamp();
		// let sign = this.getSign(str, timeStamp);
		xhr.open(this.type, this.domain + route, true);
		xhr.send(str);
	}


	getTimeStamp(): number {
		let timeStamp = Date.parse(new Date() + '') / 1000;
		return timeStamp;
	}


	getCookie(name) {
		let cookie = document.cookie;
		let cookieArr = cookie.split('; ');
		let arr = new Array();
		cookieArr.forEach((res: string) => {
			let test = res.split('=');
			arr[test[0]] = test[1];
		});
		if (arr[name]) {
			return (arr[name]);
		}
		else {
			return null;
		}
	}
}
