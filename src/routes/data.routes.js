import { Router } from "express";
import { attData, deleteData, getMyData, postData } from "../controllers/data.controllers.js";
import { authValidation } from "../middlewares/authValidation.middleware.js";

const router = Router()

router.use(authValidation)

router.get("/my-data", getMyData)
router.post("/newData", postData)
router.delete("/my-data/:id", deleteData)
router.put("/my-data/:id", attData)

export default router;