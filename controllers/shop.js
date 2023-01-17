const Product = require('../models/product')
const Cart = require('../models/cart')


exports.getProducts = (req,res,next) =>{
    Product.findAll()
        .then(products => {
            res.render('shop/product-list',{
                prods:products,
                pageTitle:'All Products', 
                path:'/products'
            })
        })
        .catch(err => {
            console.log(err)
        })
}

exports.getProduct = (req,res,next) => {
    const prodId = req.params.productId;
    Product.findByPk(prodId)
        .then(product => {
            res.render('shop/product-detail',{
                product:product,
                pageTitle: product.title,
                path:'/products'
            })
        })
        .catch(err => console.log(err))
    
}

exports.getIndex = (req,res,next) =>{
    Product.findAll()
    .then(products => {
        res.render('shop/index',{
            prods:products,
            pageTitle:'Shop', 
            path:'/'
        })
    })
    .catch(err => {
        console.log(err)
    })
}

exports.getCart = (req,res,next) =>{
    Cart.getCart(cart=>{
        Product.fetchAll(products => {
            const cartProducts = []
            for(product of products){
                const cartProductData = cart.products.find(prod => prod.id === product.id)
                if(cartProductData){
                    cartProducts.push({productData: product,qty: cartProductData.qty})
                }
            }
            res.render('shop/cart',{
                products:cartProducts,
                pageTitle:'Your Cart', 
                path:'/cart'
            })
        })
    })
}

exports.postCart = (req,res,next) => {
    const prodId = req.body.productId;

    Product.findById(prodId)
    .then(([product])=>{
        Cart.addProductToCart(prodId,product[0].price)
    })
    .catch(err => console.log(err))

    res.redirect('/cart')
}

exports.postCartDeleteProduct = (req,res,next) =>{
    const prodId = req.body.productId;

    Product.findById(prodId)
        .then(([product])=>{
            Cart.deleteProduct(prodId,product[0].price);
            res.redirect('/cart')
    })
        .catch(err => console.log(err))
}

exports.getOrders = (req,res,next) =>{
    Product.fetchAll(products => {
        res.render('shop/orders',{
            prods:products,
            pageTitle:'Your Orders', 
            path:'/orders'
        })
    })
}

exports.getCheckout = (req,res,next) =>{
    Product.fetchAll(products => {
        res.render('shop/checkout',{
            prods:products,
            pageTitle:'Checkout', 
            path:'/checkout'
        })
    })
}