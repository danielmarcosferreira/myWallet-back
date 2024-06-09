import { Router } from "express";
import { signUp, signIn } from "../controllers/auth.controllers.js";
import { signInValidation, signUpValidation } from "../middlewares/authValidation.middleware.js";

const router = Router();

router.post("/sign-up", signUpValidation, signUp)
router.post("/sign-in", signInValidation, signIn)

export default router;