const mongoose = require("mongoose")
const orders = mongoose.Schema({
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
    orderstatus:{
        type:String,
        require:true
    },
    paymentmethod:{
        type:String,
        require:true
    },
    addressname:{
        type:String,
        require:true
    },
    orderaddress:{
        type:String,
        require:true
    },
    phonenumber:{
        type:String,
        require:true
    },
    createdAt: {  
        type: Date,
        default: Date.now,  
      },
      Globalid:{
        type:String,
        require:false
      },

})

const Orders = mongoose.model("Orders",orders)

module.exports = Orders
