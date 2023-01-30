const RepliesRepository = require('../RepliesRepository');

describe('RepliesRepository interface', () => {
  it('should throw error when invoke abstract behavior', async () => {
    // Arrange
    const commentRepository = new RepliesRepository();

    // Action and Assert
    await expect(commentRepository.repliesComment('', '')).rejects.toThrowError('COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    await expect(commentRepository.getRepliesByCommentId('', '')).rejects.toThrowError('COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  });
});
