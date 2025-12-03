const path = require("path");
const {Admin , Planing} = require("../model/admin");
const {Vendor, Property} = require("../model/vendor");
const {User , Booking} = require("../model/user");
// const { default: plans } = require("razorpay/dist/types/plans");

async function getAdminlogin(req , res)
{
    res.render("admin/login");
}
async function postAdminlogin(req , res)
{
    try{
        const admin = await Admin.findOne({uname : req.body.aname});
        if(admin){
            if(admin.pass === req.body.apass){
                req.session.admin = {
                    id : admin._id,
                    namde : admin.uname,
                };
                res.redirect("/admin/home");
            }
            else{
                res.status(400).json({error : "Opps! Password is incorect"});
            }
        }
        else{
            res.status(400).json({error : "Opps! Username is incorect"});
        }
    }catch(error)
    {
        console.log(error);
    }
}

async function getAdmindeshboard(req , res)
{
    if (!req.session.admin) {
        return res.redirect("/admin/");
    }
    try {
        const totalUsers = await User.countDocuments(); // Count total users in database
        const totalVendors = await Vendor.countDocuments(); // Count total vendors in database
        const totalPackages = await Planing.countDocuments(); // Count total listings in database
        res.render("admin/index", { totalUsers, totalVendors, totalPackages });
    } catch (error) {
        console.error(error);
    }
}

async function getAdminvendordata(req , res){
    if (!req.session.admin) {
        return res.redirect("/admin/");
    }
    const vendor = await Vendor.find();
    res.render("admin/vendordata", { vendor});
}

async function getAdminpropertydata(req , res){
    if (!req.session.admin) {
        return res.redirect("/admin/");
    }
    const properties = await Property.find({ status : 'pending'});
    // console.log(properties);
    const vendorId = properties.map(property => property.vendorId);
    const Vendors = await Vendor.findOne({ _id: vendorId});
    //  console.log(Vendor);
    res.render("admin/propertydata", {properties  , Vendors});
}

// async function getAdmineditproperty(req , res){
//     const property = await Property.findById(req.params.id);
//     if (!property) {
//         return res.status(404).send("Property not found");
//     }
//     res.render("admin/editproperty", { property });
// }

async function postAdminpropertydataupdate(req , res){
    if (!req.session.admin) {
        return res.redirect("/admin/");
    }
    try{
        const property = await Property.findByIdAndUpdate(req.params.id , {status : 'Active'});
        res.redirect("/admin/propertydata");
    }catch(error){
        console.log(error);
    }
}
async function postAdminpropertydecline(req , res){
    if (!req.session.admin) {
        return res.redirect("/admin/");
    }
    try{
        const property = await Property.findByIdAndUpdate(req.params.id , {status : 'Decline'});
        res.redirect("/admin/propertydata");
    }catch(error){
        console.log(error);
    }
}

async function getAdminactiveproperty(req , res) { 
    if (!req.session.admin) {
    return res.redirect("/admin/");
}

try {
    const properties = await Property.find({ status: 'Active' });
    
    // Extract all unique vendor IDs from the properties
    const vendorIds = [...new Set(properties.map(property => property.vendorId))];
    
    // Find all vendors whose IDs are in the vendorIds array
    const Vendors = await Vendor.find({ _id: { $in: vendorIds } });
    
    res.render("admin/activeproperty", { properties, Vendors });
} catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
}
}

async function postAdmindeactivetproperty(req , res){
    if (!req.session.admin) {
        return res.redirect("/admin/");
    }
    try{
        const property = await Property.findByIdAndUpdate(req.params.id , {status : 'Deactivate'});
        res.redirect("/admin/propertydata");
    }catch(error){
        console.log(error);
    }
}
// async function postAdminpropertydelete(req, res) {
//     try {
//         const property = await Property.findByIdAndDelete(req.params.id);

//         if (!property) {
//             return res.status(404).send("Property not found");
//         }

//         res.redirect("/admin/propertydata"); // Redirect back to the listing page
//     } catch (error) {
//         console.error(error);
//         res.status(500).send("Internal Server Error");
//     }
// };

async function getAdminuserdata(req , res){
    if (!req.session.admin) {
        return res.redirect("/admin/");
    }
    const user = await User.find();
    res.render("admin/userdata" , {user});
}

async function getAdminplaning(req , res) {
    if (!req.session.admin) {
        return res.redirect("/admin/");
    }
    res.render("admin/planing");
}

