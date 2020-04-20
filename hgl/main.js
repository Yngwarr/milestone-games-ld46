import "./extensions.js"
import {Model} from "./model.js"
import {EventHandler} from "./eventhandler.js"
import {Point, Rect, Size} from "./geometry.js"

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
		this.loadLevel("test", () => {
			this.updateStatus();
			this.model.start(this);
		});
	}

	loadLevel(id, cb) {
		if (this.model) {
			this.model.unload();
		}

		this.model = new Model(id, this);
		this.model.load(this, () => {
			this.clearOutput();
			this.updateStatus();
			this.forceGameUpdate();
			this.resize();

			if (cb) {
				cb();
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

	onEnterKeyUp(evt) {
		console.log("ENTER")
	}

	onClick(evt) {
		let elm = evt.target;
		let point = new Point(evt.x, evt.y);
		console.log(point, this.translateClientPointToWorldPoint(point));
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

		if (this.model) {
			this.model.tick(this);
		}

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

	translateClientPointToWorldPoint(point) {
		let worldRect = this.model.worldContentElement.getRect();
		let translatedPoint = point.clone();
		translatedPoint.x -= worldRect.x;
		//NOTE: Disable vertical offset since it doesn't work on iOS
		translatedPoint.y -= worldRect.y;
		//console.log(this.model.worldContentElement.scrollLeft, this.model.worldContentElement.scrollTop);
		translatedPoint.x = Math.round(translatedPoint.x * 100) / 100;
		translatedPoint.y = Math.round(translatedPoint.y * 100) / 100;
		return translatedPoint;
	}

	// element - game controller delegation
	placeholderClickedThreeTimes(evt) {
		let elm = evt.detail;
		console.log("Placeholder clicked three times!", elm);
		elm.remove();
	}
}

window.g = new Game();