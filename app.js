const express = require('express')
const bodyParser = require('body-parser')
const path = require('path')

const User = require('./models/user')

const adminRoutes= require('./routes/admin')
const shopRoutes = require('./routes/shop')
const errorController = require('./controllers/error')
const mongoConnect = require('./util/database').mongoConnect;


const app = express();


app.set('view engine','ejs');
app.set('views','views')

app.use(bodyParser.urlencoded({extended:false}))
app.use(express.static(path.join(__dirname,'public')))

app.use((req,res,next) => {
    User.findById("63caa5fe59be6c0354a91e21")
        .then(user =>{
            req.user = new User(user.name,user.email,user.cart,user._id);
            next();
        })

        .catch(err => console.log(err))        
})

app.use('/admin',adminRoutes)

app.use(shopRoutes)

app.use(errorController.get404)

mongoConnect(() =>{
    app.listen(3000);
})