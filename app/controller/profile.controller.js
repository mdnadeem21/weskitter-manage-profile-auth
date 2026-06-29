const fs = require('fs');
const path = require('path');
const bcryptjs = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Profile = require('../../app/models/profile.model')
const { uploadFileOnCloudinary } = require('../utils/uploadFilesOnCloudinary');
const { error } = require('console');

class ProfileController {
  async register(req, res) {
    console.log("User Resgister...")
    try {
      const { name, email, profileImage, password } = req.body;
      if (!name || !email || !password) {
        return res.status(400).json({
          status: false,
          message: "All fields are required",
        });
      }
      const profileExist = await Profile.findOne({ email });
      if (profileExist) {
        return res.status(400).json({
          status: false,
          message: "Profile already exists",
        });
      }

      const salt = await bcryptjs.genSalt(10);
      const hashPassword = await bcryptjs.hash(password, salt);

      const profiledata = new Profile({
        name,
        email,
        profileImage,
        password: hashPassword,
      });

      if (req.file) {
        profiledata.profileImage = req.file.path
        const cloudinaryResponse = await uploadFileOnCloudinary(req.file.path)
        profiledata.profileImage = cloudinaryResponse.url;
      }

      const data = await profiledata.save();
      return res.status(200).json({
        status: true,
        message: "Profile registered successfully",
        data: data,
      });
    } catch (error) {
      return res.status(500).json({
        status: false,
        message: "something went wrong",
        error: error.message,
      });
    }
  }

  async login(req, res) {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        status: false,
        message: "All fields are required",
      });
    }

    const profileExist = await Profile.findOne({ email });
    if (!profileExist) {
      return res.status(400).json({
        status: false,
        message: "Profile does not exist",
      });
    }
    //console.log(profileExist);

    const isMatch = await bcryptjs.compare(password, profileExist.password);
    if (!isMatch) {
      return res.status(400).json({
        status: false,
        message: "Invalid credentials",
      });
    }

    const token = await jwt.sign({
      id: profileExist._id,
      name: profileExist.name,
      email: profileExist.email,
      profileImage: profileExist.profileImage,
    }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    return res.status(200).json({
      status: true,
      message: "Login successful",
      user: {
        id: profileExist._id,
        name: profileExist.name,
        email: profileExist.email,
        profileImage: profileExist.profileImage,
      },
      token: token,
    });
  }

  async getProfile(req, res) {
    try {
      const userId = req.user.id;
      const userProfile = await Profile.findById(userId)
      if (!userProfile) {
        return res.status(404)
          .json({ message: 'User profile not found' });
      }

      res.status(200).json({
        success: true,
        data: userProfile
      });
    } catch (error) {
      res.status(500)
        .json({
          status: false,
          message: 'Internal Server Error from gettig profile : '
        });
    }
  }

  async adminlogin(req, res) {
    try {
      const { email, password } = req.body
      if (!email || !password) {
        console.log('all fields are required');
        return res.status(400).json({
          status: false,
          message: "all fields are required",
        });
      }
      const profileExist = await Profile.findOne({ email })
      //console.log(userExist);
      if (!profileExist) {
        console.log('user does not exist');
        return res.status(400).json({
          status: false,
          message: "profile doesnot exist",
        });
      }
      const isMatch = await bcryptjs.compare(password, profileExist.password)
      if (!isMatch) {
        console.log('invalid credentials');
        return res.status(400).json({
          status: false,
          message: "invalid credential",
        });
      }
      if (isMatch && profileExist.role == 'admin') {
        //create token
        const Token = await jwt.sign({
          id: profileExist._id,
          name: profileExist.name,
          email: profileExist.email,
          role: profileExist.role
        }, process.env.ADMIN_JWT_SECRET, { expiresIn: '1d' })


        if (Token) {
          res.cookie('admintoken', Token, { maxAge: 86400000, httpOnly: true });
          return res.status(200)
            .json({
              status: true,
              message: "Login successful as an admin",
              user: {
                id: profileExist._id,
                name: profileExist.name,
                email: profileExist.email,
                profileImage: profileExist.profileImage,
              },
              token: Token,
            })
        } else {
          console.log('something went wrong in admin token');
          return res.status(401)
                    .json({
                      status:false,
                      message:"Something went wrong in admin token",
                      error:error.message
                    })
        }


      }
      console.log('admin logon failed');
      // return res.redirect('/admin/login')
    } catch (error) {
        console.log(error.message);
    }
  }
}

module.exports = new ProfileController