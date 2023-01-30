const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const container = require('../../container');
const pool = require('../../database/postgres/pool');
const createServer = require('../createServer');

describe('/threads endpoint', () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await UsersTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
  });

  describe('when POST /comment', () => {
    it('should response 401', async () => {
      // Arrange
      const requestPayload = {
        content: 'first comment',
      };

      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads/thread-123/comments',
        payload: requestPayload,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(responseJson.statusCode).toEqual(401);
      expect(responseJson.message).toEqual('Missing authentication');
    });

    it('should response 201 and persisted comment', async () => {
      // Arrange
      const userAccount = {
        username: 'dicoding',
        password: 'secret',
      };

      const requestThread = {
        title: 'first thread',
        body: 'description',
      };

      const requestComment = {
        content: 'first comment',
      };

      const server = await createServer(container);

      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          ...userAccount,
          fullname: 'Dicoding Indonesia',
        },
      });

      const responseUser = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: userAccount,
      });

      const responseUserJson = JSON.parse(responseUser.payload);

      const responseThread = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestThread,
        headers: {
          Authorization: `Bearer ${responseUserJson.data.accessToken}`,
        },
      });

      const responseThreadJson = JSON.parse(responseThread.payload);
      const threadId = responseThreadJson.data.addedThread.id;

      const responseComment = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: requestComment,
        headers: {
          Authorization: `Bearer ${responseUserJson.data.accessToken}`,
        },
      });

      const responseCommentJson = JSON.parse(responseComment.payload);

      expect(responseComment.statusCode).toEqual(201);
      expect(responseCommentJson.status).toEqual('success');
      expect(responseCommentJson.data.addedComment).toBeDefined();
    });

    it('should response 400 when request payload not meet data type specification', async () => {
      // Arrange
      const userAccount = {
        username: 'dicoding',
        password: 'secret',
      };

      const requestThread = {
        title: 'first thread',
        body: 'description',
      };

      const requestComment = {
        content: [],
      };

      const server = await createServer(container);

      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          ...userAccount,
          fullname: 'Dicoding Indonesia',
        },
      });

      const responseUser = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: userAccount,
      });

      const responseUserJson = JSON.parse(responseUser.payload);

      const responseThread = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestThread,
        headers: {
          Authorization: `Bearer ${responseUserJson.data.accessToken}`,
        },
      });

      const responseThreadJson = JSON.parse(responseThread.payload);
      const threadId = responseThreadJson.data.addedThread.id;

      const responseComment = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: requestComment,
        headers: {
          Authorization: `Bearer ${responseUserJson.data.accessToken}`,
        },
      });

      const responseCommentJson = JSON.parse(responseComment.payload);

      expect(responseComment.statusCode).toEqual(400);
      expect(responseCommentJson.status).toEqual('fail');
      expect(responseCommentJson.message).toEqual('tidak dapat membuat comment baru karena tipe data tidak sesuai');
    });

    it('should response 400 when request payload not contain needed property', async () => {
      // Arrange
      const userAccount = {
        username: 'dicoding',
        password: 'secret',
      };

      const requestThread = {
        title: 'first thread',
        body: 'description',
      };

      const requestComment = {};

      const server = await createServer(container);

      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          ...userAccount,
          fullname: 'Dicoding Indonesia',
        },
      });

      const responseUser = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: userAccount,
      });

      const responseUserJson = JSON.parse(responseUser.payload);

      const responseThread = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestThread,
        headers: {
          Authorization: `Bearer ${responseUserJson.data.accessToken}`,
        },
      });

      const responseThreadJson = JSON.parse(responseThread.payload);
      const threadId = responseThreadJson.data.addedThread.id;

      const responseComment = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: requestComment,
        headers: {
          Authorization: `Bearer ${responseUserJson.data.accessToken}`,
        },
      });

      const responseCommentJson = JSON.parse(responseComment.payload);

      expect(responseComment.statusCode).toEqual(400);
      expect(responseCommentJson.status).toEqual('fail');
      expect(responseCommentJson.message).toEqual('tidak dapat membuat comment baru karena properti yang dibutuhkan tidak ada');
    });

    it('should response 404 when thread not found', async () => {
      // Arrange
      const userAccount = {
        username: 'dicoding',
        password: 'secret',
      };

      const requestComment = {
        content: 'first comment',
      };

      const server = await createServer(container);

      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          ...userAccount,
          fullname: 'Dicoding Indonesia',
        },
      });

      const responseUser = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: userAccount,
      });

      const responseUserJson = JSON.parse(responseUser.payload);

      // Action
      const responseComment = await server.inject({
        method: 'POST',
        url: '/threads/thread-123/comments',
        payload: requestComment,
        headers: {
          Authorization: `Bearer ${responseUserJson.data.accessToken}`,
        },
      });

      const responseCommentjson = JSON.parse(responseComment.payload);
      expect(responseComment.statusCode).toEqual(404);
      expect(responseCommentjson.status).toEqual('fail');
      expect(responseCommentjson.message).toEqual('thread tidak ditemukan');
    });
  });

  describe('when DELETE /comment', () => {
    it('should response 401', async () => {
      // Arrange
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: '/threads/thread-123/comments/comment-123',
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(responseJson.statusCode).toEqual(401);
      expect(responseJson.message).toEqual('Missing authentication');
    });

    it('should response 403', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({}); // user-123
      await ThreadsTableTestHelper.addThread({}); // thread-123
      await CommentsTableTestHelper.addComment({}); // comment-123

      const userAccount = {
        username: 'naruto',
        password: 'secret',
      };

      const server = await createServer(container);

      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          ...userAccount,
          fullname: 'Dicoding Indonesia',
        },
      });

      const responseUser = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: userAccount,
      });

      const responseUserJson = JSON.parse(responseUser.payload);

      // Action
      const deleteComment = await server.inject({
        method: 'DELETE',
        url: '/threads/thread-123/comments/comment-123',
        headers: {
          Authorization: `Bearer ${responseUserJson.data.accessToken}`,
        },
      });

      const deleteCommentJson = JSON.parse(deleteComment.payload);

      // Assert
      expect(deleteComment.statusCode).toEqual(403);
      expect(deleteCommentJson.status).toEqual('fail');
      expect(deleteCommentJson.message).toEqual('tidak memiliki akses resource');
    });

    it('should response 200 and delete comment', async () => {
      // Arrange
      const userAccount = {
        username: 'dicoding',
        password: 'secret',
      };

      const requestThread = {
        title: 'first thread',
        body: 'description',
      };

      const requestComment = {
        content: 'first comment',
      };

      const server = await createServer(container);

      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          ...userAccount,
          fullname: 'Dicoding Indonesia',
        },
      });

      const responseUser = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: userAccount,
      });

      const responseUserJson = JSON.parse(responseUser.payload);

      const responseThread = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestThread,
        headers: {
          Authorization: `Bearer ${responseUserJson.data.accessToken}`,
        },
      });

      const responseThreadJson = JSON.parse(responseThread.payload);
      const threadId = responseThreadJson.data.addedThread.id;

      const responseComment = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: requestComment,
        headers: {
          Authorization: `Bearer ${responseUserJson.data.accessToken}`,
        },
      });

      const responseCommentJson = JSON.parse(responseComment.payload);
      const commentId = responseCommentJson.data.addedComment.id;

      // Action
      const deleteComment = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}`,
        headers: {
          Authorization: `Bearer ${responseUserJson.data.accessToken}`,
        },
      });

      const deleteCommentJson = JSON.parse(deleteComment.payload);

      // Assert
      expect(deleteComment.statusCode).toEqual(200);
      expect(deleteCommentJson.status).toEqual('success');
      expect(deleteCommentJson.message).toEqual('Koementar berhasil dihapus');
    });

    it('should response 404 when thread or comment not found', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({}); // user-123
      await ThreadsTableTestHelper.addThread({}); // thread-123
      await CommentsTableTestHelper.addComment({}); // comment-123

      const userAccount = {
        username: 'naruto',
        password: 'secret',
      };

      const server = await createServer(container);

      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          ...userAccount,
          fullname: 'Dicoding Indonesia',
        },
      });

      const responseUser = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: userAccount,
      });

      const responseUserJson = JSON.parse(responseUser.payload);

      // Action
      const threadNotFound = await server.inject({
        method: 'DELETE',
        url: '/threads/thread-100/comments/comment-123',
        headers: {
          Authorization: `Bearer ${responseUserJson.data.accessToken}`,
        },
      });

      const commentNotFound = await server.inject({
        method: 'DELETE',
        url: '/threads/thread-123/comments/comment-100',
        headers: {
          Authorization: `Bearer ${responseUserJson.data.accessToken}`,
        },
      });

      const threadNotFoundJson = JSON.parse(threadNotFound.payload);
      const commentNotFoundJson = JSON.parse(commentNotFound.payload);

      // Assert
      expect(threadNotFound.statusCode).toEqual(404);
      expect(threadNotFoundJson.status).toEqual('fail');
      expect(threadNotFoundJson.message).toEqual('thread tidak ditemukan');
      expect(commentNotFound.statusCode).toEqual(404);
      expect(commentNotFoundJson.status).toEqual('fail');
      expect(commentNotFoundJson.message).toEqual('comment tidak ditemukan');
    });
  });

  describe('when POST /replies', () => {
    it('should response 401', async () => {
      // Arrange
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads/thread-123/comments/comment-123/replies',
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(responseJson.statusCode).toEqual(401);
      expect(responseJson.message).toEqual('Missing authentication');
    });

    it('should response 201 and persisted replies', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({}); // user-123
      await ThreadsTableTestHelper.addThread({}); // thread-123
      await CommentsTableTestHelper.addComment({}); // comment-123

      const userAccount = {
        username: 'naruto',
        password: 'secret',
      };

      const requestReply = {
        content: 'reply comment',
      };

      const server = await createServer(container);

      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          ...userAccount,
          fullname: 'Dicoding Indonesia',
        },
      });

      const responseUser = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: userAccount,
      });

      const responseUserJson = JSON.parse(responseUser.payload);

      // Action
      const repliesComment = await server.inject({
        method: 'POST',
        url: '/threads/thread-123/comments/comment-123/replies',
        payload: requestReply,
        headers: {
          Authorization: `Bearer ${responseUserJson.data.accessToken}`,
        },
      });

      const repliesCommentJson = JSON.parse(repliesComment.payload);

      // Assert
      expect(repliesComment.statusCode).toEqual(201);
      expect(repliesCommentJson.status).toEqual('success');
      expect(repliesCommentJson.data.addedReply).toBeDefined();
    });

    it('should response 400 when request payload not meet data type specification', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({}); // user-123
      await ThreadsTableTestHelper.addThread({}); // thread-123
      await CommentsTableTestHelper.addComment({}); // comment-123

      const userAccount = {
        username: 'naruto',
        password: 'secret',
      };

      const requestReply = {
        content: [],
      };

      const server = await createServer(container);

      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          ...userAccount,
          fullname: 'Dicoding Indonesia',
        },
      });

      const responseUser = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: userAccount,
      });

      const responseUserJson = JSON.parse(responseUser.payload);

      // Action
      const repliesComment = await server.inject({
        method: 'POST',
        url: '/threads/thread-123/comments/comment-123/replies',
        payload: requestReply,
        headers: {
          Authorization: `Bearer ${responseUserJson.data.accessToken}`,
        },
      });

      const repliesCommentJson = JSON.parse(repliesComment.payload);

      // Assert
      expect(repliesComment.statusCode).toEqual(400);
      expect(repliesCommentJson.status).toEqual('fail');
      expect(repliesCommentJson.message).toEqual('tidak dapat membuat comment baru karena tipe data tidak sesuai');
    });

    it('should response 400 when request payload not contain needed property', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({}); // user-123
      await ThreadsTableTestHelper.addThread({}); // thread-123
      await CommentsTableTestHelper.addComment({}); // comment-123

      const userAccount = {
        username: 'naruto',
        password: 'secret',
      };

      const requestReply = {};

      const server = await createServer(container);

      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          ...userAccount,
          fullname: 'Dicoding Indonesia',
        },
      });

      const responseUser = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: userAccount,
      });

      const responseUserJson = JSON.parse(responseUser.payload);

      // Action
      const repliesComment = await server.inject({
        method: 'POST',
        url: '/threads/thread-123/comments/comment-123/replies',
        payload: requestReply,
        headers: {
          Authorization: `Bearer ${responseUserJson.data.accessToken}`,
        },
      });

      const repliesCommentJson = JSON.parse(repliesComment.payload);

      // Assert
      expect(repliesComment.statusCode).toEqual(400);
      expect(repliesCommentJson.status).toEqual('fail');
      expect(repliesCommentJson.message).toEqual('tidak dapat membuat comment baru karena properti yang dibutuhkan tidak ada');
    });

    it('should response 404 when thread or comment not found', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({}); // user-123
      await ThreadsTableTestHelper.addThread({}); // thread-123
      await CommentsTableTestHelper.addComment({}); // comment-123

      const userAccount = {
        username: 'naruto',
        password: 'secret',
      };

      const requestReply = {
        content: 'reply comment',
      };

      const server = await createServer(container);

      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          ...userAccount,
          fullname: 'Dicoding Indonesia',
        },
      });

      const responseUser = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: userAccount,
      });

      const responseUserJson = JSON.parse(responseUser.payload);

      // Action
      const threadNotFound = await server.inject({
        method: 'POST',
        url: '/threads/thread-100/comments/comment-123/replies',
        payload: requestReply,
        headers: {
          Authorization: `Bearer ${responseUserJson.data.accessToken}`,
        },
      });

      const commentNotFound = await server.inject({
        method: 'POST',
        url: '/threads/thread-123/comments/comment-100/replies',
        payload: requestReply,
        headers: {
          Authorization: `Bearer ${responseUserJson.data.accessToken}`,
        },
      });

      const threadNotFoundJson = JSON.parse(threadNotFound.payload);
      const commentNotFoundJson = JSON.parse(commentNotFound.payload);

      // Assert
      expect(threadNotFound.statusCode).toEqual(404);
      expect(threadNotFoundJson.status).toEqual('fail');
      expect(threadNotFoundJson.message).toEqual('thread tidak ditemukan');
      expect(commentNotFound.statusCode).toEqual(404);
      expect(commentNotFoundJson.status).toEqual('fail');
      expect(commentNotFoundJson.message).toEqual('comment tidak ditemukan');
    });
  });

  describe('when DELETE /replies', () => {
    it('should response 401', async () => {
      // Arrange
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: '/threads/thread-123/comments/comment-123/replies/reply-123',
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(responseJson.statusCode).toEqual(401);
      expect(responseJson.message).toEqual('Missing authentication');
    });

    it('should response 403', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({}); // user-123
      await UsersTableTestHelper.addUser({
        id: 'user-124',
        username: 'mikey',
      }); // user-124
      await ThreadsTableTestHelper.addThread({}); // thread-123
      await CommentsTableTestHelper.addComment({}); // comment-123
      await CommentsTableTestHelper.addComment({
        id: 'reply-123',
        parent_id: 'comment-123',
        owner: 'user-124',
      }); // reply-123 created by user-124

      const userAccount = {
        username: 'boruto',
        password: 'secret',
      };

      const server = await createServer(container);

      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          ...userAccount,
          fullname: 'Dicoding Indonesia',
        },
      });

      const responseUser = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: userAccount,
      });

      const responseUserJson = JSON.parse(responseUser.payload);

      // Action
      const deleteComment = await server.inject({
        method: 'DELETE',
        url: '/threads/thread-123/comments/comment-123/replies/reply-123',
        headers: {
          Authorization: `Bearer ${responseUserJson.data.accessToken}`,
        },
      });

      const deleteCommentJson = JSON.parse(deleteComment.payload);

      // Assert
      expect(deleteComment.statusCode).toEqual(403);
      expect(deleteCommentJson.status).toEqual('fail');
      expect(deleteCommentJson.message).toEqual('tidak memiliki akses resource');
    });

    it('should response 200 and delete reply', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({}); // user-123
      await ThreadsTableTestHelper.addThread({}); // thread-123
      await CommentsTableTestHelper.addComment({}); // comment-123
      const threadId = 'thread-123';
      const commentId = 'comment-123';

      const userAccount = {
        username: 'naruto',
        password: 'secret',
      };

      const requestReply = {
        content: 'reply comment',
      };

      const server = await createServer(container);

      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          ...userAccount,
          fullname: 'Dicoding Indonesia',
        },
      });

      const responseUser = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: userAccount,
      });

      const responseUserJson = JSON.parse(responseUser.payload);

      const responseReply = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments/${commentId}/replies`,
        payload: requestReply,
        headers: {
          Authorization: `Bearer ${responseUserJson.data.accessToken}`,
        },
      });

      const responseReplyJson = JSON.parse(responseReply.payload);
      const replyId = responseReplyJson.data.addedReply.id;

      // Action
      const deleteReply = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}/replies/${replyId}`,
        headers: {
          Authorization: `Bearer ${responseUserJson.data.accessToken}`,
        },
      });

      const deleteReplyJson = JSON.parse(deleteReply.payload);
      // Assert
      expect(deleteReply.statusCode).toEqual(200);
      expect(deleteReplyJson.status).toEqual('success');
      expect(deleteReplyJson.message).toEqual('Koementar berhasil dihapus');
    });

    it('should response 404 when thread or comment not found', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({}); // user-123
      await UsersTableTestHelper.addUser({
        id: 'user-124',
        username: 'mikey',
      }); // user-124
      await ThreadsTableTestHelper.addThread({}); // thread-123
      await CommentsTableTestHelper.addComment({}); // comment-123
      await CommentsTableTestHelper.addComment({
        id: 'reply-123',
        parent_id: 'comment-123',
        owner: 'user-124',
      }); // reply-123 created by user-124

      const userAccount = {
        username: 'naruto',
        password: 'secret',
      };

      const server = await createServer(container);

      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          ...userAccount,
          fullname: 'Dicoding Indonesia',
        },
      });

      const responseUser = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: userAccount,
      });

      const responseUserJson = JSON.parse(responseUser.payload);

      // Action
      const threadNotFound = await server.inject({
        method: 'DELETE',
        url: '/threads/thread-100/comments/comment-123/replies/reply-123',
        headers: {
          Authorization: `Bearer ${responseUserJson.data.accessToken}`,
        },
      });

      const commentNotFound = await server.inject({
        method: 'DELETE',
        url: '/threads/thread-123/comments/comment-100/replies/reply-123',
        headers: {
          Authorization: `Bearer ${responseUserJson.data.accessToken}`,
        },
      });

      const threadNotFoundJson = JSON.parse(threadNotFound.payload);
      const commentNotFoundJson = JSON.parse(commentNotFound.payload);

      // Assert
      expect(threadNotFound.statusCode).toEqual(404);
      expect(threadNotFoundJson.status).toEqual('fail');
      expect(threadNotFoundJson.message).toEqual('thread tidak ditemukan');
      expect(commentNotFound.statusCode).toEqual(404);
      expect(commentNotFoundJson.status).toEqual('fail');
      expect(commentNotFoundJson.message).toEqual('comment tidak ditemukan');
    });
  });

  describe('when PUT /comment/likes', () => {
    it('should response 401', async () => {
      // Arrange
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'PUT',
        url: '/threads/thread-123/comments/comment-123/likes',
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(responseJson.statusCode).toEqual(401);
      expect(responseJson.message).toEqual('Missing authentication');
    });

    it('should response 404 when thread or comment not found', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({}); // user-123
      await ThreadsTableTestHelper.addThread({}); // thread-123
      await CommentsTableTestHelper.addComment({}); // comment-123

      const userAccount = {
        username: 'naruto',
        password: 'secret',
      };

      const server = await createServer(container);

      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          ...userAccount,
          fullname: 'Dicoding Indonesia',
        },
      });

      const responseUser = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: userAccount,
      });

      const responseUserJson = JSON.parse(responseUser.payload);

      // Action
      const threadNotFound = await server.inject({
        method: 'PUT',
        url: '/threads/thread-100/comments/comment-123/likes',
        headers: {
          Authorization: `Bearer ${responseUserJson.data.accessToken}`,
        },
      });

      const commentNotFound = await server.inject({
        method: 'PUT',
        url: '/threads/thread-123/comments/comment-110/likes',
        headers: {
          Authorization: `Bearer ${responseUserJson.data.accessToken}`,
        },
      });

      const threadNotFoundJson = JSON.parse(threadNotFound.payload);
      const commentNotFoundJson = JSON.parse(commentNotFound.payload);

      // Assert
      expect(threadNotFound.statusCode).toEqual(404);
      expect(threadNotFoundJson.status).toEqual('fail');
      expect(threadNotFoundJson.message).toEqual('thread tidak ditemukan');
      expect(commentNotFound.statusCode).toEqual(404);
      expect(commentNotFoundJson.status).toEqual('fail');
      expect(commentNotFoundJson.message).toEqual('comment tidak ditemukan');
    });

    it('should add like to comment', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({}); // user-123
      await ThreadsTableTestHelper.addThread({}); // thread-123
      await CommentsTableTestHelper.addComment({}); // comment-123

      const userAccount = {
        username: 'naruto',
        password: 'secret',
      };

      const server = await createServer(container);

      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          ...userAccount,
          fullname: 'Dicoding Indonesia',
        },
      });

      const responseUser = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: userAccount,
      });

      const responseUserJson = JSON.parse(responseUser.payload);

      // Action
      const addLikeComment = await server.inject({
        method: 'PUT',
        url: '/threads/thread-123/comments/comment-123/likes',
        headers: {
          Authorization: `Bearer ${responseUserJson.data.accessToken}`,
        },
      });

      const responseAddLikeCommentJson = JSON.parse(addLikeComment.payload);
      // Assert
      expect(addLikeComment.statusCode).toEqual(200);
      expect(responseAddLikeCommentJson.status).toEqual('success');
    });
  });
});
