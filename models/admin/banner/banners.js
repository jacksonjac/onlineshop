const mongoose = require("mongoose")




const banners = mongoose.Schema({
    bannername:{
        type:String,
        require:true
    },
    images: {
        type: String,
        required: false
    },
    


   
})

const Banners = mongoose.model("bannerimages",banners)

module.exports = Banners
