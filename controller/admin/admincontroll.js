const Admin = require("../../models/admin/adminmodel");
const users = require("../../models/public/usersmodel");
const products = require("../../models/products/product models");
const Orderslist = require("../../models/products/Orders");
const category = require("../../models/products/category");
const banners = require ("../../models/admin/banner/banners")
const Coupon = require("../../models/admin/coupon/couponmodel")
const bycrpt = require("bcrypt");
const {
  ConversationListInstance,
} = require("twilio/lib/rest/conversations/v1/conversation");
const { Orderlist } = require("./public/usercontroll");

const securedpassword = async (password) => {
  try {
    const passwordhash = await bycrpt.hash(password, 10);
    return passwordhash;
  } catch (error) {
    console.log(error.message);
  }
};

const addcategory = async (req, res) => {
  try {
    res.render("admin/addcategory");
  } catch (error) {
    console.log(error.message);
  }
};

const Dashboard = async (req, res) => {
  try {
    // Count the number of users
    const userCount = await users.countDocuments();

    // Count the number of orders
    const orderCount = await Orderslist.countDocuments();

    // Calculate total order sales
    const totalSales = await Orderslist.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: "$price" }
        }
      }
    ]);

    // Extract the total sales amount
    const orderSales = totalSales.length > 0 ? totalSales[0].total : 0;

    // Count the number of COD orders and calculate their total price
    const codOrders = await Orderslist.aggregate([
      {
        $match: {
          paymentmethod: "cod" // Assuming the payment method field is named "paymentMethod"
        }
      },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          total: { $sum: "$price" }
        }
      }
    ]);

    // Extract the COD order count and total price
    const codOrderCount = codOrders.length > 0 ? codOrders[0].count : 0;
    const codTotalPrice = codOrders.length > 0 ? codOrders[0].total : 0;


    const cancelOrders = await Orderslist.aggregate([
      {
        $match: {
          orderstatus: "CANCEL" // Assuming the payment method field is named "paymentMethod"
        }
      },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          total: { $sum: "$price" }
        }
      }
    ]);

    // Extract the COD order count and total price
    const canselOrderCount = cancelOrders.length > 0 ? cancelOrders[0].count : 0;
    const canselOrderprice = cancelOrders.length > 0 ? cancelOrders[0].total : 0;

    // Count the number of UPI orders and calculate their total price
    const upiOrders = await Orderslist.aggregate([
      {
        $match: {
          paymentmethod: "upi" // Assuming the payment method field is named "paymentMethod"
        }
      },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          total: { $sum: "$price" }
        }
      }
    ]);
    

    // Extract the UPI order count and total price
    const upiOrderCount = upiOrders.length > 0 ? upiOrders[0].count : 0;
    const upiTotalPrice = upiOrders.length > 0 ? upiOrders[0].total : 0;

    let adminid = req.session.admin_id;

    if (adminid) {
      adminid = true;
    } else {
      adminid = false;
    }

    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 7);

    // Calculate total sales for each of the last 7 days
    const last7DaysOrderSales = await Orderslist.aggregate([
      {
        $match: {
          createdAt: { $gte: last7Days }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          total: { $sum: "$price" }
        }
      }
    ]);

    // Create an object to store daily sales
    const dailySales = {};
    last7DaysOrderSales.forEach((day) => {
      dailySales[day._id] = day.total;
    });

    // Create an array of the last 7 days
    const dateLabels = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date();
      day.setDate(day.getDate() - i);
      dateLabels.unshift(day.toISOString().split("T")[0]);
    }

    // Create an array of total sales for the last 7 days
    const last7DaysSalesData = dateLabels.map((date) => ({
      date,
      total: dailySales[date] || 0
    }));

    console.log(last7DaysSalesData,"it is the data of last 7 days")

    console.log(
      
      upiOrderCount,
      upiTotalPrice
    ,"upiiiisljfsldc");

    function getDayOfWeek(dateString) {
      const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      const date = new Date(dateString);
      return daysOfWeek[date.getDay()];
    }
    const walletOrders = await Orderslist.aggregate([
      {
        $match: {
          paymentmethod: "wallet" // Assuming the payment method field is named "paymentMethod"
        }
      },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          total: { $sum: "$price" }
        }
      }
    ]);
    
    // Extract the Wallet order count and total price
    const walletOrderCount = walletOrders.length > 0 ? walletOrders[0].count : 0;
    const walletTotalPrice = walletOrders.length > 0 ? walletOrders[0].total : 0;
    

    const deliveredOrders = await Orderslist.aggregate([
      {
        $match: {
          orderstatus: "DELIVERED"
        }
      },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          total: { $sum: "$price" }
        }
      }
    ]);
    
    // Extract the total count of delivered orders
    const deliveredOrdersCount = deliveredOrders.length > 0 ? deliveredOrders[0].count : 0;
    const deliveredOrdersTotal = deliveredOrders.length > 0 ? deliveredOrders[0].total : 0;
    
    console.log(deliveredOrdersCount, "it is the count")
    
    const reversedLast7DaysData = last7DaysSalesData.reverse();

    res.render("admin/dashboard", {
      adminid,
      userCount,
      orderCount,
      orderSales,
      codOrderCount,
      codTotalPrice,
      upiOrderCount,
      upiTotalPrice,
      reversedLast7DaysData,
      getDayOfWeek:getDayOfWeek,
      walletOrderCount,
      walletTotalPrice,
      canselOrderprice,
      canselOrderCount,
      orderCount,
      deliveredOrdersCount,

      
      

    });
  } catch (error) {
    console.log(error.message);
  }
};
const adminlogin = async (req, res) => {
  try {
    res.render("admin/index");
  } catch (error) {
    console.log(error.message);
  }
};

