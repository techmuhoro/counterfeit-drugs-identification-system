const mongoose = require("mongoose");

const productSchema = mongoose.Schema({
    brand: {
        type: String,
        required: true,
    },
    serial: {
        type: String,
        required: true,
    },
    dateOfRegistration: {
        type: String,
        required: true,
    },
    expiry: {
        type: String,
        required: true,
    },
    manufacturer: {
        type: String,
        required: true,
    },
    qrcode: {
        type: String,
        required: false,
    },
    track: {
        type: Object,
        required: false,
    },
});

module.exports = mongoose.model("Product", productSchema);