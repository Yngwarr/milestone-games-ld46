import {Rect} from "./hgl/geometry.js"
import {CustomerElement} from "./CustomerElement.js"
import {ProductElement} from "./ProductElement.js"
import {CustomerState} from "./Constants.js"

import {DialogController} from "./DialogController.js"

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

		this.dialogController = new DialogController(this);

		this.currentCustomerPatienceTimeout = null;
	}

	get queueLength() {
		return this.queueEnterElement.childElementCount;
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
			// If a product is waiting for the consumer
			window.clearTimeout(customerElm.patienceTimeout);
			this.dialogController.showDialog(customerElm.request);
			this.dialogController.markAsCompleted()
			customerElm.state = CustomerState.satisfied;
			productElm.consume();
			window.setTimeout(e => {
				customerElm.startLeavingHappy();
				this.dialogController.hideDialog();
			}, 1000);

		} else {
			// No product ready for the customer to consume
			customerElm.state = CustomerState.idle;
			window.setTimeout(e => {
				customerElm.state = CustomerState.waiting;
				this.dialogController.showDialog(customerElm.request, customerElm.patienceDuration);
				customerElm.patienceTimeout = window.setTimeout(this.onCustomerPatienceExpired.bind(this), customerElm.patienceDuration, customerElm);
			}, 1000);
		}
	}

	onCustomerPatienceExpired(customerElm) {
		window.clearTimeout(customerElm.patienceTimeout);
		// main delegate cash exchange!
		customerElm.state = CustomerState.dissatisfied;
		this.dialogController.markAsFailed()
		window.setTimeout(e => {
			this.dialogController.hideDialog();
			customerElm.startLeavingAngry();
		}, 1000)
	}

	onCustomerLeft(evt) {
		console.log("removing", evt.detail);
		evt.detail.remove();
	}

	onProductStoppedFirstInLine(evt) {
		let productElm = evt.detail;
		let customerElm = this.firstInLineCustomer;
		if (customerElm) {
			if (customerElm.state != CustomerState.waiting) {
				return;
			}
			console.log("satisfied", customerElm);
			customerElm.state = CustomerState.satisfied;
			window.clearTimeout(customerElm.patienceTimeout);
			this.dialogController.markAsCompleted();
			productElm.consume();
			window.setTimeout(e => {
				customerElm.startLeavingHappy();
				this.dialogController.hideDialog();
			}, 2000);
		} else {
			console.error("A product but no customer!??");
		}
	}
}