const adminloginpost = async (req, res) => {
  try {
    const Name = req.body.name;
    const Password = req.body.password;

    console.log(Name,Password,"sfklsdfj")
    const admin = await Admin.findOne({ name: Name });
    const dataname = admin.name;
    const datapassword = admin.password;

    req.session.admin_id = admin._id;
    req.session.admin_data = {
      name: admin.name,
      password: admin.password,
    };
    const adminid = req.session.admin_id


    if (dataname === Name && datapassword === Password) {

      const userCount = await users.countDocuments();

    // Count the number of orders
    const orderCount = await Orderslist.countDocuments();

    // Calculate total order sales
    const totalSales = await Orderslist.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: "$price" }
        }
      }
    ]);

    // Extract the total sales amount
    const orderSales = totalSales.length > 0 ? totalSales[0].total : 0;

    const codOrders = await Orderslist.aggregate([
      {
        $match: {
          paymentMethod: "COD" // Assuming the payment method field is named "paymentMethod"
        }
      },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          total: { $sum: "$price" }
        }
      }
    ]);

    // Extract the COD order count and total price
    const codOrderCount = codOrders.length > 0 ? codOrders[0].count : 0;
    const codTotalPrice = codOrders.length > 0 ? codOrders[0].total : 0;

    // Count the number of UPI orders and calculate their total price
    const upiOrders = await Orderslist.aggregate([
      {
        $match: {
          paymentmethod: "upi" // Assuming the payment method field is named "paymentMethod"
        }
      },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          total: { $sum: "$price" }
        }
      }
    ]);
    

    // Extract the UPI order count and total price
    const upiOrderCount = upiOrders.length > 0 ? upiOrders[0].count : 0;
    const upiTotalPrice = upiOrders.length > 0 ? upiOrders[0].total : 0;

    const cancelOrders = await Orderslist.aggregate([
      {
        $match: {
          orderstatus: "CANCEL" // Assuming the payment method field is named "paymentMethod"
        }
      },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          total: { $sum: "$price" }
        }
      }
    ]);

    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 7);

    // Calculate total sales for each of the last 7 days
    const last7DaysOrderSales = await Orderslist.aggregate([
      {
        $match: {
          createdAt: { $gte: last7Days }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          total: { $sum: "$price" }
        }
      }
    ]);
    const dailySales = {};
    last7DaysOrderSales.forEach((day) => {
      dailySales[day._id] = day.total;
    });

    // Create an array of the last 7 days
    const dateLabels = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date();
      day.setDate(day.getDate() - i);
      dateLabels.unshift(day.toISOString().split("T")[0]);
    }

    // Create an array of total sales for the last 7 days
    const last7DaysSalesData = dateLabels.map((date) => ({
      date,
      total: dailySales[date] || 0
    }));

    function getDayOfWeek(dateString) {
      const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      const date = new Date(dateString);
      return daysOfWeek[date.getDay()];
    }

    console.log(last7DaysSalesData,"it is the data of last 7 days")

    const walletOrders = await Orderslist.aggregate([
      {
        $match: {
          paymentmethod: "wallet" // Assuming the payment method field is named "paymentMethod"
        }
      },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          total: { $sum: "$price" }
        }
      }
    ]);
    
    // Extract the Wallet order count and total price
    const walletOrderCount = walletOrders.length > 0 ? walletOrders[0].count : 0;
    const walletTotalPrice = walletOrders.length > 0 ? walletOrders[0].total : 0;

    const deliveredOrders = await Orderslist.aggregate([
      {
        $match: {
          orderstatus: "DELIVERED"
        }
      },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          total: { $sum: "$price" }
        }
      }
    ]);
    
    // Extract the total count of delivered orders
    const deliveredOrdersCount = deliveredOrders.length > 0 ? deliveredOrders[0].count : 0;
    const deliveredOrdersTotal = deliveredOrders.length > 0 ? deliveredOrders[0].total : 0;
    // Extract the COD order count and total price
    const canselOrderCount = cancelOrders.length > 0 ? cancelOrders[0].count : 0;
    const canselOrderprice = cancelOrders.length > 0 ? cancelOrders[0].total : 0;

    // Extract the UPI order count and total price
   
    const reversedLast7DaysData = last7DaysSalesData.reverse();

      res.render("admin/dashboard",{
        adminid,
        userCount,
        orderCount,
        totalSales,
        orderSales,
        upiOrderCount,
        upiTotalPrice,
        codOrderCount,
        codTotalPrice,
        canselOrderprice,
        reversedLast7DaysData,
        getDayOfWeek:getDayOfWeek,
        walletTotalPrice,
        canselOrderCount,
        deliveredOrdersCount
      });
    } else {
      res.render("admin/index",{message:"incorrect password"});
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).render("public/error", {
      error: " Internal Server Error Try Again later",
    });
  }
};
const authentication = async (req, res, next) => {
  try {
    if (req.session.admin_id) {
      next();
    } else {
      res.redirect("/");
    }
  } catch (error) {
    res.status(500).render("public/error", {
      error: " Internal Server Error Try Again later",
    });
  }
};

