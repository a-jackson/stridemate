/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
  pgm.addColumns('activities', {
    deleted: {
      type: 'boolean',
      default: false,
      notNull: true,
    },
  });
};

exports.down = pgm => {};
