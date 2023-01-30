const AddedThread = require('../AddedThread');

describe(' a addedThread entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arange
    const payload = {
      id: 'thread-001',
      title: 'first thread',
    };

    // Action and Assert
    expect(() => new AddedThread(payload)).toThrowError('ADDED_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arange
    const payload = {
      id: 123,
      title: 'first thread',
      owner: 99,
    };

    // Action and Assert
    expect(() => new AddedThread(payload)).toThrowError('ADDED_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create thread object correctly', () => {
    // Arange
    const payload = {
      id: 'thread-001',
      title: 'first thread',
      owner: 'user-001',
    };

    // Action
    const addedThread = new AddedThread(payload);

    // Assert
    expect(addedThread.id).toEqual(payload.id);
    expect(addedThread.title).toEqual(payload.title);
    expect(addedThread.owner).toEqual(payload.owner);
  });
});
