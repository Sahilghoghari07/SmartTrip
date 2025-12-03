const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const bodyParser = require("body-parser");
const multer = require("multer");
const {getAdminlogin,
    postAdminlogin,
    getAdmindeshboard,
    getAdminuserdata,
    getAdminvendordata,
    getAdminpropertydata,
    postAdminpropertydecline,
    getAdminactiveproperty,
    postAdmindeactivetproperty,
    // postAdminpropertydelete,
    // getAdmineditproperty,
    getAdminplaning,
    postAdminplaning,
    postAdminpropertydataupdate,
    getAdminbookingdata,
    getAdminlogout,
    getAdmindisplayplans,
    getAdmineditplans,
    postAdminplandelete,
    postAdminUpdatePlan,
} = require("../cantroler/admin");
const router = express.Router();
const app = express();
const conn = mongoose.Connection;

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/"); // Make sure this folder exists
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + "-" + file.originalname);
    }
});
const upload = multer({ storage: storage });

router.get("/" , getAdminlogin);

router.post("/" , postAdminlogin);

router.get("/home" , getAdmindeshboard);

router.get("/userdata" , getAdminuserdata);

router.get("/vendordata" , getAdminvendordata);

router.get("/propertydata" , getAdminpropertydata);

router.post("/propertyupdate/:id" , postAdminpropertydataupdate);

router.post("/propertydecline/:id" , postAdminpropertydecline);

router.get("/activeproperty" , getAdminactiveproperty);

router.post("/dactiveproperty/:id" , postAdmindeactivetproperty);

router.get("/editplans/:id", getAdmineditplans );

router.post("/updateplan/", postAdminUpdatePlan );

router.post("/deleteplans/:id", postAdminplandelete );

router.get("/planing" , getAdminplaning);

router.post("/planing", upload.array("images", 10), postAdminplaning);

router.get("/bookings" , getAdminbookingdata);

router.get("/displayplans" , getAdmindisplayplans);

router.get("/logout" , getAdminlogout);

module.exports = router;