const parseVarsToObj = require("./processingUtils/generatePaperUtils/parseVarsToObj.cjs")
const fs = require("fs")
const express = require("express")
const parseVarsToObjs = require("./processingUtils/generatePaperUtils/parseVarsToObj.cjs")
const generateVars = require("./processingUtils/generatePaperUtils/generateVars.cjs")
const connection = require("./database/connectToDatabase.cjs")

const app = express()
const port = 8080


connection.connect();
app.get('/', (req, res) => {
    res.send("Hello World!")
})

app.get('/process', async (req, res) => {
    var name = "Hello World"
    // var file = JSON.parse(await fs.readFileSync("multiple.json"))

    var file, varSpecificationList
    connection.query(`select content from specifications where name = '${name}'`, (err, rows, fields) => {
        if (err) throw err
        file = JSON.parse(rows[0].content)
        varSpecificationList = parseVarsToObjs(file.vars)
        res.send(generateVars(varSpecificationList))
    })
    console.log("finished!")
})

app.listen(port, () => {
    console.log(`http://localhost:${port}`)
})