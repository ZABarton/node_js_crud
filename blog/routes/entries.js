var express = require('express'),
		router = express.Router(),
		mongoose = require('mongoose'),
		bodyParser = require('body-parser'),
		methodOverride = require('method-override');

router.use(bodyParser.urlencoded({ extended: true }))
router.use(methodOverride(function(req, res){
	if (req.body && typeof req.body === 'object' && '_method' in req.body) {
		var method = req.body._method
		delete req.body._method
		return method
	}
}))

router.route('/')
	.get(function(req, res, next) {
		mongoose.model('Entry').find({}, function (err, entries) {
			if (err) {
				return console.error(err);
			} else {
				res.format({
					html: function(){
						res.render('entries/index', {
							title: 'Blog Entries',
							"entries" : entries
						});
					},
					json: function(){
						res.json(info);
					}
				});
			}
		});
	})

	.post(function(req, res){
		var author = req.body.author;
		var postTitle = req.body.postTitle;
		var postBody = req.body.postBody;
		var date = req.body.date;
		mongoose.model('Entry').create({
			author : author,
			postTitle : postTitle,
			postBody : postBody,
			date : date
		}, function (err, entry) {
			if (err) {
				res.send("There was problem creating a new entry.")
			} else {
				console.log('POST request for new entry: ' + entry);
				res.format({
					html: function(){
						res.location("entries");
						res.redirect("/entries");
					},
					json: function(){
						res.json(entry);
					}
				});
			}
		})
	});

router.get('/new', function(req, res){
	res.render('entries/new', {title: 'Create New Entry'});
});

router.param('id', function(req, res, next, id) {
	mongoose.model('Entry').findById(id, function(err, entry){
		if (err) {
			console.log(id + ' could not be found');
			res.status(404)
			var err = new Error('Not Found');
			err.status = 404;
			res.format({
				html: function(){
					next(err);
				},
				json: function(){
					res.json({message : err.status + ' ' + err});
				}
			});
		} else {
			req.id = id;
			next();
		}
	});
});

router.route('/:id')
	.get(function(req, res) {
		mongoose.model('Entry').findById(req.id, function(err, entry) {
			if (err) {
				console.log('There was an error retrieving this entry');
			} else {
				console.log('Retrieving ID: ' + entry._id);
				var entrydate = entry.date.toISOString();
				entrydate = entrydate.substring(0, entrydate.indexOf('T'))
				res.format ({
					html: function(){
						res.render('entries/show', {
							"entrydate" : entrydate,
							"entry" : entry
						});
					},
					json: function(){
						res.json(entry);
					}
				});
			}
		});
	});

router.route('/:id/edit')
	.get(function(req, res) {
		mongoose.model('Entry').findById(req.id, function(err, entry){
			if (err) {
				console.log('There was an error retrieving this entry');
			} else {
				var entrydate = entry.date.toISOString();
				entrydate = entrydate.substring(0, entrydate.indexOf('T'))
					res.format({
						html: function(){
							res.render('entries/edit', {
								title: "Entry #" + entry._id,
								"entrydate" : entrydate,
								"entry" : entry
							});
						},
						json: function(){
							res.json(entry);
						}
					});				
			}
		});	
	})
	.put(function(req, res){
		var author = req.body.author;
		var postTitle = req.body.postTitle;
		var postBody = req.body.postBody;
		var date = req.body.date;
		mongoose.model('Entry').findById(req.id, function (err, entry) {
			entry.update({
				author : author,
				postTitle : postTitle,
				postBody : postBody,
				date : date
			}, function (err, entryID) {
				if (err) {
					res.send("There was an error while updating information")
				} else {
					res.format({
						html: function(){
							res.redirect("/entries/" + entry._id)
						},
						json: function(){
							res.json(entry);
						}
					});
				}
			})
		});
	})
	.delete(function (req, res){
		mongoose.model('Entry').findById(req.id, function (err, entry) {
			if (err) {
				return console.error(err);
			} else {
				entry.remove(function (err, entry){
					if (err) {
						return console.error(err);
					} else {
						res.format({
							html: function(){
								res.redirect("/entries");
							},
							json: function(){
								res.json({message : 'deleted',
									item : entry
								});
							}
						});
					}
				});
			}
		});	
	});
	
module.exports = router;