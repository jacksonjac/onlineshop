const mongoose = require("mongoose")




const products = mongoose.Schema({
    model:{
        type:String,
        require:true
    },
    category: {
        type: mongoose.Schema.Types.ObjectId, // Reference to Category schema
        ref: "Category", 
        required: true
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
    status:{
        type:Number,
        require:false

    },
    images: [{
        type: String,
        required: false
    },
]

    


   
})

const Products = mongoose.model("products",products)

module.exports = Products
