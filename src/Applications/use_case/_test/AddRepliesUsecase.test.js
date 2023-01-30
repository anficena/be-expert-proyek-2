const CommentRepository = require('../../../Domains/comments/CommentRepository');
const RepliesCommentRepository = require('../../../Domains/comments/RepliesRepository');
const AddComment = require('../../../Domains/comments/entities/AddComment');
const AddedComment = require('../../../Domains/comments/entities/AddedComment');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const AddRepliesUseCase = require('../AddRepliesUseCase');

describe('AddRepliesUseCase', () => {
  it('should orchestrating the add replies comment', async () => {
    // Arrange
    const useCasePayload = {
      thread_id: 'thread-123',
      content: 'balasan komentar thread 1',
      parent_id: 'comment-123',
      owner: 'user-123',
    };

    const expectedResult = {
      addedReply: new AddedComment({
        id: 'reply-123',
        content: useCasePayload.content,
        owner: 'user-123',
      }),
    };

    /** creating depedency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockRepliesCommentRepository = new RepliesCommentRepository();

    /** mocking needed function */
    mockThreadRepository.verifyThreadAvaibility = jest.fn(() => Promise.resolve());
    mockCommentRepository.verifyCommentAvailability = jest.fn(() => Promise.resolve());
    mockRepliesCommentRepository.repliesComment = jest.fn()
      .mockImplementation(() => Promise.resolve(new AddedComment({
        id: 'reply-123',
        content: useCasePayload.content,
        owner: 'user-123',
      })));

    /** creating use case instance */
    const getCommentUseCase = new AddRepliesUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      repliesCommentRepository: mockRepliesCommentRepository,
    });

    // Action
    const addedReplies = await getCommentUseCase.execute(useCasePayload);

    // Assert
    expect(addedReplies).toStrictEqual(expectedResult);
    expect(mockThreadRepository.verifyThreadAvaibility).toBeCalledWith(useCasePayload.thread_id);
    expect(mockCommentRepository.verifyCommentAvailability)
      .toBeCalledWith(useCasePayload.parent_id);
    expect(mockRepliesCommentRepository.repliesComment)
      .toBeCalledWith(new AddComment(useCasePayload));
  });
});
