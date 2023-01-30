exports.up = (pgm) => {
  pgm.dropTable('threads', {
    ifExists: true,
    cascade: true,
  });

  pgm.createTable(
    'threads',
    {
      id: {
        type: 'VARCHAR(50)',
        primaryKey: true,
      },
      title: {
        type: 'TEXT',
        notNull: true,
      },
      body: {
        type: 'TEXT',
        notNull: true,
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
    },
    {
      constraints: {
        foreignKeys: {
          columns: 'owner',
          references: 'users(id)',
          onDelete: 'cascade',
        },
      },
    },
  );
};

exports.down = (pgm) => {
  pgm.dropTable('threads', {
    ifExists: true,
    cascade: true,
  });
};
