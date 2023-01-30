/* eslint-disable camelcase */
const LikeRepository = require('../../Domains/comments/LikeRepository');

class LikeCommentRepositoryPostgres extends LikeRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addOrDeleteLike({ comment_id, owner }) {
    const query = {
      text: 'SELECT id FROM comment_likes WHERE comment_id = $1 AND owner = $2',
      values: [comment_id, owner],
    };

    const result = await this._pool.query(query);

    if (result.rowCount) {
      const queryRemove = {
        text: 'DELETE FROM comment_likes WHERE id = $1 RETURNING id',
        values: [result.rows[0].id],
      };

      await this._pool.query(queryRemove);
    } else {
      const id = `like-${this._idGenerator()}`;
      const queryAdd = {
        text: 'INSERT INTO comment_likes VALUES($1, $2, $3) RETURNING id',
        values: [id, comment_id, owner],
      };

      await this._pool.query(queryAdd);
    }

    return true;
  }

  async getTotalLike(commentId) {
    const query = {
      text: 'SELECT COUNT(id) as total_like FROM comment_likes WHERE comment_id = $1',
      values: [commentId],
    };

    const result = await this._pool.query(query);

    return result.rows[0];
  }
}

module.exports = LikeCommentRepositoryPostgres;
