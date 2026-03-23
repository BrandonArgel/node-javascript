import mysql from 'mysql2/promise'

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  port: 3306,
  password: '',
  database: 'movies_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
})

export class MovieModel {
  static async getAll({
    genres,
    year,
    directors,
    minRate,
    page = 1,
    limit = 10
  }) {
    const conditions = []
    const values = []
    let joins = ''

    if (genres) {
      joins += ` 
        JOIN movie_genres mg ON m.id = mg.movie_id 
        JOIN genre g ON mg.genre_id = g.id 
      `
      if (Array.isArray(genres)) {
        conditions.push(`g.name IN (${genres.map(() => '?').join(',')})`)
        values.push(...genres)
      } else {
        conditions.push(`g.name = ?`)
        values.push(genres)
      }
    }

    if (year) {
      conditions.push(`m.year = ?`)
      values.push(year)
    }

    if (directors) {
      if (Array.isArray(directors)) {
        const likeConditions = directors
          .map(() => `m.directors LIKE ?`)
          .join(' OR ')
        conditions.push(`(${likeConditions})`)
        values.push(...directors.map((dir) => `%${dir}%`))
      } else {
        conditions.push(`m.directors LIKE ?`)
        values.push(`%${directors}%`)
      }
    }

    if (minRate) {
      conditions.push(`m.rate >= ?`)
      values.push(minRate)
    }

    const whereClause =
      conditions.length > 0 ? ` WHERE ${conditions.join(' AND ')}` : ''

    const dataQuery = `
      SELECT DISTINCT BIN_TO_UUID(m.id) as id, m.title, m.year, m.directors, m.duration, m.poster, m.rate 
      FROM movie m
      ${joins}
      ${whereClause}
      LIMIT ? OFFSET ?
    `

    const parsedLimit = Number(limit)
    const offset = (Number(page) - 1) * parsedLimit

    const dataValues = [...values, parsedLimit, offset]

    const countQuery = `
      SELECT COUNT(DISTINCT m.id) as totalRecords 
      FROM movie m
      ${joins}
      ${whereClause}
    `

    const [dataResult, countResult] = await Promise.all([
      pool.query(dataQuery, dataValues),
      pool.query(countQuery, values)
    ])

    const rows = dataResult[0]
    const totalRecords = countResult[0][0].totalRecords

    return {
      movies: rows,
      totalRecords: Number(totalRecords)
    }
  }

  static async getById({ id }) {
    const [rows] = await pool.query(
      `
    SELECT BIN_TO_UUID(id) as id, title, year, director, duration, poster, rate 
    FROM movie 
    WHERE id = UUID_TO_BIN(?)
  `,
      [id]
    ) // Id replaces the ? in the query

    return rows[0]
  }

  static async create({ input }) {
    const { title, year, directors, duration, poster, rate } = input

    // MySQL generates the ID automatically
    const [result] = await pool.query(
      `
    INSERT INTO movie (title, year, directors, duration, poster, rate) 
    VALUES (?, ?, ?, ?, ?, ?)
  `,
      [title, year, directors, duration, poster, rate]
    )

    return result.affectedRows === 1
  }

  static async update({ id, input }) {
    const { title, year, directors, duration, poster, rate } = input

    const [result] = await pool.query(
      `
    UPDATE movie 
    SET title = ?, year = ?, directors = ?, duration = ?, poster = ?, rate = ?
    WHERE id = UUID_TO_BIN(?)
  `,
      [title, year, directors, duration, poster, rate, id]
    )

    return result.affectedRows > 0
  }

  static async delete({ id }) {
    const [result] = await pool.query(
      `
    DELETE FROM movie 
    WHERE id = UUID_TO_BIN(?)
  `,
      [id]
    )

    return result.affectedRows > 0
  }
}
