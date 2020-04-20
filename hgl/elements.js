import {Point, Rect, Size} from "./geometry.js"

export class EntityElement extends HTMLElement {
	constructor() {
		super();
		this._rect = new Rect();
	}

	static selector() {
		return "x-entity";
	}

	static register() {
		if (!window.customElements.get(this.selector())) {
			window.customElements.define(this.selector(), this);
		}
	}

	get point() {
		return this._rect.point;
	}

	set point(point) {
		let rect = this.rect;
		rect.point = point;
		this.rect = rect;
	}

	get rect() {
		return this._rect;
	}

	set rect(rect) {
		this._rect = rect;
		this.style.transform = `translate(${rect.point.x}px, ${rect.point.y}px)`;
		this.style.width = `${rect.size.w}px`;		
		this.style.height = `${rect.size.h}px`;		
	}

	get size() {
		return this._rect.size;
	}

	set size(size) {
		let rect = this.rect;
		rect.size = size;
		this.rect = rect;
	}

	set sprite(sprite) {
		this.dataset.sprite = sprite;
	}

	get sprite() {
		return this.dataset.sprite;
	}


	tick(game) {
		// No-op
	}

	moveTowardsPoint(targetPoint, speed, callback) {
		// Get the direction in x and y (delta)
		var directionX = targetPoint.x - this.rect.centerPoint.x;
		var directionY = targetPoint.y - this.rect.centerPoint.y;

		// Normalize the direction
		var len = Math.sqrt(directionX * directionX + directionY * directionY);
		directionX /= len;
		directionY /= len;

		//TODO: figure out how to use delta to get smooth movement
		let deltaTime = 1;

		// calculate remaining distance
		var dx = targetPoint.x - this.rect.centerPoint.x;
		var dy = targetPoint.y - this.rect.centerPoint.y;
		var lenSquared = dx * dx + dy * dy;

	    // distance to cover in this update
	    var distToCover = deltaTime * speed;

	    // Check if the remaining distance is smaller than the 
	    // distance to cover. If yes, set location to target location.
	    // Also set the "targetReached" flag to true
	    let x,y = 0;
	    if(lenSquared < distToCover * distToCover){
	    	if (callback) {
	    		callback();
	    	}
	    } else {
	    	x = distToCover * directionX;
	    	y = distToCover * directionY;
	    }
	    this.point = this.point.pointOffsetBy(x,y);
	}
}


export class PlaceholderElement extends EntityElement {
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

EntityElement.register();
PlaceholderElement.register();