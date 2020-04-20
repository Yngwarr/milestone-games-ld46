import {ProductBeverageTypes, ProductPastryTypes} from "./Constants.js"

let _productData = {}
_productData[ProductBeverageTypes.beverage_0] = {
	title: "Hot coffee",
	description: "",
	productionPrice: 1,
	salesPrice: 5,
	productionTime: 1500,
};
_productData[ProductBeverageTypes.beverage_1] = {
	title: "Cappuchino",
	description: "",
	productionPrice: 1,
	salesPrice: 5,
	productionTime: 1500,
};
_productData[ProductBeverageTypes.beverage_2] = {
	title: "Mint Tea",
	description: "",
	productionPrice: 1,
	salesPrice: 5,
	productionTime: 1500,
};
_productData[ProductBeverageTypes.beverage_3] = {
	title: "Hot chocolate",
	description: "",
	productionPrice: 1,
	salesPrice: 5,
	productionTime: 1500,
};
_productData[ProductBeverageTypes.beverage_4] = {
	title: "Cold brew",
	description: "",
	productionPrice: 1,
	salesPrice: 5,
	productionTime: 1500,
};
_productData[ProductPastryTypes.pastry_0] = {
	title: "Apple",
	description: "",
	productionPrice: 1,
	salesPrice: 5,
	productionTime: 1500,
};
_productData[ProductPastryTypes.pastry_1] = {
	title: "Cinnamon Bun",
	description: "",
	productionPrice: 1,
	salesPrice: 5,
	productionTime: 1500,
};
_productData[ProductPastryTypes.pastry_2] = {
	title: "Cupcake",
	description: "",
	productionPrice: 1,
	salesPrice: 5,
	productionTime: 1500,
};
_productData[ProductPastryTypes.pastry_3] = {
	title: "Donut",
	description: "",
	productionPrice: 1,
	salesPrice: 5,
	productionTime: 1500,
};
_productData[ProductPastryTypes.pastry_4] = {
	title: "Strawberry Pie",
	description: "",
	productionPrice: 1,
	salesPrice: 5,
	productionTime: 1500,
};

export class ProductData {

	static get(productType) {
		if (_productData[productType]) {
			return _productData[productType];
		} else {
			return {
				title: "Unknown",
				description: "Unknown",
				productionPrice: 0,
				salesPrice: 0,
				productionTime: null,
			};
		}
	}
}