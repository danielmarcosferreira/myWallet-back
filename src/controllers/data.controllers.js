import { sessionCollection, userCollection, dataCollection } from "../dataBase/db.js"
import dayjs from "dayjs"
import { ObjectId } from "mongodb"

export async function getMyData (req, res) {
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
}

export async function postData (req, res) {
    const { price, description, signal } = req.body
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
        let truePrice;
        if (signal === "minus") {
            truePrice = price * -1
        } else {
            truePrice = price
        }

        await dataCollection.insertOne({
            type: signal,
            date,
            price: truePrice,
            description,
            userId: user._id
        })

        return res.status(201).send({ message: "Data sent" })
    } catch (err) {
        console.log(err)
        return res.sendStatus(500)
    }
}

export async function deleteData (req, res) {
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
}

export async function attData (req, res) {
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
}