const mongoose = require('mongoose');

mongoose.set('useFindAndModify', false);
mongoose.set('useNewUrlParser', true);
mongoose.set('useCreateIndex', true);

/////////////check if connected to db or no ///////////////
mongoose.connect("mongodb+srv://Ecommerce:Ecommerceiti@cluster0.fvdln.mongodb.net/myFirstDatabase?retryWrites=true&w=majority" , 
{ useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('connected to MongodDB ...'))
    .catch((err) => console.error('can not connect to MongoDB', err))