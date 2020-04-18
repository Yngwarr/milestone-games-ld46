import {EntityElement} from "./hgl/elements.js"

export class CustomerElement extends EntityElement {
	constructor(data, rect) {
		super();
		this.data = data;
		this.rect = rect;
		this.clicks = 0;
		this.innerText = this.data.title;
		this.addEventListener("click", fn => {
			this.clicks++;
		})
	}

	tick(game) {
		if (this.clicks >= 3) {
			window.dispatchEvent(new CustomEvent("placeholderClickedThreeTimes", {detail:this}));
			this.remove();
		}
	}

	static selector() {
		return "x-placeholder";
	}
}