import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import { ObjectId } from "mongodb"
import dayjs from "dayjs"
import authRoutes from "./routes/auth.routes.js"
import { userCollection, sessionCollection, dataCollection } from "./dataBase/db.js"

dotenv.config()
const app = express()
app.use(cors())
app.use(express.json())
app.use(authRoutes)

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

app.put("/my-data/:id", async (req, res) => {
    const { id } = req.params
    const option = req.body

    try {
        const optionFinded = await dataCollection.findOne({ _id: new ObjectId(id) })
        if (!optionFinded) {
            return res.status(400).send("Option not found")
        }

        await dataCollection.updateOne({ _id: new ObjectId(id) }, { $set: option })
        return res.send("Uptadeted option successfully")
    } catch (err) {
        console.log(err)
        return res.sendStatus(500)
    }
})


app.listen(5656, () => console.log("Server running in port 5656"))