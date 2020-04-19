import "./hgl/extensions.js"

export class DialogController {
	constructor(delegate) {
		this.requestDialogElement = document.querySelector("#request-dialog");
		this.requestDialogTimerElement = document.querySelector("#request-dialog-timer");
		this.requestDialogItemElement = document.querySelector("#request-dialog-item");
		this.timerDuration = 0;
		this.timerElapsedTime = 0;
		this.timerInterval = null;
		this.requestDialogElement.setHidden(true);
		this.markAsIdle();
	}

	showDialog(items = []) {
		this.createRequestItemElements(items);
		this.markAsIdle();
		this.requestDialogElement.setHidden(false, "flex");
	}

	startTimer(duration) {
		this.timerDuration = duration;
		this.timerElapsedTime = 0;
		this.setProgress(0);
		window.clearInterval(this.timerInterval);
		this.timerInterval = window.setInterval(this.updateTimerProgress.bind(this), 100);
	}

	createRequestItemElements(items) {
		this.requestDialogElement.querySelectorAll(".item").forEach(e => e.remove());
		items.forEach(itemId => {
			let elm = document.createElement("div");
			elm.classList.add("item", "icon_16");
			elm.dataset.type = itemId;
			this.requestDialogElement.appendChild(elm)
		})
	}

	completeItem(itemType) {
		let elm = this.requestDialogElement.querySelector(`[data-type="${itemType}"]:not(.completed)`);
		if (elm) {
			elm.classList.add("completed");
		} else {
			console.warn("tried to complete item that does not exist", itemType)
		}
	}

	updateTimerProgress() {
		if (this.requestDialogTimerElement.dataset.progress > 10) {
			return;
		}
		this.timerElapsedTime += 100;
		let index = Math.round((this.timerElapsedTime/this.timerDuration) * 10);
		this.setProgress(index);
	}

	setProgress(progress = 0) {
		this.requestDialogTimerElement.dataset.progress = progress;
	}

	markAsCompleted() {
		window.clearInterval(this.timerInterval);
		this.requestDialogTimerElement.dataset.progress = 11;
	}

	markAsFailed() {
		window.clearInterval(this.timerInterval);
		this.requestDialogTimerElement.dataset.progress = 12;
	}

	markAsIdle() {
		this.requestDialogTimerElement.dataset.progress = 13;
	}

	hideDialog() {
		window.clearInterval(this.timerInterval);
		this.requestDialogElement.setHidden(true);
	}
}