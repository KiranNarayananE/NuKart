
const admin= (req,res,next)=>{
    if(req.session.adminlogin){
    next();
}
else{
    res.redirect("/admin")
}
}
module.exports=admin