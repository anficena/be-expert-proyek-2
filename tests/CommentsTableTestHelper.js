/* eslint-disable camelcase */
/* istanbul ignore file */
const pool = require('../src/Infrastructures/database/postgres/pool');

const CommentTableTestHelper = {
  async addComment({
    id = 'comment-123',
    content = 'content comment',
    thread_id = 'thread-123',
    parent_id = null,
    owner = 'user-123',
    createdAt = new Date().toISOString(),
  }) {
    const query = {
      text: 'INSERT INTO comments VALUES($1, $2, $3, $4, $5, $6, $7)',
      values: [id, content, thread_id, parent_id, owner, createdAt, createdAt],
    };

    await pool.query(query);
  },

  async addLike({
    id = 'like-123',
    comment_id = 'comment-123',
    owner = 'user-124',
  }) {
    const query = {
      text: 'INSERT INTO comment_likes VALUES($1, $2, $3)',
      values: [id, comment_id, owner],
    };

    await pool.query(query);
  },

  async findCommentsById(id) {
    const query = {
      text: 'SELECT * FROM comments WHERE id = $1',
      values: [id],
    };

    const result = await pool.query(query);
    return result.rows;
  },

  async findLikeById(id) {
    const query = {
      text: 'SELECT * FROM comment_likes WHERE id = $1',
      values: [id],
    };

    const result = await pool.query(query);
    return result.rows;
  },

  async findLikeCommentById(id) {
    const query = {
      text: 'SELECT * FROM comment_likes WHERE comment_id = $1',
      values: [id],
    };

    const result = await pool.query(query);
    return result.rows;
  },

  async deleteCommentById(id) {
    const deletedAt = new Date().toISOString();
    const query = {
      text: 'UPDATE comments SET deleted_at = $1 WHERE id = $2 RETURNING id, owner',
      values: [deletedAt, id],
    };

    await pool.query(query);
  },

  async cleanTable() {
    await pool.query('DELETE FROM comments WHERE 1=1');
    await pool.query('DELETE FROM comment_likes WHERE 1=1');
  },
};

module.exports = CommentTableTestHelper;
