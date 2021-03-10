const _=require('lodash');
const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Product= require('../schema/product');
const auth=require('../middleware/auth')
const cloudinary=require('../middleware/cloudinary').upload
const upload=require('../middleware/upload')
let imageUrl;


//////////////////// add new product //////////////////////////////

router.post('/add',auth,upload,
body('title').isLength({ min: 1 })
.withMessage('title is required')
, body('price').isLength({ min: 1 })
.withMessage('price is required'),
 body('details').isLength({ min: 1 })
.withMessage('details is required')
, async(req, res) => {
       const errors = validationResult(req); 
       if (!errors.isEmpty()) return res.status(400).send({error: errors.errors[0].msg }); 
        ///////////////check if image uploaded 
        if (!req.files || _.isEmpty(req.files)) {
          return res.status(400)
              .send({error:"No file uploaded"})
      }
      try {
          
           image =  await cloudinary(req.file.path);
          
        } catch (e) {
          console.log("err :", e);
          return next(e);
      }
       const product =new Product({
          title:req.body.title,
          price:req.body.price,
          details:req.body.details,
          image:image.url,
         cloudinary_id: image.public_id
       })
    try{
        await product.save()
       res.send({message:'a new product is added successfully'}) 
    }
    catch(err){
        res.send({error:err}) 
    }
    
  })

  //////////////////// get product by id //////////////////////////////
  router.get('/:id',auth,  async(req, res)=> {
    
    const product= await Product.find({_id:req.params.id})
      if(product) return res.send('products :' + product)
 
    })

//////////////////////// get all products /////////////////////////////

router.get('/',auth,  async(req, res)=> {
     
    const products= await Product.find()
      if(products) return res.send('Products list :'+products)
 
    })

///////////////////////// edit product by id //////////////////////////////////

router.patch('/:id',auth, async(req, res) => {
       let product
        try{
           product= await Product.findById(req.params.id)
        }
       catch(ex)
       {
        return res.send({error:'this product id is not exist'})
       }
  
       await cloudinary.uploader.destroy(product.cloudinary_id);
       const image = await cloudinary(req.file.path);
          const updated= await Product.updateOne(product,{
            $set:{
             title:req.body.title,
             price:req.body.price,
             details:req.body.details,
             image:image.url||product.image,
             cloudinary_id:image.public_id||product.cloudinary_id  
            }
        },{new:true});
            if(updated)
              return res.send({message:'Product is edited successfully',product:product})

   })

  ///////////////////////// Delete product by id ////////////////////////

   router.delete('/:id',auth,async(req, res) => {

        const product= await Product.findById(req.params.id);
        if(!product) return res.send({error:'this product id is not exist'})
        await cloudinary.uploader.destroy(product.cloudinary_id);
        await Product.deleteOne(product)
        return res.send({message:'product deleted successfuly'})
               
       
   })

   module.exports=router;
