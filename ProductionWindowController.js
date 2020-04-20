import "./hgl/extensions.js"
import {ProductData} from "./ProductData.js"

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

	open(productCategory, availableProducts = [], productionQueue = [], storage = {}) {
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

	createProductIconElement(productType, displayData, hoverData) {
		let elm = document.createElement("div");
		elm.classList.add("product", "clickable", "icon_16");
		elm.dataset.type = productType;

		if (displayData) {
			let displayDataElem = document.createElement("span");
			displayDataElem.classList.add("product-display-data");
			displayDataElem.innerText = displayData;
			elm.appendChild(displayDataElem);
		}

		if (hoverData) {
			let hoverDataElm = document.createElement("span");
			hoverDataElm.classList.add("product-hover-data");
			hoverDataElm.innerText = hoverData;
			elm.appendChild(hoverDataElm);
		}
		return elm;
	}

	updateAvailableProducts(availableProducts = []) {
		this.productTypesElement.innerHTML = "";
		availableProducts.clone().forEach(productType => {
			let hoverData = `${ProductData.get(productType).title}`;
			let elm = this.createProductIconElement(productType, null, hoverData);
			elm.addEventListener("click", this.availableProductButtonClicked.bind(this));
			this.productTypesElement.appendChild(elm);
		})
	}

	updateProductionQueue(productionQueue = []) {
		this.productionQueueElement.innerHTML = "";
		productionQueue.clone().forEach(productType => {
			let elm = this.createProductIconElement(productType);
			elm.addEventListener("click", this.queueProductButtonClicked.bind(this));
			this.productionQueueElement.appendChild(elm);
		});
	}

	updateProductStorage(productStorage = {}) {
		this.productStorageElement.innerHTML = "";
		Object.keys(productStorage.clone()).forEach(productType => {
			let amount = productStorage[productType];
			let elm = this.createProductIconElement(productType, amount);
			this.productStorageElement.appendChild(elm);
		})
	}

	availableProductButtonClicked(evt) {
		window.dispatchEvent(new CustomEvent("availableProductButtonClicked", {detail:evt.target.dataset.type}));
	}

	queueProductButtonClicked(evt) {
		console.log("Cancelling queue not implemented");
	}

	onProductButtonClicked(evt) {
		console.log(evt);
	}

	onCloseButtonClicked(evt) {
		this.close();
	}
}