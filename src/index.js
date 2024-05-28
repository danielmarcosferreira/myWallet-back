import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import { MongoClient, ObjectId } from "mongodb"
import Joi from "joi"
import bcrypt from "bcrypt"
import { v4 as uuidV4 } from "uuid"
import dayjs from "dayjs"

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

try {
    await mongoClient.connect()
} catch (err) {
    console.log(err)
}

const db = mongoClient.db("myWallet")
const userCollection = db.collection("users")
const sessionCollection = db.collection("sessions")
const dataCollection = db.collection("myData")

app.post("/sign-up", async (req, res) => {
    const user = req.body

    try {
        const userExists = await userCollection.findOne({ email: user.email })
        if (userExists) {
            return res.status(409).send({ message: "Email already in use" })
        }

        const { error } = newUSerScheme.validate(user, { abortEarly: false })
        if (error) {
            const errors = error.details.map(detail => detail.message)
            return res.status(400).send(errors)
        }

        const hashPassword = bcrypt.hashSync(user.password, 10)

        delete user.confirmPass

        await userCollection.insertOne({ ...user, password: hashPassword })
        res.status(201)
    } catch (err) {
        console.log(err)
        return res.sendStatus(500)
    }
    res.send()
})

app.post("/sign-in", async (req, res) => {
    const { email, password } = req.body

    const token = uuidV4()

    try {
        const userExists = await userCollection.findOne({ email })
        if (!userExists) {
            return res.status(401).send({ message: "User not found" })
        }

        const isPasswordOk = bcrypt.compareSync(password, userExists.password)
        if (!isPasswordOk) {
            return res.sendStatus(401)
        }

        const { error } = userLoginScheme.validate(req.body, { abortEarly: false })
        if (error) {
            const errors = error.details.map(detail => detail.message)
            return res.status(400).send(errors)
        }

        await sessionCollection.insertOne({
            token,
            userId: userExists._id
        })

        const returnUser = { token, name: userExists.name, email }
        return res.send(returnUser)

    } catch (err) {
        console.log(err)
        return res.sendStatus(500)
    }
})

app.post("/newData", async (req, res) => {
    const { price, description } = req.body
    const { authorization } = req.headers
    const date = new dayjs().format("DD/MM")

    const token = authorization?.replace("Bearer ", "")
    if (!token) {
        return res.sendStatus(401)
    }

    try {
        const session = await sessionCollection.findOne({ token })
        if (!session) {
            return res.status(401).send({ message: "Session not found" })
        }

        const user = await userCollection.findOne({ _id: session.userId })
        if (!user) {
            return res.status(401).send({ message: "User not found" })
        }

        await dataCollection.insertOne({
            type: "plus",
            date,
            price,
            description,
            userId: user._id
        })

        return res.status(201).send({ message: "Data sent" })
    } catch (err) {
        console.log(err)
        return res.sendStatus(500)
    }
})

app.post("/newOutput", async (req, res) => {
    const { price, description } = req.body
    const { authorization } = req.headers
    const date = new dayjs().format("DD/MM")

    const token = authorization?.replace("Bearer ", "")
    if (!token) {
        return res.sendStatus(401)
    }

    try {
        const session = await sessionCollection.findOne({ token })
        if (!session) {
            return res.status(401).send({ message: "Session not found" })
        }

        const user = await userCollection.findOne({ _id: session.userId })
        if (!user) {
            return res.status(401).send({ message: "User not found" })
        }

        await dataCollection.insertOne({
            type: "minus",
            date,
            price: price * -1,
            description,
            userId: user._id
        })
        return res.status(201).send({ message: "Data sent" })
    } catch (err) {
        console.log(err)
        return res.sendStatus(500)
    }
})

app.get("/my-data", async (req, res) => {
    const { authorization } = req.headers

    const token = authorization?.replace("Bearer ", "")
    if (!token) {
        return res.sendStatus(401)
    }

    try {
        const session = await sessionCollection.findOne({ token })
        if (!session) {
            return res.sendStatus(401)
        }

        const user = await userCollection.findOne({ _id: session.userId })
        if (!user) {
            return res.sendStatus(401)
        }

        const allData = await dataCollection.find({ userId: user._id }).toArray()

        res.send(allData)

    } catch (err) {
        console.log(err)
        return res.sendStatus(500)
    }
})

app.delete("/my-data/:id", async (req, res) => {
    const { id } = req.params

    try {
        if (!id) {
            return res.sendStatus(401)
        }

        const item = await dataCollection.deleteOne({ _id: new ObjectId(id) })
        if (!item) {
            return res.sendStatus(401)
        }
        return res.status(200).send({ message: "Document deleted successfully" })
    } catch (err) {
        console.log(err)
        return res.sendStatus(500)
    }
})


app.listen(5656, () => console.log("Server running in port 5656"))