import {ProductElement} from "./ProductElement.js"
import {ProductCategory} from "./Constants.js"

export class ProductionController {

	constructor(delegate) {
		this.delegate = delegate;
		this.productionDuration = {}
		this.verboseLogging = true;

		this.defaultProductionTime = 500;

		this.openCustomerRequests = [];

		this.availableProducts = {}
		this.availableProducts[ProductCategory.beverage] = [];
		this.availableProducts[ProductCategory.breakfast] = [];
		this.availableProducts[ProductCategory.pastry] = [];

		this.researchableProducts = {}
		this.researchableProducts[ProductCategory.beverage] = [];
		this.researchableProducts[ProductCategory.breakfast] = [];
		this.researchableProducts[ProductCategory.pastry] = [];

		let fillWithProducts = (arr, n) => {
			Object.keys(arr).forEach(key => {
				for (var i = 0; i < n; i++) {
					arr[key].push(`${key}_${i}`);
				}
			})
		}

		fillWithProducts(this.researchableProducts, 8);
		fillWithProducts(this.availableProducts, 2);

		console.log(this.researchableProducts);
		console.log(this.availableProducts);

		this.storage = {};
		this.storage[ProductCategory.beverage] = [];
		this.storage[ProductCategory.breakfast] = [];
		this.storage[ProductCategory.pastry] = [];

		this.productonQueue = {};
		this.productonQueue[ProductCategory.beverage] = [];
		this.productonQueue[ProductCategory.breakfast] = [];
		this.productonQueue[ProductCategory.pastry] = [];

		this.productionTimeouts = {};
		this.productionTimeouts[ProductCategory.beverage] = null;
		this.productionTimeouts[ProductCategory.breakfast] = null;
		this.productionTimeouts[ProductCategory.pastry] = null;

		this.verboseLogging && console.log(this.storage);
		this.verboseLogging && console.log(this.productonQueue);
		this.verboseLogging && console.log(this.productionTimeouts);

		window.addEventListener("customerOrderedProduct", this.onCustomerOrderedProduct.bind(this));
		window.addEventListener("availableProductButtonClicked", this.onAvailableProductButtonClicked.bind(this));
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
		return ProductElement.getProductCategoryFromProductType(productType);
	}

	getAvailableProductTypesForProductCategory(productCategory) {
		return this.availableProducts[productCategory];
	}

	getProductStorageForCategory(productCategory) {
		return this.storage[productCategory];
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
		window.dispatchEvent(new CustomEvent("productionStorageUpdated", {detail:productCategory}));
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
		window.dispatchEvent(new CustomEvent("productionStorageUpdated", {detail:productCategory}));
	}

	produceProduct(productType) {
		if (this.getQueueForProductType(productType).length > 0 | this.getTimeoutForProductType(productType) != null) {
			this.enqueueProductProduction(productType);
		} else {
			this.startProductingProduct(productType);
		}
	}

	notifyQueueUpdated(productCategory) {
		window.dispatchEvent(new CustomEvent("productionQueueUpdated", {detail:productCategory}));
	}

	enqueueProductProduction(productType) {
		let productCategory = this.getProductCategoryFromProductType(productType);
		this.notifyQueueUpdated(productCategory);
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
		this.notifyQueueUpdated(productCategory);
	}

	shipProduct(productType) {
		window.dispatchEvent(new CustomEvent("productShipped", {detail:productType}));
	}

	onProductProduced(productType) {
		this.verboseLogging && console.log("Product produced", productType);

		// Do we need to ship immediately or can we add to storage?
		let requestIndex = this.openCustomerRequests.indexOf(productType);
		if (requestIndex == -1) {
			this.verboseLogging && console.log("- No open request for it. Storing it");
			this.incrementStorage(productType);
		} else {
			// Remove the request if satisfied
			this.verboseLogging && console.log("- Shipping it immediately");
			this.openCustomerRequests.splice(requestIndex, 1);
			this.shipProduct(productType);
			window.clearTimeout(this.getTimeoutForProductType(productType));
			this.setTimeoutForProductType(productType, null);
			this.processNextItemInQueue(this.getProductCategoryFromProductType(productType));
		}
	}

	handleProductProductionRequest(productType) {
		if (this.hasProductInStorage(productType)) {
			this.decrementStorage(productType);
			this.onProductProduced(productType);
		} else {
			this.openCustomerRequests.push(productType);
			this.produceProduct(productType);
		}
	}

	handleProductStockingRequest(productType) {
		this.produceProduct(productType);
	}

	// Event Handlers

	onCustomerOrderedProduct(evt) {
		let productType = evt.detail;
		this.handleProductProductionRequest(productType);
	}

	onAvailableProductButtonClicked(evt) {
		let productType = evt.detail;
		this.handleProductStockingRequest(productType);
	}
}