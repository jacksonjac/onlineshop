const Users = require("../../../models/public/usersmodel");
const category = require("../../../models/products/category");
const product = require("../../../models/products/product models");
const productorders = require("../../../models/products/Orders");
const banner = require("../../../models/admin/banner/banners")
const Razorpay = require("razorpay")
const coupons = require("../../../models/admin/coupon/couponmodel")
const bycrpt = require("bcrypt");
const path = require('path')
var easyinvoice = require('easyinvoice');
const fs = require('fs')






//Otp working data
const dotenv = require("dotenv").config();
const accountSid = "AC9ddd92d8f3f55f6f21bfa7ad405c845f";
const authToken = "c02b321ea722f82a9353b99f0579d44f";
const verifySid = "VA37b47d3c160352891689221e106e08ce";
const client = require("twilio")(accountSid, authToken);



const razorPayInstance = new Razorpay({
  key_id:"rzp_test_jYuvgdereCJGfM",
  key_secret:"dkOQ8mMw1PsK6imUPURGnOTK"
})

//password bcrypt function

const securedpassword = async (password) => {
  try {
    const passwordhash = await bycrpt.hash(password, 10);
    return passwordhash;
  } catch (error) {
    console.log(error.message);
  }
};
//landig page controlling
const landingpage = async (req, res) => {
  try {
    const bannersData = await banner.find().exec();
    const userid = req.session.user_id;
    const categorylist = await category.find();

   
    const allproducts = await product.find({ status: 1 });

    // Create an array to store the first four banner images
    const firstFourBannerImages = [];

    // Check if there are at least four banners
    if (bannersData.length >= 4) {
      // Push the first four banner images into the array
      for (let i = 0; i < 5; i++) {
        firstFourBannerImages.push(bannersData[i].images);
      }
    }

    console.log(firstFourBannerImages,"dskfslfd")

    res.render("public/landing", {
      allproducts,
      categorylist,
      userid,
      firstFourBannerImages,
    });
  } catch (error) {
    console.log(error.message);
  }
};

//signin button click function
const login = async (req, res) => {
  try {
    // Check if the user is already logged in using session user_id
    if (req.session.user_id) {
      return res.redirect("/home");
    } else {
      const userid = req.session.user_id;
      return res.render("public/loginpage", { userid });
    }
  } catch (error) {
    console.log(error.message);
  }
};
const signinpage = async (req, res) => {
  try {
    // Check if the user is already logged in using session user_id
    if (req.session.user_id) {
      return res.redirect("/home");
    } else {
      const userid = req.session.user_id;
      return res.render("public/signinpage", { userid });
    }
  } catch (error) {
    console.log(error.message);
  }
};

//login verification function
const loginpost = async (req, res) => {
  try {
    console.log("this is loggin page");
    const email = req.body.email;
    const password = req.body.password;

    const user = await Users.findOne({ email });

    console.log(user,"this is user data")
    const status = user.status;


 console.log(status,"thsi si s")
    if (status === 0) {
      const userid = false;
      return res.render("/loginpage", { userid });
    }

    if (!user) {
      const userid = false;

      return res.render("/loginpage", { userid });
    }

    const passwordMatch = await bycrpt.compare(password, user.password);

    if (passwordMatch) {
      console.log("password match");
      // Set the session user_id to the logged-in user's ID
      req.session.user_id = user._id;
      req.session.user_data = {
        name: user.name,
        email: user.email,
      };

      const username = req.session.user_data.name;

      // Find the category named "smartphones"

      
      const userdata = await Users.findOne({ name: username });

      if (!userdata) {
        return res.send("user not found");
      }

      
       return res.redirect("/home")
    } else {
      const userid = false;
      return res.render("public/loginpage", {
        userid,
        message: "username is incorrect",
      });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).render("public/error", {
      error: "Error logging in Go back and try again",
    });
  }
};

//name checking
const namecheck = async (req, res, next) => {
  const username = req.body.name;

  if (username == null) {
  }

  const userfound = await Users.findOne({ name: username });

  if (userfound) {
    const error = "Username Alredy found";

    return res.render("public/index", { message: "username Alredyfound" });
  } else {
    next();
  }
};

const verifynumber = async (req, res, next) => {
  try {
    const name = req.body.name;
    const number = req.body.number;
    client.verify
      .services(verifySid)
      .verifications.create({ to: "+91" + number, channel: "sms" })
      .then((verification) => {
        console.log(verification.status);
        const userid = false
        res.render("public/verify_otp", { number, name ,userid});
      })
      .catch((error) => {
        console.log(error);
        res.status(500).render("public/error", {
          error: "Error in  verify  Go back and try again",
        });
      });
  } catch (error) {
    console.log(error.message);
  }
};

const insertuserdata = async (req, res) => {
  try {
    const newname = req.body.name;
    const newemail = req.body.email;
    const newnumber = req.body.number;
    const newpassword = req.body.password;

    const spassword = await securedpassword(newpassword);

    const userData = new Users({
      name: newname,
      email: newemail,
      number: newnumber,
      password: spassword,
      verified: 0,
    });

    const udata = await userData.save();

    const userid = false

    res.render("public/verify_number", { newname, newnumber ,userid});
  } catch (error) {
    console.log(error.message);
    res.status(500).render("public/error", {
      error: "Error in saving Data Go back and try again",
    });
  }
};

const verify_otp = async (req, res, next) => {
  try {
    const mobile = req.body.number;

    const otpCode = req.body.otp;

    const verificationCheck = await client.verify
      .services(verifySid)
      .verificationChecks.create({ to: "+91" + mobile, code: otpCode });

    console.log(verificationCheck.status);
    console.log("OTP verification successful");

    next();
  } catch (error) {
    console.error(error);
    res.status(500).render("public/error", {
      error: "Error in verify OTP Go back and try again",
    });
  }
};

const verifyupadate = async (req, res) => {
  try {
    console.log("this is verify update fun");

    const username = req.body.name;

    console.log(username);
    const updatedUser = await Users.findOneAndUpdate(
      { name: username },
      { verified: 1 },
      { new: true }
    );

    if (!updatedUser) {
      console.log("User not found");
      return res.status(500).render("public/error", {
        error: "User Not found Go back and try again",
      });
    }
    res.redirect("/login");
  } catch (error) {
    console.log(error.message);
  }
};

//

const home = async (req, res) => {
  try {

    console.log("thsi is ")
    if (req.session.user_id) {
      const username = req.session.user_data.name;
      const userdata = await Users.findOne({ name: username });

      if (!userdata) {
        return res.status(500).render("public/error", {
          error: "User Login Error Go back and try again",
        });
      }

      const page = req.query.page || 1; // Get the requested page or default to page 1
      const limit = 9; // Number of products per page

      const userCartItemcount = userdata.cartitem.length;
      const userOrderItemcount = userdata.Orders.length;
      const userwhishlistItemcount = userdata.whishlist.length;
      const userid = req.session.user_id;

      // Calculate the skip value based on the current page and limit
      const skip = (page - 1) * limit;

      // Query the database to get products for the current page
      const allproducts = await product.find({ status: 1 }).limit(limit).skip(skip);

      // Calculate the total number of pages
      const totalProductsCount = await product.countDocuments();
      const totalpage = Math.ceil(totalProductsCount / limit);

      const verifiednumber = userdata.verified;
      const phonenumber = userdata.number;
      const categorylist = await category.find();

      res.render("public/productshome", {
        allproducts,
        username,
        verifiednumber,
        phonenumber,
        categorylist,
        userCartItemcount,
        userOrderItemcount,
        userwhishlistItemcount,
        userid,
        currentPage: page, // Pass the current page to the template
        totalpage, // Pass the total number of pages to the template
      });
    } else {
      res.redirect("/login");
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).render("public/error", {
      error: "Internal server error",
    });
  }
};

