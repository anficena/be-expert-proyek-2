const AddLikeComment = require('../AddLikeComment');

describe('a like comment entities', () => {
  it('should create like comment object correctly', () => {
    // Arange
    const payload = {
      threadId: 'thread-123',
      commentId: 'comment-123',
      owner: 'user-123',
    };

    // Action
    const likeComment = new AddLikeComment(payload);

    // Assert
    expect(likeComment.comment_id).toEqual(payload.commentId);
    expect(likeComment.owner).toEqual(payload.owner);
  });

  it('should throw error when payload did not contain needed property', () => {
    // Arange
    const payload = {};

    // Action and Assert
    expect(() => new AddLikeComment(payload)).toThrowError('ADD_LIKE_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arange
    const payload = {
      threadId: 1234,
      commentId: true,
      owner: [],
    };

    // Action and Assert
    expect(() => new AddLikeComment(payload)).toThrowError('ADD_LIKE_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });
});
