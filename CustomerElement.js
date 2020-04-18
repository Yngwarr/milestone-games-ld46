import {EntityElement} from "./hgl/elements.js"
import {Rect, Point} from "./hgl/geometry.js"

export class CustomerElement extends EntityElement {
	constructor(data) {
		super();
		this.data = data;
		this.patienceDuration = 5000;
		this.patienceTimeout = null;

		this.title = this.data.title;
		this.addEventListener("click", fn => {
			this.parentElement.parentElement.querySelector("#queue-leave").appendChild(this);
		})
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