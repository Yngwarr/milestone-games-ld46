import {CustomerElement} from "./CustomerElement.js"

export class CoffeeHouseController {

	constructor(delegate) {
		this.delegate = delegate;
		this.queueElement = document.getElementById("world");
		this.worldElement = document.getElementById("world");
		this.interiorElement = document.getElementById("interior");
		this.queueElement = document.getElementById("queue");
	}

	get queueLength() {
		return this.queueLength.childElementCount;
	}

	addCustomer(elm) {
		let c = new CustomerElement();
		this.queue.appendChild(elm);
	}

	tick() {
		// Update UI in coffee house
	}
}