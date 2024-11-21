// Import required libraries
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { MongoClient, ObjectId } = require('mongodb');

// MongoDB connection string (updated to use votingDB)
const mongoURI = process.env.MONGO_CONN_URI;
const PORT = process.env.PORT || 27017;

// Initialize MongoDB client
const client = new MongoClient(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });

// Database and collections references
let db;
let votersCollection;
let adminsCollection; // Add reference for admins collection
let candidatesCollection;

// Connect to MongoDB
client.connect().then(() => {
  db = client.db('votingDB');  // Explicitly use 'votingDB' database
  votersCollection = db.collection('voters');
  adminsCollection = db.collection('admins'); // Initialize admins collection
  candidatesCollection = db.collection('candidates');
  console.log('Connected to MongoDB');

  // Ensure a unique index for 'idNumber' to prevent duplicate registration in voters
  votersCollection.createIndex({ idNumber: 1 }, { unique: true });
}).catch((error) => {
  console.error('Error connecting to MongoDB:', error);
  process.exit(1);
});

// Initialize Express app
const app = express();

// Middleware setup
app.use(cors());  // Allows Cross-Origin requests (if your frontend is running on a different port)
app.use(bodyParser.json());  // Allows Express to handle JSON request bodies

// Utility function to validate email
function validateEmail(email) {
  const regex = /\S+@\S+\.\S+/;
  return regex.test(email);
}

// Route: Register a voter
app.post('/register', async (req, res) => {
  const { name, email, idNumber, province } = req.body;

  // Validate required fields
  if (!name || !email || !idNumber || !province) {
    return res.status(400).send({ message: 'Name, email, ID number, and province are required' });
  }

  // Validate email format
  if (!validateEmail(email)) {
    return res.status(400).send({ message: 'Invalid email format' });
  }

  // Validate ID number (must be exactly 13 digits)
  const idRegex = /^\d{13}$/;
  if (!idRegex.test(idNumber)) {
    return res.status(400).send({ message: 'ID number must be exactly 13 digits' });
  }

  try {
    // Check if the voter already exists by email
    const existingVoterByEmail = await votersCollection.findOne({ email });
    
    if (existingVoterByEmail) {
      // If the voter exists, update their information (name, idNumber, etc.)
      await votersCollection.updateOne(
        { email },  // Find the voter by email
        { $set: { name, idNumber, province } }  // Update the name, idNumber, and province
      );
      return res.send({ message: 'Registration updated successfully!' });
    }

    // Check if the voter already exists by ID number
    const existingVoterByID = await votersCollection.findOne({ idNumber });

    if (existingVoterByID) {
      return res.status(400).send({ message: 'This ID number is already registered' });
    }

    // If the voter doesn't exist, create a new voter document
    await votersCollection.insertOne({
      name,
      email,
      idNumber,
      province,  // Save province to the database
      hasVoted: false,  // Initially, the voter hasn't voted
    });

    res.send({ message: 'Registration successful' });
    
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).send({ message: 'An error occurred during registration' });
  }
});

// Route: Login
app.post('/login', async (req, res) => {
  const { idNumber } = req.body;

  // Validate ID number (must be exactly 13 digits)
  const idRegex = /^\d{13}$/;
  if (!idRegex.test(idNumber)) {
    return res.status(400).send({ message: 'Invalid ID number format' });
  }

  try {
    // First check if the ID number exists in the admins collection
    const admin = await adminsCollection.findOne({ idNumber });
    
    if (admin) {
      // If the ID number matches an admin, return the role as 'admin'
      return res.send({ message: 'Login successful', role: 'admin' });
    }

    // If not an admin, check if the ID number exists in the voters collection
    const voter = await votersCollection.findOne({ idNumber });

    if (!voter) {
      return res.status(400).send({ message: 'ID number not found. Please register first.' });
    }

    // If the voter exists, return the role as 'voter'
    res.send({ message: 'Login successful', role: 'voter' });

  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).send({ message: 'An error occurred. Please try again later.' });
  }
});

// Endpoint to retrieve all candidates with their votes
app.get('/results', async (req, res) => {
  try {
    const candidates = await candidatesCollection.find({}).toArray();
    res.json(candidates);
  } catch (error) {
    console.error('Error retrieving candidates:', error);
    res.status(500).send({ message: 'Failed to retrieve candidates' });
  }
});

// Endpoint to add a new candidate
// app.post('/addCandidate', async (req, res) => {
//   const { name } = req.body;
  
//   if (!name) {
//     return res.status(400).send({ message: 'Candidate name is required' });
//   }

//   try {
//     // Insert a new candidate with 0 votes initially
//     const result = await candidatesCollection.insertOne({
//       name,
//       votes: 0, // Initialize with 0 votes
//     });

//     res.status(201).send({
//       candidateId: result.insertedId,
//       name,
//       votes: 0,
//     });
//   } catch (error) {
//     console.error('Error adding candidate:', error);
//     res.status(500).send({ message: 'Failed to add candidate' });
//   }
// });

app.post('/addCandidate', async (req, res) => {
  const { name, imageBase64 } = req.body; // Accept image in base64 format
  
  if (!name) {
    return res.status(400).send({ message: 'Candidate name is required' });
  }

  try {
    const result = await candidatesCollection.insertOne({
      name,
      image: imageBase64,  // Store the image base64 data
      votes: 0, // Initialize with 0 votes
    });

    res.status(201).send({
      candidateId: result.insertedId,
      name,
      votes: 0,
    });
  } catch (error) {
    console.error('Error adding candidate:', error);
    res.status(500).send({ message: 'Failed to add candidate' });
  }
});

// Endpoint to remove a candidate by ID
app.delete('/removeCandidate/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await candidatesCollection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return res.status(404).send({ message: 'Candidate not found' });
    }

    res.send({ message: 'Candidate removed successfully' });
  } catch (error) {
    console.error('Error removing candidate:', error);
    res.status(500).send({ message: 'Failed to remove candidate' });
  }
});

// Route to handle voting
app.post('/vote', async (req, res) => {
  const { idNumber, candidateName } = req.body;

  if (!idNumber || !candidateName) {
    return res.status(400).send({ message: 'ID number and candidate name are required' });
  }

  try {
    const voter = await votersCollection.findOne({ idNumber });
    if (!voter) return res.status(400).send({ message: 'Voter not found. Please register.' });
    if (voter.hasVoted) return res.status(400).send({ message: 'You have already voted' });

    const candidate = await candidatesCollection.findOne({ name: candidateName });
    if (!candidate) return res.status(400).send({ message: 'Candidate not found' });

    // Increment the candidate's vote count
    await candidatesCollection.updateOne({ name: candidateName }, { $inc: { votes: 1 } });

    // Mark voter as having voted
    await votersCollection.updateOne({ idNumber }, { $set: { hasVoted: true } });

    res.send({ message: `Successfully voted for ${candidateName}` });
  } catch (err) {
    console.error('Error during voting:', err);
    res.status(500).send({ message: 'An error occurred while casting the vote' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
