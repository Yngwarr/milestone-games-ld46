import "./hgl/extensions.js"
import {EventHandler} from "./hgl/eventhandler.js"
import {Point, Rect, Size} from "./hgl/geometry.js"

import {BusinessModel} from "./BusinessModel.js"
import {CoffeeHouseController} from "./CoffeeHouseController.js"
import {ProductionController} from "./ProductionController.js";
import {ProductionWindowController} from "./ProductionWindowController.js";
import {ProductData} from "./ProductData.js"

class Game {

	constructor() {
		this.gameElement = document.getElementById("game");

		this.updateRequired = false;
		this.currentTouchClientPoint = new Point(0,0);
		this.currentTouch = null;
		this.touchHasMoved = false;

		this.resizeTimeout = null;
		this.chunkUpdateTimeout = null;

		// FPS coordination
		this.speed = 1;
		this.delta = 0;
		this.lastFrameTimeMs = 0;
		this.elapsedTimeSinceLastTick;

		this.currentDialog = null;
		this.paused = false;

		this.productionWindowController = new ProductionWindowController();

		window.addEventListener("businessDataUpdated", this.onBusinessDataUpdated.bind(this));
		window.addEventListener("productionQueueUpdated", this.onProductionQueueUpdated.bind(this));
		window.addEventListener("productionStorageUpdated", this.onProductionStorageUpdated.bind(this));

		this.init();
	}



	get fpsInterval() {
		return (1000 / 60) / this.speed;
	}

	init() {
		this.eventHandler = new EventHandler(this, window);
		window.requestAnimationFrame(this.tick.bind(this));
		window.setInterval(this.updateStatus.bind(this), 300);
		window.focus();

		this.businessModel = new BusinessModel(this);
		this.productionController = new ProductionController(this);
		this.coffeeHouseController = new CoffeeHouseController(this);

		//main is the commerce controller for now, spawning waves and stuff

		this.setupWindowScroll();
		window.setTimeout(e => {
			window.scrollTo(5000, 0);
		}, 10)
	}

	setupWindowScroll() {
		let mouseDown = false;
		let mouseDownX;
		let currentX;

		window.addEventListener("mousedown", e => {
			mouseDown = true;
			document.body.classList.add("active");
			mouseDownX = e.pageX - 0;
			currentX = window.scrollX;
		});
		window.addEventListener("mouseleave", () => {
			mouseDown = false;
			document.body.classList.remove("active");
		});
		window.addEventListener("mouseup", () => {
			mouseDown = false;
			document.body.classList.remove("active");
		});
		window.addEventListener("mousemove", e => {
			if (!mouseDown) return;
			e.preventDefault();
			const dragDistance = e.pageX - mouseDownX;
			if (!this.productionWindowController.isOpen) {
				window.scrollBy({left:-dragDistance*1});
			}
		});
		window.addEventListener("wheel", e => {
			if (!this.productionWindowController.isOpen) {
				window.scrollBy({left:-e.deltaY});
			}
		});
	}

	tick(timestamp) {
		const panic = () => {
			console.log("panic");
			this.delta = 0;
		}
		if (timestamp < this.lastFrameTimeMs + this.fpsInterval) {
			window.requestAnimationFrame(this.tick.bind(this));
			return;
		}

		this.delta += timestamp - this.lastFrameTimeMs;
		this.lastFrameTimeMs = timestamp;

		let numUpdateSteps = 0;
		while (this.delta >= this.fpsInterval) {
			this.updateGame(this.fpsInterval);
			this.delta -= this.fpsInterval;
			if (++numUpdateSteps >= 240) {
				panic();
				break;
			}
		}
		//If there was a draw function, call it here
		window.requestAnimationFrame(this.tick.bind(this));
	}

	onVisibilityChange(evt) {
		if (document.hidden) {
			this.pause();
		} else {
			window.setTimeout(this.unpause.bind(this), 500);
		}
	} 

	onResize() {

	}

	onCKeyUp(evt) {
		this.coffeeHouseController.addCustomer();
	}

	onEscapeKeyUp(evt) {
		this.productionWindowController.close()
	}

	onClick(evt) {
		let elm = evt.target;
		if (elm.id == "shop") {
			this.productionWindowController.close();
		}
		if (elm.classList.contains("production")) {
			let productCategory = elm.dataset.category;
			let availableProducts = this.productionController.getAvailableProductTypesForProductCategory(productCategory);
			let productionQueue = this.productionController.getQueueForProductCategory(productCategory);
			let storage = this.productionController.getProductStorageForCategory(productCategory);
			this.productionWindowController.updateProductStorage(storage);
			this.productionWindowController.open(productCategory, availableProducts, productionQueue, storage);
		}
	}

	pause() {
		this.togglePaused(true);
	}

	unpause() {
		if (!this.paused) {
			return;
		}
		this.togglePaused(false);
		this.forceGameUpdate();
	}

	togglePaused(paused) {
		this.paused = paused;
	}

	updateGame(elapsedTimeSinceLastTick = 30) {
		// Input, or automation do not run while game is paused
		if (this.paused) {
			return;
		}

		this.coffeeHouseController.tick();
		this.businessModel.tick();
		this.productionController.tick();

		this.updateRequired = false;
	}

	forceGameUpdate() {
		this.updateRequired = true;
		this.updateGame();
	}

	updateStatus() {

	}

	logOutput(message, ms = 3000) {

	}

	onBusinessDataUpdated(evt) {
		console.log("CSAT", this.businessModel.customerSatisfaction);
		console.log("money", this.businessModel.money);
	}

	onProductionQueueUpdated(evt) {
		let productCategory = evt.detail;
		if (this.productionWindowController.isOpen && this.productionWindowController.productCategory == productCategory) {
			let productionQueue = this.productionController.getQueueForProductCategory(productCategory);
			this.productionWindowController.updateProductionQueue(productionQueue);
		}
	}
	onProductionStorageUpdated(evt) {
		let productCategory = evt.detail;
		if (this.productionWindowController.isOpen && this.productionWindowController.productCategory == productCategory) {
			let storage = this.productionController.getProductStorageForCategory(productCategory);
			this.productionWindowController.updateProductStorage(storage);
		}
	}
}

window.g = new Game();