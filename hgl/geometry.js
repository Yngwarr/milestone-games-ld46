export {Point};
export {Size};
export {Rect};

class Point {
	constructor(x,y) {
		this.x = parseFloat(x);
		this.y = parseFloat(y);
	}

	static zeroPoint() {
		return new Point(0,0);
	}

	static fromString(pointString) {
		let p = pointString.split("x");
		return new Point(p[0],p[1]);
	}

	toString() {
		return `${this.x}x${this.y}`;
	}

	clone() {
		return new Point(this.x, this.y);
	}

	equalsToPoint(point) {
		return this.x == point.x && this.y == point.y;
	}

	round() {
		this.x = Math.round(this.x);
		this.y = Math.round(this.y);
	}

	pointMultipliedBy(factor) {
		return new Point(this.x * factor, this.y * factor);
	}

	pointOffsetBy(x = 0 ,y = 0) {
		return new Point(this.x + x, this.y + y);
	}

	reversedPoint() {
		return new Point(this.x * -1, this.y * -1);	
	}

	offsetBy(x = 0 ,y = 0) {
		if (typeof x == "object") {
			y = x.y;
			x = x.x;
		}
		this.x += x;
		this.y += y;
	}

	roundedPoint() {
		return new Point(Math.round(this.x), Math.round(this.y));
	}

	flooredPoint(tileSize) {
		return new Point(Math.floor(this.x / tileSize) * tileSize, Math.floor(this.y / tileSize) * tileSize);
	}
}

class Size {
	constructor(w = 0, h = 0) {
		this.w = parseFloat(w);
		this.h = parseFloat(h);
	}

	static fromString(sizeString = "0x0") {
		let p = sizeString.split("x");
		return new Size(p[0],p[1]);
	}

	toString() {
		return `${this.w}x${this.h}`;
	}

	roundedSize(tileSize) {
		return new Size(Math.round(this.w / tileSize) * tileSize, Math.round(this.h / tileSize) * tileSize);
	}
}

class Rect {
	constructor(x = 0, y = 0, w = 0, h = 0) {
		this.point = new Point(x,y);
		this.size = new Size(w,h);
	}

	static zeroRect() {
		return new Rect(0,0,0,0);
	}

	static fromString(rectString = "0x0,0x0") {
		let parts = rectString.split[","];
		let xy = parts[0].split("x");
		let wh = parts[1].split("x");
		return new Rect(xy[0],xy[1],wh[0],wh[1]);
	}

	rectOffsetBy(x = 0 ,y = 0) {
		let r = new Rect(0,0);
		r.size = this.size;
		r.point = this.point.pointOffsetBy(x, y);
		return r;
	}

	clone() {
		return new Rect(this.x, this.y, this.w, this.h);
	}

	toString() {
		return `${this.point},${this.size}`;
	}

	get x() {
		return this.point.x;
	}

	get y() {
		return this.point.y;
	}

	get w() {
		return this.size.w;
	}

	get h() {
		return this.size.h;
	}

	set x(x) {
		this.point.x = x;
	}

	set y(y) {
		this.point.y = y;
	}

	set w(w) {
		this.size.w = w;
	}

	set h(h) {
		this.size.h = h;
	}

	get topLeftPoint() {
		return this.point;
	}

	get topRightPoint() {
		return this.point.pointOffsetBy(this.size.w, 0);
	}

	get bottomLeftPoint() {
		return this.point.pointOffsetBy(0, this.size.h);
	}

	get bottomRightPoint() {
		return this.point.pointOffsetBy(this.size.w, this.size.h);
	}

	get centerPoint() {
		return this.point.pointOffsetBy(this.size.w / 2, this.size.h / 2);
	}

	inset(xInset = 0, yInset = 0) {
		this.size.w = this.w - xInset * 2;
		this.size.h = this.h - yInset * 2;
		this.point.x = this.x + xInset;
		this.point.y = this.y + yInset;
	}

	containsPoint(point) {
		return (point.x >= this.x && point.x < this.x + this.w) && (point.y >= this.y && point.y < this.y + this.h);
	}

	getSubgrid(subgridTileSize) {
		let subgrid = [];
		let horizontalTiles = Math.round(this.w/subgridTileSize);
		let verticalTiles = Math.round(this.h/subgridTileSize);
		for (let x = 0; x < horizontalTiles; x++) {
			for (let y = 0; y < verticalTiles; y++) {
				subgrid.push(new Rect(this.x + (x * subgridTileSize), this.y + (y * subgridTileSize), subgridTileSize, subgridTileSize));
			}
		}
		return subgrid;
	}

	intersectsRect(rect) {
		let containsTopLeftPoint = rect.containsPoint(this.topLeftPoint);
		let containsTopRightPoint = rect.containsPoint(this.topRightPoint);
		let containsBottomLeftPoint = rect.containsPoint(this.bottomLeftPoint);
		let containsBottomRightPoint = rect.containsPoint(this.bottomRightPoint);
		return (containsTopLeftPoint || containsTopRightPoint || containsBottomLeftPoint || containsBottomRightPoint);
	}
}