const CommentRepository = require('../../../Domains/comments/CommentRepository');
const LikeRepository = require('../../../Domains/comments/LikeRepository');
const AddLikeComment = require('../../../Domains/comments/entities/AddLikeComment');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const AddLikeCommentUseCase = require('../AddLikeCommentUseCase');

describe('AddLikeCommentUseCase', () => {
  it('should orchestrating the add like to comment', async () => {
    // Arrange
    const useCasePayload = {
      threadId: 'thread-123',
      owner: 'user-124',
      commentId: 'comment-123',
    };

    const expectedResult = {
      status: 'success',
    };

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockLikeRepository = new LikeRepository();

    /** mocking needed function */
    mockThreadRepository.verifyThreadAvaibility = jest.fn(() => Promise.resolve());
    mockCommentRepository.verifyCommentAvailability = jest.fn(() => Promise.resolve());
    mockLikeRepository.addOrDeleteLike = jest.fn()
      .mockImplementation(() => Promise.resolve(true));

    /** creating use case instance */
    const getLikeCommentUseCase = new AddLikeCommentUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      likeRepository: mockLikeRepository,
    });

    // Action
    const likeComment = await getLikeCommentUseCase.execute(useCasePayload);

    // Assert
    expect(likeComment).toStrictEqual(expectedResult);
    expect(mockThreadRepository.verifyThreadAvaibility).toBeCalledWith(useCasePayload.threadId);
    expect(mockCommentRepository.verifyCommentAvailability)
      .toBeCalledWith(useCasePayload.commentId);
    expect(mockLikeRepository.addOrDeleteLike)
      .toBeCalledWith(new AddLikeComment(useCasePayload));
  });
});
