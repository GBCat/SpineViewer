import Request from "./Request";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Main extends cc.Component {

	@property({ type: cc.Node })
	aniContent: cc.Node = null;
	@property({ type: cc.Prefab })
	aniBtn: cc.Prefab = null;
	@property({ type: cc.Node })
	backNode: cc.Node = null;


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
	onLoad() {
		let id = parseInt(this.getUrlParam('id'));
		Request.getApp().open('index/get_urls', { id: id }, (res: any) => {
			console.log(res);
			if (res.errMsg == 'ok') {
				let data: ReqUrls = res.data;
				data.json = Request.getApp().domain + 'storage/' + data.json;
				data.png = Request.getApp().domain + 'storage/' + data.png;
				data.atlas = Request.getApp().domain + 'storage/' + data.atlas;
				this.loadRemote(data, (json: cc.JsonAsset, png: cc.Texture2D, atlas: cc.TextAsset) => {
					console.log('加载完成');
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
					spine.setAnimation(0, actionNames[0], true);
					this.createAniBtns(actionNames);
					this.setTouch();
				});
			}
		});
	}


	createAniBtns(list: string[]) {
		list.forEach((item: string) => {
			let node: cc.Node = cc.instantiate(this.aniBtn);
			node.parent = this.aniContent;
			node.children[0].getComponent(cc.Label).string = item;
			node.on(cc.Node.EventType.TOUCH_END, () => {
				this.spine.setAnimation(this.track, item, true);
			});
		});
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
		cc.assetManager.loadRemote(urls.png, (err, res: cc.Texture2D) => {
			if (err) return;
			png = res;
			check();
		});
		cc.assetManager.loadRemote(urls.json, (err, res: cc.JsonAsset) => {
			if (err) return;
			json = res;
			check();
		});
		cc.assetManager.loadRemote(urls.atlas, (err, res: cc.TextAsset) => {
			if (err) return;
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

	track: number = 0;
	setTrack(event, data) {
		this.track = parseInt(data);
	}

	amplification() {
		this.spine.node.scale += 0.1;
	}

	narrow() {
		this.spine.node.scale -= 0.1;
	}

	premultipliedAlpha() {
		this.spine.premultipliedAlpha = !this.spine.premultipliedAlpha;
	}
	backColor: number = 0;
	setBackColor() {
		if (this.backColor == 0) {
			this.backColor = 1;
			this.backNode.color = new cc.Color(255, 255, 255);
		} else {
			this.backColor = 0
			this.backNode.color = new cc.Color(0, 0, 0);
		}
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
	default: string,
	date: string,
	id: number
};