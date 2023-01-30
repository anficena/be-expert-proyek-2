exports.up = (pgm) => {
  pgm.dropTable('comment_likes', {
    ifExists: true,
    cascade: true,
  });

  pgm.createTable('comment_likes', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    comment_id: {
      type: 'VARCHAR(50)',
      notNull: false,
    },
    owner: {
      type: 'VARCHAR(50)',
      notNull: false,
    },
  }, {
    constraints: {
      foreignKeys: [
        {
          columns: 'owner',
          references: 'users(id)',
          onDelete: 'cascade',
        },
        {
          columns: 'comment_id',
          references: 'comments(id)',
          onDelete: 'cascade',
        },
      ],
    },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('comment_likes', {
    ifExists: true,
    cascade: true,
  });
};
