/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
  pgm.createTable('users', {
    userId: 'id',
    name: { type: 'varchar(100)', notNull: true },
  });

  pgm.createTable('devices', {
    deviceId: 'id',
    name: { type: 'varchar(100)', notNull: true },
    userId: {
      type: 'integer',
      notNull: true,
      references: '"users"',
    },
  });

  pgm.createTable('locations', {
    locationId: 'id',
    deviceId: {
      type: 'integer',
      notNull: true,
      references: '"devices"',
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
      type: 'integer',
      notNull: true,
    },
    velocity: {
      type: 'integer',
      notNull: true,
    },
    time: {
      type: 'timestamp',
      notNull: true,
    },
  });
};

exports.down = pgm => {};
