function Point(x,y) {
	"use strict";
	this.x = parseInt(x);
	this.y = parseInt(y);
	return this;
}

Point.fromString = function(string, tileSize) {
	let p = string.split(",");
	return new Point(p[0].parseNumber(tileSize),p[1].parseNumber(tileSize));
}

Point.prototype.toString = function() {
	return "Point(" + this.x + "," + this.y + ")";
};

Point.prototype.key = function() {
	return this.x + "," + this.y;
};

Point.prototype.pointRoundedToNearestTile = function(tileSize) {
	"use strict";
	var x = Math.round(this.x / tileSize) * tileSize;
	var y = Math.round(this .y / tileSize) * tileSize;
	return new Point(x,y);
};

Point.prototype.pointFlooredToNearestTile = function(tileSize) {
	"use strict";
	var x = Math.floor(this.x / tileSize) * tileSize;
	var y = Math.floor(this .y / tileSize) * tileSize;
	return new Point(x,y);
};

Point.prototype.offset = function(offsetX, offsetY) {
	"use strict";
	offsetX = offsetX || 0;
	offsetY = offsetY || 0;
	return new Point(this.x + offsetX, this.y + offsetY);
};

Point.prototype.isEqual = function(point) {
	return this.x == point.x && this.y == point.y;
};

function Size(w,h) {
	"use strict";
	this.w = w;
	this.h = h;
	return this;
}

Size.prototype.toString = function() {
	return "Size(" + this.w + "," + this.h + ")";
};

Size.fromString = function(string, tileSize) {
	let p = string.split(",");
	return new Size(p[0].parseNumber(tileSize),p[1].parseNumber(tileSize));
}

Size.prototype.isEqual = function(size) {
	return this.w == size.h && this.w == size.h;
};

// Shorthand
function R(point, size) {
	return new Rect(point.x,point.y,size.w, size.h);
}

function Rect(x,y,w,h) {
	"use strict";
	this.x = x;
	this.y = y;
	this.w = w;
	this.h = h;
	return this;
}

Rect.prototype.toString = function() {
	return "Rect(" + this.getPoint().toString() + "," + this.getSize().toString() + ")";
};

Rect.fromHash = function(hash) {
	var r = hash.split("-");
	var x = r[0] ? r[0] : 0;
	var y = r[1] ? r[1] : 0;
	var w = r[2] ? r[2] : 0;
	var h = r[3] ? r[3] : 0;
	return new Rect(x,y,w,h);
}

Rect.fromDataSet = function(dataset, tileSize) {
	let x = dataset.x.parseNumber(tileSize);
	let y = dataset.y.parseNumber(tileSize);
	let w = dataset.width.parseNumber(tileSize);
	let h = dataset.height.parseNumber(tileSize);
	return new Rect(x,y,w,h);
}

Rect.prototype.hash = function() {
	return this.x+"-"+this.y+"-"+this.w+"-"+this.h;
}

Rect.prototype.rectRoundedToNearestTile = function(tileSize) {
	return this.setPoint(this.getPoint().pointRoundedToNearestTile(tileSize));
}

Rect.prototype.isEqual = function(rect) {
	return this.getPoint().isEqual(rect.getPoint()) && this.getSize().isEqual(rect.getSize());
};

Rect.prototype.getPoint = function() {
	return new Point(this.x, this.y);
};

Rect.prototype.getSurroundingRects = function(tileSize, offset = 1) {
	let points = [
        {x:this.x - 0 * tileSize, y:this.y - offset * tileSize}, // North
        {x:this.x + offset * tileSize, y:this.y - offset * tileSize}, // North East
        {x:this.x + offset * tileSize, y:this.y + 0 * tileSize}, // East
        {x:this.x + offset * tileSize, y:this.y + offset * tileSize}, // South East
        {x:this.x + 0 * tileSize, y:this.y + offset * tileSize}, // South
        {x:this.x - offset * tileSize, y:this.y + offset * tileSize}, // South West
        {x:this.x - offset * tileSize, y:this.y + 0 * tileSize}, // West
        {x:this.x - offset * tileSize, y:this.y - offset * tileSize}, // North West
    ];
    return points.map(p => {
    	return new Rect(p.x, p.y, tileSize, tileSize);
    });
}

