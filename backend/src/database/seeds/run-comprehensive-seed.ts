import { seedComprehensiveData } from './comprehensive-seed';
import { createDatabaseConnection } from '../../config/database.config';

async function runSeed() {
  console.log('🚀 Initializing database connection...');
  
  const dataSource = createDatabaseConnection();

  try {
    await dataSource.initialize();
    console.log('✅ Database connection established');

    await seedComprehensiveData(dataSource);

    console.log('🎉 Seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    process.exit(1);
  } finally {
    await dataSource.destroy();
    console.log('🔌 Database connection closed');
  }
}

// Run the seed if this file is executed directly
if (require.main === module) {
  runSeed();
}

export { runSeed }; 