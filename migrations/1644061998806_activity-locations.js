/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
  pgm.createTable('activity_locations', {
    activityLocationId: 'id',
    activityId: {
      type: 'integer',
      notNull: true,
      references: '"activities"',
    },
    latitude: {
      type: 'numeric',
      notNull: true,
    },
    longitude: {
      type: 'numeric',
      notNull: true,
    },
    altitude: {
      type: 'integer',
      notNull: true,
    },
    accuracy: {
      type: 'numeric',
      notNull: true,
    },
    time: {
      type: 'timestamp',
      notNull: true,
    },
  });
};

exports.down = pgm => {};
