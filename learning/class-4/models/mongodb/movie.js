import { MongoClient, ObjectId, ServerApiVersion } from 'mongodb'
import 'dotenv/config'

const uri = process.env.MONGODB_URI

if (!uri) {
  throw new Error(
    'Please set the MONGODB_URI environment variable in your .env file with your MongoDB connection string'
  )
}

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true
  }
})

let dbInstance = null

async function connect() {
  // If we already have a connection, return the existing instance
  if (dbInstance) {
    return dbInstance
  }

  try {
    // If no connection exists, connect to MongoDB Atlas
    await client.connect()
    console.log('📦 Successfully connected to MongoDB')

    // Save the database instance for future use
    const database = client.db('sample_mflix')
    dbInstance = database.collection('movies')

    return dbInstance
  } catch (error) {
    console.error('❌ Error connecting to the database:', error)
    throw new Error('Could not connect to the database')
  }
}

export class MovieModel {
  static async getAll({
    genres,
    year,
    director,
    minRate,
    page = 1,
    limit = 10
  }) {
    const collection = await connect()

    const query = {}

    if (genres) {
      const genresArray = Array.isArray(genres) ? genres : [genres]
      query.genres = { $in: genresArray.map((g) => new RegExp(g, 'i')) }
    }

    if (year) {
      query.year = parseInt(year, 10)
    }

    if (director) {
      query.directors = { $regex: director, $options: 'i' }
    }

    if (minRate) {
      query['imdb.rating'] = { $gte: parseFloat(minRate) }
    }

    const pageNumber = parseInt(page, 10)
    const limitNumber = parseInt(limit, 10)
    const skip = (pageNumber - 1) * limitNumber

    // Ejecutamos la consulta en la colección
    const movies = await collection
      .find(query)
      .skip(skip)
      .limit(limitNumber)
      .toArray()
    const totalItems = await collection.countDocuments(query)

    return {
      info: {
        totalItems,
        totalPages: Math.ceil(totalItems / limitNumber),
        currentPage: pageNumber,
        limit: limitNumber
      },
      results: movies
    }
  }

  static async getById({ id }) {
    const collection = await connect()
    const objectId = new ObjectId(id)
    return collection.findOne({ _id: objectId })
  }

  static async create({ input }) {
    const collection = await connect()

    const { insertedId } = await collection.insertOne(input)

    return {
      id: insertedId,
      ...input
    }
  }

  static async update({ id, input }) {
    const collection = await connect()
    const objectId = new ObjectId(id)

    const { ok, value } = await collection.findOneAndUpdate(
      { _id: objectId },
      { $set: input },
      { returnNewDocument: true }
    )

    if (!ok) return false

    return value
  }

  static async delete({ id }) {
    const collection = await connect()
    const objectId = new ObjectId(id)
    const { deletedCount } = await collection.deleteOne({ _id: objectId })
    return deletedCount > 0
  }
}