Rect.prototype.setPoint = function(point) {
	this.x = point.x;
	this.y = point.y;
	return this;
};

Rect.prototype.getSize = function() {
	return new Size(this.w, this.h);
};

Rect.prototype.setSize = function(size) {
	this.w = size.w;
	this.h = size.h;
	return this;
};

Rect.prototype.containsPoint = function(point) {
	"use strict";
	return (point.x >= this.x && point.x < this.x + this.w) && (point.y >= this.y && point.y < this.y + this.h);
};

Rect.prototype.topLeftPoint = function() {
	"use strict";
	return new Point(this.x, this.y);
};

Rect.prototype.topRightPoint = function() {
	"use strict";
	return new Point(this.x + this.w - 1, this.y);
};

Rect.prototype.bottomRightPoint = function() {
	"use strict";
	return new Point(this.x + this.w - 1, this.y + this.h - 1);
};

Rect.prototype.bottomLeftPoint = function() {
	"use strict";
	return new Point(this.x, this.y + this.h - 1);
};

Rect.prototype.centerPoint = function() {
	"use strict";
	return new Point(this.x + this.w/2, this.y + this.h/2);
};

Rect.prototype.bottomMiddlePoint = function() {
	"use strict";
	var n = this.w / TILESIZE;
	var b = Math.floor(n/2);
	var p = b * TILESIZE;
	var x = this.x + p;
	return new Point(x, this.y + this.h);
};

Rect.prototype.randomPoint = function() {
	"use strict";
	var x = this.x + (Math.round(Math.random()) * this.w);
	var y = this.y + (Math.round(Math.random()) * this.h);
	return new Point(x, y);
};

Rect.prototype.insetRect = function(xInset, yInset) {
	var w = this.w - xInset * 2;
	var h = this.h - yInset * 2;
	var x = this.x + xInset;
	var y = this.y + yInset;
	return new Rect(x, y, w, h);
};

Rect.prototype.getSubgrid = function(subgridTileSize) {
	var subgrid = [];
	var horizontalTiles = Math.round(this.w/subgridTileSize);
	var verticalTiles = Math.round(this.h/subgridTileSize);
	for (var x = 0; x < horizontalTiles; x++) {
		for (var y = 0; y < verticalTiles; y++) {
			subgrid.push(new Rect(this.x + (x * subgridTileSize), this.y + (y * subgridTileSize), subgridTileSize, subgridTileSize));
		}
	}
	return subgrid;
};

Rect.prototype.intersectsRect = function(rect) {
	var containsTopLeftPoint = rect.containsPoint(this.topLeftPoint());
	var containsTopRightPoint = rect.containsPoint(this.topRightPoint());
	var containsBottomLeftPoint = rect.containsPoint(this.bottomLeftPoint());
	var containsBottomRightPoint = rect.containsPoint(this.bottomRightPoint());

	return (containsTopLeftPoint || containsTopRightPoint || containsBottomLeftPoint || containsBottomRightPoint);
};

function Vector(x,y) {
	this.x = x;
	this.y = y;
}

Point.prototype.addVector = function(vector) {
	this.x += vector.x;
	this.y += vector.y;
};

Point.prototype.vectorToPoint = function(point) {
	return new Vector(this.x - point.x, this.y - point.y);
}

Point.prototype.hash = function() {
	return this.x+"-"+this.y;
}

Color = function(r,g,b,a) {
	this.r = r || 0;
	this.g = g || 0;
	this.b = b || 0;
	if (!a && a !== 0) {
		this.a = 1;
	} else {
		this.a = a;
	}
};

Color.randomColor = function() {
	var randColor = function() {
		return Math.round(Math.random() * 255);
	};

	return new Color(randColor(),
					 randColor(),
					 randColor());

};

Color.clear = function() {
	return new Color(0,0,0,0);
}

Color.prototype.toString = function() {
	return "rgba("+this.r+","+this.g+","+this.b+","+this.a+")";
};