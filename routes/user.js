const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
// const bodyparser = require("body-parser");
const {getUserlogin,
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
    Probooking,
    postUserprofile,
    getUserweather,
    postUserweather,
    getUsercontact,
    getUserabout,
    getUserdestinations,
    postUserdestinations,
    getUserlogout,
    
} = require("../cantroler/user");
const router = express.Router();
const app = express();
const conn = mongoose.connection;


router.get("/", getUserlogin );

router.post("/", postUserlogin);

router.get("/register", getUserregister);

router.post("/register" , postUserregister);

router.get("/index", getUserindex);

router.post("/index" , postUserindex);

router.get("/display" , getUserdisplay);

router.post("/display" , postUserdisplay);

router.get("/plans"  , getUserplans);

router.post("/plans" , postUserplans);

router.get("/profile" , getUserprofile);

router.post("/profile" , postUserprofile);

router.get("/planing" , getUserplaning);

router.post("/planing" , postUserplanning , Probooking);

router.post('/verify-payment', bookingentry);

router.get("/bookings" , getUseruserbooking);

router.get("/weather" , getUserweather);

router.post("/weather" , postUserweather);

router.get("/contact" , getUsercontact);

router.get("/about" , getUserabout);

router.get("/destinations" , getUserdestinations);

router.post("/destinations" , postUserdestinations);

router.get("/logout" , getUserlogout);

module.exports = router;