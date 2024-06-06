import { Router } from "express";
import { attData, deleteData, getMyData, postData } from "../controllers/data.controllers.js";

const router = Router()

router.get("/my-data", getMyData)
router.post("/newData", postData)
router.delete("/my-data/:id", deleteData)
router.put("/my-data/:id", attData)

export default router;