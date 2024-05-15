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

app.post("/sign-up", async (req, res) => {
    const user = req.body

    try {
        const userExists = await userCollection.findOne({email: user.email})
        if (userExists) {
            return res.status(409).send({message: "Email already in use"})
        }

        const {error} = newUSerScheme.validate(user, {abortEarly: false})
        if (error) {
            const errors = error.details.map(detail => detail.message)
            return res.status(400).send(errors)
        }

        const hashPassword = bcrypt.hashSync(user.password, 10)

        delete user.confirmPass

        await userCollection.insertOne({...user, password: hashPassword})
        res.status(201)
    } catch (err) {
        console.log(err)
        return res.sendStatus(500)
    }
    res.send()
})

app.listen(5656, () => console.log("Server running in port 5656"))