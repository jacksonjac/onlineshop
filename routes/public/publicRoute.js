const express = require("express");
const publicRoute = express.Router();
const controller = require("../../controller/admin/public/usercontroll");
const authentication = require("../../middleware/auth");


//bodyparser
const bodyparser = require("body-parser");
publicRoute.use(bodyparser.json());
publicRoute.use(bodyparser.urlencoded({ extended: true }));





                //public routers


//Login-users
publicRoute.get("/", controller.landingpage);
publicRoute.get("/login", controller.login);
publicRoute.post("/loginpost", controller.loginpost);
publicRoute.get( "/home",authentication.userlogged,controller.userstatus,controller.home);

//signup- users
publicRoute.get("/signinpage", controller.signinpage);
publicRoute.post("/insertdata", controller.insertuserdata);
publicRoute.post("/verify_number", controller.verifynumber);
publicRoute.post("/verify-otp",controller.verify_otp,controller.verifyupadate);

//forgot-password
publicRoute.get("/forgotpassword",controller.forgottpasswordpage);
publicRoute.post("/forgotemailsearch",controller.forgotemailsearch);
publicRoute.post("/forgototpverify",controller.verify_otpforgot);
publicRoute.post("/newpasswordupload",controller.newpasswordupload); 
publicRoute.post("/verify-otp-forgot",controller.verify_otp,controller.verifyupadate);
publicRoute.post("/verifynumberlater",authentication.userlogged,controller.laternumberverify,controller.insertuserdata);
publicRoute.post("/verify-otplater",authentication.userlogged,controller.laterotpverify);

//product
publicRoute.get("/productdetailpage", controller.productdetailspage);
publicRoute.get("/buynow",authentication.userlogged,controller.userstatus,controller.buyproduct);

//cart
publicRoute.get("/addtocart",authentication.userlogged,controller.userstatus,controller.addtocart);
publicRoute.get("/linkaddtocart",authentication.userlogged,controller.userstatus,controller.linkaddtocart);
publicRoute.get("/removecartproduct",authentication.userloggedcontroller.userstatus,controller.removecartproduct);
publicRoute.post("/increment",authentication.userlogged,controller.userstatus,controller.increments);
publicRoute.post("/decrement",authentication.userlogged,controller.userstatus,controller.decrement);

//category
publicRoute.get("/category", controller.getcategory);
publicRoute.post("/categorysearch",authentication.userlogged,controller.categorysearch)

//profile
publicRoute.get("/profilepage",authentication.userlogged,controller.userstatus,controller.profilepage);
publicRoute.get("/editdefaltaddress",authentication.userlogged,controller.userstatus,controller.editdefaltaddress);
publicRoute.get("/editdefaltchekaddress",authentication.userlogged,controller.editdefaltcheckaddress);
publicRoute.get("/Editaddressshow",authentication.userlogged,controller.userstatus,controller.editaddressshow);
publicRoute.post("/uploaddefaltchekaddress",authentication.userlogged,controller.userstatus,controller.Uploaddefultcheckaddress);
publicRoute.post("/uploadaddress",authentication.userlogged,controller.addressupload);
publicRoute.post("/uploadnewaddress",authentication.userlogged,controller.userstatus, controller.uploadnewaddress);
publicRoute.post("/uploadchecknewaddress",authentication.userlogged,ontroller.userstatus,controller.uploadchecknewaddress);
publicRoute.post("/uploaddefaltadd",authentication.userlogged,controller.userstatus,controller.Uploaddefultaddress);
publicRoute.get("/manageaddress",authentication.userlogged,controller.manageaddress);
publicRoute.post("/personalinfoupload",authentication.userlogged,controller.userstatus,controller.personalinfoupdate);
publicRoute.get("/editpersonalinfo",authentication.userlogged, controller.userstatus, controller.editpersonaleinfo);
publicRoute.get("/deleteaddress",authentication.userlogged,controller.userstatus,controller.deletaddress);
publicRoute.get("/newaddresspage",authentication.userlogged,controller.userstatus, controller.newaddressform);
publicRoute.get("/setdefaltaddress",authentication.userlogged,controller.userstatus,controller.setaddressdefalt);
publicRoute.get("/newcheckaddresspage",authentication.userlogged,controller.userstatus,controller.newcheckaddpage)

//whishlist
publicRoute.post("/addwhishlist",authentication.userlogged,controller.userstatus,controller.whishlistdatapost);
publicRoute.get("/whishlistproducts",authentication.userlogged,controller.userstatus,controller.whishlistdata);
publicRoute.get("/removewhishlist",authentication.userlogged, controller.userstatus,controller.deletewhishlistproduct);

//order
publicRoute.post("/orderverify",authentication.userlogged,controller.userstatus,controller.Ordersummery);
publicRoute.get("/Orderlist",authentication.userlogged,controller.userstatus,controller.Orderlist);
publicRoute.get("/deleteorder",authentication.userlogged,controller.userstatus,controller.deleteOrder);
publicRoute.get("/moreinfo",authentication.userlogged, controller.Ordermoreinfo)
publicRoute.get("/returnorder",authentication.userlogged,controller.retrnorder)
publicRoute.get("/removeorder",authentication.userlogged, controller.removeOrder)
publicRoute.get("/downloadinvoice",authentication.userlogged,controller.downloadInvoice)

//payment
publicRoute.post("/checkoutpaymentmethod",authentication.userlogged,controller.userstatus,controller.checkoutpayment);
publicRoute.post("/paymentoptionscheckout",authentication.userlogged,controller.checkoutorderadd);
publicRoute.get("/paymentmethod",authentication.userlogged,controller.userstatus,controller.paymentmethod);
publicRoute.post("/paymentoptions",authentication.userlogged,controller.userstatus,controller.paymentoptions);
publicRoute.get("/checkout",authentication.userlogged, controller.userstatus,controller.checkout);
publicRoute.post("/verifyPayment",authentication.userlogged, controller.userstatus, controller.verifypayment);
publicRoute.get("/checkpaymentmethod",authentication.userlogged,controller.userstatus,controller.checkpaymentmethod);

//coupon
publicRoute.get("/getcoupons",authentication.userlogged,controller.userstatus,controller.getcoupons);
publicRoute.post("/checkcoupon", authentication.userlogged, controller.userstatus, controller.checkcouponcode);

//sortandfilter
publicRoute.get("/pricebysort",authentication.userlogged,controller.sortproduct)
publicRoute.get("/searchproduct",authentication.userlogged,controller.searchproducts);

//wallet
publicRoute.get("/walletinput",authentication.userlogged,controller.getwalletdata)

//sucess
publicRoute.get("/sucess", authentication.userlogged,controller.userstatus,controller.thakyoupage);

//logout
publicRoute.get("/logout", controller.logout);


module.exports = publicRoute;
