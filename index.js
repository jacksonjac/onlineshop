const express = require("express");
const app = express();
const mongoose = require("mongoose");
const session = require("express-session")
const path = require ("path")

app.use(express.static(path.join(__dirname,"/routes/publicview")))


app.use(
  session({
    secret: "your-secret-key",
    resave: false,
    saveUninitialized: true
  })
);


mongoose.connect("mongodb+srv://jacksonjack333r:VWSbWKQw5eMjmI3V@cluster0.jykgsxw.mongodb.net/", {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log("MongoDB connected");
});
// Set view engine and views directory
app.set("view engine", "ejs");
app.set("views", "./views/");

app.use(express.static(path.join(__dirname,"views/public"))) 
app.use(express.static(path.join(__dirname,"views/admin"))) 
app.use(express.static(path.join(__dirname,"public"))) 

// Routes
const publicRoute = require("./routes/public/publicRoute");
const adminRoute = require("./routes/admin/adminRoute");



//separate router for admin and users
app.use("/", publicRoute);
app.use("/admin/", adminRoute);

//404 page set
app.use("*", (req, res) => {
  const userid = false
  res.render("public/404page",{userid});
});
  


app.listen(8001, () => {
  console.log("Server started at http://localhost:8001");
});
