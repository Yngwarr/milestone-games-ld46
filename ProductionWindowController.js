import "./hgl/extensions.js"
import {ProductElement} from "./ProductElement.js"

export class ProductionWindowController {
	constructor() {
		this.windowElement = document.querySelector("#production-window");
		this.productTypesElement = this.windowElement.querySelector("#production-window-product-storage");
		this.productTypesElement = this.windowElement.querySelector("#production-window-product-types");
		this.productionQueueElement = this.windowElement.querySelector("#production-window-production-queue");
		this.productStorageElement = this.windowElement.querySelector("#production-window-product-storage");
		this.closeButtonElement = this.windowElement.querySelector(".close");
		this.closeButtonElement.addEventListener("click", this.onCloseButtonClicked.bind(this));
		this.windowElement.setHidden(true)
		this.isOpen = false;
		this.productCategory = null;
	}

	open(productCategory, availableProducts = [], productionQueue = [], storage = []) {
		this.productCategory = productCategory;
		this.updateAvailableProducts(availableProducts);
		this.updateProductionQueue(productionQueue);
		this.updateProductStorage(storage);
		this.windowElement.setHidden(false);
		this.isOpen = true;
	}

	close() {
		this.productCategory = null;
		this.isOpen = false;
		this.windowElement.setHidden(true);
	}

	createProductIconElement(productType) {
		let elm = document.createElement("div");
		elm.classList.add("product", "clickable", "icon_16");
		elm.dataset.type = productType;
		elm.addEventListener("click", this.availableProductButtonClicked.bind(this));
		return elm;
	}

	updateAvailableProducts(availableProducts = []) {
		this.productTypesElement.innerHTML = "";
		availableProducts.forEach(productType => {
			this.productTypesElement.appendChild(this.createProductIconElement(productType));
		})
	}

	updateProductionQueue(productionQueue = []) {
		this.productionQueueElement.innerHTML = "";
		productionQueue.forEach(productType => {
			this.productionQueueElement.appendChild(this.createProductIconElement(productType));
		})
	}

	updateProductStorage(productStorage = []) {
		this.productStorageElement.innerHTML = "";
		productStorage.forEach(productType => {
			this.productStorageElement.appendChild(this.createProductIconElement(productType));
		})
	}

	availableProductButtonClicked(evt) {
		window.dispatchEvent(new CustomEvent("availableProductButtonClicked", {detail:evt.target.dataset.type}));
	}

	onProductButtonClicked(evt) {
		console.log(evt);
	}

	onCloseButtonClicked(evt) {
		this.close();
	}
}