const adminproducts = async (req, res) => {
  try {
    const productList = await products.find().populate("category");
    const categorylist = await category.find();
    res.render("admin/products", { productList, categorylist });
  } catch (error) {
    console.log(error.message);
    res.status(500).render("public/error", {
      error: " Internal Server Error Try Again later",
    });
  }
};

const adminusers = async (req, res) => {
  try {
    const userslist = await users.find();

    res.render("admin/users", { userslist });
  } catch (error) {
    console.log(error.message);
    res.status(500).render("public/error", {
      error: " Internal Server Error Try Again later",
    });
  }
};

const adminnotification = async (req, res) => {
  try {
    res.render("admin/notifications/notifications");
  } catch (error) {
    console.log(error.message);
    res.status(500).render("public/error", {
      error: " Internal Server Error Try Again later",
    });
  }
};

const admindashboard = async (req, res) => {
  try {
    res.render("admin/dashboard");
  } catch (error) {
    console.log(error.message);
    res.status(500).render("public/error", {
      error: " Internal Server Error Try Again later",
    });
  }
};

const userblock = async (req, res) => {
  try {
    const username = req.body.name;

    // Find the user by username
    const user = await users.findOne({ name: username });

    if (user) {
      // Update the user's status to blocked (status = 0)
      user.status = 0;
      await user.save();

      const userslist = await users.find();

      res.render("admin/users", {
        message: "User blocked successfully",
        userslist,
      });
    } else {
      const userslist = await users.find();
      res.render("admin/users", {
        message: "User not found",
        userslist,
      });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).render("public/error", {
      error: " Internal Server Error Try Again later",
    });
  }
};

const userunblock = async (req, res) => {
  try {
    const username = req.body.name;

    // Find the user by username
    const user = await users.findOne({ name: username });

    if (user) {
      // Update the user's status to unblocked (status = 1)
      user.status = 1;
      await user.save();

      // Fetch the updated user list and render the page
      const userslist = await users.find();
      res.render("admin/users", {
        message: "User unblocked successfully",
        userslist,
      });
    } else {
      // User not found, render the page with a message
      const userslist = await users.find();
      res.render("admin/users/users", {
        message: "User not found",
        userslist,
      });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).render("public/error", {
      error: " Internal Server Error Try Again later",
    });
  }
};

const uplodeproduct = async (req, res) => {
  const categoryid = await category.find();
  console.log(categoryid);
  res.render("admin/newproduct", { categoryid });
};
const addproducts = async (req, res) => {
  try {



    console.log(req.files,"this is the files");
    const price = req.body.price;
    const categoryId = req.body.category;
    const images = req.files.map(file => file.filename); 

   

    

    // Find the category by ID
    const categories = await category.findOne({ _id: categoryId });

    console.log(categories);

    if (!categories) {
      return res.status(500).render("public/error", {
        error: " Internal Server Error Try Again later",
      });
    }

    if (price < 0) {
      return res.status(500).render("public/error", {
        error: " Internal Server Error Try Again later",
      });
    }

    

    const newProduct = new products({
      model: req.body.model,
      category: categories._id,
      price: req.body.price,
      colour: req.body.colour,
      images: images,
      description: req.body.description,
      status: 1,
    });

    const productData = await newProduct.save();
    if (productData) {
      const categoryid = await category.find();

      return res.render("admin/products/newproduct", {
        message: "Product uploaded successfully",
        categoryid,
      });
    } else {
      console.log("Product not uploaded");
      return res.render("admin/products/newproduct", {
        message: "Product upload failed",
      });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).render("public/error", {
      error: " Internal Server Error Try Again later",
    });
  }
};

