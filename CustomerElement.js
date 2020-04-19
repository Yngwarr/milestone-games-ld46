import {EntityElement} from "./hgl/elements.js"
import {Rect, Point} from "./hgl/geometry.js"
import {CustomerState} from "./Constants.js"

export class CustomerElement extends EntityElement {
	constructor(data) {
		super();
		this.wrapperElement = document.createElement("div");
		this.wrapperElement.classList.add("wrapper");
		this.spriteElement = document.createElement("div");
		this.spriteElement.classList.add("sprite");
		this.appendChild(this.wrapperElement);
		this.wrapperElement.appendChild(this.spriteElement);
		this.wrapperElement.appendChild(this.spriteElement);
		this.dataset.sprite = data.sprite || 0;

		this.data = data;
		this.request = data.request;
		this.purchasedProducts = [];
		this.patienceDuration = 100000;
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
			this.purchasedProducts.push(productElm.type);
		}
		productElm.destroy();
	}

	payForProducts() {
		window.dispatchEvent(new CustomEvent("customerPaidForProducts", {detail:this.purchasedProducts.clone()}));
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
		this.dataset.outcome = "happy";
		this.classList.add(this.dataset.outcome);
	}

	startLeavingDisappointed() {
		this.startLeaving();
		this.dataset.outcome = "disappointed";
		this.classList.add(this.dataset.outcome);
	}

	startLeavingAngry() {
		this.startLeaving();
		this.dataset.outcome = "angry";
		this.classList.add(this.dataset.outcome);
	}

	static selector() {
		return "x-customer";
	}
}