const dbConfig = {
  synchronize: false,
};

switch (process.env.NODE_ENV) {
  case 'debug':
  case 'dev':
    Object.assign(dbConfig, {
      synchronize: true,
      type: 'better-sqlite3',
      database: '/usr/src/app/' + (process.env.DB_NAME || 'dbDev.sqlite'),
      entities: ["../dist/**/*.entity.js"],
      cli: {
        "migrationsDir": "migrations",
      }
    });
    break;

  case 'test':
    Object.assign(dbConfig, {
      synchronize: true,
      type: 'better-sqlite3',
      database: process.env.DB_NAME || '/tmp/dbTest.sqlite',
      entities: ["../dist/**/*.entity.js"]
    });
    break;

  case 'production':
    Object.assign(dbConfig,
      {
        type: "postgres",
        host: "database_server",
        port: 5432,
        username: process.env.POSTGRES_USER || 'admin',
        password: process.env.POSTGRES_PASSWORD || 'admin',
        database: "db_production",
        entities: ["../dist/**/*.entity.js"],
        migrations: ["migrations/*.ts"],
        cli: {
          "migrationsDir": "migrations",
        }
      }
    );
    break;

  default:
    throw new Error('unknown environnement');
}

module.exports = dbConfig;

