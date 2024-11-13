const mongoose = require('mongoose');

async function checkDatabaseConnection() {
  try {
    const state = mongoose.connection.readyState;
    const states = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };
    
    console.log(`MongoDB connection status: ${states[state]}`);
    
    if (state === 1) {
      const dbName = mongoose.connection.db.databaseName;
      console.log(`Connected to database: ${dbName}`);
      
      // List all collections
      const collections = await mongoose.connection.db.listCollections().toArray();
      console.log('Available collections:', collections.map(c => c.name));
    }
  } catch (error) {
    console.error('Database check failed:', error);
  }
}

module.exports = checkDatabaseConnection;