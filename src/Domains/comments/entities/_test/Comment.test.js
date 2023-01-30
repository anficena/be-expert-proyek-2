const Comment = require('../Comment');

describe('a comment entities', () => {
  it('should create comment object correctly', () => {
    // Arange
    const payload = {
      id: 'comment-001',
      content: 'detail comment',
      date: '2021-08-08T07:59:16.198Z',
      username: 'uzumakinaruto',
      deleted_at: '',
    };

    const reply = [];

    // Action
    const comment = new Comment(payload, reply);

    // Assert
    expect(comment.id).toEqual(payload.id);
    expect(comment.content).toEqual('detail comment');
    expect(comment.username).toEqual(payload.username);
    expect(comment.date).toEqual(payload.date);
    expect(comment.replies).toHaveLength(0);
  });

  it('should create deleted comment object correctly', () => {
    // Arange
    const payload = {
      id: 'comment-001',
      content: 'detail comment',
      date: '2021-08-08T07:59:16.198Z',
      username: 'uzumakinaruto',
      deleted_at: '2021-08-00T07:59:16.198Z',
    };

    const reply = [];

    // Action
    const comment = new Comment(payload, reply);

    // Assert
    expect(comment.id).toEqual(payload.id);
    expect(comment.content).toEqual('**komentar telah dihapus**');
    expect(comment.username).toEqual(payload.username);
    expect(comment.date).toEqual(payload.date);
    expect(comment.replies).toHaveLength(0);
  });
});
