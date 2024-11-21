require('dotenv').config();
const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

// MongoDB connection string
const mongoURI = process.env.MONGO_CONN_URI; // MongoDB URI from .env file

// Function to convert image file to base64
function imageToBase64(imagePath) {
  const imageBuffer = fs.readFileSync(imagePath);
  return imageBuffer.toString('base64'); // Convert the image buffer to a base64 string
}

// Initialize MongoDB client
const client = new MongoClient(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });

// Connect to MongoDB
async function createCandidatesCollection() {
  try {
    await client.connect();
    const db = client.db('votingDB'); // Use the database 'votingDB'
    const candidatesCollection = db.collection('candidates'); // Use the 'candidates' collection

    // Sample data to insert into the candidates collection (7 candidates)
    const candidates = [
      {
        name: 'Marothi Joel',
        picture: imageToBase64(path.join(__dirname, '..', 'andile.jpg')), // Path to your local image
        votes: 0
      },
      {
        name: 'Zama Ngema',
        picture: imageToBase64(path.join(__dirname, '..', 'lindiwe.jpg')), // Path to your local image
        votes: 0
      },
      {
        name: 'Sibusiso Ndlovu',
        picture: imageToBase64(path.join(__dirname, '..', 'sbusiso.jpg')),
        votes: 0
      },
      {
        name: 'Nokuthula Mkhize',
        picture: imageToBase64(path.join(__dirname, '..', 'nokuthula.jpg')),
        votes: 0
      },
      {
        name: 'Thabo Dlamini',
        picture: imageToBase64(path.join(__dirname, '..', 'thabo.jpg')),
        votes: 0
      },
      {
        name: 'Lindiwe Zondo',
        picture: imageToBase64(path.join(__dirname, '..', 'zama.jpg')),
        votes: 0
      },
      {
        name: 'Andile Khumalo',
        picture: imageToBase64(path.join(__dirname, '..', 'andile.jpg')),
        votes: 0
      }
    ];

    // Insert candidates data into the collection
    const result = await candidatesCollection.insertMany(candidates);

    console.log(`${result.insertedCount} candidates have been added to the 'candidates' collection`);

  } catch (error) {
    console.error('Error creating candidates collection:', error);
  } finally {
    // Close the connection
    await client.close();
  }
}

// Run the script to create the collection and insert sample candidates
createCandidatesCollection();
