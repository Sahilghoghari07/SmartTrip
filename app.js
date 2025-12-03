require("dotenv").config(); 
const express = require("express");
const path = require("path");
const bodyparser = require("body-parser");
const { default: mongoose, Collection } = require("mongoose");
const session = require("express-session");
const multer = require("multer");
const userRouter = require("./routes/user");
const vendorRouter = require("./routes/vendor");
const adminRouter = require("./routes/admin");
const app = express();
const port = 5000 ;


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// app.set(path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
// app.use('/uploads', express.static('uploads'));

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

mongoose.connect("mongodb://127.0.0.1:27017/smarttrip" ).then(()=>{
    console.log("conection sucsessfull.....");
}).catch((err)=>{
    console.log("not connect");
}); 

app.use(
    session({
        secret: "its session key", // Change this to a secure key
        resave: false,
        saveUninitialized: false, // Ensure session object is created only when needed
        cookie: { secure: false }
    })
);

app.use("/user" , userRouter);

app.use("/vendor" , vendorRouter);

app.use("/admin" , adminRouter);

app.listen(port , ()=>
{
    console.log(`server runing is port number : ${port}`);
});