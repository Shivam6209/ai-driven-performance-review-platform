import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || process.env.DATABASE_PORT || '5432', 10),
  username: process.env.DB_USERNAME || process.env.DATABASE_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || process.env.DATABASE_PASSWORD || 'postgres',
  database: process.env.DB_DATABASE || process.env.DB_NAME || process.env.DATABASE_NAME || 'performance_review_db',
  entities: [__dirname + '/**/*.entity{.ts,.js}'],
  synchronize: false,
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
  logging: process.env.NODE_ENV !== 'production',
  ssl: process.env.NODE_ENV === 'production' || process.env.DB_SSL === 'true' || process.env.DB_HOST?.includes('aivencloud.com') ? {
    rejectUnauthorized: false
  } : false,
  extra: {
    max: 25,
    connectionTimeoutMillis: 10000,
  },
});

export default AppDataSource; 