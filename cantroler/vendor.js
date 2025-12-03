const path = require("path");
const {Vendor , Property} = require("../model/vendor");
const {User , Booking} = require("../model/user");
const {Planing} = require("../model/admin");
const { error } = require("console");
const fs = require("fs");


async function getVendorlogin(req , res)
{
    // res.sendFile(path.join(__dirname , '../view/vendor/login.html'));
    res.render("vendor/login");
}

async function postVendorLogin(req , res)
{
    try{
        const vendor = await Vendor.findOne({email : req.body.vemail})
        if(vendor)
        {
            if(req.body.vpass === vendor.cpass)
            {
                req.session.vendor = {
                    id : vendor._id,
                    name: vendor.name,
                    dob : vendor.dob,
                    email: vendor.email,
                    country: vendor.country,
                    state: vendor.state,
                    city: vendor.city,
                    zip : vendor.zip,
                    mono : vendor.mono,
                };
                res.redirect("/vendor/index");
            }
            else{
                res.status(400).json({error : "Opps! password incorect"});
            }
        }else{
            res.status(400).json({error : "opps E-mail Incorect"})
        }
    }catch(error){
        console.log(error);
    }
}

function getVendorregister(req , res)
{
    // res.sendFile(path.join(__dirname , '../view/vendor/register.html'));
    res.render("vendor/register");
}

async function postVendorregister(req , res)
{

    const {name , dob , country , state , city , zip , mono , email , pass , cpass} = req.body;
    const existingVendor = await Vendor.findOne({email : email });
        if (existingVendor) {
            return res.status(400).json({ error: "Email already registered!" });
        }
    const result = await Vendor.create({name , dob , country , state , city , zip , mono , email , pass , cpass});
    // console.log(result);
    res.redirect("/vendor");
}

async function getVendorhome(req , res)
{
    if (!req.session.vendor) {
        res.redirect("/vendor")
    }
    try {
        const totalProperties = await Property.countDocuments(); 

        const vendorId = req.session.vendor.id;
        const properties = await Property.find({ vendorId : vendorId });
        const propertyIds = properties.map(p => p._id);
        const totalbookings = await Booking.countDocuments({ propertyId: {$in: propertyIds} }); 
        const pendingRequest = await Property.countDocuments({ status: "pending" });
        res.render("vendor/index", { totalProperties, pendingRequest, totalbookings });
    } catch (error) {
        console.error(error);
    }
}

function getVendorprofile(req , res) {
    if (!req.session.vendor) {
        res.redirect("/vendor")
    }
    try{
        if (!req.session.vendor) {
            return res.redirect("/vendor"); // Redirect to login if not authenticated
        }
        res.render('vendor/profile' , {vendor : req.session.vendor});
    }catch(error){
        console.log(error);
    }
}

async function postVendorprofile(req , res){
    if (!req.session.vendor) {
        res.redirect("/vendor")
    }
    const {id , name , dob , country , state , city , zip , mono , email } = req.body;
    const updatedVendor = await Vendor.findByIdAndUpdate(id,{name , dob , country , state , city , zip, mono} , {new : true});
    if (updatedVendor) {
        req.session.vendor = {
            id: updatedVendor._id,
            name: updatedVendor.name,
            dob: updatedVendor.dob,
            email: updatedVendor.email,
            country: updatedVendor.country,
            state: updatedVendor.state,
            city: updatedVendor.city,
            zip: updatedVendor.zip,
            mono: updatedVendor.mono,
        };
    }
    // res.redirect('/user/profile');
     res.redirect('/vendor/profile');
}

function getVendorlisting(req , res){
    if (!req.session.vendor) {
        return res.redirect("/vendor"); // Redirect to login if not authenticated
    }
    try{
         res.render('vendor/listing' , {vendor : req.session.vendor});
    }catch(error){
        console.log(error);
    }
}

