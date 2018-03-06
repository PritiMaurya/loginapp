const mongoose = require('../database/connect').module.mongoose;
const validate = require('mongoose-validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
var nameValidator = [
    validate({
        validator: 'isLength',
        arguments: [3, 50],
        message: 'Name should be between {ARGS[0]} and {ARGS[1]} characters',
    }),
    validate({
        validator: 'isAlphanumeric',
        passIfEmpty: true,
        message: 'Name should contain alpha-numeric characters only',
    })
]

var emailValidator = validate({
        validator: 'isEmail',
        message: '{VALUE} is not valid email'
    });


const schema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
        trim: true,
        validate: nameValidator
    },
    email:{
        type:String,
        required:true,
        trim: true,
        validate: emailValidator
    },
    password:{
        type:String,
        required:true,
        trim: true
    },
    mobile:{
        type:String,
        trim: true
    },
    isDelete:{
        type: Boolean,
        default: false
    },
    token:[{

        access:{
            type: String
        },
        token:{
            type: String
        }
    }]
});

schema.methods.genToken = function () {
    let user = this;
    let access = "auth";
    let token = jwt.sign({_id:user._id.toHexString(),access},"abc123").toString();
    user.token.push({access,token:token});

    return user.save().then(()=>{
            return token;
    })
}

schema.pre('save',function (next) {
    let user = this;
    if(user.isModified('password'))
    {
        bcrypt.genSalt(10,(err,salt)=>{
            if(err) return;
            bcrypt.hash(user.password,salt,(err,hash)=>{
                if(err) return;
                user.password = hash;
                next();
            })
        })
    }
    else
        next();
});


const user = mongoose.model('user',schema);

exports.module = {
    user
}


// {
//     "name":"priti",
//     "password":"123456",
//     "email":"p@123gmail.com",
//     "mobile":"9898347592"
// }
//	"name":"jay",
//suman@123gmail.com"
//"password":"199ddd6",