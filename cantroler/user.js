require("dotenv").config();
const path = require("path");
const https = require("https");
const mongoose = require("mongoose");
const Razorpay = require('razorpay');
const crypto = require("crypto");
const nodemailer = require('nodemailer');
const { RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET } = process.env;
const { User, Booking, Trip } = require("../model/user");
const { Property, Vendor , Roombooking } = require("../model/vendor");
const { Planing, Admin } = require("../model/admin");
const session = require("express-session");
const date = require("../date");
const { Console, log } = require("console");

const temp = "";
const todaydate = date.getDate();
const weatherDesc = "Search for Temperature";
const query = "";
const imgurl = "https://cdn.iconscout.com/icon/free/png-256/sunny-weather-1-458138.png";

const razorpay = new Razorpay({
    key_id: RAZORPAY_KEY_ID,
    key_secret: RAZORPAY_KEY_SECRET,
});

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});


async function getUserlogin(req, res) {
    res.render("user/login");
}

async function postUserlogin(req, res) {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (user) {
            if (req.body.pass === user.pass) {
                req.session.user = {
                    id: user._id,
                    name: user.name,
                    dob: user.dob,
                    email: user.email,
                    country: user.country,
                    state: user.state,
                    city: user.city,
                    zip: user.zip,
                    mono: user.mono,
                };
                res.redirect("/user/index");
            }
            else {
                res.json({ error: "password doesn't match" });
            }
        }
        else {
            res.status(400).json({ error: "E-Mail Doesn't exist" });
        }
    }
    catch (error) {
        console.log(error);
    }
}

async function getUserregister(req, res) {
    res.render("user/register")
}

async function postUserregister(req, res) {
    const { name, dob, country, state, city, zip, mono, email, pass, cpass } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return res.status(400).json({ error: "Email already registered" });
    }
    const result = await User.create({ name, dob, country, state, city, zip, mono, email, pass, cpass });
    res.redirect("/user");
}

function getUserindex(req, res) {
    if (!req.session.user) {
        return res.redirect("/user/");
    }
    res.render("user/index");
}

async function postUserindex(req, res) {
    if (!req.session.user) {
        return res.redirect("/user/");
    }
    try {
        const { source, destination, date, days, person } = req.body;
        const trimdestination = destination.trim(); // Trim spaces
        const planplace = await Planing.find({ placename: { $regex: new RegExp(trimdestination, "i") } });
        if(!planplace || planplace.length === 0){
            return res.render("user/display", {
                errorMessage: "No Hotels Are Available"
            });
        }
        const avroom = await Roombooking.find()
        const { city, state } = planplace[0];
        const properties = await Property.find({
            $and: [
                {
                    $or: [
                        { city: { $regex: new RegExp(city, "i") } },  // Case-insensitive search for city
                        { state: { $regex: new RegExp(state, "i") } }    // Case-insensitive search for state
                    ]
                }, { status : 'Active' }
            ]
        });

        if(!properties || properties.length === 0){
            return res.render("user/display", {
                errorMessage: "No property available"
            });
        } 
        else{

            const checkinDate = new Date(date);
        const today = new Date();

        let availableProperties = [];

        for (const property of properties) {
            const totroom = property.rooms || 0;
            const bookedRooms = await Roombooking.find({
                propertyId: property._id,
                checkout: { $gt: today },
                checkin: { $lte: checkinDate }
            });

            const roomsBooked = bookedRooms.reduce((acc, room) => acc + room.bookrooms, 0);
            const availableRooms = totroom - roomsBooked;

            if (availableRooms >= person) {
                availableProperties.push(property);
            }
        }

        if (availableProperties.length === 0) {
            return res.render("user/display", {
                errorMessage: "No rooms available for the selected date"
            });
        }
        

        res.render("user/display", {
            errorMessage: null,
            destinations: availableProperties,
            source,
            destination,
            date,
            days,
            person
        });
    }
    } catch (error) {
        console.log(error);
    }
}

async function getUserdisplay(req, res) {
    if (!req.session.user) {
        return res.redirect("/user/");
    }
    const destinations = await Vendor.find()
    res.render("user/display");
}

async function postUserdisplay(req, res) {
    if (!req.session.user) {
        return res.redirect("/user/");
    }
    try {
        const { source, destination, date, person, city, hotelprice, vendorname, propertyid } = req.body;
        console.log(req.body);

        const trimdestination = destination.trim(); // Trim spaces
        const planing = await Planing.find({ placename: { $regex: new RegExp(trimdestination, "i") } });
        const property = await Property.findOne({ _id: propertyid });
        // console.log(property);
        // console.log(planing);
        res.render("user/plans", { planing, source, destination, date, person, city, hotelprice, vendorname, property });
    } catch (error) {
        console.log(error);
    }
}

