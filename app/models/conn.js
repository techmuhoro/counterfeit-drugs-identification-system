// file dependecies
const mongoose = require("mongoose");

// variables
//connection url
const url = "mongodb://localhost:27017/Counterfeit";

mongoose.connect(
    url,
    {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    },
    err => err ? console.log(err) : console.log("Connected to database"),
);