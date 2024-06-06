import Joi from "joi"

export const userLoginScheme = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
})

export const newUserScheme = Joi.object({
    name: Joi.string().min(3).max(15).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(5).required(),
    confirmPass: Joi.string().min(5).required().valid(Joi.ref("password"))
}).with("password", "confirmPass")