const User  = require('../models/user')
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const sendGridTransport = require('nodemailer-sendgrid-transport')
const crypto = require('crypto')
//
const sgMail = require('@sendgrid/mail')
sgMail.setApiKey('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')

// const transporter = nodemailer.createTransport(sendGridTransport({
//     auth: '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'
// }))

exports.getLogin = (req,res,next) =>{
    let message = req.flash('error');
    message = message.length > 0 ? message[0] : null;

    res.render('auth/login',{
        path: '/login',
        pageTitle:'Login',
        errorMessage: message
    })
}

exports.getSignup = (req, res, next) => {
    let message = req.flash('error');
    message = message.length > 0 ? message[0] : null;

    res.render('auth/signup', {
      path: '/signup',
      pageTitle: 'Signup',
      errorMessage: message,
    });
    
  };

exports.postLogin = (req,res,next) =>{
    const email = req.body.email;
    const password = req.body.password;
    User.findOne({email: email})
    .then(user =>{
        if(!user){
            req.flash('error','Invalid email or password.')
            return res.redirect('login');
        }
        bcrypt.compare(password,user.password)
        .then(doMatch => {
            if(doMatch){
                req.session.user = user;
                req.session.isLoggedIn = true;
                return req.session.save(err => {
                    console.log(err);
                    res.redirect('/');
                 })
            }
            req.flash('error','Invalid email or password.')
            res.redirect('/login')
        })
        .catch(err => console.log(err))
    })
    .catch(err => console.log(err))
}

exports.postSignup = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    const confirmPassword = req.body.confirmPassword;

    User.findOne({email:email})
    .then(userDoc => {
        if(userDoc){
            req.flash('error','E-Mail is already exist, please pick different one')
            return res.redirect('/signup');
        }
        return bcrypt.hash(password,12)
            .then(hashedPassword =>{
                const user = new User({
                    email:email,
                    password:hashedPassword,
                    cart:{items:[]}
                })
                return user.save()
            })
            .then(result =>{
                res.redirect('/login')

                return sgMail.send({
                    to: email,
                    from:'furkankocyigit58@gmail.com',
                    subject:'Signup succeded!',
                    html: '<h1>You have successfully signed up!</h1>'
                }).catch((error) => {
                    console.error(error)
                })
            })
    })
    .catch(err => console.log(err))
};

exports.postLogout = (req,res,next) =>{

    req.session.destroy( err =>{
        console.log(err)
        res.redirect('/')
    })
}

exports.getReset = (req,res,next) =>{

    let message = req.flash('error');
    message = message.length > 0 ? message[0] : null;

    res.render('auth/reset', {
      path: '/reset',
      pageTitle: 'Reset Password',
      errorMessage: message,
    });
}


exports.postReset = (req,res,next) => {
    crypto.randomBytes(32,(err,buffer) =>{
        if(err){
            console.log(err);
            return res.redirect('/reset')
        }
        const token = buffer.toString('hex');
        User.findOne({email: req.body.email})
        .then(user => {
            if(!user){
                req.flash('error','No account with that email found');
                return res.redirect('/reset')
            }
            user.resetToken = token;
            user.resetTokenExpiration = Date.now() + 3600000;
            return user.save();
        }).then( result =>{
            res.redirect('/')

            sgMail.send({
                to: req.body.email,
                from:'furkankocyigit58@gmail.com',
                subject:'Password reset',
                html: `
                <p> You requested a password reset </p>
                <p> Click this <a href="http://localhost:3000/reset/${token}">link</a> to set a new password.</p>
                `
            }).catch((error) => {
                console.error(error)
            })
        })
        .catch(err => {
            console.log(err)
        })
    })
}

exports.getNewPassword = (req,res,next) => {
    const token = req.params.token;
    User.findOne({resetToken:token, resetTokenExpiration: {$gt:Date.now()}})
    .then(user => {
        let message = req.flash('error');
        message = message.length > 0 ? message[0] : null;

        res.render('auth/new-password', {
                    path: '/new-password',
                    pageTitle: 'New Password',
                    errorMessage: message,
                    userId: user._id.toString(),
                    passwordToken: token
        });
    })
    .catch(err => console.log(err))
    
}


exports.postNewPassword = (req,res,next) => {
    const newPassword = req.body.password;
    const userId = req.body.userId;
    const passwordToken = req.body.passwordToken;
    let resetUser;
    
    User.findOne({resetToken:passwordToken, resetTokenExpiration: {$gt:Date.now()}, _id:userId})
        .then(user => {
            resetUser = user;
            return bcrypt.hash(newPassword,12)
        }).then(hashedPassword => {
            console.log(resetUser)
            resetUser.password = hashedPassword;
            resetUser.resetToken = undefined;
            resetUser.resetTokenExpiration = undefined;

            return resetUser.save();
        }).then(result => {
            res.redirect('/login')
        })
        .catch( err => console.log(err))
}