const CommentRepository = require('../../../Domains/comments/CommentRepository');
const RepliesCommentRepository = require('../../../Domains/comments/RepliesRepository');
const LikeCommentRepository = require('../../../Domains/comments/LikeRepository');
const Comment = require('../../../Domains/comments/entities/Comment');
const ReplyComment = require('../../../Domains/comments/entities/ReplyComment');
const ItemThread = require('../../../Domains/threads/entities/ItemThread');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const DetailThreadUseCase = require('../DetailThreadUseCase');

describe('DetailThreadUseCase', () => {
  it('should orchestrating get detail thread with no comment', async () => {
    // Arrange
    const params = {
      thread_id: 'thread-123',
    };

    const thread = new ItemThread({
      id: params.thread_id,
      title: 'sebuah thread',
      body: 'sebuah body thread',
      date: '2021-08-08T07:59:16.198Z',
      username: 'user-001',
    });

    thread.comments = [];

    const expectedResult = { thread };

    /** creating depedency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();

    /** mocking needed function */
    mockThreadRepository.getThreadById = jest.fn()
      .mockImplementation(() => Promise.resolve(new ItemThread({
        id: params.thread_id,
        title: 'sebuah thread',
        body: 'sebuah body thread',
        date: '2021-08-08T07:59:16.198Z',
        username: 'user-001',
      })));
    mockCommentRepository.getCommentByThreadId = jest.fn()
      .mockImplementation(() => Promise.resolve([]));

    /** creating use case instance  */
    const getThreadUseCase = new DetailThreadUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
    });

    // Action
    const detailThread = await getThreadUseCase.execute(params);

    // Assert
    expect(detailThread).toStrictEqual(expectedResult);
    expect(mockThreadRepository.getThreadById).toBeCalledWith(params.thread_id);
    expect(mockCommentRepository.getCommentByThreadId).toBeCalledWith(params.thread_id);
  });

  it('should orchestrating get detail thread with comment and replies', async () => {
    // Arrange
    const params = {
      thread_id: 'thread-123',
    };

    const expectedResult = {
      thread: {
        id: params.thread_id,
        title: 'sebuah thread',
        body: 'sebuah body thread',
        date: '2021-08-08T07:59:16.198Z',
        username: 'user-001',
        comments: [
          new Comment({
            id: 'comment-123',
            username: 'user-002',
            date: '2021-08-08T07:59:18.982Z',
            content: 'keren sekali',
            likeCount: 2,
          }, []),
          new Comment({
            id: 'comment-124',
            username: 'user-003',
            date: '2021-08-09T07:59:18.982Z',
            content: 'mantap betul',
            likeCount: 0,
          }, [
            new ReplyComment({
              content: 'iya memang mantap',
              date: '2021-08-08T07:59:48.766Z',
              id: 'reply-123',
              username: 'user-004',
            }),
          ]),
        ],
      },
    };

    /** creating depedency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockRepliesCommentRepository = new RepliesCommentRepository();
    const mockLikeCommentRepository = new LikeCommentRepository();

    /** mocking needed function */
    mockThreadRepository.getThreadById = jest.fn()
      .mockImplementation(() => Promise.resolve({
        id: params.thread_id,
        title: 'sebuah thread',
        body: 'sebuah body thread',
        date: '2021-08-08T07:59:16.198Z',
        username: 'user-001',
      }));

    mockCommentRepository.getCommentByThreadId = jest.fn()
      .mockImplementation(() => Promise.resolve([
        {
          id: 'comment-123',
          username: 'user-002',
          date: '2021-08-08T07:59:18.982Z',
          content: 'keren sekali',
          deleted_at: null,
        },
        {
          id: 'comment-124',
          username: 'user-003',
          date: '2021-08-09T07:59:18.982Z',
          content: 'mantap betul',
          deleted_at: null,
        },
      ]));

    mockRepliesCommentRepository.getRepliesByCommentId = jest.fn()
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([
        {
          id: 'reply-123',
          content: 'iya memang mantap',
          date: '2021-08-08T07:59:48.766Z',
          username: 'user-004',
          deleted_at: null,
        },
      ]);

    mockLikeCommentRepository.getTotalLike = jest.fn()
      .mockResolvedValueOnce({ total_like: '2' })
      .mockResolvedValueOnce({ total_like: '0' });

    /** creating use case instance  */
    const getThreadUseCase = new DetailThreadUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      repliesCommentRepository: mockRepliesCommentRepository,
      likeCommentRepository: mockLikeCommentRepository,
    });

    // Action
    const detailThread = await getThreadUseCase.execute(params);

    // Assert
    expect(detailThread).toStrictEqual(expectedResult);
    expect(mockThreadRepository.getThreadById).toBeCalledWith(params.thread_id);
    expect(mockCommentRepository.getCommentByThreadId).toBeCalledWith(params.thread_id);
    expect(mockRepliesCommentRepository.getRepliesByCommentId).toHaveBeenNthCalledWith(1, params.thread_id, 'comment-123');
    expect(mockRepliesCommentRepository.getRepliesByCommentId).toHaveBeenNthCalledWith(2, params.thread_id, 'comment-124');
    expect(mockLikeCommentRepository.getTotalLike).toHaveBeenNthCalledWith(1, 'comment-123');
    expect(mockLikeCommentRepository.getTotalLike).toHaveBeenNthCalledWith(2, 'comment-124');
    expect(mockRepliesCommentRepository.getRepliesByCommentId)
      .toBeCalledTimes(expectedResult.thread.comments.length);
  });

  it('should orchestrating get detail thread with deleted comment and replies', async () => {
    // Arrange
    const params = {
      thread_id: 'thread-123',
    };

    const expectedResult = {
      thread: {
        id: params.thread_id,
        title: 'sebuah thread',
        body: 'sebuah body thread',
        date: '2021-08-08T07:59:16.198Z',
        username: 'user-001',
        comments: [
          new Comment({
            id: 'comment-123',
            username: 'user-002',
            date: '2021-08-08T07:59:18.982Z',
            content: '**komentar telah dihapus**',
            likeCount: 2,
          }, []),
          new Comment({
            id: 'comment-124',
            username: 'user-003',
            date: '2021-08-09T07:59:18.982Z',
            content: 'mantap betul',
            likeCount: 0,
          }, [new ReplyComment({
            id: 'reply-123',
            content: 'iya memang mantap',
            date: '2021-08-08T07:59:48.766Z',
            username: 'user-004',
            deleted_at: '2023-01-10T01:10:41.796Z',
          })]),
        ],
      },
    };

    /** creating depedency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockRepliesCommentRepository = new RepliesCommentRepository();
    const mockLikeCommentRepository = new LikeCommentRepository();

    /** mocking needed function */
    mockThreadRepository.getThreadById = jest.fn()
      .mockImplementation(() => Promise.resolve({
        id: params.thread_id,
        title: 'sebuah thread',
        body: 'sebuah body thread',
        date: '2021-08-08T07:59:16.198Z',
        username: 'user-001',
      }));

    mockCommentRepository.getCommentByThreadId = jest.fn()
      .mockImplementation(() => Promise.resolve([
        {
          id: 'comment-123',
          username: 'user-002',
          date: '2021-08-08T07:59:18.982Z',
          content: 'keren sekali',
          deleted_at: '2023-01-10T01:10:41.796Z',
        },
        {
          id: 'comment-124',
          username: 'user-003',
          date: '2021-08-09T07:59:18.982Z',
          content: 'mantap betul',
          deleted_at: null,
        },
      ]));

    mockRepliesCommentRepository.getRepliesByCommentId = jest.fn()
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([
        {
          id: 'reply-123',
          content: 'iya memang mantap',
          date: '2021-08-08T07:59:48.766Z',
          username: 'user-004',
          deleted_at: '2023-01-10T01:10:41.796Z',
        },
      ]);

    mockLikeCommentRepository.getTotalLike = jest.fn()
      .mockResolvedValueOnce({ total_like: '2' })
      .mockResolvedValueOnce({ total_like: '0' });

    /** creating use case instance  */
    const getThreadUseCase = new DetailThreadUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      repliesCommentRepository: mockRepliesCommentRepository,
      likeCommentRepository: mockLikeCommentRepository,
    });

    // Action
    const detailThread = await getThreadUseCase.execute(params);

    // Assert
    expect(detailThread).toStrictEqual(expectedResult);
    expect(mockThreadRepository.getThreadById).toBeCalledWith(params.thread_id);
    expect(mockCommentRepository.getCommentByThreadId).toBeCalledWith(params.thread_id);
    expect(mockRepliesCommentRepository.getRepliesByCommentId).toHaveBeenNthCalledWith(1, params.thread_id, 'comment-123');
    expect(mockRepliesCommentRepository.getRepliesByCommentId).toHaveBeenNthCalledWith(2, params.thread_id, 'comment-124');
    expect(mockLikeCommentRepository.getTotalLike).toHaveBeenNthCalledWith(1, 'comment-123');
    expect(mockLikeCommentRepository.getTotalLike).toHaveBeenNthCalledWith(2, 'comment-124');
    expect(mockRepliesCommentRepository.getRepliesByCommentId)
      .toBeCalledTimes(expectedResult.thread.comments.length);
  });

  it('should orchestrating get detail thread with total like in each comment', async () => {
    // Arrange
    const params = {
      thread_id: 'thread-123',
    };

    const expectedResult = {
      thread: {
        id: params.thread_id,
        title: 'sebuah thread',
        body: 'sebuah body thread',
        date: '2021-08-08T07:59:16.198Z',
        username: 'user-001',
        comments: [
          new Comment({
            id: 'comment-123',
            username: 'user-002',
            date: '2021-08-08T07:59:18.982Z',
            content: 'keren sekali',
            likeCount: 2,
          }, []),
          new Comment({
            id: 'comment-124',
            username: 'user-003',
            date: '2021-08-09T07:59:18.982Z',
            content: 'mantap betul',
            likeCount: 0,
          }, [
            new ReplyComment({
              content: 'iya memang mantap',
              date: '2021-08-08T07:59:48.766Z',
              id: 'reply-123',
              username: 'user-004',
            }),
          ]),
        ],
      },
    };

    /** creating depedency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockRepliesCommentRepository = new RepliesCommentRepository();
    const mockLikeCommentRepository = new LikeCommentRepository();

    /** mocking needed function */
    mockThreadRepository.getThreadById = jest.fn()
      .mockImplementation(() => Promise.resolve({
        id: params.thread_id,
        title: 'sebuah thread',
        body: 'sebuah body thread',
        date: '2021-08-08T07:59:16.198Z',
        username: 'user-001',
      }));

    mockCommentRepository.getCommentByThreadId = jest.fn()
      .mockImplementation(() => Promise.resolve([
        {
          id: 'comment-123',
          username: 'user-002',
          date: '2021-08-08T07:59:18.982Z',
          content: 'keren sekali',
          deleted_at: null,
        },
        {
          id: 'comment-124',
          username: 'user-003',
          date: '2021-08-09T07:59:18.982Z',
          content: 'mantap betul',
          deleted_at: null,
        },
      ]));

    mockLikeCommentRepository.getTotalLike = jest.fn()
      .mockResolvedValueOnce({ total_like: '2' })
      .mockResolvedValueOnce({ total_like: '0' });

    mockRepliesCommentRepository.getRepliesByCommentId = jest.fn()
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([
        {
          id: 'reply-123',
          content: 'iya memang mantap',
          date: '2021-08-08T07:59:48.766Z',
          username: 'user-004',
          deleted_at: null,
        },
      ]);

    /** creating use case instance  */
    const getThreadUseCase = new DetailThreadUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      repliesCommentRepository: mockRepliesCommentRepository,
      likeCommentRepository: mockLikeCommentRepository,
    });

    // Action
    const detailThread = await getThreadUseCase.execute(params);

    // Assert
    expect(detailThread).toStrictEqual(expectedResult);
    expect(mockThreadRepository.getThreadById).toBeCalledWith(params.thread_id);
    expect(mockCommentRepository.getCommentByThreadId).toBeCalledWith(params.thread_id);
    expect(mockRepliesCommentRepository.getRepliesByCommentId).toHaveBeenNthCalledWith(1, params.thread_id, 'comment-123');
    expect(mockRepliesCommentRepository.getRepliesByCommentId).toHaveBeenNthCalledWith(2, params.thread_id, 'comment-124');
    expect(mockLikeCommentRepository.getTotalLike).toHaveBeenNthCalledWith(1, 'comment-123');
    expect(mockLikeCommentRepository.getTotalLike).toHaveBeenNthCalledWith(2, 'comment-124');
    expect(mockRepliesCommentRepository.getRepliesByCommentId)
      .toBeCalledTimes(expectedResult.thread.comments.length);
  });
});
