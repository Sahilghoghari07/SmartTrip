const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema({
    uname : String,
    pass : String,
});

const Admin = mongoose.model("admin" , adminSchema);

const planningSchema = new mongoose.Schema({
    placename: { type: String, required: true },
    description: { type: String, required: true },
    country: { type: String, required: true },
    state: { type: String, required: true },
    city: { type: String, required: true },
    price: { type: Number, required: true },
    days: [{ day: String, plan: String }], // Array of objects for daily plans
    images: [String] // Store image file paths
}, { timestamps: true });

const Planing = mongoose.model("planing" , planningSchema);

module.exports = {Admin , Planing };