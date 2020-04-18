import {EntityElement} from "./hgl/elements.js"
import {Rect, Point} from "./hgl/geometry.js"

export class ProductElement extends EntityElement {
	constructor(data) {
		super();
		this.data = data;
		this.clicks = 0;
		this.title = this.data.title;
	}

	tick(game) {
		// Enter or leave, queuing behind the previous customer
		const walkSpeed = 0.8;
		let walkDistance = 15;
		const distanceBetweenObjects = 10;
		const walkDelta = walkDistance * walkSpeed;
		let minX = this.parentElement.getW() - this.getW(); 

		let x = this.getX();
		let aheadObjectElm = this.previousSibling;
		if (aheadObjectElm) {
			minX = aheadObjectElm.getX() - this.getW() - distanceBetweenObjects;
		}
	
		if (x < minX) {
			x += walkDelta;
			this.classList.add("moving");
		}
		
		if (x >= minX) {
			x = minX;
			if (this.classList.contains("moving")) {
				this.classList.remove("moving");
				if (!aheadObjectElm) {
					window.dispatchEvent(new CustomEvent("productStoppedFirstInLine", {detail:this}));
				}
			}
		}

		this.setX(x);
	}

	static selector() {
		return "x-product";
	}

	consume() {
		this.remove();
	}
}