import Request from "./Request";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Main extends cc.Component {

	@property({ type: cc.Prefab })
	aniBtn: cc.Prefab = null;
	@property({ type: cc.Node })
	backNode: cc.Node = null;
	@property({ type: cc.Node })
	logNode: cc.Node = null;

	spine: sp.Skeleton = null;
	/**
	 * 从当前URL中获取参数
	 * @param name 参数名称,如果不指定参数名称则返回全部参数
	 * @returns 值
	 */
	getUrlParam(name?: string): string {
		let url = location.search; //获取url中"?"符后的字串
		let theRequest = {};
		if (url.indexOf("?") != -1) {
			let str = url.substring(1);
			let strs = str.split("&");
			for (let i = 0; i < strs.length; i++) {
				theRequest[strs[i].split("=")[0]] = decodeURI(strs[i].split("=")[1]);
			}
		}
		if (name) return theRequest[name];
	}

	getWindowParam(key: string): string {
		return window[key];
	}

	name: string = null;
	track: number = 0;
	alpha: boolean = false;
	onLoad() {
		window['cocos'] = {
			setName: (name) => {
				this.name = name;
				this.spine.setAnimation(this.track, this.name, true);
			},
			setColor: (str) => {
				let color: cc.Color = new cc.Color();
				cc.Color.fromHEX(color, str);
				this.backNode.color = color;
			},
			setTrack: (track) => {
				this.track = track;
				this.spine.setAnimation(this.track, this.name, true);
			},
			setAlpha: (alpha) => {
				this.spine.premultipliedAlpha = alpha;
			},
		};
		let data: ReqUrls = {
			json: this.getWindowParam('json'),
			png: this.getWindowParam('png'),
			atlas: this.getWindowParam('atlas')
		};
		this.loadRemote(data, (json: cc.JsonAsset, png: cc.Texture2D, atlas: cc.TextAsset) => {
			this.log('加载完成');
			try {
				let text = atlas.text;
				let arr = text.split('\n');
				let name = arr[1];
				let node: cc.Node = new cc.Node();
				node.parent = this.node;
				let spine: sp.Skeleton = node.addComponent(sp.Skeleton);
				this.spine = spine;
				let skeletonData: sp.SkeletonData = new sp.SkeletonData();
				skeletonData.skeletonJson = json.json;
				skeletonData.textures.push(png);
				skeletonData.atlasText = atlas.text;
				skeletonData.textureNames.push(name);
				spine.skeletonData = skeletonData;
				let actionNames: string[] = [];
				for (let key in json.json.animations) {
					actionNames.push(key);
				}
				if (actionNames.length) {
					this.name = actionNames[0];
					spine.setAnimation(0, actionNames[0], true);
					this.createAniBtns(actionNames);
					this.setTouch();
					this.log('');
				} else {
					this.log('获取动画列表失败');
				}

			} catch (error) {
				this.log('加载动画失败');
				console.error(error);
			}
		});

	}


	createAniBtns(list: string[]) {
		window['func'].aniList(list);
	}

	log(str) {
		this.logNode.getComponent(cc.Label).string = str;
	}

	protected loadRemote(urls: Urls, call: (json: cc.JsonAsset, png: cc.Texture2D, atlas: cc.TextAsset) => void) {
		let json: cc.JsonAsset = null;
		let png: cc.Texture2D = null;
		let atlas: cc.TextAsset = null;
		let check: () => void = () => {
			if (png && json && atlas) {
				call(json, png, atlas);
			}
		};
		this.log('正在加载资源');
		cc.assetManager.loadRemote(urls.png, (err, res: cc.Texture2D) => {
			if (err) {
				this.log('.png文件加载失败');
				return;
			};
			this.log('.png文件加载成功');
			png = res;
			check();
		});
		cc.assetManager.loadRemote(urls.json, (err, res: cc.JsonAsset) => {
			if (err) {
				this.log('.json文件加载失败');
				return;
			};
			this.log('.json文件加载成功');
			json = res;
			check();
		});
		cc.assetManager.loadRemote(urls.atlas, (err, res: cc.TextAsset) => {
			if (err) {
				this.log('.atlas文件加载失败');
				return;
			};
			this.log('.atlas文件加载成功');
			atlas = res;
			check();
		});
	}

	setTouch() {
		this.node.on(cc.Node.EventType.TOUCH_MOVE, (res) => {
			this.spine.node.x += res.getDelta().x;
			this.spine.node.y += res.getDelta().y;
		});
		cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, (res) => {
			console.log(res.keyCode);
		});
		this.node.on(cc.Node.EventType.MOUSE_WHEEL, (res) => {
			this.spine.node.scale += res.getScrollY() / 1200;
			if (this.spine.node.scale < 0.1) this.spine.node.scale = 0.1;
			console.log(res.getScrollY());
		});
	}


}
export type Urls = {
	png: string,
	json: string,
	atlas: string
};
export type ReqUrls = {
	png: string,
	json: string,
	atlas: string,
};