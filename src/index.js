import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import { MongoClient } from "mongodb"
import Joi from "joi"
import bcrypt from "bcrypt"

const newUSerScheme = Joi.object({
    name: Joi.string().min(3).max(15).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(5).required(),
    confirmPass: Joi.string().min(5).required().valid(Joi.ref("password"))
}).with("password", "confirmPass")

const userLoginScheme = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
})

dotenv.config()
const app = express()
app.use(cors())
app.use(express.json())

const mongoClient = new MongoClient(process.env.MONGO_URI)

try{
    await mongoClient.connect()
} catch (err) {
    console.log(err)
}

const db = mongoClient.db("myWallet")
const userCollection = db.collection("users")

app.listen(5656, () => console.log("Server running in port 5656"))