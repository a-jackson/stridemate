/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
  pgm.createIndex('activity_locations', 'activityId', {
    name: 'IX_activity_locations_activityId',
  });
};

exports.down = pgm => {};
