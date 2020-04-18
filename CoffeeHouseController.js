import {Rect} from "./hgl/geometry.js"
import {CustomerElement} from "./CustomerElement.js"

export class CoffeeHouseController {

	constructor(delegate) {
		this.delegate = delegate;
		this.worldElement = document.getElementById("world");
		this.interiorElement = document.getElementById("interior");
		this.queueEnterElement = document.getElementById("queue-enter");
		this.queueExitElement = document.getElementById("queue-exit");
		CustomerElement.register();
	}

	get queueLength() {
		return this.queueLength.childElementCount;
	}

	addCustomer() {
		let elm = new CustomerElement({});
		this.queueEnterElement.appendChild(elm);
		elm.setX(this.queueEnterElement.getW());
		elm.setY(this.queueEnterElement.getH() - elm.getH());
	}

	tick() {
		this.interiorElement.querySelectorAll("x-customer").forEach(elm => elm.tick());
		// Update UI in coffee house
	}
}