const productedit = async (req, res) => {
  try {
    const productId = req.body.productId;

    const editproduct = await products.findById(productId);

    if (!editproduct) {
      return res.status(404).send("Product not found.");
    }
    const categoryid = await category.find();
    res.render("admin/editproduct", { editproduct, categoryid });
  } catch (error) {
    console.log(error.message);
    res.status(500).render("public/error", {
      error: " Internal Server Error Try Again later",
    });
  }
};

const updateproduct = async (req, res) => {
  try {
    console.log("this is the update fn");
    const categoryId = req.body.category;
    const images = req.files.map(file => file.filename);

    const categories = await category.findOne({ _id: categoryId });
    console.log(categories._id, "this is idd ididi");

    const productId = req.body.id;
    const model = req.body.model;
    const categoryID = categories._id;
    const price = req.body.price;
    const colour = req.body.colour;
    const description = req.body.description;

    // Move this line to before it's used
    const product = await products.findById(productId);

    if (!product) {
      return res.status(500).render("public/error", {
        error: " Internal Server Error Try Again later",
      });
    }

    const newImages = images.length > 0 ? images : product.images;

    await products.updateOne(
      { _id: productId },
      {
        $set: {
          model: model,
          category: categoryID,
          price: price,
          colour: colour,
          description: description,
          images: newImages,
        },
      }
    );

    const categorylist = await category.find();
    console.log("this is category list", categorylist);

    res.redirect("/admin/alllist");
  } catch (error) {
    console.log(error.message);
    res.status(500).render("public/error", {
      error: " Internal Server Error Try Again later",
    });
  }
};

const getcategory = async (req, res) => {
  try {
    const Cname = req.query.name;

    // Find the category by name
    const foundCategory = await category.findOne({ name: Cname });

    if (!foundCategory) {
      return res.status(500).render("public/error", {
        error: " Internal Server Error Try Again later",
      });
    }

    // Find all products belonging to the found category using populate
    const productList = await products
      .find({ category: foundCategory._id })
      .populate("category");
    const categorylist = await category.find();
    res.render("admin/products", { productList, categorylist });
  } catch (error) {
    console.log(error.message);
    res.status(500).render("public/error", {
      error: " Internal Server Error Try Again later",
    });
  }
};
const productblock = async (req, res) => {
  try {
    const productmodel = req.body.model;

    console.log(productmodel);

    // Find the product with the given model
    const productdata = await products.findOne({ model: productmodel });
    console.log(productdata, "this is product data");

    if (!productdata) {
      return res.status(500).render("public/error", {
        error: " Internal Server Error Try Again later",
      });
    }

    // Update the status to 0 (unlisted)
    productdata.status = 0;
    await productdata.save();

    // Retrieve the updated product list with populated categories
    const productList = await products.find().populate("category");

    console.log(productList.status, "number");
    const categorylist = await category.find();
    return res.render("admin/products/products", { productList, categorylist });
  } catch (error) {
    console.log(error.message);
    res.status(500).render("public/error", {
      error: " Internal Server Error Try Again later",
    });
  }
};

const productunblock = async (req, res) => {
  try {
    const productmodel = req.body.model;

    console.log(productmodel);

    // Find the product with the given model
    const productdata = await products.findOne({ model: productmodel });
    console.log(productdata, "this is product data");

    if (!productdata) {
      return res.status(500).render("public/error", {
        error: " Internal Server Error Try Again later",
      });
    }

    // Update the status to 0 (unlisted)
    productdata.status = 1;
    await productdata.save();

    // Retrieve the updated product list with populated categories
    const productList = await products.find().populate("category");

    console.log(productList.status, "number");
    const categorylist = await category.find();
    return res.render("admin/products/products", { productList, categorylist });
  } catch (error) {
    console.log(error.message);
    res.status(500).render("public/error", {
      error: " Internal Server Error Try Again later",
    });
  }
};

const userorderslist = async (req, res) => {
  try {
    // Retrieve all order list data from the Orders model
    const allOrders = await Orderslist.find();

    // Loop through the orders and retrieve user data for each order
    const ordersWithData = await Promise.all(
      allOrders.map(async (order) => {
        const userData = await users.findById(order.userid);

        if (userData) {
          return {
            ...order.toObject(),
            username: userData.name,
          };
        } else {
          // Handle the case where userData is null or undefined
          return {
            ...order.toObject(),
            username: "Unknown User",
          };
        }
      })
    );

    console.log(ordersWithData, "this is all user orders");

    // Render the order list page and pass the order list data with user data
    res.render("admin/Orderedproducts", { allOrders: ordersWithData });
  } catch (error) {
    console.log(error.message);
    res.status(500).render("public/error", {
      error: "Internal Server Error. Try again later.",
    });
  }
};

