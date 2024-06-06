import bcrypt from "bcrypt"
import { v4 as uuidV4 } from "uuid"
import { userCollection, sessionCollection } from "../dataBase/db.js";
import { newUserScheme, userLoginScheme } from "../models/users.model.js"

export async function signUp(req, res) {
    const user = req.body

    try {
        const userExists = await userCollection.findOne({ email: user.email })
        if (userExists) {
            return res.status(409).send({ message: "Email already in use" })
        }

        const { error } = newUserScheme.validate(user, { abortEarly: false })
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
}

export async function signIn(req, res) {
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

}