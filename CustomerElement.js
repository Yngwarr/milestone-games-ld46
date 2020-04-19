import {EntityElement} from "./hgl/elements.js"
import {Rect, Point} from "./hgl/geometry.js"
import {CustomerState} from "./Constants.js"

export class CustomerElement extends EntityElement {
	constructor(data) {
		super();
		this.spriteElement = document.createElement("div");
		this.spriteElement.classList.add("sprite");
		this.appendChild(this.spriteElement);
		this.dataset.sprite = data.sprite || 0;

		this.data = data;
		this.request = data.request;
		this.patienceDuration = 10000;
		this.patienceTimeout = null;
		this.state = CustomerState.idle;
		if (this.data.title) {
			this.title = this.data.title;
		}
	}

	set state(state) {
		this._state = state;
		this.dataset.state = state;
	}

	get state() {
		return this._state;
	}

	wantsProduct(productElm) {
		return this.request.indexOf(productElm.dataset.type) != -1;
	}

	validateRequestSatisfaction() {
		return this.request.length == 0;
	}

	takeProduct(productElm) {
		let i = this.request.indexOf(productElm.type);
		if (i != -1) {
			this.request.splice(i, 1);
		}
		productElm.destroy();
	}

	tick(game) {
		// Enter or leave, queuing behind the previous customer
		const walkSpeed = 0.3;
		let walkDistance = 15;
		const distanceBetweenCustomers = Math.floor((Math.random() * walkDistance) * 2);
		const walkDelta = walkDistance * walkSpeed
		const customerIsLeaving = this.parentElement.id == "queue-leave";

		let targetX = 0;
		if (customerIsLeaving) {
			targetX = this.parentElement.getW();
		}

		let x = this.point.x;
		let customerInFront = this.previousSibling;
		if (customerInFront) {
			targetX = customerInFront.point.x + customerInFront.getW() + distanceBetweenCustomers;
		}
		
		if (customerIsLeaving) {
			if (x < targetX) {
				x += walkDelta;
				this.classList.add("walking");
			} else if (x >= targetX) {
				window.dispatchEvent(new CustomEvent("customerLeft", {detail:this}));
			}
		} else {
			if (x > targetX) {
				x -= walkDelta;
				this.classList.add("walking");
			} 
		}

		if (!customerIsLeaving && !customerInFront && x <= targetX) {
			x = targetX;
		}
		
		if ((!customerIsLeaving && x <= targetX) || (customerIsLeaving && x >= targetX)) {
			if (this.classList.contains("walking")) {
				this.classList.remove("walking");
				if (!customerIsLeaving && !customerInFront) {
					window.dispatchEvent(new CustomEvent("customerStoppedFirstInLine", {detail:this}));
				}
			}
		}

		let point = this.point;
		point.x = x;
		this.point = point;
	}

	leave() {
		this.remove();
	}

	startLeaving() {
		this.closest("#shop").querySelector("#queue-leave").appendChild(this);
	}

	startLeavingHappy() {
		this.startLeaving();
		this.classList.add("happy");
	}

	startLeavingAngry() {
		this.startLeaving();
		this.classList.add("angry");
	}

	static selector() {
		return "x-customer";
	}
}