const mongoose = require("mongoose")
const admin = mongoose.Schema({
    name:{
        type:String,
        require:true
    },
   
    password:{
        type: String,
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
    verified:{
        type:Number,
        require:false
    }
})

const Admin = mongoose.model("Admin",admin)

module.exports = Admin
