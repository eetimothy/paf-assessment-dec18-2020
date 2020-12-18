//load libraries
const morgan = require('morgan')
const express = require('express')
const cors = require('cors')
const AWS = require('aws-sdk')
const { MongoClient } = require('mongodb')
const multer = require('multer')
const mysql = require('mysql2/promise')
const multerS3 = require('multer-s3')
const fs = require('fs')

//configure PORT
const PORT = parseInt(process.argv[2]) || parseInt(process.env.PORT) || 3000

//start app
const app = express()
app.use(morgan('combined'))
app.use(cors())

//configure the databases
//MYSQL database setup
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'mario',
    password: process.env.DB_PASSWORD || 'q1w2e3r4',
    database: process.env.DB_NAME || 'paf2020',
    connectionLimit: 4,
    timezone: '+08:00'
})

//MONGO database setup
const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017'
const MONGO_DB = 'bgg' //change later
const MONGO_COLLECTION = 'reviews' // change later
const mongoClient = new MongoClient(MONGO_URL, {
    useNewUrlParser: true, useUnifiedTopology: true
})

//digitalocean database setup
const s3 = new AWS.S3({
    endpoint: new AWS.Endpoint('sfo2.digitaloceanspaces.com'),
    accessKeyId: process.env.ACCESS_KEY,
    secretAccessKey: process.env.SECRET_ACCESS_KEY
})






//start server only if both databases are connected
//IIFE
const p0 = (async () => {   //mysql connection
    const conn = await pool.getConnection()
    await conn.ping()
    conn.release()
    return true
})()

const p1 = (async () => {   //mongo connection
    await mongoClient.connect()
    return true
})()

const p2 = new Promise(
    (resolve, reject) => {
        if ((!!process.env.ACCESS_KEY) && (!!process.env.SECRET_ACCESS_KEY))
                resolve()
        else
                reject('S3 keys not found')
    }
)

Promise.all([ p0, p1, p2 ])
    .then((r) => {
        app.listen(PORT, () => {
            console.info(`Application started on port ${PORT} at ${new Date()}`)
        })
    })
    .catch(err => { console.error('Unable to connect: ', err) })
