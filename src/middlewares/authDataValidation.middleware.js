import { sessionCollection, userCollection } from "../dataBase/db.js";

export async function authValidation(req, res, next) {
    const { authorization } = req.headers
    let user;

    try {
        const token = authorization?.replace("Bearer ", "")
        if (!token) {
            return res.status(401).send({ message: "Token not founded" })
        }
        const session = await sessionCollection.findOne({ token })
        if (!session) {
            return res.status(401).send({ message: "Session not found" })
        }

        user = await userCollection.findOne({ _id: session.userId })
        if (!user) {
            return res.status(401).send({ message: "User not found" })
        }

    } catch (err) {
        console.log(err)
    }

    req.user = user;

    next()
}