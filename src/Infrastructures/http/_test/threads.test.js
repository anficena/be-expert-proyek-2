const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const CommentTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
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
    await CommentTableTestHelper.cleanTable();
  });

  describe('when POST /threads', () => {
    it('should response 401', async () => {
      // Arrange
      const requestPayload = {
        title: 'first thread',
        body: 'body thread',
      };

      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(responseJson.statusCode).toEqual(401);
      expect(responseJson.message).toEqual('Missing authentication');
    });

    it('should response 201 and persisted thread', async () => {
      // Arrange
      const userAccount = {
        username: 'dicoding',
        password: 'secret',
      };

      const requestThread = {
        title: 'first thread',
        body: 'description',
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
      const responseThread = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestThread,
        headers: {
          Authorization: `Bearer ${responseUserJson.data.accessToken}`,
        },
      });

      const responseThreadJson = JSON.parse(responseThread.payload);
      expect(responseThread.statusCode).toEqual(201);
      expect(responseThreadJson.status).toEqual('success');
      expect(responseThreadJson.data.addedThread).toBeDefined();
    });

    it('should response 400 when request payload not meet data type specification', async () => {
      // Arrange
      const userAccount = {
        username: 'dicoding',
        password: 'secret',
      };

      const requestThread = {
        title: 123,
        body: [],
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
      const responseThread = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestThread,
        headers: {
          Authorization: `Bearer ${responseUserJson.data.accessToken}`,
        },
      });

      const responseThreadJson = JSON.parse(responseThread.payload);
      expect(responseThread.statusCode).toEqual(400);
      expect(responseThreadJson.status).toEqual('fail');
      expect(responseThreadJson.message).toEqual('tidak dapat membuat thread baru karena tipe data tidak sesuai');
    });

    it('should response 400 when request payload not contain needed property', async () => {
      // Arrange
      const userAccount = {
        username: 'dicoding',
        password: 'secret',
      };

      const requestThread = {
        title: 'first thread',
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
      const responseThread = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestThread,
        headers: {
          Authorization: `Bearer ${responseUserJson.data.accessToken}`,
        },
      });

      const responseThreadJson = JSON.parse(responseThread.payload);
      expect(responseThread.statusCode).toEqual(400);
      expect(responseThreadJson.status).toEqual('fail');
      expect(responseThreadJson.message).toEqual('tidak dapat membuat thread baru karena properti yang dibutuhkan tidak ada');
    });
  });

  describe('when GET /threads', () => {
    it('should response 200 and show thread without comments', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({});
      await ThreadsTableTestHelper.addThread({});

      const server = await createServer(container);

      const threadId = 'thread-123';

      // Action
      const responseThreadDetail = await server.inject({
        method: 'GET',
        url: `/threads/${threadId}`,
      });

      const responseThreadDetailjson = JSON.parse(responseThreadDetail.payload);
      expect(responseThreadDetail.statusCode).toEqual(200);
      expect(responseThreadDetailjson.status).toEqual('success');
      expect(responseThreadDetailjson.data.thread).toHaveProperty('id');
      expect(responseThreadDetailjson.data.thread.id).toEqual(threadId);
      expect(responseThreadDetailjson.data.thread.comments).toHaveLength(0);
    });

    it('should response 200 and show thread with comments', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({}); // user-123
      await ThreadsTableTestHelper.addThread({}); // thread-123
      await CommentTableTestHelper.addComment({}); // comment-123
      const threadId = 'thread-123';
      const server = await createServer(container);

      // Action
      const responseThreadDetail = await server.inject({
        method: 'GET',
        url: `/threads/${threadId}`,
      });

      const responseThreadDetailjson = JSON.parse(responseThreadDetail.payload);
      expect(responseThreadDetail.statusCode).toEqual(200);
      expect(responseThreadDetailjson.status).toEqual('success');
      expect(responseThreadDetailjson.data.thread).toHaveProperty('id');
      expect(responseThreadDetailjson.data.thread.id).toEqual(threadId);
      expect(responseThreadDetailjson.data.thread.comments).toHaveLength(1);
      expect(responseThreadDetailjson.data.thread.comments[0].id).toBeDefined();
    });

    it('should response 200 and show thread with deleted comments', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({}); // user-123
      await ThreadsTableTestHelper.addThread({}); // thread-123
      await CommentTableTestHelper.addComment({}); // comment-123
      const threadId = 'thread-123';
      await CommentTableTestHelper.deleteCommentById('comment-123');
      const server = await createServer(container);

      // Action
      const responseThreadDetail = await server.inject({
        method: 'GET',
        url: `/threads/${threadId}`,
      });

      const responseThreadDetailjson = JSON.parse(responseThreadDetail.payload);
      expect(responseThreadDetail.statusCode).toEqual(200);
      expect(responseThreadDetailjson.status).toEqual('success');
      expect(responseThreadDetailjson.data.thread).toHaveProperty('id');
      expect(responseThreadDetailjson.data.thread.id).toEqual(threadId);
      expect(responseThreadDetailjson.data.thread.comments).toHaveLength(1);
      expect(responseThreadDetailjson.data.thread.comments[0].id).toBeDefined();
      expect(responseThreadDetailjson.data.thread.comments[0].content).toStrictEqual('**komentar telah dihapus**');
    });

    it('should response 200 and show thread with replies comments', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({}); // user-123
      await UsersTableTestHelper.addUser({
        id: 'user-124',
        username: 'naruto',
      });
      await ThreadsTableTestHelper.addThread({}); // thread-123
      await CommentTableTestHelper.addComment({}); // comment-123
      await CommentTableTestHelper.addComment({
        id: 'reply-123',
        thread_id: 'thread-123',
        parent_id: 'comment-123',
        owner: 'user-124',
      });

      const threadId = 'thread-123';
      const server = await createServer(container);

      // Action
      const responseThreadDetail = await server.inject({
        method: 'GET',
        url: `/threads/${threadId}`,
      });

      const responseThreadDetailjson = JSON.parse(responseThreadDetail.payload);
      expect(responseThreadDetail.statusCode).toEqual(200);
      expect(responseThreadDetailjson.status).toEqual('success');
      expect(responseThreadDetailjson.data.thread).toHaveProperty('id');
      expect(responseThreadDetailjson.data.thread.id).toEqual(threadId);
      expect(responseThreadDetailjson.data.thread.comments).toHaveLength(1);
      expect(responseThreadDetailjson.data.thread.comments[0].id).toBeDefined();
      expect(responseThreadDetailjson.data.thread.comments[0].replies).toHaveLength(1);
      expect(responseThreadDetailjson.data.thread.comments[0].replies[0].id).toBeDefined();
    });

    it('should response 200 and show thread with deleted replies comment', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({}); // user-123
      await UsersTableTestHelper.addUser({
        id: 'user-124',
        username: 'naruto',
      });
      await ThreadsTableTestHelper.addThread({}); // thread-123
      await CommentTableTestHelper.addComment({}); // comment-123
      await CommentTableTestHelper.addComment({
        id: 'reply-123',
        thread_id: 'thread-123',
        parent_id: 'comment-123',
        owner: 'user-124',
      });
      await CommentTableTestHelper.deleteCommentById('reply-123');

      const threadId = 'thread-123';
      const server = await createServer(container);

      // Action
      const responseThreadDetail = await server.inject({
        method: 'GET',
        url: `/threads/${threadId}`,
      });

      const responseThreadDetailjson = JSON.parse(responseThreadDetail.payload);
      expect(responseThreadDetail.statusCode).toEqual(200);
      expect(responseThreadDetailjson.status).toEqual('success');
      expect(responseThreadDetailjson.data.thread).toHaveProperty('id');
      expect(responseThreadDetailjson.data.thread.id).toEqual(threadId);
      expect(responseThreadDetailjson.data.thread.comments).toHaveLength(1);
      expect(responseThreadDetailjson.data.thread.comments[0].id).toBeDefined();
      expect(responseThreadDetailjson.data.thread.comments[0].replies).toHaveLength(1);
      expect(responseThreadDetailjson.data.thread.comments[0].replies[0].id).toBeDefined();
      expect(responseThreadDetailjson.data.thread.comments[0].replies[0].content).toStrictEqual('**balasan telah dihapus**');
    });
  });
});
