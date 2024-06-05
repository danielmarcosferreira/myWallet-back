import { Router } from "express";

const router = Router();

router.post("/signUp", signUp)
router.post("/signIn", signIn)

export default router;