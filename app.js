const express = require("express")
const connection = require("./database/connectToDatabase.cjs")
const PaperProcessor = require("./processingUtils/generatePaperUtils/PaperProcessor.cjs")

const { v4: uuidv4 } = require("uuid")

const app = express()
const port = 8080

app.get('/', (req, res) => {
    res.send(uuidv4())
})

app.get('/process', async (req, res) => {
    // read URL query
    var query = req.query

    connection.query(`select content from specifications where name = '${query.name}'`,
        (err, rows) => {
            if (err) throw err
            let content = JSON.parse(rows[0].content)
            let paperProcessor = new PaperProcessor(content)
            res.send(paperProcessor.generatePaper(0))
        })
})

app.listen(port, () => {
    console.log(`http://localhost:${port}`)
})