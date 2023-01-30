class ReplyComment {
  constructor({
    id,
    username,
    date,
    content,
    deleted_at: deletedAt,
  }) {
    this.id = id;
    this.username = username;
    this.date = date;
    this.content = deletedAt ? '**balasan telah dihapus**' : content;
  }
}

module.exports = ReplyComment;
