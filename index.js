import express from "express";
const app = express()

import routes from "./routes.js"

app.use(express.json())

app.use("/", routes)

app.get("/health", (req, res)=> {
    res.status(200).json({
        "message": "success"
    })
})

app.listen(3000, () => {
    console.log("listening on 3000")
})