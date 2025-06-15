import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

const config: TypeOrmModuleOptions = {
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  synchronize: process.env.NODE_ENV !== 'production',
  migrations: [__dirname + '/../database/migrations/*{.ts,.js}'],
  migrationsRun: true,
  logging: process.env.NODE_ENV !== 'production',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  extra: {
    max: 25,
    connectionTimeoutMillis: 10000,
  },
};

export default config; 