const getcategory = async (req, res) => {
  try {
    const categoryName = req.query.name;

    // Find the category by name
    const foundCategory = await category.findOne({ name: categoryName });

    if (!foundCategory) {
      return res.status(404).json({ error: "Category not found." });
    }

    // Find all products belonging to the found category using populate
    const allproducts = await product
      .find({ category: foundCategory._id })
      .populate("category");

    // Send the JSON response
    res.status(200).json({ products: allproducts });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: "Something went wrong." });
  }
};

const logout = async (req, res) => {
  req.session.destroy(); // Destroy the session
  res.redirect("/");
};

const productdetailspage = async (req, res) => {
  try {
    const modelname = req.query.model; // Access the model name sent from the form

    // Find the product with the given model name
    const theproduct = await product
      .findOne({ model: modelname })
      .populate("category");

    if (!theproduct) {
      return res.status(500).render("public/error", {
        error: " Something Errror Go back and try again",
      });
    }

    const theproductcategoryid = theproduct.category._id;

    console.log(theproductcategoryid);

    // Find the category of the product
    const productcategory = await category.findById(theproductcategoryid);

    // Find related products for the same category
    const Relatedproduct = await product.find({
      category: productcategory._id,
      _id: { $ne: theproduct._id },
    });

    const userid = req.session.user_id;
    res.render("public/productdetails", {
      theproduct,
      Relatedproduct,
      userid,
    });
  } catch (error) {
    console.log(error.message);
    res
      .status(500)
      .render("public/error", { error: " Server Error Try Again later" });
  }
};

const addtocart = async (req, res) => {
  try {
    const userid = req.session.user_id; // Get the user ID from the session
    const productId = req.query.productid;

    console.log(productId);
    const theproduct = await product.findOne({ _id: productId });

    if (!theproduct) {
      return res
        .status(500)
        .render("public/error", { error: " Server Error Try Again later" });
    }

    // Find the user by their ID
    const user = await Users.findById(userid);

    if (!user) {
      // Handle the case when the user is not found
      return res
        .status(500)
        .render("public/error", { error: " Server Error Try Again later" });
    }

    // Check if the product is already in the cart
    const cartItem = user.cartitem.find(
      (item) => item.model === theproduct.model
    );

    if (cartItem) {
      cartItem.quantity += 1;
    } else {
      // If the product is not in the cart, add it as a new cart item
      user.cartitem.push({
        model: theproduct.model,
        category: theproduct.category,
        price: theproduct.price,
        colour: theproduct.colour,
        description: theproduct.description,
        image: theproduct.images[0],
        quantity: 1,
      });
    }
    await user.save();

    // Calculate total quantity of products in the cart
    const totalCartQuantity = user.cartitem.reduce(
      (total, item) => total + item.quantity,
      0
    );

    // Calculate grand total of cart items
    const grandTotal = user.cartitem.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );

    const username = req.session.user_data.name;
    const cartitems = user.cartitem; // Get the updated cartitems data for the user

    // Pass the cartitems data, totalCartQuantity, and grandTotal to the EJS view
    res.render("public/addtocart", {
      cartproducts: cartitems.reverse(),
      username,
      totalCartQuantity,
      grandTotal,
      userid,
    });
  } catch (error) {
    console.log(error.message);
    res
      .status(500)
      .render("public/error", { error: " Server Error   Try Again later" });
  }
};

const removecartproduct = async (req, res) => {
  try {
    const productmodelname = req.query.model;
    const grandTotal = req.query.grandTotal;

    // Assuming you have an authenticated user and you can access the user's ID
    const userid = req.session.user_id; // Replace this with your actual method of getting the user ID

    // Find the user by ID and update the cartitem array to remove the product with the specified model name
    await Users.findByIdAndUpdate(
      userid,
      { $pull: { cartitem: { model: productmodelname } } },
      { new: true }
    );

    const updatedUser = await Users.findById(userid);
    const cartitems = updatedUser.cartitem;
    const username = req.session.user_data.name;

    res.redirect("/linkaddtocart");
  } catch (error) {
    console.log(error.message);
    res
      .status(500)
      .render("public/error", { error: " Server Error Try Again later" });
  }
};
const forgottpasswordpage = async (req, res) => {
  try {
    const userid = req.session.user_id;

    res.render("public/forgotpasspage", { userid });
  } catch (error) {
    console.log(error.message);
  }
};
const forgotemailsearch = async (req, res) => {
  try {
    const usernamecheck = await Users.findOne({ email: req.body.email });

    if (usernamecheck) {
      const number = usernamecheck.number; // Move this line inside the if block

      client.verify
        .services(verifySid)
        .verifications.create({ to: "+91" + number, channel: "sms" })
        .then((verification) => {
          console.log(verification.status);
          const userid = req.session.user_id;
          const number = usernamecheck.number.toString();
          const name = usernamecheck.name;
          res.render("public/forgototpverify", { number, name, userid });
        })
        .catch((error) => {
          console.log(error);
          res
            .status(500)
            .render("public/error", { error: " Server Error Try Again later" });
        });
    } else {
      res.send("User not found"); // Handle the case where usernamecheck is null
    }
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .render("public/error", { error: " Server Error Try Again later" });
  }
};

