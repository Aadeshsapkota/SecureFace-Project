import { Router } from "express";
import { registerUser , loginUser ,verifyUserCode, registerFace, loginWithFace} from "../controller/user.controller.js"

const router = Router()

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route('/register-face').post(registerFace);
router.route('/login-face').post(loginWithFace);
router.route('/verify').post( verifyUserCode); 



export default router;