const EditOrderstatus = async (req, res) => {
  try {
    const status = req.body.newStatus;
    const username = req.body.username;
    const productModel = req.body.productModel;
    const orderid = req.body.orderid;

    // Find the user data
    const userData = await users.findOne({ name: username });
  console.log("sdfkjsdlfk")
    if (!userData) {
      return res.status(404).json({ message: "User not found" });
    }

    // Find the order in user's Orders array with matching model
    const orderToUpdate = userData.Orders.find(
      (order) => order.model === productModel
    );

    if (!orderToUpdate) {
      return res.status(500).render("public/error", {
        error: " Internal Server Error Try Again later",
      });
    }

    // Update the status of the user-specific order
    orderToUpdate.orderstatus = status;

    // Save the updated user data
    await userData.save();

    // Find and update the global order by its ID
    const globalOrderToUpdate = await Orderslist.findById(orderid);

    if (!globalOrderToUpdate) {
      return res.status(404).json({ message: "Global Order not found" });
    }

    // Update the status of the global order
    globalOrderToUpdate.orderstatus = status;

    // Save the updated global order status
    await globalOrderToUpdate.save();

    console.log(globalOrderToUpdate,"skfjsdflkdsoderdd")

    res.json({ message: "Order status updated successfully", status });
  } catch (error) {
    console.error(error.message);
    res.status(500).render("public/error", {
      error: " Internal Server Error Try Again later",
    });
  }
};

const logout = async (req, res) => {
  try {
    req.session.destroy();

    res.redirect("/admin/");
  } catch (error) {
    console.log(error.message);
  }
};

const editimage = async (req, res) => {
  try {
    console.log("dskfsdlfksjdl")
    // Retrieve the image name from the query parameter
    const imageName = req.query.imageName;

    // Now you can use the imageName to load and edit the corresponding image
    // For example, you can render the editimagepage EJS template with the imageName
    res.render("admin/editimagepage", { imageName });
  } catch (error) {
    console.log(error.message);
    // Handle errors as needed
  }
};

const uploadcategory = async (req, res) => {
  try {
    const categoryName = req.body.categoryname; // Assuming you're sending the category name in the request body

    // Check if the new category name already exists in the category list
    const isNameTaken = await category.findOne({ name: categoryName });

    if (isNameTaken) {
      // Category name already exists, so you can return an error message
      res.render("admin/addcategory", {
        message: "Category name already exists in the list",
      });
    } else {
      // Create a new category if the name is not taken
      const newCategory = new category({
        name: categoryName,
      });

      // Save the new category to the database
      const savedCategory = await newCategory.save();
      res.render("admin/products/addcategory",{
        message: "Category added successfully",
        category: savedCategory,
      });
    }
  } catch (error) {
    console.error(error.message);
    res.status(500).render("public/error", {
      error: "Internal Server Error. Try Again later",
    });
  }
};
const editcategory = async (req, res) => {
  try {
    const categorylist = await category.find();

    res.render("admin/categoryedit", { categorylist });
  } catch (error) {
    console.log(error.message);
    res.status(500).render("public/error", {
      error: " Internal Server Error Try Again later",
    });
  }
};


const bannerlist = async (req, res) => {
  try {
    const bannerlist = await banners.find(); // Retrieve all banner documents from the database

    res.render('admin/banner', { bannerlist }); // Pass the retrieved banners to your template
  } catch (error) {
    console.log(error.message);
    res.status(500).send('Internal Server Error');
  }
};


const editcategoryname = async (req, res) => {
  try {
    const categoryId = req.query.categoryId;
    const categoryName = req.query.categoryName;

    console.log(categoryId, categoryName, "dkfjsldkf");

    res.render("admin/editcategory", { categoryId, categoryName });
  } catch (error) {
    console.log(error.message);
  }
};

const updatecategoryname = async (req, res) => {
  try {
    const categoryName = req.body.categoryname; // Assuming you're sending the new category name in the request body
    const categoryId = req.body.id;

    // Check if the new category name already exists in the category list
    const isNameTaken = await category.findOne({ name: categoryName });

    if (isNameTaken) {
      console.log("Category name already exists");
      const categorylist = await category.find();
      res.render("admin/editcategory", {
        categoryId,
        categorylist,
        categoryName,
        message: "Category name already exists in the list",
      });
    } else {
      // Find the category by its ID and update the name
      const updatedCategory = await category.findOneAndUpdate(
        { _id: categoryId }, // Assuming _id is the field for the category's unique identifier
        { name: categoryName }, // Update the name
        { new: true } // This option returns the updated document
      );

      if (!updatedCategory) {
        // Handle the case where the category with the given ID does not exist
        console.log("Category not found for update");
        const categorylist = await category.find();
        res.render("admin/editcategory", {
          categoryId,
          categorylist,
          categoryName,
          message: "Category not found for update",
        });
      } else {
        // Category name updated successfully
        const categorylist = await category.find();
        res.render("admin/categoryedit", {
          categoryId,
          categorylist,
          categoryName: updatedCategory.name, // Use the updated name
          message: "Category name updated successfully",
        });
      }
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).render("public/error", {
      error: "Internal Server Error. Try Again later",
    });
  }
};
 

