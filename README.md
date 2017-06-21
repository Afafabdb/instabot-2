# Instabot

Instabot is a Node.js app wich can automatically and **periodically get posts from Instagram** based on a hashtag and save them in a database.
In addition, a human can use the app to add a single comment on those posts based on a static list of possibilies.

**Disclaimer:**
This app has been made in purpose of practice and learning about Node.js, Express.js, Sequelize and so on.
In anyway the idea behind this project is some kind of evil. So I hope you won't use it that way. If not, it's your decision and only yours.
You are an adult, you take the responsability for your acts.

As I do know that this app is pure nooby code in some way, **feedbacks/comments/pull requests are welcome**! Just please be kind with my ego.

## Credits

This app wouldn't exist without the great work of (huttarichard on his instagram-private-api)[https://github.com/huttarichard/instagram-private-api]. Big up for him!

## Installation

As a Node server, this app needs few node packages.

```
// Enter the app directory using a Terminal
cd path/to/appl/directory
```

```
// Install app dependencies
npm install 
```

```
// Launch the app
npm start 
```

The Terminal now output something like "Launch of the application on port 3000." and some database logs.

## Configuration

To work smoothly, the app has to be configured. To do so, update the file `config/app.js` has shown below.

```
// You need a valid Instagram account
user : {
  login: "", // the Instagram account nickname
  password: "" // the Instagram account password
}
```

```
// You need to create a database on your server and update its informations
db : {
  host: "", // the database host (ex: localhost)
  dialect: "", // the database dialect (ex: mysql)
  name : "", // a database name (ex: instabot)
  login : "", // the database login
  password : "" // the database password
}
```

``` 
// Cron informations
cron : {
  hashtag : "", // the hashtag to search for posts
  delay : 5 // the cron's delay
}
```

In addition, the file `config/categories.js` is the one used to display the list of comments on the webpage. You shall want to update it with your own data.
**Tip**: you can add/remove comment/category on this file. Then you can have a 15 comments list if you want to.

## Usage

As soon as it has been launched, the app will periodically get Instagram's posts and save the new one in the database.
If you want to post a comment on the posts, just open `localhost:3000` on your browser. You now can add on comment on each post.
If you open `localhost:3000/validated` you will see all posts one wich you have already had a comment.

