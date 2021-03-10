const bcrypt=require('bcrypt')
const _=require('lodash');
const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Admin = require('../schema/admin');
const auth=require('../middleware/auth')



/////////////////get all admins ////////////////////////
router.get('/', auth, async(req, res)=> {
  
    const admins= await Admin.find();
    
     return res.send('registered Admins :' + admins)
 
    })

///////////////register a new admin ////////////////////////////

    router.post('/register',body('email').isLength({ min: 1 })
    .withMessage('email is required'),
    body('password').isLength({ min: 4 })
    .withMessage('password is required')
    , async(req, res) => {
           ///// body validation
           const errors = validationResult(req); 
           if (!errors.isEmpty()) return res.status(400).send({error: errors.errors[0].msg });        
           
           ////// chech if Admin register before
           let isAdmin=await Admin.findOne({email:req.body.email})
           if(isAdmin) return res.status(400).send('this email is already registered') 
           ////// create new Admin
           const admin =new Admin(_.pick(req.body,['email','password']))
           //// hashing password
           const salt=await bcrypt.genSalt(10);
           admin.password=await bcrypt.hash(admin.password,salt)
          
           ///// save new admin
        try{
            await admin.save()
            return res.send({message:'admin was registered successfully'}) 
        }
        catch(err){
            res.send({error:err}) 
        }
        
      })

      module.exports=router