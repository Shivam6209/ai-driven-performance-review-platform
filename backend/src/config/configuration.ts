export default () => ({
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Database
  database: {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
  },

  // JWT
  jwt: {
    secret: process.env.JWT_SECRET || 'super-secret',
    expiresIn: process.env.JWT_EXPIRATION || '24h',
  },

  // Firebase Admin
  firebase: {
    projectId: process.env.FIREBASE_PROJECT_ID,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    databaseURL: process.env.FIREBASE_DATABASE_URL,
  },

  // OpenAI
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
    model: process.env.OPENAI_MODEL || 'gpt-4',
    maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS || '2000', 10),
  },

  // Pinecone
  pinecone: {
    apiKey: process.env.PINECONE_API_KEY,
    environment: process.env.PINECONE_ENVIRONMENT,
    index: process.env.PINECONE_INDEX,
  },

  // Redis
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  },

  // Email (Mailjet)
  email: {
    apiKey: process.env.MAILJET_API_KEY,
    apiSecret: process.env.MAILJET_API_SECRET,
    fromEmail: process.env.FROM_EMAIL,
    fromName: process.env.FROM_NAME,
  },

  // Frontend URL (for CORS)
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
}); 