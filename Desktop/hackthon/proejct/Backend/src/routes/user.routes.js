import { Router } from "express";
import { 
    continuewithGoogle,
    logoutUser,
     updatecoverImage,
      Updateavatar,
      createUser,
    loginUser, 
    getCurrentUser,
    refreshTokeenfun} from "../controllers/user.controller.js";

import { upload } from "../middleware/multer.middleware.js";
import { verifyjwt } from "../middleware/auth.middlewware.js";
const router=Router()

router.route("/continuewithgoogle").post(continuewithGoogle);
router.route('/logout').post(verifyjwt,logoutUser)
router.route('/updateCover_image').post(verifyjwt,upload.single("coverImage"),updatecoverImage)
router.route('/updateavatar').patch(verifyjwt,upload.single("avatar"),Updateavatar)
router.route('/createUser').post(upload.single("avatar"),createUser)
router.route('/login').post(loginUser)
router.route('/curent_user').get(verifyjwt,getCurrentUser)
router.route('/refresh').get(refreshTokeenfun)
export default router