const newbannerpage = async (req,res)=>{

  try {


    res.render("admin/newbannerpage")


    
  } catch (error) {
    console.log(error.message)
  }
}

const editbannerpage = async (req,res)=>{
  try {
    const imageId = req.query.imageid;

    // Assuming you want to retrieve the banner data associated with imageId
    const banner = await banners.findById(imageId);

    // Render the edit banner page and pass the banner data
    res.render('admin/editbanner', { banner }); // Assuming you have a template engine like EJS
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Internal Server Error');
  }


}




const updatebanner = async (req, res) => {
  try {
    const bannerId = req.body.imageid; // Retrieve the image ID from the form
    const updatedBannerName = req.body.bannername; // Retrieve the updated banner name from the form
    const currentImageFilename = req.body.currentimage; // Retrieve the current image filename

    // Find the banner document by ID
    const banner = await banners.findById(bannerId);
    if (!banner) {
      return res.status(404).send('Banner not found');
    }

    // Check if a file was uploaded
    if (req.file) {
      // If a new image was provided, retrieve the filename of the new image
      const newImageFilename = req.file.filename;

      // Update the banner's image field with the new image filename
      banner.images = newImageFilename;
    } else {
      // If no new image was provided, retain the current image filename
      banner.images = currentImageFilename;
    }

    // Update the banner's name field with the updated banner name
    banner.bannername = updatedBannerName;

    // Save the updated banner document
    await banner.save();

    // Redirect to the list of banners or any other desired page
    res.redirect('/admin/bannerlist');
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Internal Server Error');
  }
};



const deletebanner = async(req,res)=>{

  try {
    const imageId = req.query.imageid;

    console.log(imageId,"sfkjsdlfksdlfk")

    // Find the banner by imageId and delete it
    const banner = await banners.findByIdAndRemove(imageId);

    // Redirect to the banner list or take appropriate action
    res.redirect('/admin/bannerlist'); // Redirect to the list of banners
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Internal Server Error');
  }

 
}

const updateimage = async (req, res) => {
  try {
    // Retrieve the new image file from the request
    const newImageFile = req.file.filename; // Assuming you're using multer for file uploads
     console.log(newImageFile, "thskfslfjsl")
    // Retrieve the current image path from the query parameter
    const currentImagePath = req.body.imageName;
       console.log(currentImagePath,"dsfjsdlfksdlf")
    // Update the product's images array with the new image filename
    const updatedProduct = await products.findOneAndUpdate(
      { "images": currentImagePath }, // Find the product by the current image path
      { $set: { "images.$": newImageFile } }, // Replace the current image path with the new filename
      { new: true } // Return the updated document
    );

    if (!updatedProduct) {
      // Handle the case where the product is not found
      return res.status(404).send("Product not found");
    }
     const imageName = newImageFile

    // Redirect or render a success page as needed
    res.render("admin/editimagepage",{imageName,message:"image changed Successfully"} );
  } catch (error) {
    console.log(error.message);
    // Handle errors as needed
  }
};

const uplodnewbanner = async (req, res) => {
  try {
    const bannername = req.body.bannername;

    // Check if a new image file was uploaded
    if (req.file) {
      const image = req.file.filename; // Get the filename of the uploaded image

      const newBanner = new banners({
        bannername,
        images: image, // Use the filename for the 'images' field
      });

      await newBanner.save();

      res.redirect('/admin/bannerlist'); // Redirect to a page displaying all banners
    } else {
      // Handle the case where no image was uploaded (if needed)
      console.log("No image was uploaded.");
      res.status(400).send("No image was uploaded.");
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).send('Internal Server Error');
  }
};


