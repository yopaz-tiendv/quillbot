const express = require('express')
const path = require('path')
const indexRouter = require('./routes')
const cookieParser = require('cookie-parser')
const app = express()
const port = 3000

app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())

app.use('/', indexRouter)

app.listen(port, () => {
    console.log(`App listening on port ${port}`)
})
