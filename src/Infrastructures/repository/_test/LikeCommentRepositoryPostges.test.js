const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const pool = require('../../database/postgres/pool');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const AddLikeComment = require('../../../Domains/comments/entities/AddLikeComment');
const LikeCommentRepositoryPostgres = require('../LikeCommentRepository');

describe('LikeCommentRepositoryPostgres', () => {
  afterEach(async () => {
    await UsersTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await CommentTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addOrDelete like function', () => {
    it('should persist like and return like corectly', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({});
      await UsersTableTestHelper.addUser({ id: 'user-124', username: 'netizen124' });
      await ThreadsTableTestHelper.addThread({}); // thead-123
      await CommentTableTestHelper.addComment({}); // comment-123

      const addLike = new AddLikeComment({
        threadId: 'thread-123',
        owner: 'user-124',
        commentId: 'comment-123',
      });

      const fakeIdGenerator = () => '123';
      const likeRepositoryPostgres = new LikeCommentRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await likeRepositoryPostgres.addOrDeleteLike(addLike);

      // Assert
      const likes = await CommentTableTestHelper.findLikeById('like-123');
      expect(likes).toHaveLength(1);
    });

    it('should persist deleted like and return like corectly', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({});
      await UsersTableTestHelper.addUser({ id: 'user-124', username: 'netizen124' });
      await ThreadsTableTestHelper.addThread({}); // thread-124
      await CommentTableTestHelper.addComment({}); // comment-123
      await CommentTableTestHelper.addLike({}); // like-123

      const addLike = new AddLikeComment({
        threadId: 'thread-123',
        owner: 'user-124',
        commentId: 'comment-123',
      });

      const likeRepositoryPostgres = new LikeCommentRepositoryPostgres(pool, {});

      // Action
      await likeRepositoryPostgres.addOrDeleteLike(addLike);

      // Assert
      const likes = await CommentTableTestHelper.findLikeCommentById(addLike.comment_id);
      expect(likes).toHaveLength(0);
    });

    it('should return added like corectly', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({}); // user-123
      await UsersTableTestHelper.addUser({ id: 'user-124', username: 'netizen124' });
      await ThreadsTableTestHelper.addThread({}); // thread-124
      await CommentTableTestHelper.addComment({}); // comment-123

      const addLike = new AddLikeComment({
        threadId: 'thread-124',
        owner: 'user-124',
        commentId: 'comment-123',
      });

      const fakeIdGenerator = () => '123';
      const likeRepositoryPostgres = new LikeCommentRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const likes = await likeRepositoryPostgres.addOrDeleteLike(addLike);

      // Assert
      expect(likes).toStrictEqual(true);
    });
  });

  describe('getTotalLike function', () => {
    it('should return total like for a comment', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({});
      await UsersTableTestHelper.addUser({ id: 'user-124', username: 'netizen124' });
      await UsersTableTestHelper.addUser({ id: 'user-125', username: 'netizen125' });
      await ThreadsTableTestHelper.addThread({}); // thread-123
      await CommentTableTestHelper.addComment({}); // comment-123
      await CommentTableTestHelper.addLike({
        id: 'like-123',
        comment_id: 'comment-123',
        owner: 'user-124',
      });
      await CommentTableTestHelper.addLike({
        id: 'like-124',
        comment_id: 'comment-123',
        owner: 'user-125',
      });

      const likeRepositoryPostgres = new LikeCommentRepositoryPostgres(pool, {});

      // Action
      const likes = await likeRepositoryPostgres.getTotalLike('comment-123');

      // Assert
      expect(likes).toHaveProperty('total_like', '2');
    });
  });
});