const updatecategory = async (req, res) => {
  try {
    // Initialize a flag to check if any category name is already found
    let categoryNameFound = false;

    // Iterate through the submitted form data
    for (const key in req.body) {
      if (key.startsWith("category_")) {
        const categoryId = key.replace("category_", ""); // Extract the category ID from the key
        const newCategoryName = req.body[key]; // Get the new category name from the form data
          console.log(categoryId,"dkfsdk")
          console.log(newCategoryName,"dkffsdfdsdk")

        // Check if the new category name already exists in the category list
        const isNameTaken = await category.findOne({ name: newCategoryName });

        if (isNameTaken) {

          res.send("fksdflksdfldflds")
          categoryNameFound = true; // Set the flag to true if the name is found
        } else {
          // Update the category name if it doesn't exist
          await category.findByIdAndUpdate(categoryId, { name: newCategoryName });
        }
      }
    }

    const categorylist = await category.find();

    if (categoryNameFound) {
      // If at least one category name is already found, render the same page with a message
      res.render("admin/products/categoryedit", {
        categorylist,
        message: "Category name already exists in the list",
      });
    } else {
      // Otherwise, redirect back to the edit category page with a success message
      res.render("admin/products/categoryedit", {
        categorylist,
        message: "Categories Updated Successfully",
      });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).render("public/error", {
      error: "Internal Server Error. Try Again later",
    });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const categoryId = req.query.categoryId;

    // Find the category by its ID using the Category model
    const deleted = await category.findByIdAndDelete(categoryId);

    if (!deleted) {
      return res.status(404).send("Category not found");
    }

    res.redirect("/admin/editcategory");
  } catch (error) {
    console.error(error.message);
    res.status(500).send("An error occurred while deleting the category");
  }
};


const couponpage = async (req,res)=>{

  try {

    res.render("admin/couponpage")
    
  } catch (error) {

    console.log(error.message)
    
  }
}

const postCoupon = async (req, res) => {
  try {
    
    const existingCoupon = await Coupon.find({})
      const {
          couponCode,
          validity,
          minPurchase,
          minDiscountPercentage,
          maxDiscountValue,
          description
      } = req.body;

      const newCoupon = new Coupon({
          couponCode,
          validity,
          minPurchase,
          minDiscountPercentage,
          maxDiscountValue,
          description
      });

      await newCoupon.save();
      res.json({ status: true }); // Send a JSON response to the AJAX request
  } catch (error) {
      console.error(error);
      res.json({ status: false }); // Send a JSON response to the AJAX request
  }
};


const couponlists = async (req, res) => {
  try {
    const couponlist = await Coupon.find({});
    res.render('admin/couponlist', { couponlist }); // Pass the couponlist data to the template
  } catch (error) {
    console.log(error.message);
  }
}; 


const deletecoupon = async (req, res) => {
  try {
    const couponId = req.query.couponId;

    console.log(couponId)

    // Check if the couponId is valid (you may want to add more validation here)
    if (!couponId) {
      return res.status(400).json({ error: 'Invalid couponId' });
    }

    // Use Mongoose to find and delete the coupon by its _id
    const deletedCoupon = await Coupon.findByIdAndDelete(couponId);

    if (!deletedCoupon) {
      return res.status(404).json({ error: 'Coupon not found' });
    }

    res.redirect("/admin/couponlists")
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ error: 'Server error' });
  }
};

const orderdetailshowpage = async (req, res) => {
  try {
    const productmodel = req.body.model;
    const userid = req.body.userid;
    const paymentmethod = req.body.paymentmethod;
    const orderusername = req.body.addressname;
    const orderaddress = req.body.orderaddress;
    const orderphonenumber = req.body.phonenumber;

    console.log(productmodel, userid, paymentmethod, orderusername, orderaddress);

    const productdata = await products.findOne({ model: productmodel });
    const userdata = await users.findById(userid);

    console.log(productdata, "this is product");
    console.log(userdata, "this is userdata");
    console.log(orderusername, "this is orderusername");
    console.log(orderaddress);
    console.log(orderphonenumber);

    // Create an object with the data you want to send as a response
    const responseData = {
      productdata,
      userdata,
      orderusername,
      orderaddress,
      orderphonenumber,
    };

    // Send the response as JSON
    res.json(responseData);
  } catch (error) {
    console.log(error.message);
    // Handle errors and send an appropriate response if needed
    res.status(500).json({ error: 'An error occurred' });
  }
};

const deleteimage = async (req, res) => {
  try {
    const currentImagePath = req.query.imageName;
    console.log(currentImagePath, "dsfjsdlfksdlf");

    const product = await products.findOne({ "images": currentImagePath });

    if (!product) {
      return res.status(404).send("Product not found");
    }

    if (product.images.length <= 1) {
      // You can decide how to handle the case when there's only one image left
      const productList = await products.find().populate("category");
      const categorylist = await category.find();
     return res.render("admin/products", { productList, categorylist,message:"One image is Required" });
    }

    const updatedProduct = await products.findOneAndUpdate(
      { "images": currentImagePath },
      { $pull: { "images": currentImagePath } },
      { new: true }
    );

    const productList = await products.find().populate("category");
    const categorylist = await category.find();
    res.render("admin/products", { productList, categorylist });
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Internal Server Error");
  }
}

