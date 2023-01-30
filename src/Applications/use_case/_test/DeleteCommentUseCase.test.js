const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const DeleteCommentUseCase = require('../DeleteCommentUseCase');

describe('DeleteCommentUseCase', () => {
  it('should orchestrating the delete comment action', async () => {
    // Arrange
    const parameter = {
      thread_id: 'thread-123',
      comment_id: 'comment-123',
      owner_id: 'user-123',
    };

    const expectedVerifyOwner = {
      id: parameter.comment_id,
      owner: parameter.owner_id,
    };

    const expectedResult = {
      status: 'success',
    };

    /** creating depedency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();

    /** mocking needed function */
    mockThreadRepository.verifyThreadAvaibility = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.verifyCommentAvailability = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.verifyOwner = jest.fn()
      .mockImplementation(() => Promise.resolve(expectedVerifyOwner));
    mockCommentRepository.deleteComment = jest.fn()
      .mockImplementation(() => Promise.resolve({
        id: parameter.comment_id,
        owner: parameter.owner_id,
      }));

    /** creating use case instance  */
    const getCommentUseCase = new DeleteCommentUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
    });

    // Action
    const deleteComment = await getCommentUseCase.execute(parameter);

    // Assert
    expect(deleteComment).toStrictEqual(expectedResult);
    expect(mockThreadRepository.verifyThreadAvaibility).toBeCalledWith(parameter.thread_id);
    expect(mockCommentRepository.verifyCommentAvailability).toBeCalledWith(parameter.comment_id);
    expect(mockCommentRepository.verifyOwner).toBeCalledWith(
      parameter.comment_id,
      parameter.owner_id,
    );
    expect(mockCommentRepository.deleteComment).toBeCalledWith(parameter.comment_id);
  });

  it('should orchestrating the delete replies comment action', async () => {
    // Arrange
    const parameter = {
      thread_id: 'thread-123',
      comment_id: 'comment-123',
      reply_id: 'reply-123',
      owner_id: 'user-124',
    };

    const expectedResult = {
      status: 'success',
    };

    /** creating depedency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();

    /** mocking needed function */
    mockThreadRepository.verifyThreadAvaibility = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.verifyCommentAvailability = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.verifyOwner = jest.fn()
      .mockImplementation(() => Promise.resolve({
        id: parameter.reply_id,
        owner: parameter.owner_id,
      }));
    mockCommentRepository.deleteComment = jest.fn()
      .mockImplementation(() => Promise.resolve({
        id: parameter.comment_id,
        owner: parameter.owner_id,
      }));

    /** creating use case instance  */
    const getCommentUseCase = new DeleteCommentUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
    });

    // Action
    const deleteComment = await getCommentUseCase.execute(parameter);

    // Assert
    expect(deleteComment).toStrictEqual(expectedResult);
    expect(mockThreadRepository.verifyThreadAvaibility)
      .toBeCalledWith(parameter.thread_id);
    expect(mockCommentRepository.verifyCommentAvailability)
      .toHaveBeenNthCalledWith(1, parameter.comment_id);
    expect(mockCommentRepository.verifyCommentAvailability)
      .toHaveBeenNthCalledWith(2, parameter.reply_id);
    expect(mockCommentRepository.verifyOwner).toBeCalledWith(
      parameter.reply_id,
      parameter.owner_id,
    );
    expect(mockCommentRepository.deleteComment).toBeCalledWith(parameter.reply_id);
  });

  it('should orchestrating failed to delete comment', async () => {
    // Arrange
    const parameter = {
      thread_id: 'thread-123',
      comment_id: 'comment-123',
      owner_id: 'user-123',
    };

    const expectedVerifyOwner = {
      id: parameter.comment_id,
      owner: parameter.owner_id,
    };

    const expectedResult = {
      status: 'fail',
    };

    /** creating depedency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();

    /** mocking needed function */
    mockThreadRepository.verifyThreadAvaibility = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.verifyCommentAvailability = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.verifyOwner = jest.fn()
      .mockImplementation(() => Promise.resolve(expectedVerifyOwner));
    mockCommentRepository.deleteComment = jest.fn()
      .mockImplementation(() => Promise.resolve({}));

    /** creating use case instance  */
    const getCommentUseCase = new DeleteCommentUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
    });

    // Action
    const deleteComment = await getCommentUseCase.execute(parameter);

    // Assert
    expect(deleteComment).toStrictEqual(expectedResult);
    expect(mockThreadRepository.verifyThreadAvaibility).toBeCalledWith(parameter.thread_id);
    expect(mockCommentRepository.verifyCommentAvailability).toBeCalledWith(parameter.comment_id);
    expect(mockCommentRepository.verifyOwner).toBeCalledWith(
      parameter.comment_id,
      parameter.owner_id,
    );
    expect(mockCommentRepository.deleteComment).toBeCalledWith(parameter.comment_id);
  });
});
