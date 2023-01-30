const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const pool = require('../../database/postgres/pool');
const CommentRepositoryPostgres = require('../CommentRepositoryPostgres');
const AddComment = require('../../../Domains/comments/entities/AddComment');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const AddedComment = require('../../../Domains/comments/entities/AddedComment');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');

describe('CommentRepositoryPostgres', () => {
  afterEach(async () => {
    await UsersTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await CommentTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addComment function', () => {
    it('should persist comment and return added comment correctly', async () => {
      // Arrange
      const addComment = new AddComment({ content: 'coment description' });

      await UsersTableTestHelper.addUser({}); // that post thread
      await UsersTableTestHelper.addUser({
        id: 'user-124',
        username: 'netizen1',
        fullname: 'netizen pertama',
      }); // that comment the thread

      await ThreadsTableTestHelper.addThread({});
      addComment.thread_id = 'thread-123';
      addComment.owner = 'user-124';

      const fakeIdGenerator = () => '123'; // stub;
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await commentRepositoryPostgres.addComment(addComment);

      // Assert
      const comment = await CommentTableTestHelper.findCommentsById('comment-123');
      expect(comment).toHaveLength(1);
    });

    it('it should return added comment object corectly', async () => {
      // Arrange
      const addComment = new AddComment({
        content: 'comment description...',
      });

      await UsersTableTestHelper.addUser({}); // that post thread
      await UsersTableTestHelper.addUser({
        id: 'user-124',
        username: 'netizen1',
        fullname: 'netizen pertama',
      }); // that comment the thread

      await ThreadsTableTestHelper.addThread({});
      addComment.thread_id = 'thread-123';
      addComment.owner = 'user-124';

      const fakeIdGenerator = () => '123'; // stub;
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const comment = await commentRepositoryPostgres.addComment(addComment);

      // Assert
      expect(comment).toStrictEqual(
        new AddedComment({
          id: 'comment-123',
          content: 'comment description...',
          owner: 'user-124',
        }),
      );
    });
  });

  describe('getCommentById fucntion', () => {
    it('should throw NotFoundError when comment not found', async () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      return expect(commentRepositoryPostgres.getCommentById('comment-123')).rejects.toThrowError(NotFoundError);
    });

    it('should show all comment related to Id', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({});
      await ThreadsTableTestHelper.addThread({});
      await CommentTableTestHelper.addComment({});
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action
      const comment = await commentRepositoryPostgres.getCommentById('comment-123');

      // Assert
      expect(comment).toStrictEqual(
        new AddedComment({
          id: 'comment-123',
          content: 'content comment',
          owner: 'user-123',
        }),
      );
    });
  });

  describe('verifyCommentAvailability fucntion', () => {
    it('should throw NotFoundError when comment not found', async () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      return expect(commentRepositoryPostgres.verifyCommentAvailability('comment-123')).rejects.toThrowError(NotFoundError);
    });

    it('should not throw NotFoundError when comment exist', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({});
      await ThreadsTableTestHelper.addThread({});
      await CommentTableTestHelper.addComment({});
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(commentRepositoryPostgres.verifyCommentAvailability('comment-123'))
        .resolves.not.toThrow(NotFoundError);
    });
  });

  describe('deleteComment function', () => {
    it('should throw NotFoundError when comment not found', async () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      return expect(commentRepositoryPostgres.deleteComment('comment-123')).rejects.toThrowError(NotFoundError);
    });

    it('should delete comment when the comment is found', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({});
      await ThreadsTableTestHelper.addThread({});
      await CommentTableTestHelper.addComment({});
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action
      const deleteComment = await commentRepositoryPostgres.deleteComment('comment-123');

      // Assert
      const comment = await CommentTableTestHelper.findCommentsById('comment-123');
      expect(comment).toHaveLength(1);
      expect(deleteComment).toStrictEqual({
        id: 'comment-123',
        owner: 'user-123',
        deleted_at: comment[0].deleted_at,
      });
    });
  });

  describe('getCommentByThreadId function', () => {
    it('should return empty array when comment not found', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({});
      await ThreadsTableTestHelper.addThread({});
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action
      const comment = await commentRepositoryPostgres.getCommentByThreadId('thread-123');

      // Assert
      expect(comment).toHaveLength(0);
    });

    it('should show all comment related to threadId', async () => {
      // Arrange
      const now = new Date().toISOString();
      const firstComment = {
        id: 'comment-123',
        username: 'dicoding',
        date: now,
        content: 'content comment',
        deleted_at: null,
      };

      const secondComment = { ...firstComment };
      secondComment.id = 'comment-124';

      await UsersTableTestHelper.addUser({});
      await ThreadsTableTestHelper.addThread({});
      await CommentTableTestHelper.addComment({ createdAt: now });
      await CommentTableTestHelper.addComment({ id: 'comment-124', createdAt: now });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action
      const comment = await commentRepositoryPostgres.getCommentByThreadId('thread-123');

      // Assert
      expect(comment).toHaveLength(2);
      expect(comment[0]).toStrictEqual(firstComment);
      expect(comment[1]).toStrictEqual(secondComment);
    });
  });

  describe('deleteRepliesComment function', () => {
    it('should throw NotFoundError when reply comment not found', async () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      return expect(commentRepositoryPostgres.deleteComment('reply-123')).rejects.toThrowError(NotFoundError);
    });

    it('should delete reply comment when it is found', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({});
      await UsersTableTestHelper.addUser({
        id: 'user-124',
        username: 'netizen1',
        fullname: 'netizen pertama',
      }); // that comment the thread
      await ThreadsTableTestHelper.addThread({});
      await CommentTableTestHelper.addComment({});
      await CommentTableTestHelper.addComment({
        id: 'reply-123',
        content: 'reply content description',
        thread_id: 'thread-123',
        parent_id: 'comment-123',
        owner: 'user-124',
      });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action
      const deleteComment = await commentRepositoryPostgres.deleteComment('reply-123');

      // Assert
      const comment = await CommentTableTestHelper.findCommentsById('reply-123');
      expect(comment).toHaveLength(1);
      expect(deleteComment).toStrictEqual({
        id: 'reply-123',
        owner: 'user-124',
        deleted_at: comment[0].deleted_at,
      });
    });
  });

  describe('verifyOwner function', () => {
    it('should throw unauthorized error when comment manipulate not by owner', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({}); // with id user-123
      await UsersTableTestHelper.addUser({
        id: 'user-124',
        username: 'netizen1',
        fullname: 'netizen pertama',
      }); // reply comment
      await ThreadsTableTestHelper.addThread({}); // with id thread-123
      await CommentTableTestHelper.addComment({}); // with id comment-123
      await CommentTableTestHelper.addComment({
        id: 'reply-123',
        content: 'reply content description',
        thread_id: 'thread-123',
        parent_id: 'comment-123',
        owner: 'user-124',
      });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action
      const isOwner = commentRepositoryPostgres.verifyOwner('reply-123', 'user-120');

      // Assert
      expect(isOwner).rejects.toThrowError(AuthorizationError);
    });

    it('should verified that comment manipulate by owner', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({}); // with id user-123
      await UsersTableTestHelper.addUser({
        id: 'user-124',
        username: 'netizen1',
        fullname: 'netizen pertama',
      }); // reply comment
      await ThreadsTableTestHelper.addThread({}); // with id thread-123
      await CommentTableTestHelper.addComment({}); // with id comment-123
      await CommentTableTestHelper.addComment({
        id: 'reply-123',
        content: 'reply content description',
        thread_id: 'thread-123',
        parent_id: 'comment-123',
        owner: 'user-124',
      });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action
      const isOwner = await commentRepositoryPostgres.verifyOwner('reply-123', 'user-124');

      // Assert
      expect(isOwner).toHaveLength(1);
    });
  });
});