function getUserplans(req, res) {
    if (!req.session.user) {
        return res.redirect("/user/");
    }
    res.render("/user/plans");
}

async function postUserplans(req, res) {
    if (!req.session.user) {
        return res.redirect("/user/");
    }
    try {

        const { source, destination, date, person, hotelprice, vendorname, planingprice, placename, country, state, city, planid, propertyid } = req.body;
        const totelprice = Number(hotelprice * person) + Number(planingprice );
        const planing = await Planing.findOne({ _id: planid });
        const property = await Property.findOne({ _id: propertyid });
        // console.log("Session User:", req.session.user);  // Debugging log

        const user = req.session.user ;
        console.log(user)

        res.render("user/planning", {
            planing, user , 
            source, destination, date, person,
            hotelprice, vendorname, placename, planingprice,
            country, state, city, planid, totelprice, property, user: req.session.user,
            planDetails: planing.days || []  // ✅ Avoids error if planing.days is undefined
        });

    } catch (error) {
        console.log(error);
    }
}

async function getUserprofile(req, res) {
    if (!req.session.user) {
        return res.redirect("/user/");
    }
    try {
        if (!req.session.user) {
            return res.redirect("/user/"); // Redirect to login if not authenticated
        }
        res.render('user/profile', { user: req.session.user });
    } catch (error) {
        console.log(error);
    }
}

async function postUserprofile(req, res) {
    if (!req.session.user) {
        return res.redirect("/user/");
    }
    const { id, name, dob, country, state, city, zip, mono, email } = req.body;
    const updatedUser = await User.findByIdAndUpdate(id, { name, dob, country, state, city, zip, mono }, { new: true });
    if (updatedUser) {
        req.session.user = {
            id: updatedUser._id,
            name: updatedUser.name,
            dob: updatedUser.dob,
            email: updatedUser.email,
            country: updatedUser.country,
            state: updatedUser.state,
            city: updatedUser.city,
            zip: updatedUser.zip,
            mono: updatedUser.mono,
        };
    }
    res.redirect('/user/profile');
}

function getUserplaning(req, res) {
    if (!req.session.user) {
        return res.redirect("/user/");
    }
    res.render("user/planing");
}

async function postUserplanning(req, res) {
    if (!req.session.user) {
        return res.redirect("/user/");
    }
    try {
        const { amount, userId, planid, propertyid, date, person } = req.body;

        if (!userId) {
            return res.status(400).json({ success: false, msg: "User not logged in" });
        }

        const options = {
            amount: amount * 100, // Convert to paisa
            currency: "INR",
            receipt: `order_rcptid_${userId}`,
        };

        const order = await razorpay.orders.create(options);

        res.json({
            success: true,
            key_id: RAZORPAY_KEY_ID,
            amount: order.amount,
            order_id: order.id,
            currency: order.currency,
            userId,
            planid,
            propertyid,
            date,
            person,
        });
    } catch (error) {
        console.log("Razorpay Error:", error);
        res.status(500).json({ success: false, msg: "Payment failed" });
    }
}


async function bookingentry(req, res) {
    if (!req.session.user) {
        return res.redirect("/user/");
    }
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, userId, planid, propertyid, date, person } = req.body;

        const hmac = crypto.createHmac("sha256",RAZORPAY_KEY_SECRET);
        hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
        const generated_signature = hmac.digest("hex");


        if (generated_signature === razorpay_signature) {
            const newBooking = new Booking({
                userId,
                planId: planid,
                propertyId: propertyid,
                date,
                person,
                paymentId: razorpay_payment_id,
                status: "Confirmed",
            });

            await newBooking.save();

            if(propertyid){
                const plan = await Planing.findById(planid);
                const planday = plan.days.length;
                const bookingDate = new Date(date);
                bookingDate.setDate(bookingDate.getDate() + planday); // Subtract the days from the given date
                console.log(`Calculated date: ${bookingDate.toISOString().split('T')[0]}`); // Format the result as YYYY-MM-DD
                console.log(propertyid , planday  , date);

                const newRoomBooking = await Roombooking.create({
                    propertyId: propertyid,
                    userId: userId,
                    checkin: new Date(date),
                    checkout: bookingDate,
                    bookrooms: person, // Number of rooms booked
                    status: "Confirmed" // Assuming booking is confirmed after payment
                });
                
                 // Send confirmation email
                 const user = await User.findById(userId);
                 
            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: user.email,
                subject: "Booking Confirmation - SmartTrip",
                html: `
                    <h2>Hi ${user.name},</h2>
                    <p>Your booking is confirmed!</p>
                    <p><strong>Booking Date:</strong> ${date}</p>
                    <p><strong>Plan:</strong> ${plan.placename}</p>
                    <p><strong>Persons:</strong> ${person}</p>
                    <p><strong>Payment ID:</strong> ${razorpay_payment_id}</p>
                    <br>
                    <p>Thank you for booking with SmartTrip!</p>
                `,
            };
            await transporter.sendMail(mailOptions);
                // await newRoomBooking.save();
            }
            res.json({ success: true, msg: "Payment verified & booking confirmed!" });
        } else {
            res.status(400).json({ success: false, msg: "Invalid payment signature" });
        }
       
    } catch (error) {
        console.log("Payment Verification Error:", error);
        res.status(500).json({ success: false, msg: "Payment verification failed" });
    }
}


