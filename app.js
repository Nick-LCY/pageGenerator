const parseVarsToObj = require("./processingUtils/generatePaperUtils/parseVarsToObj.cjs")
const fs = require("fs")
const express = require("express")
const parseVarsToObjs = require("./processingUtils/generatePaperUtils/parseVarsToObj.cjs")
const generateVars = require("./processingUtils/generatePaperUtils/generateVars.cjs")

const app = express()
const port = 8080

app.get('/', (req, res) => {
    res.send("Hello World!")
})

app.get('/process', async (req, res) => {
    var file = JSON.parse(await fs.readFileSync("multiple.json"))
    var varSpecificationList = parseVarsToObjs(file.vars)

    res.send(generateVars(varSpecificationList))
})

app.listen(port, () => {
    console.log(`http://localhost:${port}`)
})