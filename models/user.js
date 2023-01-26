const getDb = require('../util/database').getDb;
const mongodb = require('mongodb')
class User {
    constructor(username,email,cart,id){
        this.username = username;
        this.email = email
        this.cart = cart
        this._id = id ? new mongodb.ObjectId(id) : null;
    }

    save(){
        const db = getDb();
        let dbOperation;
        if(this._id){
            dbOperation = db.collection('users')
                        .updateOne({ _id: this._id},{$set:this})
        }
        else{
            dbOperation = db.collection('users').insertOne(this)
        }
        return dbOperation

    }

    addToCart(product){

        const cartProductIndex = this.cart.items.findIndex(cp =>{
            return cp.productId.toString() === product._id.toString();
        })

        let newQuantity = 1;
        const updatedCartItems = [...this.cart.items]

        if(cartProductIndex >=0){
            newQuantity = updatedCartItems[cartProductIndex].quantity + 1
            updatedCartItems[cartProductIndex].quantity = newQuantity
        }else{
            updatedCartItems.push({
                productId: new mongodb.ObjectId(product._id),
                quantity:newQuantity
            })
        }
        const updatedCart = {items: updatedCartItems }
        const db = getDb();
        return db.collection('users')
            .updateOne(
                {_id: new mongodb.ObjectId(this._id)},
                { $set: {cart: updatedCart}})
    }

    removeFromCart(prodId){
        const updatedCartItems = this.cart.items.filter(item => {
            return item.productId.toString()!== prodId.toString()})
        
        const db = getDb();
        return db.collection('users')
            .updateOne(
                {_id: new mongodb.ObjectId(this._id)},
                { $set: {cart: {items: updatedCartItems}}})

    }

    getCart(){
        const db = getDb();
        const productIds = this.cart.items.map( i=> {
            return i.productId;
        })

        return db.collection('products')
            .find({_id: { $in: productIds } })
            .toArray()
            .then(products => {
                return products.map(p => {
                    return{
                        ...p,
                        quantity: this.cart.items.find(i => {
                            return i.productId.toString() === p._id.toString();
                        }).quantity
                    }
                })
            })
    }

    addOrder(){
        const db = getDb();

        return this.getCart().then( products => {
            const order = {
                items: products,
                user:{
                    _id : new mongodb.ObjectId(this._id),
                    name: this.name
                }
            }
            return db.collection('orders').insertOne(order)
        })
        .then(result => {
                this.cart = {items: []}
                return  db.collection('users')
                            .updateOne(
                            {_id: new mongodb.ObjectId(this._id)},
                            { $set: {cart: {items: []}}})
            })
            
    }

    getOrders(){
        const db = getDb();
        return db.collection('orders')
                    .find({'user._id': new mongodb.ObjectId(this._id)})
                    .toArray()
    }

    static findById(prodId){
        const db = getDb();
        return db.collection('users').findOne({_id: new mongodb.ObjectId(prodId)} )
    }
}

module.exports = User;