const express = require("express");
const router = express.Router();
const List = require("../models/list");
const Item = require("../models/item");

router.get("/", (req, res, next) => {
	List.find({}).then(lists => {
		if (!lists.length) {
			List.create({ ancestors: [], parent: null })
				.then(list => {
					lists.push(list)
					res.status(200).json(lists)
				})
		} else {
			res.status(200).json(lists);
		};
	});
});

router.post("/", (req, res, next) => {
	if (req.body.parent) {
		Item.find({ _id: req.body.parent }).then(result => {
			let body = req.body;
			body.ancestors = result[0].ancestors.concat(req.body.parent);

			List.create(body).then(list => {
				res.status(201).json([list]);
			});
		});
	} else {
		List.create(req.body).then(list => {
			res.status(201).json(list);
		});
	}
});

router.delete("/:listId", (req, res, next) => {
	List.find({ ancestors: req.params.listId }).then(lists => {
		if (lists.length) {
			List.deleteMany({ ancestors: req.params.listId }).then(() => {
				// console.log('delete lists')
			})
		}
	})
	Item.find({ ancestors: req.params.listId }).then(items => {
		if (items.length) {
			Item.deleteMany({ ancestors: req.params.listId }).then(() => {
				// console.log('delete items')
			})
		}
	})
	List.deleteOne({ _id: req.params.listId }).then(list => {
		res.status(200).json(list);
	});
});

module.exports = router;
