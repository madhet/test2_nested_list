const express = require("express");
const router = express.Router();
const Item = require("../models/item");
const List = require("../models/list");

router.get("/", (req, res, next) => {
	Item.find({}).then(items => {
		res.send(items);
	});
});

router.post("/", (req, res, next) => {
	const { parent } = req.body;
	List.find({ _id: parent }).then(result => {
		let body = req.body;
		body.ancestors = result[0].ancestors.concat(req.body.parent);
		Item.find({ parent: parent }).then(children => {
			body.order = children.length ? children.length : 0;
			Item.create(body).then(item => {
				res.status(201).send(item);
			});
		})
	})
});

router.delete("/:itemId", (req, res, next) => {
	List.find({ ancestors: req.params.itemId }).then(lists => {
		if (lists.length) {
			List.deleteMany({ ancestors: req.params.itemId }).then(() => {
			})
		}
	})
	Item.find({ ancestors: req.params.itemId }).then(items => {
		if (items.length) {
			Item.deleteMany({ ancestors: req.params.itemId }).then(() => {
			})
		}
	})
	Item.find({ _id: req.params.itemId }).then(item => {
		if (item.length) {
			let parent = item[0].parent;
			let order = item[0].order;
			Item.find({ parent: parent }).then(children => {
				children.filter(itm => itm.order > order).forEach(itm => {
					itm.order -= 1;
					itm.save();
				})
			})
		}
	})
	Item.deleteOne({ _id: req.params.itemId }).then(item => {
		res.status(200).json(item);
	});
});

router.patch("/:itemId", (req, res, next) => {
	Item.findByIdAndUpdate({ _id: req.params.itemId }, req.body).then(() => {
		Item.findOne({ _id: req.params.itemId }).then(item => {
			res.status(200).send(item);
		});
	});
});

module.exports = router;
