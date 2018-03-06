const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('./database/connect').module.mongoose;
const user = require('./model/schema').module.user;
const passport = require('passport');
const localStrategy = require('passport-local').Strategy;
const session = require('express-session');
const bcrypt = require('bcryptjs');
let token=''
app = express();
app.use(bodyParser.json());
app.use(passport.initialize());

app.use((req,res,next)=>{
    res.header("Access-Control-Allow-Headers","x-auth");
    res.header("Access-Control-Expose-Headers",'x-auth');
    next();
});



passport.serializeUser((user,done)=>{
    return done(null,user)
});

passport.deserializeUser((user,done)=>{
    return done(null,user);
});

passport.use(new localStrategy((username,password,done)=>{
    user.findOne({email:username},(err,user1)=>{
        if(user1)
        {
            console.log('email is coorecct',user1.email)
            bcrypt.compare(password,user1.password,(err,res)=>{
                if(res){
                    console.log('password is coorecct',res)
                    token=user1.token[0].token;
                    return done(null,user1);
                }
                else{
                    return done(null,false)
                }
            })
        }
        else{
            return done(null,false)
        }
    })
}));



app.post('/user-login',passport.authenticate('local',{
    successRedirect: '/profile',
    failureRedirect: '/fail'
}));

app.get('/profile',(req,res)=>{
    // user.findOne({token: {$elemMatch:{token:token}}}).then((data)=>{
    //     res.send(data.email);
    // });
    console.log('profile');
    res.header('x-auth',token).send('success');
});

app.get('/fail',(req,res)=>{
    res.send("error");
});

app.post('/user',(req,res)=>{
    let newUser = new user({
        name: req.body.name,
        password: req.body.password,
        email: req.body.email,
        mobile: req.body.mobile
    });
    newUser.save().then((data)=>{
        let token = newUser.genToken();
        token.then((t)=>{
            res.header('x-auth',t).send(data);
        }).catch((e)=>{
            console.log(e);
        });
    }).catch((e)=>{
        res.send(e);
    });
});



app.listen(3001,()=>{
   console.log("port: 3001");
});
