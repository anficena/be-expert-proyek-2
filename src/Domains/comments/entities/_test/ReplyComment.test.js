const ReplyComment = require('../ReplyComment');

describe('a comment entities', () => {
  it('should create comment object correctly', () => {
    // Arange
    const payload = {
      id: 'reply-1',
      username: 'uzumakiboruto',
      date: '2021-08-08T10:59:16.198Z',
      content: 'it is good',
      deleted_at: '',
    };

    // Action
    const replyComment = new ReplyComment(payload);

    // Assert
    expect(replyComment.id).toEqual(payload.id);
    expect(replyComment.content).toEqual('it is good');
    expect(replyComment.username).toEqual(payload.username);
    expect(replyComment.date).toEqual(payload.date);
  });

  it('should create deleted reply comment object correctly', () => {
    // Arange
    const payload = {
      id: 'reply-1',
      username: 'uzumakiboruto',
      date: '2021-08-08T10:59:16.198Z',
      content: 'it is good',
      deleted_at: '2021-08-10T10:59:16.198Z',
    };

    // Action
    const replyComment = new ReplyComment(payload);

    // Assert
    expect(replyComment.id).toEqual(payload.id);
    expect(replyComment.content).toEqual('**balasan telah dihapus**');
    expect(replyComment.username).toEqual(payload.username);
    expect(replyComment.date).toEqual(payload.date);
  });
});
