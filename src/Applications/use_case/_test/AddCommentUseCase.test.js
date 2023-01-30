const CommentRepository = require('../../../Domains/comments/CommentRepository');
const AddedComment = require('../../../Domains/comments/entities/AddedComment');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const AddCommentUseCase = require('../AddCommentUseCase');

describe('AddComentUseCase', () => {
  it('should orchestrating the add comment to thread', async () => {
    // Arrange
    const useCasePayload = {
      content: 'komentar thread 1',
      thread_id: 'thread-123',
      owner: 'user-123',
    };

    const expectedResult = {
      addedComment: new AddedComment({
        id: 'thread-123',
        content: 'komentar thread 1',
        owner: 'user-123',
      }),
    };

    /** creating depedency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();

    /** mocking needed function */
    mockThreadRepository.verifyThreadAvaibility = jest.fn(() => Promise.resolve());

    mockCommentRepository.addComment = jest
      .fn()
      .mockImplementation(() => Promise.resolve(new AddedComment({
        id: 'thread-123',
        content: 'komentar thread 1',
        owner: 'user-123',
      })));

    /** creating use case instance */
    const getCommentUseCase = new AddCommentUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
    });

    // Action
    const addedComment = await getCommentUseCase.execute(useCasePayload);

    // Assert
    expect(addedComment).toStrictEqual(expectedResult);
    expect(mockThreadRepository.verifyThreadAvaibility).toBeCalledWith(useCasePayload.thread_id);
    expect(mockCommentRepository.addComment).toBeCalledWith(useCasePayload);
  });
});
