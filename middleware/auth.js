



const logged = async (req, res, next) => {
  try {


    if (req.session.admin_id) {
      next()
    } else {
      res.redirect("/admin/");
    }
   
  } catch (error) {
    console.log(error.message);
  }
};


const userlogged = async(req, res, next)=>{
  try {


    if (req.session.user_id) {
      next()
    } else {
      res.redirect("/login");
    }
   
  } catch (error) {
    console.log(error.message);
  }
};

     




module.exports = {
  logged,
  userlogged
  
};
