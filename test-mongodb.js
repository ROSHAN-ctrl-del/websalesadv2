import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/sales-management';

async function testMongoConnection() {
  try {
    console.log('🔍 Testing MongoDB connection...');
    console.log(`📡 Connection URL: ${MONGO_URI}`);
    
    await mongoose.connect(MONGO_URI);
    
    console.log('✅ MongoDB connection successful!');
    console.log(`📊 Database: ${mongoose.connection.name}`);
    console.log(`🔗 Host: ${mongoose.connection.host}`);
    console.log(`🚪 Port: ${mongoose.connection.port}`);
    
    // Test creating a simple collection
    const testCollection = mongoose.connection.collection('test');
    await testCollection.insertOne({ 
      test: true, 
      timestamp: new Date(),
      message: 'MongoDB connection test successful'
    });
    
    console.log('✅ Test document inserted successfully!');
    
    // Clean up test document
    await testCollection.deleteOne({ test: true });
    console.log('🧹 Test document cleaned up');
    
    await mongoose.connection.close();
    console.log('🔌 Connection closed');
    
    console.log('\n🎉 MongoDB is ready for MongoDB Compass!');
    console.log('\n📋 Next steps:');
    console.log('1. Open MongoDB Compass');
    console.log('2. Click "New Connection"');
    console.log('3. Enter: mongodb://localhost:27017');
    console.log('4. Click "Connect"');
    console.log('5. Navigate to "sales-management" database');
    
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Ensure MongoDB is installed and running');
    console.log('2. Check if MongoDB service is started');
    console.log('3. Verify the connection string');
    console.log('4. Check firewall settings');
    
    process.exit(1);
  }
}

testMongoConnection(); 