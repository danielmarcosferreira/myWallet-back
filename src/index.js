import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import authRoutes from "./routes/auth.routes.js"
import dataRoutes from "./routes/data.routes.js"

dotenv.config()
const app = express()
app.use(cors())
app.use(express.json())
app.use(authRoutes)
app.use(dataRoutes)

const port = process.env.PORT || 5656

app.listen(port, () => console.log(`Server running in port ${port}`))