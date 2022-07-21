const mongoose = require("mongoose");


const requestSchema = mongoose.Schema({
    from: {
        type: String,
        required: true,
    },
    to: {
        type: String,
        required: true,
    },
    serial: {
        type: String,
        required: true,
    },
    date: {
        type: String,
        required: true,
    },
    approved: Boolean,
    approval_status: {
        type: Boolean,
        required: true,
    }
});

module.exports = mongoose.model("Request", requestSchema);