const express = require("express");
const app = express()
const adminRoute = express.Router();
const admincontroller = require("../../controller/admin/admincontroll");
const authentication = require("../../middleware/auth")
const multer = require("multer");
const Bodyparser = require("body-parser");
adminRoute.use(Bodyparser.json());
adminRoute.use(Bodyparser.urlencoded({ extended: true }));
const path = require("path");


// Set the destination path for multer

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null,path.join(__dirname,"../../public/publicimage") )},
  filename: function (req, file, cb) {
const uniqueFileName = file.fieldname + "-" + Date.now() + path.extname(file.originalname);
    cb(null, uniqueFileName);
  },
});

const imageFileFilter = (req, file, cb) => {
  const allowedExtensions = [".jpg", ".jpeg", ".png", ".gif"]; // Add more image extensions if needed
  const fileExtension = path.extname(file.originalname).toLowerCase();

  if (allowedExtensions.includes(fileExtension)) {
    cb(null, true); 
  } else {
    cb(new Error("Invalid file type. Only images are allowed."), false); 
  }
};
const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    // Multer error (e.g., file too large)
    res.status(400).render("errorpage", { error: "File upload error: " + err.message });
  } else {
    // Custom error (e.g., invalid file type)
    res.status(400).render("errorpage", { error: "Invalid file type. Only images are allowed." });
  }
};





// Initialize multer with the storage configuration
const upload = multer({
  storage: storage,
  fileFilter: imageFileFilter, // Use the image filter
});

app.use(handleUploadError);




     //Admin Routers

//Login
adminRoute.get("/", admincontroller.adminlogin);
adminRoute.get("/dashboard",admincontroller.Dashboard)
adminRoute.post("/adminlogin",admincontroller.adminloginpost);

//Dashboard
adminRoute.get("/admindashboard",authentication.logged, admincontroller.admindashboard);

//Products
adminRoute.get("/adminproducts",authentication.logged, admincontroller.adminproducts);
adminRoute.post("/addproducts", upload.array("images"), authentication.logged, admincontroller.addproducts);
adminRoute.post("/productblock",authentication.logged, admincontroller.productblock);
adminRoute.post("/productunblock",authentication.logged, admincontroller.productunblock);
adminRoute.post("/productedit", admincontroller.productedit);
adminRoute.post("/updateproduct",upload.array("images"),authentication.logged, admincontroller.updateproduct);
adminRoute.get("/alllist",authentication.logged,admincontroller.adminproducts)
adminRoute.get("/uplodeproduct",authentication.logged, admincontroller.uplodeproduct);
adminRoute.get("/editimage",authentication.logged,admincontroller.editimage)
adminRoute.get("/deleteimage",authentication.logged,admincontroller.deleteimage)
adminRoute.post("/updateimage",upload.single("images"),authentication.logged, admincontroller.updateimage);



//users
adminRoute.get("/adminusers",authentication.logged, admincontroller.adminusers);
adminRoute.post("/userblock",authentication.logged, admincontroller.userblock);
adminRoute.post("/userunblock",authentication.logged, admincontroller.userunblock);
adminRoute.get("/userOrders",authentication.logged,admincontroller.userorderslist)

//category
adminRoute.get("/category",authentication.logged,admincontroller.getcategory )
adminRoute.get("/addcatergory",authentication.logged,admincontroller.addcategory)
adminRoute.get("/editcategory",authentication.logged,admincontroller.editcategory)
adminRoute.get("/editcategoryname",authentication.logged,admincontroller.editcategoryname)
adminRoute.post("/updatecategoryname",authentication.logged,admincontroller.updatecategoryname)
adminRoute.get("/deletecategory",authentication.logged, admincontroller.deleteCategory);
adminRoute.post("/process-category",authentication.logged,admincontroller.uploadcategory)
adminRoute.post("/updatecategory",authentication.logged,admincontroller.updatecategory)

//orders
adminRoute.post("/Orderstatus",authentication.logged,admincontroller.EditOrderstatus)
adminRoute.post("/orderdetailshowpage",authentication.logged, admincontroller.orderdetailshowpage)

//banner
adminRoute.get ("/bannerlist",authentication.logged,admincontroller.bannerlist)
adminRoute.get("/newbannerpage",authentication.logged,admincontroller.newbannerpage)
adminRoute.post('/uploadnewbanner', authentication.logged, upload.single('images'), admincontroller.uplodnewbanner);
adminRoute.get("/editbannerpage",authentication.logged,admincontroller.editbannerpage)
adminRoute.get("/deletebanner",authentication.logged,admincontroller.deletebanner)
adminRoute.post("/updatebanner",upload.single("images"),authentication.logged, admincontroller.updatebanner);

//coupon
adminRoute.get("/couponlists",authentication.logged,admincontroller.couponlists)
adminRoute.get("/couponpage",authentication.logged,admincontroller.couponpage)
adminRoute.get("/deletecoupon",authentication.logged,admincontroller.deletecoupon)
adminRoute.post('/postCoupon',authentication.logged,admincontroller.postCoupon)

//sales-Report
adminRoute.get("/salesReportpage",authentication.logged,admincontroller.salesReportpage)
adminRoute.get("/getsalesdata",authentication.logged,admincontroller.getsalesreport)

//profile
adminRoute.get("/profile",authentication.logged,admincontroller.profile)
adminRoute.post("/editprofile",authentication.logged, admincontroller.editprofile)
adminRoute.post("/changepassword",authentication.logged, admincontroller.changepassword)
adminRoute.post("/addnewadmin",authentication.logged,admincontroller.addNewAdmin)

//logout
adminRoute.get("/logout",admincontroller.logout)







module.exports = adminRoute;








 