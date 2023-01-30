const ItemThread = require('../ItemThread');

describe(' a itemThread entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arange
    const payload = {
      id: 'thread-001',
      title: 'first thread',
    };

    // Action and Assert
    expect(() => new ItemThread(payload)).toThrowError('ITEM_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arange
    const payload = {
      id: 'thread-001',
      title: 123,
      body: 'user-001',
      date: new Date(),
      username: 'naruto uzumaki',
    };

    // Action and Assert
    expect(() => new ItemThread(payload)).toThrowError('ITEM_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should return thread object correctly', () => {
    // Arange
    const payload = {
      id: 'thread-001',
      title: 'first thread',
      body: 'user-001',
      date: '2021-08-08T07:59:48.766Z',
      username: 'naruto uzumaki',
    };

    // Action
    const itemThread = new ItemThread(payload);

    // Assert
    expect(itemThread.id).toEqual(payload.id);
    expect(itemThread.title).toEqual(payload.title);
    expect(itemThread.body).toEqual(payload.body);
    expect(itemThread.date).toEqual(payload.date);
    expect(itemThread.username).toEqual(payload.username);
  });
});
