const {
    user}=require("../model/user")
const ifAdmin= (req,res,next)=>{
    if(req.session.adminlogin){
    next();
}
else{
    res.redirect("/admin")
}
}

const ifUserAxios= async(req,res,next)=>{
    if(req.session.loginuser){
        if (await user.findOne({ _id: req.session.userId, status: true })){
        next() 
        }
        else{
            req.session.destroy()
        }
}
else{
    
    res.send({msg_login:true})
}
}

const ifUser= async(req,res,next)=>{
    if(req.session.loginuser){
        if (await user.findOne({ _id: req.session.userId, status: true })){
        next() 
        }
        else{
            req.session.destroy()
        }
}
else{
    
    if(req.path=="/cart"){
        req.session.loginTocart=true
        
    }
    else if(req.path=="/wishList"){
        req.session.loginToWishList=true
    }
    res.redirect("/")
}
}
module.exports={ifAdmin,ifUserAxios,ifUser}