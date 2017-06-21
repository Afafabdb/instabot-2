module.exports = {
	user : {
		login: "", // a Instagram account nickname
		password: "" // a Instagram account password
	},
	db : {
		host: "", // the database host (ex: localhost)
		dialect: "", // the database dialect (ex: mysql)
		name : "", // a database name (ex: instabot)
		login : "", // the database login
		password : "" // the database password
	},
	cron : {
		hashtag : "", // the hashtag to search for posts
		delay : 5 // the cron's delay
	}
};