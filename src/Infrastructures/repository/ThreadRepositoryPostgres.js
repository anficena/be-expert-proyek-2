const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const AddedThread = require('../../Domains/threads/entities/AddedThread');
const ItemThread = require('../../Domains/threads/entities/ItemThread');
const ThreadRepository = require('../../Domains/threads/ThreadRepository');

class ThreadRepositoryPostgres extends ThreadRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addThread(thread) {
    const { title, body, owner } = thread;
    const id = `thread-${this._idGenerator()}`;
    const createdAt = new Date().toISOString();

    const query = {
      text: 'INSERT INTO threads VALUES($1, $2, $3, $4, $5, $6) RETURNING id, title, owner',
      values: [id, title, body, owner, createdAt, createdAt],
    };

    const result = await this._pool.query(query);

    return new AddedThread(result.rows[0]);
  }

  async verifyThreadAvaibility(id) {
    const query = {
      text: 'SELECT id FROM threads WHERE id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('thread tidak ditemukan');
    }
  }

  async getThreadById(id) {
    const query = {
      text: `SELECT t.id, t.title, t.body, t.created_at as "date", u.username
                  FROM threads t LEFT JOIN users u ON u.id = t.owner
                  WHERE t.id = $1
            `,
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('thread tidak ditemukan');
    }

    return new ItemThread({ ...result.rows[0] });
  }
}

module.exports = ThreadRepositoryPostgres;
