import {EntityElement} from "./hgl/elements.js"
import {Rect, Point} from "./hgl/geometry.js"

export class CustomerElement extends EntityElement {
	constructor(data) {
		super();
		this.data = data;
		this.clicks = 0;
		this.innerText = this.data.title;
		this.addEventListener("click", fn => {
			this.remove();
		})
	}

	tick(game) {
		// Queue behind the previous customer
		const walkSpeed = 0.08;
		const walkDistance = 15;
		const distanceBetweenCustomers = 10;
		const walkDelta = walkDistance * walkSpeed
		let x = this.getX();
		let walkToPoint = new Point(this.getX()-walkDistance,this.getY())
		let aheadCustomerElm = this.previousSibling;
		let minX = 0;
		let distanceToNextObject = 0;
		if (aheadCustomerElm) {
			minX = aheadCustomerElm.getX()+aheadCustomerElm.getW()+distanceBetweenCustomers;
		}
		
		if (x > minX) {
			x -= walkDelta;
			this.classList.add("walking");
		} else {
			this.classList.remove("walking");
		}

		this.setX(x);
	}

	static selector() {
		return "x-customer";
	}
}