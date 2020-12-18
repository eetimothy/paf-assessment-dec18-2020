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
const { mkQuery } = require('./db_utils')

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
const MONGO_DB = 'picsAndWords' //change later
const MONGO_COLLECTION = 'words' // change later
const mongoClient = new MongoClient(MONGO_URL, {
    useNewUrlParser: true, useUnifiedTopology: true
})

//digitalocean database setup
const s3 = new AWS.S3({
    endpoint: new AWS.Endpoint('sfo2.digitaloceanspaces.com'),
    accessKeyId: process.env.ACCESS_KEY,
    secretAccessKey: process.env.SECRET_ACCESS_KEY
})

//upload to S3
const submission = (params, image) => {
	return {
		ts: new Date(),
		title: params.title,
		comments: params.comments,
		picture: parseFloat(params.picture),
		image
	}
}

const readFile = (path) => new Promise(
	(resolve, reject) => 
		fs.readFile(path, (err, buff) => {
			if (null !=err)
				reject(err)
			else
				resolve(buff)
		})
)

const putObject = (file, buff, s3) => new Promise(
	(resolve, reject) => {
		const params = {
			Bucket: process.env.BUCKET_NAME,
			Key: file.filename,
			Body: buff,
			ACL: 'public-read',
			ContentType: file.mimetype,
			ContentLength: file.size
		}
		s3.putObject(params, (err, result) => {
				if (null != err)
					reject(err)
				else
					resolve(result)
		})
	}
)
const upload = multer({
	dest: process.env.TMP_DIR || './uploads'
})

const checker = mkQuery(`SELECT * FROM user WHERE user_id = ? AND password = ?`, pool)

app.post('/main', upload.single('my-img'), (req, res) => {
	//insert image
	console.log(req.body)
	console.log(req.file)
	

	res.on('finish', () => {
		// delete the temp file
		fs.unlink(req.file.path,() => { })
	})

	const doc = submission(req.body, req.file.filename)

	readFile(req.file.path)
	.then(buff => 
		putObject(req.file, buff, s3)
		)
	.then(() => 
		mongoClient.db(MONGO_DB).collection(MONGO_COLLECTION)
				.insertOne(doc)
	)
	.then(results => {
		console.info('insert results: ', results)
		res.status(200)
		res.json({id: results.ops[0]._id})
	})
	.catch(error => {
		console.error('insert error: ', error)
		res.status(500)
		res.json({error})
	})
})

//application/x-www.form-urlencoded
app.post('/login', express.urlencoded({ extended: true }),
    async (req, res) => {
		try{
			const username = req.body.username
			const password = req.body.password

			if (username && password) {
				const result = await checker([username, password])
				console.log(result)

				if(result[0].username == username && result[0].password == password ) {
					res.status(200)
					res.type('application/json')
					res.json({message: 'ok'})
				}
			} else {
				res.status(401)
			}
		console.info('>> payload: ', req.body)
		
		} catch(e) {
			res.status(500)
        	res.type('application/json')
        	res.json({ error: e })
		}
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
