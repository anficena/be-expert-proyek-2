const AddThread = require('../AddThread');

describe(' a Thread entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arange
    const payload = {
      title: 'first thread',
    };

    // Action and Assert
    expect(() => new AddThread(payload)).toThrowError('ADD_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arange
    const payload = {
      title: 'first thread',
      body: [],
      owner: 123,
    };

    // Action and Assert
    expect(() => new AddThread(payload)).toThrowError('ADD_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create thread object correctly', () => {
    // Arange
    const payload = {
      title: 'first thread',
      body: 'description first thread',
      owner: 'user-123',
    };

    // Action
    const { title, body, owner } = new AddThread(payload);

    // Assert
    expect(title).toEqual(payload.title);
    expect(body).toEqual(payload.body);
    expect(owner).toEqual(payload.owner);
  });
});
