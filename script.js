require('dotenv').config();
const { MongoClient } = require('mongodb');

// MongoDB connection string
const mongoURI = process.env.MONGO_CONN_URI; // Use your actual MongoDB URI

// Initialize MongoDB client
const client = new MongoClient(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });

// Connect to MongoDB
async function addProvinceField() {
  try {
    await client.connect();
    const db = client.db('votingDB');
    const votersCollection = db.collection('voters');

    // Update all voters to include the province field if it doesn't exist
    const result = await votersCollection.updateMany(
      { province: { $exists: false } }, // Find documents where 'province' field doesn't exist
      { $set: { province: 'Unknown' } } // Set 'province' field to 'Unknown'
    );

    console.log(`${result.modifiedCount} documents were updated with the 'province' field`);

  } catch (error) {
    console.error('Error updating voters collection:', error);
  } finally {
    // Close the connection
    await client.close();
  }
}

// Run the script
addProvinceField();
