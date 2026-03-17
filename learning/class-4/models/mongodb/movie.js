import { MongoClient, ObjectId, ServerApiVersion } from 'mongodb'
const uri =
  'mongodb+srv://user:???@cluster0.dhwmu.mongodb.net/?retryWrites=true&w=majority'

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true
  }
})

async function connect() {
  try {
    await client.connect()
    const database = client.db('database')
    return database.collection('movies')
  } catch (error) {
    console.error('Error connecting to the database')
    console.error(error)
    await client.close()
  }
}

export class MovieModel {
  static async getAll({
    genre,
    year,
    director,
    minRate,
    page = 1,
    limit = 10
  }) {
    const db = await connect()

    // 1. Initialize an empty query object that we will build based on the provided filters
    const query = {}

    // 2. Build the query dynamically based on the presence of each filter
    if (genre) {
      // Support for multiple genres by allowing genre to be an array or a single value
      const genresArray = Array.isArray(genre) ? genre : [genre]
      query.genre = {
        $in: genresArray.map((g) => new RegExp(g, 'i'))
      }
    }

    if (year) {
      query.year = parseInt(year, 10) // Exact match
    }

    if (director) {
      query.director = { $regex: director, $options: 'i' } // Partial search and case-insensitive
    }

    if (minRate) {
      query.rate = { $gte: parseFloat(minRate) } // Greater than or equal to minRate
    }

    // 3. Pagination Logic
    const pageNumber = parseInt(page, 10)
    const limitNumber = parseInt(limit, 10)
    const skip = (pageNumber - 1) * limitNumber

    // 4. Execute the query with find, skip and limit
    const movies = await db.find(query).skip(skip).limit(limitNumber).toArray()

    // 5. Count total items matching the query for pagination metadata
    const totalItems = await db.countDocuments(query)

    // 6. Return an object with metadata and the actual data
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
    const db = await connect()
    const objectId = new ObjectId(id)
    return db.findOne({ _id: objectId })
  }

  static async create({ input }) {
    const db = await connect()

    const { insertedId } = await db.insertOne(input)

    return {
      id: insertedId,
      ...input
    }
  }

  static async delete({ id }) {
    const db = await connect()
    const objectId = new ObjectId(id)
    const { deletedCount } = await db.deleteOne({ _id: objectId })
    return deletedCount > 0
  }

  static async update({ id, input }) {
    const db = await connect()
    const objectId = new ObjectId(id)

    const { ok, value } = await db.findOneAndUpdate(
      { _id: objectId },
      { $set: input },
      { returnNewDocument: true }
    )

    if (!ok) return false

    return value
  }
}
