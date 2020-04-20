import "./extensions.js"

export class EventHandler {

	constructor(delegate, window) {
		this.delegate = delegate
		this.window = window;
		this.setupEvents();
	}

	setupEvents() {
		this.window.addEventListener("visibilitychange", this.onVisibilityChange.bind(this));
		this.window.addEventListener("resize", this.onResize.bind(this));
		this.window.addEventListener("click", this.onClick.bind(this));
		this.window.addEventListener("keydown", this.onKey.bind(this));
		this.window.addEventListener("keyup", this.onKey.bind(this));
	}

	addEventListener(eventName, cb) {
		this.window.addEventListener(eventName, cb);
	}

	onClick(evt) {
		this.callDelegate("onClick", evt);
	}

	onKey(evt) {
		let typeSuffix = evt.type == "keyup" ? "KeyUp" : "KeyDown";
		let key = evt.key.uppercaseFirst();
		if (key == " ") {
			key = "Space";
		}
		let eventName = `on${key}${typeSuffix}`;
		this.callDelegate(eventName, evt);
		this.callDelegate(`on${typeSuffix}`, evt);
	}

	onResize(evt) {
		this.callDelegate("onResize", evt);
	}

	onVisibilityChange(evt) {
		this.callDelegate("onVisibilityChange", evt);
	}

	callDelegate(type, evt) {
		if (this.delegate[type]) {
			this.delegate[type](evt);
		} else {
			//console.warn(type, "not implemented in delegate");
		}
	}
}