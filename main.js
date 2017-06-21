const express = require('express');
const app = express();
const bodyParser = require('body-parser');

const config = require('./config/app');
const Sequelize = require('sequelize');

const categories = require('./config/categories');

// Cron file
const CronJob = require('cron').CronJob;

// Instanciate istragram API's connection
const Client = require('instagram-private-api').V1;
const device = new Client.Device(config.user.login);
const storage = new Client.CookieFileStorage(__dirname + '/cookies/' + config.user.login + '.json');
const session = new Client.Session(device, storage);


// Sequelize connection
const sequelize = new Sequelize(config.db.name, config.db.login, config.db.password, {
	host: config.db.host,
  	dialect: config.db.dialect,
  	dialectOptions: {
  		charset: "utf8"
  	}
});

const Posts = sequelize.define('posts', {
	post_id : Sequelize.STRING,
	content : Sequelize.TEXT,
	username : Sequelize.STRING,
	picture : Sequelize.STRING,
	taken_at : Sequelize.STRING,
	link : Sequelize.STRING,
	status : { 
		type: Sequelize.INTEGER,
		default : 0
	}
});

// We wait for the DB synchronization to launch the cron
sequelize.sync().then(() => {
	launchCron();
});

// Express config
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({
    extended: true
}));
app.set('views', './views');
app.set('view engine', 'pug');

// Routes
app.get('/', function (req, res) {
	return posts = Posts.findAll({
		where: {
			status: 0
		},
			order : [["taken_at", "ASC"]]
	}).then(posts=> {	
		res.render("index", {posts : posts, categories : categories});
	});

});

app.get('/validated', function (req, res) {
	return posts = Posts.findAll({
		where: {
			status: {
				$ne : 0
			}
		},
			order : [["taken_at", "ASC"]]
	}).then(posts=> {	
		res.render("validated", {posts : posts});
	});

});

app.post('/', function (req, res) {
	// Get post params
	const postParams = req.body;

	var checkDoubleComment = false;
	// Check if the post has been commented already
	Posts.findOne({
		where : {
			id : postParams.id,
			status : +postParams.category
		}
	}).then(result => {
		if(result != null){
			checkDoubleComment = true;
		}
	}).then(()=>{
		if(!checkDoubleComment){
			return updatePost(postParams.id, postParams.category);
		}
	}).then(()=> {
		if(!checkDoubleComment && postParams.no_comment !== "no"){
			// Send comment on instagram's post
			return Client.Comment.create(session, postParams.post_id, categories[postParams.category-1].comment);		
		}
	}).then(() => {
		// Get same posts as previously but without the one newly commented
		return posts = Posts.findAll({
			where: {
				status: 0
			},
			order : [["taken_at", "ASC"]]
		});
	}).then(posts => {	
		res.render("index", {posts : posts, categories : categories});
	});

});

app.listen(3000, function () {
	console.log('App is launched on port 3000.');
});

/*
* launchCron starts a cron based on config/app.js cron's delay
*/
function launchCron() 
{
	Client.Session.create(device, storage, config.user.login, config.user.password);

	const startDate = new Date();

	console.log("#".repeat(5) + " Starts Cron at " + new Date() + " " + "#".repeat(5));
	// Initiate the cron
	new CronJob({
		cronTime: '0 */' + config.cron.delay + ' * * * *', // Pattern means every 5 min
		onTick : crawlPosts,
		start : true,
		runOnInit : true
	});
}

function crawlPosts() {
	console.log("#".repeat(5) + " Launch new syncho at " + new Date() + " " + "#".repeat(5));
	// Get last post's timestamp in DB
	var lastPostTimestamp = "0";
	Posts.findOne({ attributes : ["taken_at"], order : [["taken_at", "DESC"]]}).then(function(lastPost){
		if(lastPost !== null){
			lastPostTimestamp = lastPost.get("taken_at");
		}
	}).then(() => {
		return getPosts(config.cron.hashtag);
	}).then(feed => {

		for(i = 0; i<=feed.length-1; i++){
			const params = feed[i]._params;
			const accountParams = feed[i].account._params;

			if(+params.takenAt > +lastPostTimestamp){
				console.log("create post " + params.id + " in DB");
				//Create posts in DB
				injectPost(params, accountParams);
			}else {
				return ; 
			}
		}
	}, error => {
		console.error(error);
	});
}

/*
* injectPost create a new post in the DB
* params {object}
* accountParams {object}
*/
function injectPost(params, accountParams){
	//TODO: Do it better
	var pictureParam = params.images[1],
		pictureUrl = "";

	if(pictureParam.length > 1){
		pictureUrl = pictureParam[0].url;
	}else {
		pictureUrl = pictureParam.url;
	}

	Posts.create({
		post_id: params.id,
		content : params.caption,
		username : accountParams.username,
		picture : pictureUrl,
		taken_at :  params.takenAt,
		link :  params.webLink,
		status: 0
	});
}

/*
* updatePost in the DB
* id {string}
* value {string}
* return {promise}
*/
function updatePost(id, value){
	return Posts.update(
		{ status : +value },
		{ where : {
			id : id
			}
		}
	);
}

/*
* getPosts gets instagram posts based on hashtag
* hashtag {string}
* return {Object} : a Feed object containing all Posts objects
*/
function getPosts(hashtag) {
	const feed = new Client.Feed.TaggedMedia(session, hashtag);

	return feed.get();
}