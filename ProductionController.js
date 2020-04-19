import {ProductCategory} from "./Constants.js"

export class ProductionController {

	constructor(delegate) {
		this.delegate = delegate;
		this.productionDuration = {}
		this.verboseLogging = false;

		this.defaultProductionTime = 500;

		this.storage = {};
		this.storage[ProductCategory.beverage] = [];
		this.storage[ProductCategory.breakfast] = [];
		this.storage[ProductCategory.pastry] = [];
		this.storage[ProductCategory.lunch] = [];

		this.productonQueue = {};
		this.productonQueue[ProductCategory.beverage] = [];
		this.productonQueue[ProductCategory.breakfast] = [];
		this.productonQueue[ProductCategory.pastry] = [];
		this.productonQueue[ProductCategory.lunch] = [];

		this.productionTimeouts = {};
		this.productionTimeouts[ProductCategory.beverage] = null;
		this.productionTimeouts[ProductCategory.breakfast] = null;
		this.productionTimeouts[ProductCategory.pastry] = null;
		this.productionTimeouts[ProductCategory.lunch] = null;

		this.verboseLogging && console.log(this.storage);
		this.verboseLogging && console.log(this.productonQueue);
		this.verboseLogging && console.log(this.productionTimeouts);

		window.addEventListener("customerOrderedProduct", this.onCustomerOrderedProduct.bind(this));
	}

	tick() {
		//no-op
	}

	getTimeoutForProductType(productType) {
		return this.productionTimeouts[this.getProductCategoryFromProductType(productType)];
	}

	setTimeoutForProductType(productType, timeout) {
		this.productionTimeouts[this.getProductCategoryFromProductType(productType)] = timeout;
	}

	getQueueForProductType(productType) {
		return this.productonQueue[this.getProductCategoryFromProductType(productType)];
	}

	getTimeoutForProductCategory(productCategory) {
		return this.productionTimeouts[productCategory];
	}

	getQueueForProductCategory(productCategory) {
		return this.productonQueue[productCategory];
	}

	getProductCategoryFromProductType(productType) {
		return productType.split("_")[0];
	}

	hasProductInStorage(productType) {
		let productCategory = this.getProductCategoryFromProductType(productType);
		let storageCount =  this.storage[productCategory][productType] || 0;
		this.verboseLogging && console.log("Checking storage for", productType, "there is", storageCount, "available");
		return storageCount > 0;
	}

	incrementStorage(productType) {
		let productCategory = this.getProductCategoryFromProductType(productType);
		let existingStorage = this.storage[productCategory][productType] || 0;
		this.storage[productCategory][productType] = existingStorage + 1;
	}

	decrementStorage(productType) {
		let productCategory = this.getProductCategoryFromProductType(productType);
		let inStorage = false;
		let existingStorage = this.storage[productCategory][productType] || 0;
		if (existingStorage > 0) {
			this.storage[productCategory][productType] = existingStorage - 1;
		} else {
			this.verboseLogging && console.log("decrementStorage negative", productCategory, productType, this.storage);
		}
	}

	produceProduct(productType) {
		if (this.getQueueForProductType(productType).length > 0 | this.getTimeoutForProductType(productType) != null) {
			this.enqueueProductProduction(productType);
		} else {
			this.startProductingProduct(productType);
		}
	}

	enqueueProductProduction(productType) {
		this.verboseLogging && console.log("Queieing production of", productType);
		this.getQueueForProductType(productType).push(productType);
	}

	getProductionTimeForProduct(productType) {
		let calculatedDefaultProductionTime = (parseInt(productType.split("_")[1])+1 ) * this.defaultProductionTime;
		return this.productionDuration[productType] || calculatedDefaultProductionTime;
	}

	startProductingProduct(productType) {
		if(this.getTimeoutForProductType(productType) != null) {
			console.error("Production already ongoing", this.getQueueForProductType(productType), productType, this.getTimeoutForProductType(productType));
			return;
		}
		this.verboseLogging && console.log("Starting production of", productType, "it will take", this.getProductionTimeForProduct(productType));
		this.setTimeoutForProductType(productType, window.setTimeout(this.onProductProduced.bind(this), this.getProductionTimeForProduct(productType), productType));
	}

	processNextItemInQueue(productCategory) {
		let queue = this.getQueueForProductCategory(productCategory);
		if (queue.length > 0) {
			let productType = queue.shift();
			this.startProductingProduct(productType)
			this.verboseLogging && console.log("Queue: Processing next item", productCategory);
		}
		this.verboseLogging && console.log("Queue emptied for", productCategory);
	}

	shipProduct(productType) {
		window.dispatchEvent(new CustomEvent("productShipped", {detail:productType}));
	}

	onProductProduced(productType) {
		this.verboseLogging && console.log("Product produced", productType);
		this.shipProduct(productType);
		window.clearTimeout(this.getTimeoutForProductType(productType));
		this.setTimeoutForProductType(productType, null);
		this.processNextItemInQueue(this.getProductCategoryFromProductType(productType));
	}


	// Event Handlers

	onCustomerOrderedProduct(evt) {
		let productType = evt.detail;
		if (this.hasProductInStorage(productType)) {
			this.decrementStorage(productType);
			this.onProductProduced(productType);
		} else {
			this.produceProduct(productType);
		}
	}
}