const express = require('express')
const bodyParser = require('body-parser')
const path = require('path')
const mongoose = require('mongoose')

const User = require('./models/user')

const adminRoutes= require('./routes/admin')
const shopRoutes = require('./routes/shop')
const errorController = require('./controllers/error')


const app = express();


app.set('view engine','ejs');
app.set('views','views')

app.use(bodyParser.urlencoded({extended:false}))
app.use(express.static(path.join(__dirname,'public')))

app.use((req,res,next) => {
    User.findById("63d295b4868dfa7296475173")
        .then(user =>{
            req.user = user;
            next();
        })

        .catch(err => console.log(err))        
})

app.use('/admin',adminRoutes)

app.use(shopRoutes)

app.use(errorController.get404)

mongoose.connect('mongodb+srv://furkankocyigit58:furkan123@mongodb-cluster.k3jufzl.mongodb.net/shop?retryWrites=true&w=majority')
    .then(result => {
        User.findOne().then( user =>{
            if(!user){
                const user = new User({
                    name:'Furkan',
                    email:'test@email.com',
                    cart:{items:[]}
                })
                user.save()
            }
        })
        app.listen(3000)

}).catch(err=>{
    console.log(err)
})