async function postAdminplaning(req, res){
    if (!req.session.admin) {
        return res.redirect("/admin/");
    }
    try {
        const  {placename , description, country, state, city, price, day, plan } = req.body;
        console.log(req.body);

        if (!placename || !description || !country || !state || !city || !price) {
            return res.status(400).json({ error: "All fields are required." });
        }

        // Ensure 'day' and 'plan' are arrays
        let daysPlan = [];

if (!Array.isArray(day)) {
    daysPlan = [{ day: day, plan: plan }];
} else {
    daysPlan = day.map((d, index) => ({
        day: d,
        plan: plan[index] || "",
    }));
}

        // Handle image uploads (assuming multer is used)
        let images = [];
        if (req.files) {
            images = req.files.map(file => file.filename);
        }

        // Create new planning document
        const newPlan = await Planing.create({
            placename,
            description,
            country,
            state,
            city,
            price,
            days: day ? day.map((d, index) => ({ day: d, plan: plan[index] })) : [],
            images: req.files ? req.files.map(file => file.path) : []
        });

        console.log("Plan created successfully:", newPlan);
        res.redirect("/admin/planing");  // Redirect after successful submission
    } catch (error) {
        console.error("Error creating plan:", error);
        res.status(500).send("Internal Server Error");
    }
};

async function getAdminbookingdata(req , res) {
    if (!req.session.admin) {
        return res.redirect("/admin/");
    }
    try {
        // Fetch all bookings
        const bookings = await Booking.find();

        // Fetch plan, property, and vendor details
        const bookingDetails = await Promise.all(
            bookings.map(async (booking) => {
                const plan = await Planing.findById(booking.planId);
                const property = booking.propertyId ? await Property.findById(booking.propertyId).populate({ path: "vendorId", select: "name" }) : null;
                
                return {
                    ...booking.toObject(),
                    plan,
                    property,
                    vendorName: property && property.vendorId ? property.vendorId.name : "N/A"
                };
            })
        );

        res.render("admin/bookingdata", { bookings: bookingDetails });
    } catch (error) {
        console.log(error);
        res.status(500).send("Server Error");
    }
}

async function getAdmindisplayplans(req,res){
    if (!req.session.admin) {
        return res.redirect("/admin/");
    }
    try{
        const plans = await Planing.find();
        res.render("admin/displayplans", { plans }); 
    }catch(error){
        console.log(error);
    }
} 

async function getAdmineditplans(req, res) {
    if (!req.session.admin) {
        return res.redirect("/admin/");
    }
    try {
        const plan = await Planing.findById(req.params.id);
        res.render("admin/edit", { plan });
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
}

async function postAdminUpdatePlan(req, res) {
    if (!req.session.admin) {
        return res.redirect("/admin/");
    }
    try {
        const {id , placename , description , price , country , state , city } = req.body;
        let updateData = { placename , description , price ,country, state, city };
        console.log(req.body);
        const plan = await Planing.findById(req.params.id);
        
        await Planing.findByIdAndUpdate( id, {
            placename : placename,
            description : description,
            country : country , 
            state : state,
            city : city,
            price: price,
        });
        res.redirect("/admin/displayplans");
    } catch (error) {
        console.log(error);
        res.status(500).send("Internal Server Error");
    }
}

async function postAdminplandelete(req, res) {
    if (!req.session.admin) {
        return res.redirect("/admin/");
    }
    try {
        const plan = await Planing.findByIdAndDelete(req.params.id);
        res.redirect("/admin/displayplans"); // Redirect back to the listing page
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
}

function getAdminlogout(req , res){
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).send('Logout failed');
        }
        res.redirect('/vendor/'); 
    });
}



module.exports = {
    getAdminlogin,
    postAdminlogin,
    getAdmindeshboard,
    getAdminuserdata,
    getAdminvendordata,
    getAdminpropertydata,
    postAdminpropertydataupdate,
    postAdminpropertydecline,
    getAdminactiveproperty,
    postAdmindeactivetproperty,
    getAdmineditplans,
    postAdminUpdatePlan,
    // postAdminpropertydelete,
    // getAdmineditproperty,
    getAdminplaning,
    postAdminplaning,
    getAdminbookingdata,
    getAdmindisplayplans,
    postAdminplandelete,
    getAdminlogout,
}