const { MongoClient, ObjectId } = require('mongodb')
const express = require('express')
const app = express()

const PORT = process.env.PORT || 5000

const url = 'mongodb://localhost:27017'
const mongoClient = new MongoClient(url)
const databaseName = 'social-media'
const collectionName = 'users'

app.use(express.json())

app.get('/', (req, res) => {
	res.redirect('/users')
})

const getCollection = async () => {
	try {
		await mongoClient.connect()
		const db = mongoClient.db(databaseName)
		return db.collection(collectionName)
	} catch (error) {
		return null
	}
}

// Handle GET /users
app.get('/users', async (req, res) => {
	try {
		const collection = await getCollection()
		if (req.query.id) {
			const { id } = req.query
			const user = await collection.findOne({ _id: ObjectId(id) })
			res.json(user)
		} else {
			const users = await collection.find().limit(10).toArray()
			res.send(users)
		}
		mongoClient.close()
	} catch (error) {
		res.status(500).send(error.message)
	}
})

// Handle POST /users
app.post('/users', async (req, res) => {
	try {
		const collection = await getCollection()
		await collection.insertOne(req.body)
		res.json({ message: 'Inserted successfully', user: req.body })
		mongoClient.close()
	} catch (error) {
		res.status(500).send(error.message)
	}
})

// Handle PUT /users
app.put('/users', async (req, res) => {
	try {
		const { id } = req.query
		const collection = await getCollection()
		const found = collection.find({ _id: ObjectId(id) })
		if (found) {
			await collection.updateOne({ _id: ObjectId(id) }, { $set: req.body })
			res.json({ message: 'User updated successfully' })
		} else {
			res.status(404).json({ message: 'User not found' })
		}
	} catch (error) {
		res.status(500).send(error.message)
	}
})

// Handle DELETE /users
app.delete('/users', async (req, res) => {
	try {
		const { id } = req.query
		const collection = await getCollection()
		const found = collection.find({ _id: ObjectId(id) })
		if (found) {
			await collection.deleteOne({ _id: ObjectId(id) })
			res.json({ message: 'User deleted successfully' })
		} else {
			res.status(404).json({ message: 'User not found' })
		}
	} catch (error) {
		res.status(500).send(error.message)
	}
})

app.get('/*', (req, res) => {
	res.send('Not found').status(404)
})

app.listen(PORT, () =>
	console.log(`Server started at http://localhost:${PORT}/`)
)
