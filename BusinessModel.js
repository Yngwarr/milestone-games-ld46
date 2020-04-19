export class BusinessModel {

	constructor(delegate) {
		this.delegate = delegate;
		this.money = 100;
		this.customerSatisfaction = 0;	
		window.addEventListener("customerPaidForProducts", this.onCustomerPaidForProducts.bind(this));
		window.addEventListener("customerLeftHappy", this.onCustomerLeftHappy.bind(this));
		window.addEventListener("customerLeftAngry", this.onCustomerLeftAngry.bind(this));
		window.addEventListener("customerLeftDisappointed", this.onCustomerLeftDisappointed.bind(this));
	}

	onCustomerPaidForProducts(evt) {
		let products = evt.detail || [];
		console.log("$$$ TODO")
	}

	onCustomerLeftHappy(evt) {
		this.customerSatisfaction += 5;
	}

	onCustomerLeftAngry(evt) {
		this.customerSatisfaction -= 5;
	}

	onCustomerLeftDisappointed(evt) {
		this.customerSatisfaction -= 1;
	}

	updateStats() {
		window.dispatchEvent(new CustomEvent("businessDataUpdated"));
	}

	tick() {
		// Financials
		// customerSatisfaction
	}
}