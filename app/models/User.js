// file dependencies
const mongoose = require("mongoose");

// userSchema
const userSchema = mongoose.Schema({
    email: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    dateOfRegistration: {
        type: String,
        required: true,
    },
    code: {
        type: String,
        required: false,
    },
    brands: {
        type: Array,
        required: false,
    },
});

module.exports = mongoose.model("User", userSchema);