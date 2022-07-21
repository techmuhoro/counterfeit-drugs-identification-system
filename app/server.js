//File dependencies
const express = require("express");
const router = require("./router");
const path = require('path');
const cookieParser = require("cookie-parser");

//database connection
require("./models/conn");

//Global variables
const app = express();
const PORT = 3000;

//App middlewares
app.use("/", router);
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, '/../public')));
app.set("views", path.join(__dirname, "/../public/views"));
app.use(cookieParser());

//Routes 

//function start the server
function startServer () {
    app.listen(PORT, function(){
        console.log("Server running on port " + PORT);
    });
}

module.exports = startServer;
