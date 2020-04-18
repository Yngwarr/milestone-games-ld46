import {EntityElement} from "./hgl/elements.js"
import {Rect, Point} from "./hgl/geometry.js"
import {CustomerState} from "./Constants.js"

export class CustomerElement extends EntityElement {
	constructor(data) {
		super();
		this.spriteElement = document.createElement("div");
		this.spriteElement.classList.add("sprite");
		this.appendChild(this.spriteElement);

		this.data = data;
		this.patienceDuration = 10000;
		this.patienceTimeout = null;
		this.state = CustomerState.IDLE;
		if (this.data.title) {
			this.title = this.data.title;
		}
	}

	set state(state) {
		console.log("setting state", state);
		this._state = state;
		this.dataset.state = state;
	}

	get state() {
		return this._state;
	}

	tick(game) {
		// Enter or leave, queuing behind the previous customer
		const walkSpeed = 0.3;
		let walkDistance = 15;
		const distanceBetweenCustomers = 10;
		const walkDelta = walkDistance * walkSpeed
		const customerIsLeaving = this.parentElement.id == "queue-leave";

		let targetX = 0;
		if (customerIsLeaving) {
			targetX = this.parentElement.getW();
		}

		let x = this.getX();
		let aheadCustomerElm = this.previousSibling;
		if (aheadCustomerElm) {
			targetX = aheadCustomerElm.getX()+aheadCustomerElm.getW()+distanceBetweenCustomers;
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
		
		if (x == targetX) {
			if (this.classList.contains("walking")) {
				this.classList.remove("walking");
				if (!customerIsLeaving && !aheadCustomerElm) {
					window.dispatchEvent(new CustomEvent("customerStoppedFirstInLine", {detail:this}));
				}
			}
		}

		this.setX(x);
	}

	leave() {
		this.remove();
	}

	startLeaving() {
		this.closest("#interior").querySelector("#queue-leave").appendChild(this);
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