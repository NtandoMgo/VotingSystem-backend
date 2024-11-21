const { MongoClient } = require('mongodb');

// Replace with your MongoDB Atlas connection string
const uri = "mongodb+srv://devvarietyverse:NvBLyIoOqFRdvUyT@votesystem.r517q.mongodb.net/?retryWrites=true&w=majority&appName=VoteSystem";

// Create a new MongoClient
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function createAdminsTable() {
  try {
    // Connect to the MongoDB database
    await client.connect();
    console.log('Connected to MongoDB Atlas');

    // Get the database
    const db = client.db('votingDB');

    // Get or create the admins collection
    const adminsCollection = db.collection('admins');

    // Check if the admins collection already contains documents
    const adminCount = await adminsCollection.countDocuments();
    if (adminCount > 0) {
      console.log('Admins collection already populated');
      return;
    }

    // Define the admin documents to insert
    const admins = [
      {
        idNumber: '9234567890123', // 13-digit string
        name: 'Admin One'
      },
      {
        idNumber: '9876543210987', // 13-digit string
        name: 'Admin Two'
      }
    ];

    // Insert the admins into the collection
    await adminsCollection.insertMany(admins);
    console.log('Admins inserted:', admins);

  } catch (error) {
    console.error('Error creating admins table or inserting data:', error);
  } finally {
    // Close the MongoDB connection
    await client.close();
    console.log('Connection to MongoDB closed');
  }
}

// Call the function to create and populate the admins table
createAdminsTable();
