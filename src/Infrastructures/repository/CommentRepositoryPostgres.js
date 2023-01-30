/* eslint-disable camelcase */
const AddedComment = require('../../Domains/comments/entities/AddedComment');
const CommentRepository = require('../../Domains/comments/CommentRepository');
const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');

class CommentRepositoryPostgres extends CommentRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addComment(comment) {
    const {
      content,
      thread_id,
      parent_id = null,
      owner,
    } = comment;
    const id = `comment-${this._idGenerator()}`;
    const createdAt = new Date().toISOString();

    const query = {
      text: 'INSERT INTO comments VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING id, content, owner',
      values: [id, content, thread_id, parent_id, owner, createdAt, createdAt],
    };

    const result = await this._pool.query(query);
    return new AddedComment({ ...result.rows[0] });
  }

  async getCommentById(id) {
    const query = {
      text: 'SELECT id, content, owner FROM comments WHERE id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('comment tidak ditemukan');
    }

    return new AddedComment({ ...result.rows[0] });
  }

  async verifyCommentAvailability(id) {
    const query = {
      text: 'SELECT id FROM comments WHERE id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('comment tidak ditemukan');
    }
  }

  async deleteComment(id) {
    const deletedAt = new Date().toISOString();

    const query = {
      text: 'UPDATE comments SET deleted_at = $1 WHERE id = $2 RETURNING id, owner, deleted_at',
      values: [deletedAt, id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('comment tidak ditemukan');
    }

    return result.rows[0];
  }

  async getCommentByThreadId(threadId) {
    const query = {
      text: `SELECT c.id, u.username, c.created_at as "date", c.content, c.deleted_at
                FROM comments c LEFT JOIN users u ON u.id = c.owner
                WHERE thread_id = $1 AND parent_id IS NULL
            `,
      values: [threadId],
    };

    const result = await this._pool.query(query);
    return result.rows;
  }

  async verifyOwner(commentId, ownerId) {
    const query = {
      text: 'SELECT id, owner FROM comments WHERE id = $1 AND owner = $2',
      values: [commentId, ownerId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new AuthorizationError('tidak memiliki akses resource');
    }

    return result.rows;
  }
}

module.exports = CommentRepositoryPostgres;
