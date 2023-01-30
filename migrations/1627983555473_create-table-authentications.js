exports.up = (pgm) => {
  pgm.dropTable('authentications', {
    ifExists: true,
    cascade: true,
  });

  pgm.createTable('authentications', {
    token: {
      type: 'TEXT',
      notNull: true,
    },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('authentications');
};
