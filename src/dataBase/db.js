import { MongoClient } from "mongodb";
import dotenv from "dotenv"

dotenv.config()
const mongoClient = new MongoClient(process.env.MONGO_URI)

try {
    await mongoClient.connect()
} catch (err) {
    console.log(`Entrou aqui ${err}`)
}

let db = mongoClient.db("myWallet")
export const userCollection = db.collection("users")
export const sessionCollection = db.collection("sessions")
export const dataCollection = db.collection("myData")
