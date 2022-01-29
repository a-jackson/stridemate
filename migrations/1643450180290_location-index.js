/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
  pgm.createIndex('locations', 'time');
};

exports.down = pgm => {};
