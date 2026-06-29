const express = require('express')
const ProfileController = require('../controller/profile.controller')
const Auth = require("../middleware/auth.check")
const router=express.Router();
const ProfileImage=require('../../app/utils/uploadFiles')

router.post('/register',ProfileImage.single('profileImage'),ProfileController.register)
router.get('/login',ProfileController.login)


// router.use(Auth) 
router.get('/user/me/:id',Auth,ProfileController.getProfile)

router.get('/admin/login',ProfileController.adminlogin)
module.exports=router;