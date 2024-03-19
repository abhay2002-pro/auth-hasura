import express from "express";
const app = express()

import routes from "./routes.js"

app.use(express.json())

app.use("/", routes)

app.listen(3000, () => {
    console.log("listening on 3000")
})