import bcrypt from "bcrypt"
import { v4 as uuidV4 } from "uuid"
import { userCollection, sessionCollection } from "../dataBase/db.js";

export async function signUp(req, res) {
    const newUser = res.locals.user

    try {
        const hashPassword = bcrypt.hashSync(newUser.password, 10)

        delete newUser.confirmPass

        await userCollection.insertOne({ ...newUser, password: hashPassword })
        res.status(201)
    } catch (err) {
        console.log(err)
        return res.sendStatus(500)
    }
    res.send()
}

export async function signIn(req, res) {
    const user = res.locals.user
    const token = uuidV4()

    try {
        await sessionCollection.insertOne({
            token,
            userId: user._id
        })

        const returnUser = { token, name: user.name, email: user.email }
        return res.send(returnUser)

    } catch (err) {
        console.log(err)
        return res.sendStatus(500)
    }

}