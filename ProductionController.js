import {ProductElement} from "./ProductElement.js"
import {ProductCategory} from "./Constants.js"
import {ProductData} from "./ProductData.js"

export class ProductionController {

	constructor(delegate) {
		this.delegate = delegate;
		this.productionDuration = {}
		this.verboseLogging = false;

		this.defaultProductionTime = 1500;

		this.openProductRequests = {};
		this.openProductRequests[ProductCategory.beverage] = [];
		this.openProductRequests[ProductCategory.breakfast] = [];
		this.openProductRequests[ProductCategory.pastry] = [];

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
		fillWithProducts(this.availableProducts, 5);

		this.storage = {};
		this.storage[ProductCategory.beverage] = {};
		this.storage[ProductCategory.breakfast] = {};
		this.storage[ProductCategory.pastry] = {};

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
		this.verboseLogging && console.log(this.researchableProducts);
		this.verboseLogging && console.log(this.availableProducts);

		window.addEventListener("customerOrderedProduct", this.onCustomerOrderedProduct.bind(this));
		window.addEventListener("availableProductButtonClicked", this.onAvailableProductButtonClicked.bind(this));
	}

	tick() {
		//no-op
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

	isProductTypeRequested(productType) {
		let productCategory = this.getProductCategoryFromProductType(productType);
		let requestIndex = this.getOpenProductRequestsForCategory(productCategory).indexOf(productType);
		return requestIndex != -1;
	}

	getOpenProductRequestsForCategory(productCategory) {
		return this.openProductRequests[productCategory];
	}

	addCustomerRequest(productType) {
		this.verboseLogging && console.log("addCustomerRequest", productType);
		let productCategory = this.getProductCategoryFromProductType(productType);
		this.verboseLogging && console.log("-", productCategory, "had", this.getOpenProductRequestsForCategory(productCategory).length, "requests");
		this.getOpenProductRequestsForCategory(productCategory).push(productType);
		this.verboseLogging && console.log("-", productCategory, "now has", this.getOpenProductRequestsForCategory(productCategory).length, "requests");
		window.dispatchEvent(new CustomEvent("productionProductRequestsUpdated", {detail:productCategory}));
	}

	satisfyCustomerRequest(productType) {
		this.verboseLogging && console.log("satisfyCustomerRequest", productType);
		let productCategory = this.getProductCategoryFromProductType(productType);
		this.verboseLogging && console.log("-", productCategory, "had", this.getOpenProductRequestsForCategory(productCategory).length, "requests");
		let requestIndex = this.getOpenProductRequestsForCategory(productCategory).indexOf(productType);
		if (requestIndex != -1) {
			this.getOpenProductRequestsForCategory(productCategory).splice(requestIndex, 1);
			this.verboseLogging && console.log("- Removed 1 occurrence of", productType, "from", productCategory, "requests");
		} else {
			this.verboseLogging && console.log("- Error: Could not find", productType, "in", this.getOpenProductRequestsForCategory(productCategory).length, "requests");
		}
		this.verboseLogging && console.log("-", productCategory, "now has", this.getOpenProductRequestsForCategory(productCategory).length, "requests");
		window.dispatchEvent(new CustomEvent("productionProductRequestsUpdated", {detail:productCategory}));
	}

	hasProductInStorage(productType) {
		this.verboseLogging && console.log("hasProductInStorage", productType);
		let productCategory = this.getProductCategoryFromProductType(productType);
		let storageCount =  this.storage[productCategory][productType] || 0;
		this.verboseLogging && console.log("- Checking storage for", productType, "there is", storageCount, "available");
		return storageCount > 0;
	}

	incrementStorage(productType) {
		this.verboseLogging && console.log("incrementStorage", productType);
		let productCategory = this.getProductCategoryFromProductType(productType);
		let existingStorage = this.storage[productCategory][productType] || 0;
		this.storage[productCategory][productType] = existingStorage + 1;
		this.verboseLogging && console.log("- Storage updated for", productCategory, this.storage[productCategory]);
		window.dispatchEvent(new CustomEvent("productionStorageUpdated", {detail:productCategory}));
	}

	decrementStorage(productType) {
		this.verboseLogging && console.log("decrementStorage", productType);
		let productCategory = this.getProductCategoryFromProductType(productType);
		let inStorage = false;
		let existingStorage = this.storage[productCategory][productType] || 0;
		if (existingStorage > 0) {
			this.storage[productCategory][productType] = existingStorage - 1;
			this.verboseLogging && console.log("- Decremented storage", productType);
		} else {
			this.verboseLogging && console.log("- Error: Decrementing storage", productCategory, productType, this.storage);
		}
		window.dispatchEvent(new CustomEvent("productionStorageUpdated", {detail:productCategory}));
	}

	produceProduct(productType) {
		let productCategory = this.getProductCategoryFromProductType(productType);
		this.verboseLogging && console.log("produceProduct", productType);
		this.verboseLogging && console.log("- Adding to queue");
		this.enqueueProductProduction(productType);
	}

	notifyQueueUpdated(productCategory) {
		window.dispatchEvent(new CustomEvent("productionQueueUpdated", {detail:productCategory}));
	}

	enqueueProductProduction(productType) {
		this.verboseLogging && console.log("enqueueProductProduction", productType);
		let productCategory = this.getProductCategoryFromProductType(productType);
		this.notifyQueueUpdated(productCategory);
		this.getQueueForProductType(productType).push(productType);
		this.verboseLogging && console.log("- Queuing production of", productType);
		if (this.getQueueForProductType(productType).length == 1) {
			this.verboseLogging && console.log("- Production can start immediately", productType);
			this.processNextItemInQueue(this.getProductCategoryFromProductType(productType));
		}
	}

	calculateProductionTimeForProduct(productType) {
		let productionTime = ProductData.get(productType).productionTime;
		if (!productionTime) {
			productionTime = this.defaultProductionTime;
		}
		return productionTime;
		// TODO multipliers
	}

	startProducing(productType) {
		this.verboseLogging && console.log("startProducing", productType);
		let productCategory = this.getProductCategoryFromProductType(productType);
		if(this.getTimeoutForProductCategory(productCategory) != null) {
			console.error("- Production already ongoing", this.getQueueForProductType(productType), productType, this.getTimeoutForProductCategory(productCategory));
			return;
		}
		this.verboseLogging && console.log("- Actual production now starts of", productType, "it will take", this.calculateProductionTimeForProduct(productType));
		this.setTimeoutForProductType(productType, window.setTimeout(this.onProductProduced.bind(this), this.calculateProductionTimeForProduct(productType), productType));
	}

	processNextItemInQueue(productCategory) {
		this.verboseLogging && console.log("processNextItemInQueue", productCategory);
		let queue = this.getQueueForProductCategory(productCategory);
		if (this.getTimeoutForProductCategory(productCategory) != null) {
			this.verboseLogging && console.log("- Cannot process next item in queue, work is already ongoing");
			return;
		}
		if (queue.length > 0) {
			let productType = queue[0];
			this.verboseLogging && console.log("- Processing next item in queue");
			this.startProducing(productType)
		} else {
			this.verboseLogging && console.log("- Queue is empty");
		}
		this.notifyQueueUpdated(productCategory);
	}

	shipProduct(productType) {
		this.verboseLogging && console.log("shipProduct", productType);
		window.dispatchEvent(new CustomEvent("productShipped", {detail:productType}));
	}

	onProductProduced(productType) {
		this.verboseLogging && console.log("onProductProduced", productType);
		let productCategory = this.getProductCategoryFromProductType(productType);

		// Do we need to ship immediately or can we add to storage?
		if (this.isProductTypeRequested(productType)) {
			// Remove the request if satisfied
			this.verboseLogging && console.log("- Shipping product to meet request");
			this.satisfyCustomerRequest(productType);
			this.shipProduct(productType);
		} else {
			this.verboseLogging && console.log("- No open request for it. Storing it");
			this.incrementStorage(productType);
		}
		this.verboseLogging && console.log("- Now there are these many requests left:", this.getOpenProductRequestsForCategory(productCategory).length);

		this.verboseLogging && console.log("- Clearing timeout for", productCategory);
		window.clearTimeout(this.getTimeoutForProductCategory(productCategory));
		this.setTimeoutForProductType(productType, null);
		this.verboseLogging && console.log("- Removing product from first position in queue", this.getQueueForProductCategory(productCategory).length);
		this.getQueueForProductCategory(productCategory).shift();
		this.verboseLogging && console.log("- Queue is now", this.getQueueForProductCategory(productCategory).length);
		this.verboseLogging && console.log("- Processing next in queue");
		this.processNextItemInQueue(this.getProductCategoryFromProductType(productType));
	}

	shipProductFromStorage(productType) {
		let productCategory = this.getProductCategoryFromProductType(productType);
		this.verboseLogging && console.log("shipProductFromStorage", productType);
		this.verboseLogging && console.log("- Removing it from storage", productType);
		this.decrementStorage(productType);
		this.satisfyCustomerRequest(productType);
		this.verboseLogging && console.log("- Now there are these many requests left:", this.getOpenProductRequestsForCategory(productCategory).length);
		this.shipProduct(productType);
	}

	handleProductProductionRequest(productType) {
		this.verboseLogging && console.log("handleProductProductionRequest", productType);
		let productCategory = this.getProductCategoryFromProductType(productType);
		if (this.hasProductInStorage(productType)) {
			this.verboseLogging && console.log("- Product is in storage");
			this.shipProductFromStorage(productType);
		} else {
			// FOR DEMO WE ARE DISABLING AUTOMATIC CONSTRUCTION
			this.verboseLogging && console.log("- No storage, just adding request");
			this.addCustomerRequest(productType);
			this.verboseLogging && console.log("- As observed here", this.getOpenProductRequestsForCategory(productCategory));
			return
			this.verboseLogging && console.log("- Product is pushed to open requests");
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