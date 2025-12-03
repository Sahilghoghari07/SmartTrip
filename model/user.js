const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name : String,
    dob : Date , 
    country : String,
    state : String,
    city : String,
    zip : Number,
    mono : Number,
    email :{ type : String , require: true , unique : true },
    pass : String,
    cpass : String,
} , { strict: true });

const User = mongoose.model("user" , userSchema);

// const TripSchema = new mongoose.Schema({
//     placename: String,
//     description: String,
//     country: String,
//     state: String,
//     city: String,
//     price: Number,
//     days: [{ day: String, plan: String }],
//     images: [String], 
// });

// module.exports = mongoose.model("Trip", TripSchema);

const bookingSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    planId: { type: mongoose.Schema.Types.ObjectId, ref: "Planing", required: true },
    propertyId: { type: String  },
    date: { type: String, required: true },
    person: { type: Number, required: true },
    paymentId: { type: String, required: true },
    amount : {type : String},
    status: { type: String, enum: ["Pending", "Confirmed", "Cancelled"], default: "Pending" }
}, { timestamps: true });
const Booking = mongoose.model("booking", bookingSchema);

module.exports = {User ,  Booking};