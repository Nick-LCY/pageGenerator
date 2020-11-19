const express = require("express")
const connection = require("./database/connectToDatabase.cjs")
const PaperProcessor = require("./processingUtils/generatePaperUtils/PaperProcessor.cjs")
var bodyParser = require('body-parser')

const { v4: uuidv4 } = require("uuid")

const app = express()
const port = 8080

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

app.get('/', (req, res) => {
    res.send(uuidv4())
})

app.get('/process', (req, res) => {
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

app.post('/saveSpecification', (req, res) => {
    connection.query(`insert into specifications (name, content) values('${req.body.name}', '${req.body.content}')`
        , (err, rows) => {
            if (err) throw err
            console.log(rows)
            res.send(`insert at: ${rows.insertId}`)
        })
})

app.listen(port, () => {
    console.log(`http://localhost:${port}`)
})