const verify_otpforgot = async (req, res) => {
  const mobile = req.body.number;
  const otpCode = req.body.otp;
  const username = req.body.name;

  client.verify
    .services(verifySid)
    .verificationChecks.create({ to: "+91" + mobile, code: otpCode })
    .then((verificationCheck) => {
      console.log(verificationCheck.status);
      const userid = req.session.user_id;
      res.render("public/createnewpassword", { userid, username });
    })
    .catch((error) => {
      console.log(error);
      res
        .status(500)
        .render("public/error", { error: " Server Error Try Again later" });
    });
};
const newpasswordupload = async (req, res) => {
  try {
    const name = req.body.name;
    const newpassword = req.body.newpassword;
    const cfmpassword = req.body.cfmpassword; // Corrected the property name

    if (newpassword === cfmpassword) {
      // Passwords match
      const hashedPassword = await securedpassword(cfmpassword);

      // Find the user by the number
      const userdata = await Users.findOne({ name: name });

      if (userdata) {
        userdata.password = hashedPassword;
        await userdata.save();

        // Redirect or respond with a success message
        res.redirect("login");
      } else {
        res
          .status(500)
          .render("public/error", { error: " Server Error Try Again later" });
      }
    } else {
      res
        .status(500)
        .render("public/error", { error: " password Not matched" });
    }
  } catch (error) {
    console.log(error.message);
    res
      .status(500)
      .render("public/error", { error: " Server Error Try Again later" });
  }
};
const linkaddtocart = async (req, res) => {
  const userid = req.session.user_id;

  try {
    const user = await Users.findById(userid);

    if (!user) {
      // Handle the case where the user is not found
      return res
        .status(500)
        .render("public/error", { error: " Server Error Try Again later" });
    }

    const grandTotal = user.cartitem.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
    const cartItems = user.cartitem; // Assuming you have a typo in your schema field name (it should be "cartitem" instead of "cartItem")
    const username = req.session.user_data.name;
    console.log(cartItems);
    res.render("public/addtocart", {
      cartproducts: cartItems.reverse(),
      username,
      grandTotal,
      userid,
    });
  } catch (error) {
    // Handle any errors that occur during the database query or rendering
    console.error(error);
    res.status(500).render("public/error", {
      error: "  Internal Server Error Try Again later",
    });
  }
};
const profilepage = async (req, res) => {
  try {
    const userid = req.session.user_id;

    // Attempt to find the user in the database
    const userdata = await Users.findById(userid);

    if (!userdata) {
      // If user data is not found, handle it gracefully
      return res.status(404).render("public/error", {
        error: "User not found. Please sign in or register.",
      });
    }

    // Check if the user has a default address before accessing it
    const userdefaultaddress = userdata.defaultaddress[0]; // Assuming there's only one default address

    const username = req.session.user_data.name;

    // Check if a default address is available before rendering
    if (!userdefaultaddress) {
      return res.render("public/profile", {
        userdata,
        username,
        userid,
        // You can add a message here if no default address is available
        noDefaultAddressMessage: "No default address available for this user.",
      });
    }

    // If everything is fine, render the profile page
    console.log("Default Address:", userdefaultaddress.address);

    res.render("public/profile", {
      userdata,
      userdefaultaddress,
      username,
      userid,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).render("public/error", {
      error: "Internal Server Error. Try Again later",
    });
  }
};
const editdefaltaddress = async (req, res) => {
  try {
    const userid = req.session.user_id;
    const prouductid = req.query.productId;

    console.log(prouductid, "the product id");

    const userdata = await Users.findById(userid);
    if (!userdata) {
      // Handle the case where the user is not found
      return res.status(500).render("public/error", {
        error: "Internal Server Error. Try Again later",
      });
    }

    const defaltadd = userdata.defaultaddress[0];
    console.log(defaltadd);

    // Pass the default address data to the edit address view
    res.render("public/editaddress", { userid, defaltadd, prouductid });
  } catch (error) {
    console.log(error.message);
  }
};

const Uploaddefultaddress = async (req, res) => {
  try {
    const newname = req.body.name;
    const newaddress = req.body.address;
    const newemail = req.body.email;
    const newcity = req.body.city;
    const newpostalcode = req.body.postalCode;
    const newnumber = req.body.phoneNumber;

    const theproductid = req.body.productid;

    const userid = req.session.user_id;

    const theproduct = await product.findById(theproductid);

    // Find the user by their ID
    const user = await Users.findById(userid);

    if (!user) {
      return res.status(500).render("public/error", {
        error: " Internal Server Error Try Again later",
      });
    }

    // Remove the current default address
    user.defaultaddress = [];

    // Add the new default address
    user.defaultaddress.push({
      name: newname,
      email: newemail,
      address: newaddress,
      city: newcity,
      postalCode: newpostalcode,
      phonenumber: newnumber,
    });

    // Save the updated user object
    await user.save();

    console.log("Default address updated or added successfully");

    const defaultAddress = user.defaultaddress[0];
    const allUserAddresses = user.address;
    const username = req.session.user_data.name;
    const userAddresses = user.address;

    res.render("public/priceanddetails", {
      username,
      userAddresses: userAddresses,
      defaultAddress,
      allUserAddresses,
      userid,
      theproduct,
    });
  } catch (error) {
    console.error("Error updating or adding default address:", error);
    res.status(500).render("public/error", {
      error: " Internal Server Error Try Again later",
    });
  }
};

const Uploaddefultcheckaddress = async (req, res) => {
  try {
    const newname = req.body.name;
    const newaddress = req.body.address;
    const newemail = req.body.email;
    const newcity = req.body.city;
    const newpostalcode = req.body.postalCode;
    const newnumber = req.body.phoneNumber;

    const userid = req.session.user_id;

    // Find the user by their ID
    const user = await Users.findById(userid);

    if (!user) {
      return res.status(500).render("public/error", {
        error: "Internal Server Error Try Again later",
      });
    }

    // Clear the current default address
    user.defaultaddress = [];

    // Add the new default address
    user.defaultaddress.push({
      name: newname,
      email: newemail,
      address: newaddress,
      city: newcity,
      postalCode: newpostalcode,
      phonenumber: newnumber,
    });

    // Save the updated user object
    await user.save();

    const allCartProducts = user.cartitem;

    // Calculate the grand total
    let grandTotal = 0;
    for (const cartItem of allCartProducts) {
      grandTotal += cartItem.price * cartItem.quantity;
    }

    console.log("Default address updated or added successfully");

    const defaultAddress = user.defaultaddress[0];
    const allUserAddresses = user.address;
    const username = req.session.user_data.name;
    const userAddresses = user.address;

    res.render("public/checkoutpage", {
      username,
      userAddresses: userAddresses,
      defaultAddress,
      allUserAddresses,
      userid,
      allCartProducts,
      grandTotal,
    });
  } catch (error) {
    console.error("Error updating or adding default address:", error);
    res.status(500).render("public/error", {
      error: "Internal Server Error Try Again later",
    });
  }
};

const manageaddress = async (req, res) => {
  try {
    const userid = req.session.user_id;

    const user = await Users.findById(userid);

    if (!user) {
      return res.status(500).render("public/error", {
        error: " Internal Server Error Try Again later",
      });
    }

    const userAddresses = user.address; // Get the array of user addresses
    const username = req.session.user_data.name;

    res.render("public/manageaddress", {
      userAddresses: userAddresses,
      username,
      userdata: user,
      userid,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).render("public/error", {
      error: " Internal Server Error Try Again later",
    });
  }
};

const editaddressshow = async (req, res) => {
  try {
    const addressId = req.query.id; // Assuming address ID is available in the request body
    console.log(addressId);
    // Find the user by their ID and retrieve the address information
    const user = await Users.findById(req.session.user_id);

    const addressToEdit = user.address.find(
      (address) => address._id.toString() === addressId
    );

    if (!addressToEdit) {
      // Handle the case where the address is not found
      return res.status(500).render("public/error", {
        error: " Internal Server Error Try Again later",
      });
    }

    const userid = req.session.user_id;

    res.render("public/editaddressshow", { addressToEdit, userid });
  } catch (error) {
    console.log(error.message);
    res.status(500).render("public/error", {
      error: " Internal Server Error Try Again later",
    });
  }
};

const editpersonaleinfo = async (req, res) => {
  try {
    const userid = req.session.user_id;

    const userdata = await Users.findById(userid); // Remove the curly braces around userId

    if (!userdata) {
      // Handle the case where the user is not found
      return res.status(500).render("public/error", {
        error: " Internal Server Error Try Again later",
      });
    }

    res.render("public/editpersonalinfo", { userdata, userid });
  } catch (error) {
    console.log(error.message);
  }
};

const personalinfoupdate = async (req, res) => {
  try {
    const newUsername = req.body.newUsername; // Use req.body to access form data
    const newUserEmail = req.body.newUserEmail;
    const userId = req.session.user_id;

    // Find the user by their ID and update the name and email fields
    const updatedUser = await Users.findByIdAndUpdate(
      userId,
      { $set: { name: newUsername, email: newUserEmail } },
      { new: true } // Return the updated document
    );

    console.log("Updated User:", updatedUser); // Log the updated user document

    // Save the updated user data
    await updatedUser.save();

    // Redirect to the profile page after the update is complete and user data is saved
    res.redirect("/profilepage");
  } catch (error) {
    console.log(error.message);
    res.status(500).render("public/error", {
      error: "Internal Server Error Try Again later",
    });
  }
};

const deletaddress = async (req, res) => {
  try {
    const userId = req.session.user_id; // You need to get the actual user ID, perhaps from req.user or wherever you store it
    const addressIdToDelete = req.query.id; // Get the address ID to delete from the query parameter

    console.log(addressIdToDelete, "slfsdfkjds");
    const user = await Users.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Find the index of the address to delete in the user's address array
    const addressIndex = user.address.findIndex(
      (address) => address._id.toString() === addressIdToDelete
    );

    if (addressIndex === -1) {
      return res.status(404).json({ message: "Address not found" });
    }

    // Remove the address at the specified index
    user.address.splice(addressIndex, 1);

    await user.save();

    console.log("Address deleted successfully");
    res.redirect("/manageaddress"); // Redirect to manageaddress page after successful delete
  } catch (error) {
    console.error("Error deleting address:", error);
    res.status(500).render("public/error", {
      error: " Internal Server Error Try Again later",
    });
  }
};

const uploadnewaddress = async (req, res) => {
  try {
    const { name, email, address, city, postalCode, phoneNumber } = req.body;

    // Find the user by their ID
    const userid = req.session.user_id;
    const user = await Users.findById(userid);

    if (!user) {
      return res.status(500).send("User not found");
    }

    // Create a new address object
    const newAddress = {
      name,
      email,
      address,
      city,
      postalCode,
      phonenumber: phoneNumber,
    };

    // Add the new address to the user's address array
    user.address.push(newAddress);

    await user.save();

    // Redirect back to the manage address page or wherever you want
    res.redirect("/manageaddress");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error uploading new address");
  }
};

const uploadchecknewaddress = async (req, res) => {
  try {

    const grandTotal = req.body.totalamount

     console.log(grandTotal,"this is the grand total")
    const { name, email, address, city, postalCode, phoneNumber } = req.body;

    // Find the user by their ID
    const userid = req.session.user_id;
    const user = await Users.findById(userid);

    if (!user) {
      return res.status(500).send("User not found");
    }

    // Create a new address object
    const newAddress = {
      name,
      email,
      address,
      city,
      postalCode,
      phonenumber: phoneNumber,
    };

    // Add the new address to the user's address array
    user.address.push(newAddress);

    await user.save();

   

   

    const allCartProducts = user.cartitem;
    const totalitems = allCartProducts.length;
    const allUserAddresses = user.address;
    const defaultAddress = user.defaultaddress[0];
    for (const cartItem of allCartProducts) {
    }
    const username = req.session.user_data.name;
    const number = user.number;

    // Redirect back to the manage address page or wherever you want
    res.render("public/checkoutpage", {
      allCartProducts,
      defaultAddress,
      username,
      totalitems,
      grandTotal,
      number,
      userid,
      allUserAddresses,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error uploading new address");
  }
};

const addressupload = async (req, res) => {
  try {
    const { addressid, name, email, address, city, postalCode, phoneNumber } =
      req.body;

    // Find the user by their ID and the specific address by its ID
    const userid = req.session.user_id;

    const user = await Users.findById(userid);

    if (!user) {
      return res.status(500).send("User not found");
    }

    const addressToUpdate = user.address.id(addressid);

    if (!addressToUpdate) {
      return res.status(404).send("Address not found");
    }

    // Update the address fields
    addressToUpdate.name = name;
    addressToUpdate.email = email;
    addressToUpdate.address = address;
    addressToUpdate.city = city;
    addressToUpdate.postalCode = postalCode;
    addressToUpdate.phonenumber = phoneNumber;

    await user.save();

    res.redirect("/manageaddress");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error updating address");
  }
};

const newaddressform = async (req, res) => {
  try {
    const userid = req.session.user_id;

    res.render("public/newaddresspage", { userid });
  } catch (error) {
    console.log(error.message);
  }
};

const setaddressdefalt = async (req, res) => {
  try {
    const userId = req.session.user_id;
    const addressId = req.query.addressId;
    const productId = req.query.productId;

    const user = await Users.findById(userId);

    if (!user) {
      return res.status(500).render("public/error", {
        error: "Internal Server Error. Try Again later.",
      });
    }

    const addressToSetAsDefault = user.address.find(
      (address) => address._id.toString() === addressId
    );

    if (!addressToSetAsDefault) {
      return res.status(500).render("public/error", {
        error: "Address not found or unable to set as default.",
      });
    }

    // Set the address fields to the new default address object
    const newDefaultAddress = {
      name: addressToSetAsDefault.name,
      email: addressToSetAsDefault.email,
      address: addressToSetAsDefault.address,
      city: addressToSetAsDefault.city,
      postalCode: addressToSetAsDefault.postalCode,
      phonenumber: addressToSetAsDefault.phonenumber,
    };

    // Update the user's default address
    user.defaultaddress = [newDefaultAddress];

    // Save the updated user object
    await user.save();

    console.log("Default address set successfully");
    res.json({ newDefaultAddress }); // Respond with the updated default address
  } catch (error) {
    console.error("Error setting default address:", error);
    res.status(500).render("public/error", {
      error: "Internal Server Error. Try Again later.",
    });
  }
};

const whishlistdatapost = async (req, res) => {
  try {
    const userId = req.session.user_id; // Get the user's ID
    const product_id = req.body.productId; // Get the product_id from the request body

    // Find the user by their ID
    const user = await Users.findById(userId);

    if (!user) {
      return res
        .status(500)
        .json({ message: "Internal Server Error Try Again later" });
    }

    // Find the product by its ID using the Product model
    const productToAdd = await product.findById(product_id);

    if (!productToAdd) {
      return res
        .status(500)
        .json({ message: "Internal Server Error Try Again later" });
    }

    // Create a new wishlist product object using the retrieved product data
    const newWishlistProduct = {
      model: productToAdd.model,
      category: productToAdd.category,
      price: productToAdd.price,
      colour: productToAdd.colour,
      description: productToAdd.description,
      image: productToAdd.image,
      quantity: 1, // You can set the quantity as needed
    };

    // Add the new wishlist product to the user's whishlist array
    user.whishlist.push(newWishlistProduct);

    await user.save();
    console.log("Product added to wishlist successfully");

    // Return a success message
    res.json({ message: " added to wishlist successfully" });
  } catch (error) {
    console.error("Error adding product to wishlist:", error);
    res
      .status(500)
      .json({ message: "An error occurred while adding product to wishlist" });
  }
};
const whishlistdata = async (req, res) => {
  try {
    const userid = req.session.user_id; // Get the user's ID from the session

    // Find the user by their ID
    const user = await Users.findById(userid);

    if (!user) {
      return res.status(500).render("public/error", {
        error: " Internal Server Error Try Again later",
      });
    }

    const userWhishlist = user.whishlist; // Get the whishlist array from the user's data
    const username = req.session.user_data.name;
    res.render("public/whishlistpage", {
      cartproducts: userWhishlist.reverse(),
      username,
      userid,
    }); // Pass userWhishlist to the rendering view
  } catch (error) {
    console.error("Error retrieving user whishlist:", error);
    res.status(500).render("public/error", {
      error: " Internal Server Error Try Again later",
    });
  }
};

const deletewhishlistproduct = async (req, res) => {
  try {
    const userId = req.session.user_id; // Get the user ID from the session
    const productModel = req.query.model; // Get the product model name from the query parameter
    console.log(productModel, "lkfjsdlfklk");
    // Find the user by their ID
    const user = await Users.findById(userId);

    if (!user) {
      return res.status(500).render("public/error", {
        error: " Internal Server Error Try Again later",
      });
    }

    // Find the index of the product with the specified model in the wishlist
    const productIndex = user.whishlist.findIndex(
      (product) => product.model === productModel
    );

    if (productIndex !== -1) {
      // Remove the product from the wishlist array
      user.whishlist.splice(productIndex, 1);

      await user.save();

      console.log("Wishlist product removed successfully");
    } else {
      console.log("Product not found in wishlist");
    }

    // Redirect the user to the wishlist products page
    res.redirect("/whishlistproducts");
  } catch (error) {
    console.error("Error removing wishlist product:", error);
    res.status(500).render("public/error", {
      error: " Internal Server Error Try Again later",
    });
  }
};
const buyproduct = async (req, res) => {
  try {
    const product_id = req.query.productid; // Get the product ID from the form
    const theproduct = await product.findById(product_id); // Replace 'Product' with the actual model name

    if (!theproduct) {
      return res.status(500).render("public/error", {
        error: " Internal Server Error Try Again later",
      });
    }

    const userid = req.session.user_id;
    const user = await Users.findById(userid);

    if (!user) {
      return res.status(500).render("public/error", {
        error: " Internal Server Error Try Again later",
      });
    }
    const allUserAddresses = user.address;
    const defaultAddress = user.defaultaddress[0]; // Assuming there's only one default address
    const username = req.session.user_data.name;
    const userdata = user;

    res.render("public/priceanddetails", {
      theproduct,
      defaultAddress,
      username,
      userdata,
      allUserAddresses,
      userid,
    }); // Render the buyNowPage with product data and default address
  } catch (error) {
    console.log(error.message);
    res.status(500).render("public/error", {
      error: " Internal Server Error Try Again later",
    });
  }
};
const Ordersummery = async (req, res) => {
  try {
    const productid = req.body.productid;

    const theproduct = await product.findById(productid);

    // Assuming you have user data with userId associated with the product
    const userId = req.session.user_id;
    const user = await Users.findById(userId);

    const defaultAddress = user.defaultaddress[0]; // Assuming there's only one default address
    const username = req.session.user_data.name;
    const userdata = user;

    // Render the ordersummery page with product and user data
    res.render("public/Ordersummery", {
      theproduct,
      defaultAddress,
      username,
      userdata,
    });
  } catch (error) {
    console.log(error.message);
    // Handle the error and potentially redirect to an error page
    res.status(500).render("public/error", {
      error: " Internal Server Error Try Again later",
    });
  }
};

const paymentmethod = async (req, res) => {
  try {
    const productid = req.query.productid;

    console.log(productid, "kwetrjlkdfjsljsdf");

    const productdata = await product.findById(productid);

    console.log(productdata, "sldkfjsdlfkjsdlf");

    const userid = req.session.user_id;

    res.render("public/paymentmethod", {
      userid,
      productdata,
      // theproduct,
      // defaultAddress,
      // username,
      // userdata,
    });
  } catch (error) {
    console.log(error.message);
    // Handle the error and potentially redirect to an error page
    res.status(500).render("public/error", {
      error: " Internal Server Error Try Again later",
    });
  }
};

const paymentoptions = async (req, res) => {
  try {
    const paymenttype = req.body.paymentmethod;

    if (paymenttype === "cod") {
      const productid = req.body.productid;

      console.log("sfkjsdflkds");

      // Find the user by their session or authentication information
      const userid = req.session.user_id;
      const user = await Users.findById(userid);

      if (!user) {
        return res.status(500).render("public/error", {
          error: "Internal Server Error Try Again later",
        });
      }

      // Find the product by its ID
      const theproductdata = await product.findById(productid);

      if (!theproductdata) {
        return res.status(500).render("public/error", {
          error: "Internal Server Error Try Again later",
        });
      }

      // Retrieve the default address of the user
      const defaultAddress = user.defaultaddress[0]; // Assuming you only have one default address
       console.log(defaultAddress,"theislfkjsdkf")
      // Create an object with the required order details
      const orderItem = {
        userid: userid,
        productId: theproductdata._id,
        model: theproductdata.model,
        category: theproductdata.category,
        price: theproductdata.price,
        colour: theproductdata.colour,
        description: theproductdata.description,
        image: theproductdata.images[0],
        quantity: 1,
        orderstatus: "PENDING",
        paymentmethod: paymenttype,
        orderaddress: defaultAddress.address,
        phonenumber:defaultAddress.phonenumber,
        addressname:defaultAddress.name,
        
      };

      // Create a new product order using the productorders model
      const newProductOrder = new productorders(orderItem);
      await newProductOrder.save();

      // Add the order item to the user's Orders array
      user.Orders.push(newProductOrder);
      await user.save();

      // Update the product status to 0 (unlist)
      theproductdata.status = 0;
      await theproductdata.save(); // Save the updated product

      const theproduct = theproductdata;
      const username = req.session.user_data.name;
      theproduct.status = 0;
      res.render("public/Sucess", { theproduct, username, userid });
    } else {
      res
        .status(500)
        .render("public/error", { error: "The website Under Mata" });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).render("public/error", {
      error: "Internal Server Error Try Again later",
    });
  }
};

const Orderlist = async (req, res) => {
  try {
    // Find the user by their session or authentication information
    const userid = req.session.user_id; // Adjust this based on how you track the user
    const user = await Users.findById(userid);

    if (!user) {
      return res.status(500).render("public/error", {
        error: " Internal Server Error Try Again later",
      });
    }

    // Assuming your user's Orders array contains order objects with product information
    const orderList = user.Orders;

    if (!orderList || !Array.isArray(orderList)) {
      return res.status(500).render("public/error", {
        error: " Internal Server Error Try Again later",
      });
    }

    const username = req.session.user_data.name;

    // Render the order list page and pass the order list data
    res.render("public/orderlistpage", {
      cartproducts: orderList.reverse(),
      username,
      userid,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).render("public/error", {
      error: " Internal Server Error Try Again later",
    });
  }
};

const deleteOrder = async (req, res) => {
  try {
    const userId = req.session.user_id; // Get the user's ID from the session
    const user = await Users.findById(userId);

    if (!user) {
      return res.status(500).render("public/error", {
        error: "Internal Server Error. User not found.",
      });
    }

    const orderIdToCancel = req.query.id; // Assuming you're passing the order ID as a query parameter
    const globalid = req.query.globalid;
   console.log(globalid,"its is a global id")
    // Find the order to cancel based on the order ID using the find method
    const orderToCancel = user.Orders.find((order) => order._id.toString() === orderIdToCancel);

    if (!orderToCancel) {
      return res.status(500).render("public/error", {
        error: "Order not found or invalid order ID.",
      });
    }

    // Retrieve the price of the order
    const orderPrice = orderToCancel.price;

    // Update the user's wallet balance by adding the order price
    user.wallet += orderPrice;

    // Update the order status to "CANCEL"
    orderToCancel.orderstatus = "CANCEL";

    // Save the user document to persist the changes
    await user.save();

    // Retrieve the global order based on globalid
    const globalorderdata = await productorders.findById(globalid);
       console.log(globalorderdata,"its is the global data")
    if (globalorderdata) {
      // Update the order status of the global order to "CANCEL"
      globalorderdata.orderstatus = "CANCEL";
      await globalorderdata.save();
    }

    // Console log the order status and price
    console.log(`Canceled order with status: ${orderToCancel.orderstatus}`);
    console.log(`Order price: ${orderPrice}`);
    console.log(`Updated wallet balance: ${user.wallet}`);

    // Redirect to the updated order list page
    res.redirect("/Orderlist");
  } catch (error) {
    console.error(error.message);
    res.status(500).render("public/error", {
      error: "Internal Server Error. Try Again later.",
    });
  }
};

const laternumberverify = async (req, res) => {
  try {
    const number = req.body.number;
    console.log(number);

    client.verify
      .services(verifySid)
      .verifications.create({ to: "+91" + number, channel: "sms" })
      .then((verification) => {
        console.log(verification.status);
        const userdata = req.session.userData;
        console.log(userdata);
        // insertuserdata(userdata, req, res,false);
        res.render("public/verifyotplater", { number });
      })
      .catch((error) => {
        console.log(error);
        res.status(500).render("public/error", {
          error: " Internal Server Error Try Again later",
        });
      });
  } catch (error) {
    console.log(error.message);
  }
};

const userstatus = async (req, res, next) => {
  try {
    const userid = req.session.user_id;

    const User = await Users.findById(userid);

    const status = User.status;
    console.log(status, "this is status");

    if (status === 0) {
      console.log("if conditions");

      return res.status(500).render("public/error", {
        error: " Internal Server Error Try Again later",
      });
    } else {
      next();
    }
  } catch (error) {
    console.log(error.message);
  }
};
const laterotpverify = async (req, res) => {
  try {
    const mobile = req.body.number;
    const userData = req.session.userData;
    const otpCode = req.body.otp;

    client.verify
      .services(verifySid)
      .verificationChecks.create({ to: "+91" + mobile, code: otpCode })
      .then(async (verificationCheck) => {
        console.log(verificationCheck.status);

        if (verificationCheck.status === "approved") {
          console.log(
            "OTP verified successfully. Updating user's verified field to 1."
          );
          const username = req.session.user_data.name;

          // Find the user by name and update their verified field to 1
          await Users.updateOne({ name: username }, { $set: { verified: 1 } });
        } else {
          console.log("OTP verification failed.");
        }

        res.redirect("/home");
      })
      .catch((error) => {
        console.log(error);
        res.status(500).render("public/error", {
          error: " Internal Server Error Try Again later",
        });
      });
  } catch (error) {
    console.log(error.message);
  }
};
const increments = async (req, res) => {
  try {
    const username = req.session.user_data.name;
    const userdata = await Users.findOne({ name: username });

    if (!userdata) {
      return res.status(500).render("public/error", {
        error: " Internal Server Error Try Again later",
      });
    }

    const productModel = req.body.productModel;

    const cartItem = userdata.cartitem.find(
      (item) => item.model === productModel
    );

    if (!cartItem) {
      return res.status(500).render("public/error", {
        error: " Internal Server Error Try Again later",
      });
    }

    // Increment the quantity and calculate the total price
    cartItem.quantity += 1;
    console.log(cartItem.quantity, "the quandity");

    const thetotalprice = calculateTotalPrice(userdata.cartitem);

    // Save the updated user document
    await userdata.save();
    console.log(thetotalprice, "the total price");
    console.log(cartItem.price * cartItem.quantity, "the productprice");
    const productPrice = cartItem.price * cartItem.quantity;
    // Send the updated total price and individual product price in the JSON response
    res.json({
      thetotalprice: thetotalprice,
      productPrice: productPrice,
      theproductquandity: cartItem.quantity,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).render("public/error", {
      error: " Internal Server Error Try Again later",
    });
  }
};

// Helper function to calculate the total price based on cart items
function calculateTotalPrice(cartItems) {
  let totalPrice = 0;
  for (const item of cartItems) {
    totalPrice += item.price * item.quantity;
  }
  return totalPrice;
}

const decrement = async (req, res) => {
  try {
    const username = req.session.user_data.name;
    const userdata = await Users.findOne({ name: username });

    if (!userdata) {
      return res.status(500).render("public/error", {
        error: "Internal Server Error. Try Again later",
      });
    }

    const productModel = req.body.productModel;
    const cartItem = userdata.cartitem.find(
      (item) => item.model === productModel
    );

    if (!cartItem) {
      return res.status(500).render("public/error", {
        error: "Internal Server Error. Try Again later",
      });
    }

    // Decrement the quantity (ensure it's not going below 1)
    if (cartItem.quantity > 1) {
      cartItem.quantity -= 1;
    }

    const thetotalprice = calculateTotalPrice(userdata.cartitem);

    // Save the updated user document
    await userdata.save();

    // Send the updated total price and individual product price in the JSON response
    res.json({
      thetotalprice,
      productPrice: cartItem.price * cartItem.quantity,
      theproductquandity: cartItem.quantity,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).render("public/error", {
      error: "Internal Server Error. Try Again later",
    });
  }
};
const checkoutorderadd = async (req, res) => {
  try {
    const totalprice = req.body.totalprice;
    const paymentmethod = req.body.paymentmethod;

    const discount = req.body.discount
    console.log (discount, "its the discout")
    const userid = req.session.user_id;
    const user = await Users.findById(userid);

    if (!user) {
      return res.status(500).json({
        error: "Internal Server Error. Try Again later",
      });
    }

    const defaultAddress = user.defaultaddress[0];

    console.log(defaultAddress, "the default address");

    for (const cartItem of user.cartitem) {
      const orderData = {
        userid: userid,
        model: cartItem.model,
        category: cartItem.category,
        price: cartItem.price,
        colour: cartItem.colour,
        description: cartItem.description,
        image: cartItem.image,
        orderstatus: "PENDING",
        discountprice: discount,
        paymentmethod: paymentmethod,
        orderaddress: defaultAddress.address,
        phonenumber: defaultAddress.phonenumber,
        createdAt: new Date(),
      
      };

      const newOrder = new productorders(orderData);

      // Set the globalid field and save the newOrder document
      const globalid = newOrder._id;
      newOrder.Globalid = globalid;
      await newOrder.save();

      console.log(globalid);
      user.Orders.push(newOrder);
    }

    user.cartitem = []

    await user.save();
    if (paymentmethod === "upi") {
      const razorpayOrder = await razorPayInstance.orders.create({
        amount: totalprice * 100,
        currency: "INR",
        receipt: "order_" + Date.now(),
      });

      

      res.json({
        success: true,
        message: "Razorpay order created successfully",
        razorpayOrder,
      });
    } else if (paymentmethod === "cod") {
      // Additional handling for COD if needed
      res.json({ codmessage: true, userid });
    } else if (paymentmethod === "wallet") {
      const walletbalance = user.wallet;

      console.log(walletbalance,"current wallet balance")
      console.log(totalprice,"current wallet balance")

      if (totalprice < walletbalance) {
        // Deduct the total price from the wallet balance
        user.wallet -= totalprice;

        // Save the updated wallet balance
        await user.save();

        console.log(user.wallet, "this is the current wallet balance");
        res.json({
          walletmessage: true,
         
        });
      } else {

        console.log("kslfdjsfjsdkfj")
        // Wallet balance is insufficient
        res.json({
          walletmessage: false,
          error: "Insufficient wallet balance",
        });
      }
    } else {
      res.status(400).json({
        error: "Invalid payment method",
      });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({
      error: "Internal Server Error. Try Again later",
    });
  }
};
const thakyoupage = async (req,res)=>{


  try {
     
    const userid = req.session.user_id

    res.render("public/sucess",{userid})
    
  } catch (error) {

    console.log(error.message)
    
  }
}


const checkout = async (req, res) => {
  try {
    const userid = req.session.user_id;

    const grandTotal = req.query.total;
    const couponprice = req.query.coupon;

    
    const user = await Users.findById(userid);

    if (!user) {
      return res.status(500).render("public/error", {
        error: " Internal Server Error Try Again later",
      });
    }

    const allCartProducts = user.cartitem;
    const totalitems = allCartProducts.length;
    const allUserAddresses = user.address;
    const defaultAddress = user.defaultaddress[0];

    for (const cartItem of allCartProducts) {
    }
    const username = req.session.user_data.name;
    const number = user.number;
    // You can also send the cart items as a response if needed
    res.render("public/checkoutpage", {
      allCartProducts,
      defaultAddress,
      username,
      totalitems,
      grandTotal,
      number,
      userid,
      allUserAddresses,
      couponprice
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).render("public/error", {
      error: " Internal Server Error Try Again later",
    });
  }
};

const verifypayment = async (req, res) => {
  try {
      const data = req.body;

      console.log(data,"ksdjfsldfksdlkf")
     
      const OrderId = data.data.receipt
          console.log(OrderId)
      
      const crypto = require('crypto')
      
      const hmac = crypto.createHmac('sha256', 'dkOQ8mMw1PsK6imUPURGnOTK');
      hmac.update(data.payment.razorpay_order_id + '|' + data.payment.razorpay_payment_id);
      const hashedHmac = hmac.digest('hex');
   
      if (hashedHmac === data.payment.razorpay_signature) {
         
          
          return res.json({ success: true,data });
      } else {
          return res.json({ success: false, error: 'Payment verification failed' });
      }
  } catch (error) {
      console.log(error.message);
  }
}

const editdefaltcheckaddress = async (req, res) => {
  try {
    const userid = req.session.user_id;
    const productdata = req.query.productdata;
    const userdata = await Users.findById(userid);

    if (!userdata) {
      return res.status(500).render("public/error", {
        error: "Internal Server Error Try Again later",
      });
    }

    const defaltadd = userdata.defaultaddress[0];

    // Assuming you're using some template engine like EJS
    res.render("public/editchekaddres", { defaltadd, userid, productdata });
  } catch (error) {
    console.log(error.message);
    res.status(500).render("public/error", {
      error: "Internal Server Error Try Again later",
    });
  }
};
const checkoutpayment = async (req, res) => {
  try {
    const grandtotal = req.body.total;
    const userId = req.session.user_id;
    const user = await Users.findById(userId);

    if (!user) {
      return res.status(500).render("public/error", {
        error: " Internal Server Error Try Again later",
      });
    }
    const username = req.session.user_data.name;

    console.log(username, "sjlfkds");
    const number = user.number;

    res.render("public/checkoutpayment", { username, number, grandtotal });
  } catch (error) {
    console.log(error.message);
  }
};

const checkpaymentmethod = async (req, res) => {
  try {
    const userid = req.session.user_id;

    const discount = req.query.discount

    console.log(discount)

    // Find the user by their ID
    const user = await Users.findById(userid);

    if (!user) {
      return res.status(500).render("public/error", {
        error: "Internal Server Error Try Again later",
      });
    }

    let totalprice = 0;
    let totalItems = user.cartitem.length;

    for (const cartItem of user.cartitem) {
      totalprice += cartItem.price * cartItem.quantity;
    }

    res.render("public/checkpaymentmethod", { userid, totalItems, totalprice ,discount});
  } catch (error) {
    console.log(error.message);
    res.status(500).render("public/error", {
      error: "Internal Server Error Try Again later",
    });
  }
};

const getcoupons = async (req, res) => {
  try {
    // Query the database to get a list of coupons
    const couponslist = await coupons.find({});
    console.log("skjfsdlfjsdlfjsd")

    // Extract coupon codes from the coupons
    
    res.json(couponslist);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const checkcouponcode = async (req, res) => {
  try {
    const theuserinputcode = req.body.couponCode;
   
    // Find the coupon in the database
    const coupon = await coupons.findOne({ couponCode: theuserinputcode });

    if (!coupon) {
      // Coupon code does not exist
      return res.json({ message: "Coupon code not found" });
    }

    const currentDate = new Date();
    
    if (coupon.validity < currentDate) {
      // Coupon has expired
      return res.json({ message: "Coupon has expired" });
    }

    const discountPercentage = coupon.minDiscountPercentage;
    res.json({ valid: true, discountPercentage });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
const searchproducts = async (req, res) => {
  try {
    const querymodel = req.query.query;

    // Use Mongoose to search for products with a model field matching the query
    const Products = await product.find({ model: { $regex: querymodel, $options: 'i' } });

    if (Products.length === 0) {
      console.log("nothing")
      const error = false
      res.json({ error });
    } else {
      res.json(Products);
    }
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const newcheckaddpage = async (req,res)=>{


  try {

    const total = req.query.totalamount
    const userid = req.session.user_id;

    res.render("public/checkoutnewadd", { userid ,total});
  } catch (error) {
    console.log(error.message);
  }
}

const Ordermoreinfo = async (req, res) => {
  try {
    const orderId = req.query.id;
    const userId = req.session.user_id;

    // Query the database to find the user's order details
    const user = await Users.findOne({ _id: userId });

    if (!user) {
      // User not found
      return res.status(404).json({ error: 'User not found' });
    }

    // Find the order by ID within the user's Orders array
    const order = user.Orders.find(order => order._id.toString() === orderId);

    if (!order) {
      // Order not found for the user
      return res.status(404).json({ error: 'Order not found' });
    }

   const userid = userId
    console.log(order)
    // Send the order details as the response
    res.render("public/orderdetails",{order,userid});
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const categorysearch = async (req, res) => {
  try {
    const categorys = req.body.category; // Get the selected category from the form
    const input = req.body.searchInput; // Get the search input from the form

    // Use Mongoose to find the category by name
    const categoryObject = await category.findOne({ name: categorys });

    if (!categoryObject) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Use Mongoose to find products in the specified category
    let productQuery = { category: categoryObject._id };

    // If there's a search input, add a regex filter to the query
    if (input) {
      const regex = new RegExp(input, 'i'); // 'i' flag for case-insensitive search
      productQuery.model = { $regex: regex };
    }

    const page = req.query.page || 1; // Get the requested page or default to page 1
    const limit = 9; // Number of products per page

    const skip = (page - 1) * limit;

    // Query the database to get products for the current page
    const allproducts = await product.find(productQuery).limit(limit).skip(skip);
    const totalProductsCount = await product.countDocuments(productQuery);
    const totalpage = Math.ceil(totalProductsCount / limit);
    const categorylist = await category.find();
    const userid = req.session.user_id;
    res.render("public/productshome", {
      allproducts,
      
     
      
      categorylist,
      
      userid,
      currentPage: page, // Pass the current page to the template
      totalpage, // Pass the total number of pages to the template
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const sortproduct = async (req, res) => {
  try {
    const pricerang = req.query.priceRange;
    const categoryName = req.query.category; // Assuming you receive the category name in the query

    // Split the price range string using the '-' symbol as the separator
    const [firstPrice, secondPrice] = pricerang.split('-');

    console.log("First Price:", firstPrice);
    console.log("Second Price:", secondPrice);

    // Now you have the first and second prices as separate variables
    // Use these variables to filter products within the specified price range

    // Use Mongoose to find the category by name
    const categoryObject = await category.findOne({ name: categoryName });

    if (!categoryObject) {
      // Handle the case where the category does not exist
      return res.status(404).json({ error: "Category not found" });
    }

    const page = req.query.page || 1; // Get the requested page or default to page 1
    const limit = 9; // Number of products per page

    const skip = (page - 1) * limit;

    // Use the category ID to filter products within the specified price range and category
    const allproducts = await product.find({
      category: categoryObject._id, // Filter by category ID
      price: {
        $gte: parseInt(firstPrice), // Convert to integer and use as greater than or equal
        $lte: parseInt(secondPrice), // Convert to integer and use as less than or equal
      },
    })
      .limit(limit)
      .skip(skip);

    const totalProductsCount = await product.countDocuments({
      category: categoryObject._id, // Filter by category ID
      price: {
        $gte: parseInt(firstPrice), // Convert to integer and use as greater than or equal
        $lte: parseInt(secondPrice), // Convert to integer and use as less than or equal
      },
    });

    const totalpage = Math.ceil(totalProductsCount / limit);

    console.log(allproducts);
    const categorylist = await category.find();
    const userid = req.session.user_id;

    // Return the filtered products as a response
    res.render("public/productshome", {
      allproducts,
      categorylist,
      userid,
      currentPage: page, // Pass the current page to the template
      totalpage, // Pass the total number of pages to the template
    });
  } catch (error) {
    console.error("Error in sortproduct function:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getwalletdata = async (req, res) => {
  try {
    const userid = req.session.user_id;
    const user = await Users.findById(userid);

    if (!user) {
      return res.status(500).json({
        error: "Internal Server Error. Try Again later",
      });
    }

    // Assuming you have a valid payment method, you can check it here
    // For example, if the payment method is 'wallet'
   
      const walletbalance = user.wallet
      console.log(walletbalance, "this is the current wallet balance");

      return res.json({
        walletmessage: true,
        userid,
        walletbalance,
      });
     
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      error: "Internal Server Error",
    });
  }
};

const retrnorder = async (req, res) => {
  try {
    const userId = req.session.user_id; // Get the user's ID from the session
    const user = await Users.findById(userId);

    console.log(userId, "this is the userid")

    if (!user) {
      return res.status(500).render("public/error", {
        error: "Internal Server Error. User not found.",
      });
    }

    const orderIdToReturn = req.query.id; // Assuming you're passing the order ID as a query parameter

    // Find the order to return based on the order ID using the find method
    const orderToReturn = user.Orders.find((order) => order._id.toString() === orderIdToReturn);

    if (!orderToReturn) {
      return res.status(500).render("public/error", {
        error: "Order not found or invalid order ID.",
      });
    }

   
    // Retrieve the total price of the order
    const orderTotalPrice = orderToReturn.price;

console.log(orderTotalPrice, "this is the product price");

// Update the user's wallet balance by adding the order total price
user.wallet += orderTotalPrice;

    // Update the order status to "RETURN"
    orderToReturn.orderstatus = "RETURN";

    // Save the user document to persist the changes
    await user.save();

    const globalid = req.query.globalid;

    const globalorderdata = await productorders.findById(globalid);
       console.log(globalorderdata,"its is the global data")
    if (globalorderdata) {
      // Update the order status of the global order to "CANCEL"
      globalorderdata.orderstatus = "RETURN";
      await globalorderdata.save();
    }

    // Console log the order status and total price
    console.log(`Returned order with status: ${orderToReturn.orderstatus}`);
    console.log(`Order total price: ${orderTotalPrice}`);
    console.log(`Updated wallet balance: ${user.wallet}`);

    // Redirect to the updated order list page
    res.redirect("/Orderlist");
  } catch (error) {
    console.error(error.message);
    res.status(500).render("public/error", {
      error: "Internal Server Error. Try Again later.",
    });
  }
};

const removeOrder = async (req, res) => {
  try {
    const userId = req.session.user_id; // Get the user's ID from the session
    const orderIdToDelete = req.query.id; // Assuming you're passing the order ID as a query parameter
      console.log(orderIdToDelete,"dsjfsldfsdlkf")
    const user = await Users.findById(userId);

    if (!user) {
      return res.status(500).render("public/error", {
        error: "Internal Server Error. User not found.",
      });
    }

    // Find the order index to remove based on the order ID
    const orderIndexToRemove = user.Orders.findIndex((order) => order._id.toString() === orderIdToDelete);

    console.log(orderIndexToRemove, "this is the index of the id")

    if (orderIndexToRemove === -1) {
      return res.status(500).render("public/error", {
        error: "Order not found or invalid order ID.",
      });
    }

    // Remove the order from the user's Orders array
    user.Orders.splice(orderIndexToRemove, 1);

    // Save the user document to persist the changes
    await user.save();

    // Redirect to the updated order list page
    res.redirect("/Orderlist");
  } catch (error) {
    console.error(error.message);
    res.status(500).render("public/error", {
      error: "Internal Server Error. Try Again later.",
    });
  }
};

const downloadInvoice = async (req, res) => {
  try {
    const userId = req.session.user_id;
    const orderId = req.query.id;

    // Find the user based on userId
    const user = await Users.findById(userId);

    if (!user) {
      return res.status(404).render("public/error", {
        error: "User not found or unauthorized access.",
      });
    }

    // Find the order within the user's orders
    const orderdetails = user.Orders.find((userOrder) => userOrder._id.toString() === orderId);

    if (!orderdetails) {
      return res.status(404).render("public/error", {
        error: "Order not found or unauthorized access.",
      });
    }

    // Prepare customer data (customize as needed)
    const customer = {
      // Fill in customer data if available
    };

    // Prepare the data for EasyInvoice
    const data = {
      documentTitle: 'Invoice',
      currency: 'USD',
      marginTop: 25,
      marginRight: 25,
      marginLeft: 25,
      marginBottom: 25,
      logo: 'https://public.easyinvoice.cloud/img/watermark-draft.jpg', // Replace with your logo URL
      sender: {
        company: 'Genqmobz',
        address: 'Brototype',
        zip: '686633',
        city: 'Maradu',
        country: 'India',
        taxNotation: 'vatnone'
      },
      client: customer,
      invoiceNumber: orderdetails._id.toString(),
      invoiceDate: orderdetails.createdAt.toISOString(),
      information: {
        number: orderdetails.phonenumber,
        date: orderdetails.createdAt.toISOString(),
        'due-date': 'Nil', // Customize due date as needed
      },
      products: [
        {
          quantity: orderdetails.quantity,
          description: orderdetails.model,
          price: orderdetails.price,
          "tax-rate": 0, // You can customize the tax rate as needed
          total: orderdetails.price, // Total for the order details
        }
      ],
      amount: {
        subtotal: orderdetails.price.toFixed(2),
        total: orderdetails.price.toFixed(2),
      },
      bottomNotice: 'Thank you for your order.',
    };

    // Generate PDF using EasyInvoice
    const pdfResult = await easyinvoice.createInvoice(data);
    const pdfBuffer = Buffer.from(pdfResult.pdf, 'base64');

    // Set response headers for PDF download
    res.setHeader('Content-Disposition', 'attachment; filename="invoice.pdf"');
    res.setHeader('Content-Type', 'application/pdf');

    // Send the PDF buffer as the response
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).send('Error generating invoice.');
  }
};


module.exports = {
  landingpage,
  login,
  loginpost,
  verifynumber,
  verify_otp,
  insertuserdata,
  home,
  logout,
  productdetailspage,
  addtocart,
  removecartproduct,
  forgottpasswordpage,
  forgotemailsearch,
  verify_otpforgot,
  newpasswordupload,
  linkaddtocart,
  profilepage,
  editdefaltaddress,
  Uploaddefultaddress,
  manageaddress,
  editaddressshow,
  personalinfoupdate,
  editpersonaleinfo,
  deletaddress,
  setaddressdefalt,
  whishlistdatapost,
  whishlistdata,
  deletewhishlistproduct,
  buyproduct,
  Ordersummery,
  paymentmethod,
  paymentoptions,
  Orderlist,
  deleteOrder,
  laternumberverify,
  laterotpverify,
  verifyupadate,
  verifynumber,
  namecheck,
  userstatus,
  getcategory,
  increments,
  decrement,
  checkout,
  checkoutpayment,
  checkoutorderadd,
  signinpage,
  addressupload,
  newaddressform,
  uploadnewaddress,
  editdefaltcheckaddress,
  Uploaddefultcheckaddress,
  checkpaymentmethod,
  getcoupons,
  checkcouponcode,
  verifypayment,
  thakyoupage,
  searchproducts,
  newcheckaddpage,
  uploadchecknewaddress,
  Ordermoreinfo,
  categorysearch,
  sortproduct,
  getwalletdata,
  retrnorder,
  removeOrder,
  downloadInvoice
};
