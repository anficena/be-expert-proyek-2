const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const pool = require('../../database/postgres/pool');
const RepliesCommentRepositoryPostgres = require('../RepliesCommentRepositoryPostgres');
const AddComment = require('../../../Domains/comments/entities/AddComment');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const AddedComment = require('../../../Domains/comments/entities/AddedComment');

describe('RepliesCommentRepositoryPostgres', () => {
  afterEach(async () => {
    await UsersTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await CommentTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('repliesComment function', () => {
    it('should persist reply comment and return it correctly', async () => {
      // Arrange
      const repliesComment = new AddComment({
        content: 'reply coment description',
      });

      await UsersTableTestHelper.addUser({});
      await UsersTableTestHelper.addUser({
        id: 'user-124',
        username: 'netizen1',
        fullname: 'netizen pertama',
      }); // that comment the thread

      await ThreadsTableTestHelper.addThread({}); // thread-123
      await CommentTableTestHelper.addComment({ parent_id: null }); // comment-123
      repliesComment.thread_id = 'thread-123';
      repliesComment.parent_id = 'comment-123';
      repliesComment.owner = 'user-124';

      const fakeIdGenerator = () => '123'; // stub;
      const commentRepositoryPostgres = new RepliesCommentRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await commentRepositoryPostgres.repliesComment(repliesComment);

      // Assert
      const comment = await CommentTableTestHelper.findCommentsById('reply-123');
      expect(comment).toHaveLength(1);
    });

    it('it should return reply comment corectly', async () => {
      // Arrange
      const repliesComment = new AddComment({
        content: 'reply comment description...',
      });

      await UsersTableTestHelper.addUser({}); // that post thread
      await UsersTableTestHelper.addUser({
        id: 'user-124',
        username: 'netizen1',
        fullname: 'netizen pertama',
      }); // that comment the thread

      await ThreadsTableTestHelper.addThread({}); // thread-123
      await CommentTableTestHelper.addComment({}); // comment-123
      repliesComment.thread_id = 'thread-123';
      repliesComment.parent_id = 'comment-123';
      repliesComment.owner = 'user-124';

      const fakeIdGenerator = () => '123'; // stub;
      const commentRepositoryPostgres = new RepliesCommentRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const replies = await commentRepositoryPostgres.repliesComment(repliesComment);

      // Assert
      expect(replies).toStrictEqual(
        new AddedComment({
          id: 'reply-123',
          content: 'reply comment description...',
          owner: 'user-124',
        }),
      );
    });
  });

  describe('getRepliesByCommentId function', () => {
    it('should return empty array when replies comment not found', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({});
      await UsersTableTestHelper.addUser({
        id: 'user-124',
        username: 'netizen1',
        fullname: 'netizen pertama',
      }); // that comment the thread
      await ThreadsTableTestHelper.addThread({});
      await CommentTableTestHelper.addComment({});
      const commentRepositoryPostgres = new RepliesCommentRepositoryPostgres(pool, {});

      // Action
      const comment = await commentRepositoryPostgres.getRepliesByCommentId('thread-123', 'comment-123');

      // Assert
      expect(comment).toHaveLength(0);
    });

    it('should show replies comment related to commentId', async () => {
      // Arrange
      const now = new Date().toISOString();
      const firstComment = {
        id: 'reply-123',
        username: 'netizen1',
        date: now,
        content: 'reply content description',
        deleted_at: null,
      };

      await UsersTableTestHelper.addUser({});
      await UsersTableTestHelper.addUser({
        id: 'user-124',
        username: 'netizen1',
        fullname: 'netizen pertama',
      }); // that replies the comment
      await ThreadsTableTestHelper.addThread({});
      await CommentTableTestHelper.addComment({});
      await CommentTableTestHelper.addComment({
        id: 'reply-123',
        content: 'reply content description',
        thread_id: 'thread-123',
        parent_id: 'comment-123',
        owner: 'user-124',
        createdAt: now,
      });

      const commentRepositoryPostgres = new RepliesCommentRepositoryPostgres(pool, {});

      // Action
      const replies = await commentRepositoryPostgres.getRepliesByCommentId('thread-123', 'comment-123');

      // Assert
      expect(replies).toHaveLength(1);
      expect(replies[0]).toStrictEqual(firstComment);
    });
  });
});
