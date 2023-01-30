/* eslint-disable camelcase */
const AddedComment = require('../../Domains/comments/entities/AddedComment');
const RepliesRepository = require('../../Domains/comments/RepliesRepository');

class RepliesCommentRepositoryPostgres extends RepliesRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async repliesComment(comment) {
    const {
      content,
      thread_id,
      parent_id,
      owner,
    } = comment;
    const id = `reply-${this._idGenerator()}`;
    const createdAt = new Date().toISOString();

    const query = {
      text: 'INSERT INTO comments VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING id, content, owner',
      values: [id, content, thread_id, parent_id, owner, createdAt, createdAt],
    };

    const result = await this._pool.query(query);
    return new AddedComment({ ...result.rows[0] });
  }

  async getRepliesByCommentId(threadId, commentId) {
    const query = {
      text: `SELECT c.id, u.username, c.created_at as "date", c.content, c.deleted_at
                FROM comments c LEFT JOIN users u ON u.id = c.owner
                WHERE thread_id = $1 AND parent_id = $2
                ORDER BY c.created_at ASC
            `,
      values: [threadId, commentId],
    };

    const result = await this._pool.query(query);
    return result.rows;
  }
}

module.exports = RepliesCommentRepositoryPostgres;
