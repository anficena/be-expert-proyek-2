const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const AddThread = require('../../../Domains/threads/entities/AddThread');
const AddedThread = require('../../../Domains/threads/entities/AddedThread');
const pool = require('../../database/postgres/pool');
const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const ItemThread = require('../../../Domains/threads/entities/ItemThread');

describe('ThreadRepositoryPostgres', () => {
  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addThread function', () => {
    it('should persist thread and return added thread correctly', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({});
      const addThread = new AddThread({
        title: 'first thread',
        body: 'body thread',
        owner: 'user-123',
      });

      const fakeIdGenerator = () => '123'; // stub!
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await threadRepositoryPostgres.addThread(addThread);

      // Assert
      const threads = await ThreadsTableTestHelper.findThreadsById('thread-123');
      expect(threads).toHaveLength(1);
    });

    it('should return added thread correctly', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({});
      const addThread = new AddThread({
        title: 'first thread',
        body: 'body thread',
        owner: 'user-123',
      });

      const fakeIdGenerator = () => '123'; // stub!
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const addedThread = await threadRepositoryPostgres.addThread(addThread);

      // Assert
      expect(addedThread).toStrictEqual(
        new AddedThread({
          id: 'thread-123',
          title: 'first thread',
          owner: 'user-123',
        }),
      );
    });
  });

  describe('verifyThreadAvaibility', () => {
    it('should throw NotFoundError when thread not found', () => {
      // Arrange
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action & Assert
      return expect(threadRepositoryPostgres.verifyThreadAvaibility('thread-100')).rejects.toThrowError(NotFoundError);
    });

    it('it should not throw NotFoundError when thread exist', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({});
      const date = new Date().toISOString();
      await ThreadsTableTestHelper.addThread({ createdAt: date });
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(threadRepositoryPostgres.verifyThreadAvaibility('thread-123'))
        .resolves.not.toThrow(NotFoundError);
    });
  });

  describe('getThreadById', () => {
    it('should throw NotFoundError when thread not found', () => {
      // Arrange
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action & Assert
      return expect(threadRepositoryPostgres.getThreadById('thread-100')).rejects.toThrowError(NotFoundError);
    });

    it('it should return thread when threadId found', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({});
      const date = new Date().toISOString();
      await ThreadsTableTestHelper.addThread({ createdAt: date });
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action
      const threads = await threadRepositoryPostgres.getThreadById('thread-123');

      // Assert
      expect(threads).toStrictEqual(new ItemThread({
        id: 'thread-123',
        title: 'first thread',
        body: 'body thread',
        date,
        username: 'dicoding',
      }));
    });
  });
});
