const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const bodyParser = require("body-parser");
const multer = require("multer");
const {Vender,
    Property
} = require("../model/vendor");

const {getVendorlogin,
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
} = require("../cantroler/vendor");
const router = express.Router();
const app = express();
const conn = mongoose.connection;

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/"); // Make sure this folder exists
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + "-" + file.originalname);
    }
});

const upload = multer({ storage: storage });

router.get("/", getVendorlogin);

router.post("/" , postVendorLogin);

router.get("/register" , getVendorregister);

router.post("/register" , postVendorregister);

router.get("/index" , getVendorhome);

router.get("/profile", getVendorprofile );

router.post("/profile", postVendorprofile );

router.get("/listing" , getVendorlisting);

router.post("/listing", upload.array("images", 5), postVendorlisting);

router.get("/display" , getVendordisplay);

app.use("/uploads", express.static(path.join(__dirname, "../uploads"))); 

router.get("/edit/:id" , getVendoredit);

router.post("/edit/:id", upload.single("image") , postVenderedit);

router.post("/delete/:id", postVendordelete);

router.get("/bookings" , getVendorbooking);

router. get("/logout" , getVendorlogout);



module.exports = router;