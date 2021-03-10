const bcrypt=require('bcrypt')
const _=require('lodash');
const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const User = require('../schema/user');
const Admin = require('../schema/admin');
const jwt=require('jsonwebtoken')


//////////////////////authorization//////////////////////////
////////////////////create token with each login /////////////////////////



////////user login//////////
router.post('/userlogin',body('email').isLength({ min: 1 })
.withMessage('email is required'),
body('password').isLength({ min: 1 })
.withMessage('password is required')
, async function (req, res) {
    /////// validate req body
       const errors = validationResult(req); 
       if (!errors.isEmpty()) return res.status(400).send({error: errors.errors[0].msg });        
       
       //////////////chech if username is registered
       let user=await User.findOne({email:req.body.email})
       if(!user) return res.status(400).send('invalid email or password') 
       
       /////////// chech if password match usename password 
       const validPassword=await bcrypt.compare(req.body.password,user.password)
       if(validPassword===false)return res.status(400).send('invalid email or password') 

       //check mail verification 
       if (user.isActive != true) return res.status(404).send("Please verify your email to login.");
    
        /////////// create token by user id //////////
       const token=jwt.sign({_id:user._id},process.env.SECRET_KEY)
     return res.header('x-token',token).send({message:'user was logined successfully',email:user.email,
        token:token}) 
    
  })

///////////////// admin login /////////////////////
  router.post('/adminlogin',body('email').isLength({ min: 1 })
.withMessage('email is required'),
body('password').isLength({ min: 1 })
.withMessage('password is required')
, async(req, res) => {
    /////// validate req body
       const errors = validationResult(req); 
       if (!errors.isEmpty()) return res.status(400).send({error: errors.errors[0].msg });        
       
       //////////////chech if username is registered
       let admin=await Admin.findOne({email:req.body.email})
       if(!admin) return res.status(400).send('invalid email or password') 
       
       /////////// chech if password match usename password 
       const validPassword=await bcrypt.compare(req.body.password,admin.password)
       console.log(validPassword)
       console.log(req.body.password ,admin.password)
       if(validPassword===false) return res.status(400).send('invalid email or password') 

       /////////// create token by admin id //////////
       const token=jwt.sign({_id:admin._id},process.env.SECRET_KEY)
     return res.header('x-token',token).send({message:'admin was logined successfully',email:admin.email,
        token:token}) 
    
  })


  module.exports=router