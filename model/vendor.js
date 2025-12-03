const mongoose = require("mongoose");

const vendorSchema = new mongoose.Schema({
    name: { type: String, required: true },
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

const Vendor = mongoose.model("Vendor" , vendorSchema);

const propertySchema = new mongoose.Schema({
    vendorId: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor", required: true },
    propertyname: { type: String, required: true },
    description: { type: String },
    country: { type: String, required: true },
    state: { type: String, required: true },
    city: { type: String, required: true },
    pincode: { type: String, required: true },
    rooms : {type : Number},
    price: { type: String, required: true },
    images: [{ type: String }], // Stores file paths or URLs
    status: { type: String }
});

const Property = mongoose.model("Property", propertySchema);

const roombookingSchema= new mongoose.Schema({
    propertyId : { type: mongoose.Schema.Types.ObjectId, ref: "Propperty", required: true },
    userId :  { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    checkin : {type : Date },
    checkout : {type : Date},
    bookrooms : {type : Number}
});

const Roombooking = mongoose.model("Roombooking", roombookingSchema);



module.exports = {Vendor , Property , Roombooking};