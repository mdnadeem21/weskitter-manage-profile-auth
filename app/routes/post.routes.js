const express = require('express');
const router = express.Router();
const postController = require('../../app/controller/post.controller')
const Auth = require('../../app/middleware/auth.check')
const uploadFiles = require('../../app/utils/uploadFiles')

router.use(Auth)

router.post('/create/post',uploadFiles.single('postImage'),postController.createPost)
router.get('/read/post',postController.getMyPosts)
router.get('/read/post/:id',postController.getPostById)
router.put('/update/post/:id',uploadFiles.single('postImage'),postController.updatePost)
router.delete('/delete/post/:id',postController.deletePost)


module.exports = router