const salesReportpage = async (req, res) => {
  try {
    // Assuming you have a Mongoose model named "Order" and want to fetch "delivered" orders
    const deliveredOrders = await Orderslist.find({ orderstatus: "DELIVERED" });
   const allOrders = deliveredOrders
    console.log(deliveredOrders)

    res.render("admin/salesReportpage", { allOrders });
  } catch (error) {
    console.log(error.message);
  }
};

const getsalesreport = async (req, res) => {
  try {
    const dateRange = req.query.dateRange;
    console.log('Date Range:', dateRange);

    // Parse the date range and convert it into a start and end date
    const [startDateStr, endDateStr] = dateRange.split(' - ');
    console.log('Start Date:', startDateStr);
    console.log('End Date:', endDateStr);

    // Convert the date strings into JavaScript Date objects in UTC
    const startDateObj = new Date(startDateStr + ' UTC');
    const endDateObj = new Date(endDateStr + ' UTC');

    // Adjust the end date to include all of the selected end date
    endDateObj.setHours(23, 59, 59, 999); // Set to the end of the day in UTC

    // Fetch orders that match the date range (assuming "createdAt" is in UTC format)
    const orders = await Orderslist.find({
      orderstatus: 'DELIVERED',
      createdAt: { $gte: startDateObj, $lte: endDateObj },
    });

    console.log('Orders within Date Range:', orders);

    // Send the orders data to the frontend as a JSON response
    res.render("admin/salesReportpage", { allOrders: orders });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const profile = async (req, res) => {
  try {
    const adminId = req.session.admin_id; // Assuming `admin_id` is stored in the session

    // Assuming you have a Mongoose model for Admin called AdminModel
    const adminData = await Admin.findById(adminId);

    if (!adminData) {
      // Handle the case where admin data is not found
      return res.status(404).send("Admin data not found");
    }

    console.log(adminData, "admin data");

    // Set a boolean variable based on adminData.verified
    const isVerified = adminData.verified === 1;

    console.log(isVerified)

    // Assuming you want to render a template with the admin data and isVerified
    res.render("admin/profile/profile", { adminData, isVerified });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
};
const editprofile = async (req, res) => {
  try {
    const adminId = req.session.admin_id;

    // Find the Admin document by ID
    const adminData = await Admin.findById(adminId);

    if (!adminData) {
      // Handle the case where the Admin document is not found
      return res.status(404).json({ message: 'Admin not found' });
    }
  
    // Access the form data from the request body
    const formData = req.body;
   
    // Update the fields you want to change
    adminData.name = formData.name;
    adminData.email = formData.email;
    adminData.number = formData.phoneNumber;

    // Save the updated Admin document
    await adminData.save();

    console.log(adminData)


    // Send a response indicating success
    res.status(200).json({ message: 'Admin profile updated successfully' });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};


const changepassword = async (req, res) => {
  try {
      const adminId = req.session.admin_id;
      const newPassword = req.body.Password; // Use "Password" instead of "password"

      // Assuming you're using a MongoDB database
      const admin = await Admin.findOne({ _id: adminId });

      if (!admin) {
          return res.status(404).json({ message: "Admin not found" });
      }

      // Update the admin's password
      admin.password = newPassword;

      // Save the changes to the database
      await admin.save();

      return res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error" });
  }
};


const addNewAdmin = async (req, res) => {
  try {
      // Parse the request body to extract the admin data
      const { name, email, password, number } = req.body;

      // Create a new instance of the Admin model
      const newAdmin = new Admin({
          name,
          email,
          password,
          number,
      });

      // Save the new admin to the database
      const savedAdmin = await newAdmin.save();
      console.log(savedAdmin)

      // Respond with a success message and the saved admin data
      res.status(200).json({ message: 'Admin added successfully', admin: savedAdmin });
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Failed to add admin' });
  }
};







module.exports = {
  adminlogin,
  Dashboard,
  adminloginpost,
  adminproducts,
  adminusers,
  admindashboard,
  adminnotification,
  uplodeproduct,
  addproducts,
  productedit,
  updateproduct,
  getcategory,
  userorderslist,
  EditOrderstatus,
  logout,
  authentication,
  userblock,
  userunblock,
  addcategory,
  uploadcategory,
  productblock,
  productunblock,
  editcategory,
  updatecategory,
  deleteCategory,
  bannerlist,
  newbannerpage,
  uplodnewbanner,
  editbannerpage,
  deletebanner,
  updatebanner,
  couponpage,
  postCoupon,
  couponlists,
  deletecoupon,
  orderdetailshowpage,
  editcategoryname,
  updatecategoryname,
  editimage,
  updateimage,
  deleteimage,
  salesReportpage,
  getsalesreport,
  profile,
  editprofile,
  changepassword,
  addNewAdmin
 
  
};
