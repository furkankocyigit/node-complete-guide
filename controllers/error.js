exports.get404 = (req,res,next) =>{
    res.render('404',
    {
        pageTitle:'Error Page',
        path: '/404',
        isAuthenticated: req.session.isLoggedIn
    })
}

exports.get500 = (req,res,next) =>{
    res.render('500',
    {
        pageTitle:'Error Page',
        path: '/500',
        isAuthenticated: req.session.isLoggedIn
    })
}