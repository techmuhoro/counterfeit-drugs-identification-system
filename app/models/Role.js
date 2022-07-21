const mongoose = require("mongoose");

const roleSchema = mongoose.Schema({
    id: {
        type: Number,
        required: true,
    },
    name: {
        type: String,
        required: true,
    }
});


module.exports = mongoose.model("Role", roleSchema)