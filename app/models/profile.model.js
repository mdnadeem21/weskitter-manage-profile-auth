const mongoose = require("mongoose")
const Schema = mongoose.Schema

const ProfileSchema = new Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true,
        min:6
    },
    profileImage:{
        type:String,
        default:"profile-image"
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    isVerified: {
        type: Boolean,
        default: false
    }
},{
    timestamps:true
})

const ProfileModel = mongoose.model('manage-profile',ProfileSchema)
module.exports = ProfileModel