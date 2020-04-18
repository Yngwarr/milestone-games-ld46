export class DialogController {
	constructor(delegate) {
		this.requestDialogElement = document.querySelector("#request-dialog");
		this.requestDialogTimerElement = document.querySelector("#request-dialog-timer");
		this.requestDialogItemElement = document.querySelector("#request-dialog-item");
		this.timerDuration = 0;
		this.timerElapsedTime = 0;
		this.timerInterval = null;
	}

	showDialog(icon = "coffee", duration) {
		this.requestDialogItemElement.dataset.icon = icon;
		if (duration) {
			this.timerDuration = duration;
			this.timerElapsedTime = 0;
			this.setProgress(0);
			window.clearInterval(this.timerInterval);
			this.timerInterval = window.setInterval(this.updateTimerProgress.bind(this), 100);
		}
		this.requestDialogElement.setHidden(false);
	}

	updateTimerProgress() {
		if (this.requestDialogTimerElement.dataset.progress > 10) {
			return;
		}
		console.log("updateTimerProgress");
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

	hideDialog() {
		window.clearInterval(this.timerInterval);
		this.requestDialogElement.setHidden(true);
	}
}