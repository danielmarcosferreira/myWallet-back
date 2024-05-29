import Joi from "joi"

export const transactionsSchema = Joi.object({
    value: Joi.number().required(),
    description: Joi.string().min(3).required(),
    type: Joi.string().required().valid("plus", "minus"),
    user: Joi.object().required(),
    createdAt: Joi.string().required()
})