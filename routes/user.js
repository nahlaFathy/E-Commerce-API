const bcrypt=require('bcrypt')
const _=require('lodash');
const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const User = require('../schema/user');
const auth=require('../middleware/auth')
const cloudinary=require('../middleware/cloudinary').upload
const upload=require('../middleware/upload')
const { sendMail } = require('../helpers/verifyMail');
let imageUrl;



/////////////////////////////// register new user //////////////////////////////////

router.post('/register'
,body('email').isLength({ min: 1 })
.withMessage('email is required'),
body('username').isLength({ min: 1 })
.withMessage('username is required'),
body('password').isLength({ min: 4 })
.withMessage('password is required')
, body('gender').isLength({ min: 1 })
.withMessage('gender is required')
, async(req, res) => {
       ///// body validation
       
       const errors = validationResult(req); 
       if (!errors.isEmpty()) return res.status(400).send({error: errors.errors[0].msg });        
       
       ////// chech if user register before
       let isUser=await User.findOne({username:req.body.username})
       if(isUser) return res.status(400).send('user already registered') 
       ///////////////check if image uploaded 
    
       ////// create new user
       const user =new User({
         email:req.body.email,
         username:req.body.username,
         password:req.body.password,
         gender:req.body.gender,
         isAdmin:req.body.isAdmin
        
        });
       //// hashing password
       const salt=await bcrypt.genSalt(10);
       user.password=await bcrypt.hash(user.password,salt)
      
       ///// save new user
    try{
        await user.save()
        sendMail(user.email, user.username, user._id);
       
       return res.send({message:'user was registered successfully'}) 
    }
    catch(err){
        res.send({error:err}) 
    }
    
  })
  router.patch('/image',auth,upload
  , async(req, res) => {
    const loginedID=req.user._id
    const user= await User.findById(loginedID);
         if (!req.files || _.isEmpty(req.files)) {
        return res.status(400)
            .send({error:"No file uploaded"})    }
        try {
        
         // await cloudinary.uploader.destroy(user.cloudinary_id);
          const image = await cloudinary(req.file.path);
      } catch (e) {
        console.log("err :", e);
        return next(e);
    }
    
    const updates={
      image:image.url||user.image,
      cloudinary_id:image.public_id||user.cloudinary_id      
     }
     user = await User.findByIdAndUpdate(loginedID, updates, {
       new: true
       });
     if(user)
       {res.setHeader("Access-Control-Allow-Origin", "*")
       return res.send({message:'user was edited successfully',image:user.image})
       }
     else
       return  res.send({message:'This user id is not exist'})
      
    })

/////////////////////// get user ////////////////////////////////
  router.get('/',auth, async(req, res)=> {
  
    const loginedID=req.user._id
    const user= await User.findById(loginedID);
     
     return res.send(user)
 
    })


///////////////////////// edit user by id///////////////////////////////

   router.patch('/edit', auth,async(req, res) => {
 
    console.log("im in",user)

    const user= await User.findByIdAndUpdate(loginedID,{
      $set:{
        email:req.body.email||user.email,
         username:req.body.username||user.username,
         password:req.body.password||user.password,
         gender:req.body.gender||user.gender 
      }
  },{new:true});
      if(user)
        return res.send({message:'user was edited successfully',user:user})
      else
        return  res.send({message:'This user id is not exist'})
    
       

   })

  /////////////////////// delete product by id//////////////////////

   router.delete('/delete',auth, async(req, res) => {
        const loginedID=req.user._id
        const user= await User.findById(loginedID);
        await cloudinary.uploader.destroy(user.cloudinary_id);
        await User.deleteOne(user)
        if(user) return res.send({message:'user deleted successfuly'})
   })

    //verify account via mail 
    router.get( '/verify/:id', async function (req, res) {

      const { id } = req.params;
  
      //Checkin if the user exists
      let verifiedUser = await User.findOne({ _id: id });
      if (!verifiedUser) return res.status(404).send("user doesn't exist.");
  
      //change state if exist to be active
      const activate = {
          isActive: true
      }
      await User.findByIdAndUpdate(id, activate);
  
      res.status(200);
      res.sendFile('views/activation.html', {root: __dirname });
  })
  
  
    module.exports=router