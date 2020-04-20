import {Rect, Point} from "./hgl/geometry.js"
import {CustomerElement} from "./CustomerElement.js"
import {ProductElement} from "./ProductElement.js"
import {CustomerState} from "./Constants.js"

import {DialogController} from "./DialogController.js"

export class CoffeeHouseController {

	constructor(delegate) {
		this.delegate = delegate;
		this.worldElement = document.getElementById("world");
		this.coffeeShopElement = document.getElementById("shop");
		this.queueEnterElement = document.getElementById("queue-enter");
		this.queueExitElement = document.getElementById("queue-exit");
		this.productBeltElement = document.getElementById("product-belt");
		CustomerElement.register();
		ProductElement.register();

		//DEMO SCORE
		this.happyCustomers = 0;

		// Customers and Products
		window.addEventListener("customerStoppedFirstInLine", this.onCustomerStoppedFirstInLine.bind(this));
		window.addEventListener("productStoppedFirstInLine", this.onProductStoppedFirstInLine.bind(this));
		window.addEventListener("customerLeft", this.onCustomerLeft.bind(this));
		
		// Production
		window.addEventListener("productShipped", this.onProductShipped.bind(this));

		this.dialogController = new DialogController(this);

		this.currentCustomerPatienceTimeout = null;

		this.randomSpriteIds = [];
	}

	openForBusiness() {
		let perhapsSpawnCustomer = e => {
			if (this.queueLength < 4 && Math.random() > 0.8) {
				this.addCustomer();
			}
			window.setTimeout(perhapsSpawnCustomer, Math.random()*500);
		}
		perhapsSpawnCustomer();
	}

	tick() {
		this.coffeeShopElement.querySelectorAll("x-customer").forEach(elm => elm.tick());
		this.coffeeShopElement.querySelectorAll("x-product").forEach(elm => elm.tick());
		// Update UI in coffee house
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
		// Randomizing appearance
		if (this.randomSpriteIds.length == 0) {
			this.randomSpriteIds = Array.from({length: 12}, (_, i) => i).randomize();
		}

		// Randomizing request

		let minRequests = 1;
		let maxRequests = 2;
		if (this.happyCustomers > 5) {
			minRequests = 3;
			maxRequests = 5;
		} else if (this.happyCustomers > 10) {
			minRequests = 4;
			maxRequests = 6;
		} else if (this.happyCustomers > 20) {
			minRequests = 5;
			maxRequests = 9;
		} else if (this.happyCustomers > 25) {
			minRequests = maxRequests = this.happyCustomers / 3;
		}

		let n = Math.max(minRequests, Math.round(Math.random() * maxRequests));
		let request = Array.from({length: n}, e => {
			let type = Math.random() < 0.5 ? "beverage" : "pastry";
			let index = Math.floor(Math.random()*5);
			return `${type}_${index}`;
		});

		data.sprite = this.randomSpriteIds.shift();
		data.request = request;

		let elm = new CustomerElement(data);
		elm.rect = new Rect(this.queueEnterElement.getW(), 16, 96, 192);
		this.queueEnterElement.appendChild(elm);
	}

	addProduct(productType) {
		let elm = new ProductElement(productType);
		let startX = 0;
		let productCategory = ProductElement.getProductCategoryFromProductType(productType);
		switch(productCategory) {
			case "beverage":
				startX = 1123;
				break;
			case "pastry":
				startX = 550;
				break;
			case "breakfast":
				startX = 0;
				break;
		}
		elm.rect = new Rect(startX, this.productBeltElement.getH() - 48, 48, 48);
		elm.classList.add("new");
		window.setTimeout(e => {elm.classList.remove("new")}, 50);
		this.productBeltElement.appendChild(elm);
	}

	canOfferProduct(productTypes) {
		return true;
	}

	requestProducts(productTypes = []) {
		productTypes.forEach(productType => {
			window.dispatchEvent(new CustomEvent("customerOrderedProduct", {detail:productType}));
		})
	}

	// Delegation

	onProductShipped(evt) {
		let productType = evt.detail;
		this.addProduct(productType);
	}

	onCustomerStoppedFirstInLine(evt) {
		let customerElm = evt.detail;
		let productElm = this.firstInLineProduct;
		if (productElm && customerElm.wantsProduct(productElm)) {
			// If a product is waiting for the customer
			// TODO THIS IS NO LONGER TRUE
			customerElm.takeProduct(productElm);
			if (customerElm.validateRequestSatisfaction()) {
				customerElm.payForProducts();
				window.clearTimeout(customerElm.patienceTimeout);
				this.dialogController.showDialog(customerElm.request);
				this.dialogController.markAsHappy()
				customerElm.state = CustomerState.satisfied
				window.setTimeout(e => {
					this.dialogController.hideDialog();
					customerElm.startLeavingHappy();
					this.dialogController.hideDialog();
				}, 600);
			}

		} else {
			// No product ready for the customer to consume
			customerElm.state = CustomerState.idle;

			this.dialogController.showDialog(customerElm.request);
			if(this.canOfferProduct(customerElm.request)) {
				window.setTimeout(e => {
					this.dialogController.startTimer(customerElm.patienceDuration);
					customerElm.state = CustomerState.waiting;
					customerElm.patienceTimeout = window.setTimeout(this.onCustomerPatienceExpired.bind(this), customerElm.patienceDuration, customerElm);
					this.requestProducts(customerElm.request);
				}, 2500);
			} else {
				window.setTimeout(e => {
					this.dialogController.markAsDisappointed();
					customerElm.state = CustomerState.disatisfied;
					window.setTimeout(e => {
						this.dialogController.hideDialog();
						customerElm.startLeavingDisappointed();
					}, 1000);
				}, 2500);
			}
		}
	}

	onCustomerPatienceExpired(customerElm) {
		window.clearTimeout(customerElm.patienceTimeout);
		// main delegate cash exchange!
		customerElm.state = CustomerState.disatisfied;
		this.dialogController.markAsAngry();
		window.setTimeout(e => {
			this.dialogController.hideDialog();
			customerElm.startLeavingAngry();
		}, 1000)
	}

	onCustomerLeft(evt) {
		switch(evt.detail.dataset.outcome) {
			case "happy":
				window.dispatchEvent(new CustomEvent("customerLeftHappy"));
				this.happyCustomers++;
			break;
			case "angry":
				window.dispatchEvent(new CustomEvent("customerLeftAngry"));
			break;
			case "disappointed":
				window.dispatchEvent(new CustomEvent("customerLeftDisappointed"));
			break;
		}
		console.log(this.happyCustomers)
		evt.detail.remove();
		delete evt.detail;
	}

	onProductStoppedFirstInLine(evt) {
		let productElm = evt.detail;
		let customerElm = this.firstInLineCustomer;
		if (customerElm) {
			if (customerElm.state != CustomerState.waiting) {
				return;
			}
			this.dialogController.completeItem(productElm.type);
			customerElm.takeProduct(productElm);
			if (customerElm.validateRequestSatisfaction()) {
				customerElm.state = CustomerState.satisfied;
				window.clearTimeout(customerElm.patienceTimeout);
				this.dialogController.markAsHappy();
				window.setTimeout(e => {
					customerElm.startLeavingHappy();
					this.dialogController.hideDialog();
				}, 600);
			}
		} else {
			console.error("A product but no customer!??");
		}
	}
}