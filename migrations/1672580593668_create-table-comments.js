exports.up = (pgm) => {
  pgm.dropTable('comments', {
    ifExists: true,
    cascade: true,
  });

  pgm.createTable(
    'comments',
    {
      id: {
        type: 'VARCHAR(50)',
        primaryKey: true,
      },
      content: {
        type: 'TEXT',
        notNull: true,
      },
      thread_id: {
        type: 'VARCHAR(50)',
        notNull: true,
      },
      parent_id: {
        type: 'VARCHAR(50)',
        notNull: false,
      },
      owner: {
        type: 'VARCHAR(50)',
        notNull: true,
      },
      created_at: {
        type: 'TEXT',
        notNull: true,
      },
      updated_at: {
        type: 'TEXT',
        notNull: true,
      },
      deleted_at: {
        type: 'TEXT',
        notNull: false,
      },
    },
    {
      constraints: {
        foreignKeys: [
          {
            columns: 'owner',
            references: 'users(id)',
            onDelete: 'cascade',
          },
          {
            columns: 'parent_id',
            references: 'comments(id)',
            onDelete: 'cascade',
          },
        ],
      },
    },
  );
};

exports.down = (pgm) => {
  pgm.dropTable('comments', {
    ifExists: true,
    cascade: true,
  });
};
