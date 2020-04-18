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

		window.addEventListener("customerStoppedFirstInLine", this.onCustomerStoppedFirstInLine.bind(this));
		window.addEventListener("productStoppedFirstInLine", this.onProductStoppedFirstInLine.bind(this));
		window.addEventListener("customerLeft", this.onCustomerLeft.bind(this));

		this.currentCustomerPatienceTimeout = null;
	}

	get queueLength() {
		return this.queueLength.childElementCount;
	}

	get firstInLineProduct() {
		return this.productBeltElement.querySelector("x-product:first-child:not(.moving)");
	}

	get firstInLineCustomer() {
		return this.queueEnterElement.querySelector("x-customer:first-child:not(.walking)");
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

	// Delegation

	onCustomerStoppedFirstInLine(evt) {
		let customerElm = evt.detail;
		let productElm = this.firstInLineProduct;
		if (productElm) {
			window.clearTimeout(customerElm.patienceTimeout);
			productElm.consume();
			customerElm.classList.remove("waiting");
			// main delegate cash exchange!
			customerElm.startLeavingHappy();
		} else {
			console.log("started waiting:", customerElm.data.title, customerElm.patienceDuration);
			customerElm.patienceTimeout = window.setTimeout(this.onCustomerPatienceExpired.bind(this), customerElm.patienceDuration, customerElm);
			customerElm.classList.add("waiting");
		}
	}

	onCustomerPatienceExpired(customerElm) {
		window.clearTimeout(customerElm.patienceTimeout);
		console.log("patience expired", customerElm.data.title);
		customerElm.classList.remove("waiting");
		// main delegate cash exchange!
		customerElm.startLeavingAngry();
	}

	onCustomerLeft(evt) {
		console.log("removing", evt.detail);
		evt.detail.remove();
	}

	onProductStoppedFirstInLine(evt) {
		let productElm = evt.detail;
		let customerElm = this.firstInLineCustomer;
		if (customerElm) {
			customerElm.classList.remove("waiting");
			productElm.consume();
			customerElm.startLeavingHappy();
		} else {
			console.log("A product but no customer!??")
		}
	}
}