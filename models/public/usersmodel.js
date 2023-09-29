

const mongoose = require("mongoose")
const defultaddress = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String, 
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  postalCode: {
    type: Number,
    required: true,
  },
  phonenumber:{
    type:Number,
    require:true
  }

})



const cartItemSchema = mongoose.Schema({
    model:{
        type:String,
        require:true
    },
    category:{
        type: String,
        require:true
    },
    price:{
        type: Number,
        require:true
    },
    colour:{
        type: String,
        require:true
    },
    description:{
        type: String,
        require:true
    },
    image:{
        type:String,
        require:false
     
    },
    quantity: {
        type: Number,
        required: true,
        default: 1,
      },
   
  });
  const useraddress = mongoose.Schema({
    name: {
        type: String,
        required: true,
      },
      email: {
        type: String, 
        required: true,
      },
      address: {
        type: String,
        required: true,
      },
      city: {
        type: String,
        required: true,
      },
      postalCode: {
        type: Number,
        required: true,
      },
      phonenumber:{
        type:Number,
        require:true
      }
  })
  const whishlistproduct = mongoose.Schema({
    model:{
      type:String,
      require:true
  },
  category:{
      type: String,
      require:true
  },
  price:{
      type: Number,
      require:true
  },
  colour:{
      type: String,
      require:true
  },
  description:{
      type: String,
      require:true
  },
  image:{
      type:String,
      require:false
   
  },
  quantity: {
      type: Number,
      required: true,
      default: 1,
    },


  })
  const Orderlist = mongoose.Schema({
    userid:{
      type:String,
      require:false
  },
    model:{
      type:String,
      require:true
  },
  category:{
      type: String,
      require:true
  },
  price:{
      type: Number,
      require:true
  },
  discountprice: {
    type: Number,
    default: 0, // Initialize discountprice to 0
    require: false
},
  colour:{
      type: String,
      require:true
  },
  description:{
      type: String,
      require:true
  },
  image:{
      type:String,
      require:false
   
  },
  quantity: {
      type: Number,
      required: true,
      default: 1,
    },
    status:{
      type:String,
      required:false
    },
    orderstatus:{
      type:String,
      require:true
    },
    paymentmethod:{
      type:String,
      require:true
  },
  orderaddress:{
    type:String,
    require:true
},
addressname:{
  type:String,
  require:true
},
phonenumber:{
  type:String,
  require:true
},
createdAt: {  // Add the createdAt field
  type: Date,
  default: Date.now,  // Set the default value to the current date and time
},
Globalid:{
  type:String,
  require:false
},

  })

const users = mongoose.Schema({
    name:{
        type:String,
        require:true
    },
    email:{
        type: String,
        require:true
    },
    number:{
        type: String,
        require:true
    },
    password:{
        type: String,
        require:true
    },
    verified:{
      type:Number,
      require:false
    },
    status:{
      type:Number,
      require:true
    },
   wallet:{
    type:Number,
    require:true,
    default:500
   },
    cartitem: [cartItemSchema],
    address:[useraddress],
    defaultaddress:[defultaddress],
    whishlist:[whishlistproduct],
    Orders:[Orderlist]

})

const Users = mongoose.model("Users",users)

module.exports = Users

