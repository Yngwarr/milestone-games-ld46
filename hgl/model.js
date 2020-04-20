import "./extensions.js"
import {PlaceholderElement} from "./elements.js"
import {Point, Rect, Size} from "./geometry.js"


export class Model {

	constructor(id, delegate) {
		this.id = id;
		this.delegate = delegate;
		this.worldContentElement = document.getElementById("worldContent");
	}

	load(game, cb) {
		fetch(`data/data.json`)
		.then(response => response.text())
		.then(string => JSON.parse(string))
		.then(obj => {
			this.data = obj.data;
			this.createWorld();
		});
	}

	tick(game) {
		this.worldContentElement.querySelectorAll(PlaceholderElement.selector()).forEach(elm => {
			elm.tick(this);
		});
	}

	createWorld() {
		let xOffset = 0;
		this.data.things.forEach(data => {
			this.createPlaceholder(data, new Rect(0,0,48,48).rectOffsetBy(xOffset));
			xOffset += 48;
		});
	}

	createPlaceholder(data, rect) {
		let elm = new PlaceholderElement(data, rect);
		this.worldContentElement.appendChild(elm);
	}
}