async function Probooking(req , res) {
    if (!req.session.user) {
        return res.redirect("/user/");
    }
    try{
        const { amount, userId, planid, propertyid, date, person } = req.body;
        console.log("Received booking data:", req.body);
    }catch(error){
        console.log(error)
    }
}




async function getUseruserbooking(req, res) {
    if (!req.session.user) {
        return res.redirect("/user/");
    }
    try {
        const userId = req.session.user.id; // Get logged-in user ID

        // Fetch user data
        const user = await User.findById(userId);

        // Fetch bookings
        const bookings = await Booking.find({ userId: userId });

        // Fetch plan and property details for each booking
        const bookingDetails = await Promise.all(
            bookings.map(async (booking) => {
                const plan = await Planing.findById(booking.planId);
                const property = booking.propertyId ? await Property.findById(booking.propertyId) : null;
                
                return {
                    ...booking.toObject(),
                    plan,
                    property
                };
            })
        );

        res.render("user/userbooking", { user, bookings: bookingDetails });
    } catch (error) {
        console.log(error);
        res.status(500).send("Server Error");
    }
}

async function getUserweather(req, res) {
    if (!req.session.user) {
        return res.redirect("/user/");
    }
    res.render("user/weather", { temp1: temp, date1: todaydate, des: weatherDesc, place: query, img: imgurl });
}

async function postUserweather(req, res) {
    const query = req.body.cityName
    const apikey = "9430719edecb9ed4e0d82ed08590fbaf"
    const unit = "metric"
    let url = "https://api.openweathermap.org/data/2.5/weather?q=" + query + "&appid=" + apikey + "&units=" + unit;

    https.get(url, (response) => {
        response.on("data", (data) => {
            const weatherData = JSON.parse(data)
            const temp = weatherData.main.temp
            const temperature1 = temp + "° C"
            const weatherDesc = weatherData.weather[0].description
            const icon = weatherData.weather[0].icon
            const imgurl = "http://openweathermap.org/img/wn/" + icon + "@2x.png"

            res.render("user/weather", { temp1: temperature1, date1: todaydate, des: weatherDesc, place: query, img: imgurl });

        });
    });
}

async function getUsercontact(req, res) {
    if (!req.session.user) {
        return res.redirect("/user/");
    }
    res.render("user/contact");
}

async function getUserabout(req, res) {
    if (!req.session.user) {
        return res.redirect("/user/");
    }
    res.render("user/about");
}

async function getUserdestinations(req, res) {
    if (!req.session.user) {
        return res.redirect("/user/"); // Redirect to login if not authenticated
    }
    try {
        const planing = await Planing.find();
        res.render("user/destinations", { planing });
    } catch (error) {
        console.log(error);
    }
}

async function postUserdestinations(req , res){
    if (!req.session.user) {
        return res.redirect("/user/"); // Redirect to login if not authenticated
    }
     try{
        const {planid , planprice , date , person , city}=req.body;
        const {source , destination , property  } = " ";
        const hotelprice  = 0 ;
        const propertyId = property && mongoose.Types.ObjectId.isValid(property) ? property : null;
        const totelprice =  planprice * person ;
        const planing = await Planing.findOne({ _id: planid });
        const user = req.session.user ;
        res.render("user/planning" , {planing , planprice , date , person , user , city , source , destination , totelprice , property ,propertyId , hotelprice} );

    }catch (error) {
        console.log(error);
    }
}

function getUserlogout(req , res){
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).send('Logout failed');
        }
        res.redirect('/user/'); 
    });
}

module.exports = {
    getUserlogin,
    postUserlogin,
    getUserregister,
    postUserregister,
    getUserindex,
    postUserindex,
    getUserdisplay,
    postUserdisplay,
    getUserplans,
    postUserplans,
    getUseruserbooking,
    getUserprofile,
    getUserplaning,
    postUserplanning,
    bookingentry,
    postUserprofile,
    getUserweather,
    postUserweather,
    getUsercontact,
    getUserabout,
    getUserdestinations,
    postUserdestinations,
    getUserlogout,
    Probooking,
}