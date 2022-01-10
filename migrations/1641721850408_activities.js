/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
  pgm.createTable('activities', {
    activityId: 'id',
    name: { type: 'varchar(20)', notNull: true },
    startTime: { type: 'timestamp', notNull: true },
    endTime: { type: 'timestamp', notNull: true },
    distanceKm: { type: 'real', notNull: true },
    avgSpeedKm: { type: 'real', notNull: true },
    deviceId: {
      type: 'integer',
      notNull: true,
      references: '"devices"',
    },
  });
};

exports.down = pgm => {};
