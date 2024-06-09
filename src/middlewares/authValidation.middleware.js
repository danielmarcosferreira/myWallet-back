import bcrypt from "bcrypt"
import { newUserScheme, userLoginScheme } from "../models/users.model.js";
import { userCollection } from "../dataBase/db.js";

export async function signUpValidation(req, res, next) {
    const newUser = req.body

    const emailInUse = await userCollection.findOne({ email: newUser.email })
    if (emailInUse) {
        return res.status(409).send({ message: "Email already in use" })
    }

    const { error } = newUserScheme.validate(newUser, { abortEarly: false })
    if (error) {
        const errors = error.details.map(detail => detail.message)
        return res.status(400).send(errors)
    }

    res.locals.user = newUser;
    next()
}

export async function signInValidation(req, res, next) {
    const { email, password } = req.body
    let user;
    try {
        user = await userCollection.findOne({ email })
        if (!user) {
            return res.sendStatus(401)
        }

        const isPasswordOk = bcrypt.compareSync(password, user.password)
        if (!isPasswordOk) {
            return res.sendStatus(401)
        }

        const { error } = userLoginScheme.validate(req.body, { abortEarly: false })
        if (error) {
            const errors = error.details.map(detail => detail.message)
            return res.status(400).send(errors)
        }
    } catch (err) {
        console.log(err)
        return res.sendStatus(500)
    }
    res.locals.user = user;
    next()
}