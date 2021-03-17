const express = require('express');
const router = express.Router();
const {orders, validateOrder, validateOrderStatus} = require('../schema/order');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');


router.post('/', auth, async (req, res) => {
    
    const order =new orders({
        _user:req.user._id,
       totalPrice:req.body.totalPrice,
        productTitle:req.body.productTitle,
      
       status:req.body.status,
       
       
       });
      
     
      ///// save new user
   try{
       await orders.save()
      
      
      return res.send({message:'order added successfully'}) 
   }
   catch(err){
       res.send({error:err}) 
   }
   
})
// get all orders for admin
router.get('/orders', [auth, admin], async (req, res) => {
    const allOrders = await orders.find({});
    if (!allOrders) return res.send("orders don't exist.");
    res.send(allOrders);
})

// get all orders for user
router.get('/', auth, async (req, res) => {

    const allOrders = await orders.find({ _user: req.user._id });
    if (!allOrders) return res.send("orders don't exist.");
    res.send(allOrders);

})

//user to cancel if pending 
router.delete('/:id', auth, async (req, res) => {

    if (req.user._id != order._user) return res.status(405).send('method not allowed.');
    const order = await orders.findById(req.params.id);
    if (!order) return res.status(404).send("failed to find the order.");
    if (order.status != "pending") return res.status(405).send('method not allowed.');
    await orders.deleteOne({ _id: req.params.id });
    return res.send("order was deleted successfully");

})

//admin to modify order status
router.patch('/:id', [auth, admin], async (req, res) => {
    
    //check validation
    const order = await orders.findById({ _id: req.params.id });
    if (!order) return res.status(404).send("failed to find the order.");
    const { error, value } = validateOrderStatus(req.body);
    if (error) return res.status(404).send(error.details[0].message);
    let request = value;
    //update
    await orders.findByIdAndUpdate(req.params.id, request);
    res.status(200);
    res.json({ message: "order status was edited successfully", order: request });
})


module.exports = router;