async function postVendorlisting(req, res) {
    if (!req.session.vendor) {
        return res.redirect("/vendor");
    }
    try {

        const { vendorId ,propertyname, description, country, state, city, pincode, price , rooms , status } = req.body;
        const vendor =  req.session.vendor;
        const imagePaths = req.files.map(file => "/uploads/" + file.filename); // Get uploaded file paths

        const newProperty = await Property({
            vendorId,
            propertyname,
            description,
            country,
            state,
            city,
            pincode,
            price,
            rooms,
            images: imagePaths,
            status
        });

        await newProperty.save();
        res.redirect("/vendor/display"); // Redirect to listing page
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

async function getVendordisplay(req,res){
    if (!req.session.vendor) {
        return res.redirect("/vendor/"); // Redirect to login if not authenticated
    }
    try{
        const vendorId = req.session.vendor.id;
        console.log(vendorId);
        const properties = await Property.find({vendorId : vendorId});
        res.render("vendor/display", { vendors: properties }); 
    }catch(error){
        console.log(error);
    }
} 

async function getVendoredit(req, res) {
    if (!req.session.vendor) {
        return res.redirect("/vendor/");
    }
    try {
        const property = await Property.findById(req.params.id);
        if (!property) {
            return res.status(404).send("Property not found");
        }
        res.render("vendor/edit", { property });
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
}

// async function postVenderedit(req, res){
//     try {
//         const { propertyname, price, description, city } = req.body;
//         let updateData = { propertyname, price, description, city };

//         // If a new image is uploaded, update the image field
//         if (req.file) {
//             updateData.image = req.file.filename;
//         }

//         await Property.findByIdAndUpdate(req.params.id, updateData);
//         res.redirect("/vendor/display"); // Redirect after update
//     } catch (error) {
//         console.log(error);
//         res.status(500).send("Internal Server Error");
//     }
// };

async function postVenderedit(req, res) {
    if (!req.session.vendor) {
        return res.redirect("/vendor/");
    }
    try {
        const { propertyname, price, description, city } = req.body;
        let updateData = { propertyname, price, description, city };

        const property = await Property.findById(req.params.id);
        if (!property) {
            return res.status(404).send("Property not found");
        }

        // Handle image upload
        if (req.file) {
            // Delete old image from server (optional)
            if (property.image) {
                const oldImagePath = path.join(__dirname, "../public/uploads", property.image);
                fs.unlink(oldImagePath, (err) => {
                    if (err) console.log("Error deleting old image:", err);
                });
            }
            updateData.image = req.file.filename; // Save new image
        }

        await Property.findByIdAndUpdate(req.params.id, updateData);
        res.redirect("/vendor/display");
    } catch (error) {
        console.log(error);
        res.status(500).send("Internal Server Error");
    }
}

async function postVendordelete(req, res) {
    if (!req.session.vendor) {
        res.redirect("/vendor")
    }
    try {
        if (!req.session.vendor) {
            return res.redirect("/vendor/"); // Redirect if not authenticated
        }

        const property = await Property.findByIdAndDelete(req.params.id);

        if (!property) {
            return res.status(404).send("Property not found");
        }

        res.redirect("/vendor/display"); // Redirect back to the listing page
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
}

async function getVendorproperties(req, res) {
    if (!req.session.vendor) {
        res.redirect("/vendor")
    }
    try{
        if (!req.session.vendor) {
            return res.redirect("/vendor/"); // Redirect if not authenticated
        }
        const properties = await properties.find({vendorname : req.session.vendor.name});
        res.render("vendor/display", properties);
    }
    catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
}

async function getVendorbooking(req , res) {
    if (!req.session.vendor) {
        return res.redirect("/vendor/"); // Redirect if not authenticated
    }
    try {
        const vendorId = req.session.vendor.id; // Get logged-in vendor ID

        // Fetch all properties for the vendor
        const properties = await Property.find({ vendorId });

        // Extract property IDs
        const propertyIds = properties.map(property => property._id);

        // Fetch only bookings for properties owned by this vendor
        const bookings = await Booking.find({ propertyId: { $in: propertyIds } });

        // Fetch plan and property details for each booking
        const bookingDetails = await Promise.all(
            bookings.map(async (booking) => {
                const plan = await Planing.findById(booking.planId);
                const property = await Property.findById(booking.propertyId);
                
                return {
                    ...booking.toObject(),
                    plan,
                    property
                };
            })
        );

        res.render("vendor/vendorbooking", { bookings: bookingDetails }); // Changed template name to fit vendor context
    } catch (error) {
        console.log(error);
        res.status(500).send("Server Error");
    }
}

function getVendorlogout(req , res){
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).send('Logout failed');
        }
        res.redirect('/vendor/'); 
    });
}

module.exports = {
        getVendorlogin,
        postVendorLogin,
        getVendorregister,
        postVendorregister,
        getVendorhome,
        getVendorprofile,
        postVendorprofile,
        getVendorlisting,
        postVendorlisting,
        getVendordisplay,
        getVendoredit,
        postVenderedit,
        postVendordelete,
        getVendorproperties,
        getVendorbooking,
        getVendorlogout,
    }