const AddedComment = require('../AddedComment');

describe('a addedComment entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arange
    const payload = {
      id: 'comment-001',
      content: 'comment thread',
    };

    // Action and Assert
    expect(() => new AddedComment(payload)).toThrowError('ADDED_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arange
    const payload = {
      id: 123,
      content: 'comment thread',
      owner: 99,
    };

    // Action and Assert
    expect(() => new AddedComment(payload)).toThrowError('ADDED_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create comment object correctly', () => {
    // Arange
    const payload = {
      id: 'comment-001',
      content: 'comment thread',
      owner: 'user-001',
    };

    // Action
    const addedComment = new AddedComment(payload);

    // Assert
    expect(addedComment.id).toEqual(payload.id);
    expect(addedComment.content).toEqual(payload.content);
    expect(addedComment.owner).toEqual(payload.owner);
  });
});
