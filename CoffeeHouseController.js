import {Rect} from "./hgl/geometry.js"
import {CustomerElement} from "./CustomerElement.js"
import {ProductElement} from "./ProductElement.js"

export class CoffeeHouseController {

	constructor(delegate) {
		this.delegate = delegate;
		this.worldElement = document.getElementById("world");
		this.interiorElement = document.getElementById("interior");
		this.queueEnterElement = document.getElementById("queue-enter");
		this.queueExitElement = document.getElementById("queue-exit");
		this.productBeltElement = document.getElementById("product-belt");
		CustomerElement.register();
		ProductElement.register();

		this.addCustomer({title:"CC"});
		this.addCustomer({title:"JM"});
		this.addCustomer({title:"RR"});
	}

	get queueLength() {
		return this.queueLength.childElementCount;
	}

	get firstInLineProduct() {
		return this.productBeltElement.querySelector("x-product:first-child:not(.moving)");
	}

	get firstInLineCustomer() {
		return this.queueEnterElement.querySelector("x-customer:first-child:not(.moving)");
	}

	addCustomer(data = {}) {
		let elm = new CustomerElement(data);
		this.queueEnterElement.appendChild(elm);
		elm.setX(this.queueEnterElement.getW());
		elm.setY(this.queueEnterElement.getH() - elm.getH());
	}

	addProduct() {
		let elm = new ProductElement({title:"Coffee"});
		this.productBeltElement.appendChild(elm);
		elm.setX(0);
		elm.setY(this.productBeltElement.getH() - elm.getH());
	}

	tick() {
		this.interiorElement.querySelectorAll("x-customer").forEach(elm => elm.tick());
		this.interiorElement.querySelectorAll("x-product").forEach(elm => elm.tick());
		// Update UI in coffee house
	}
}