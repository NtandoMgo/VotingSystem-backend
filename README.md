# Voting System Backend  

The Voting System Backend is built with **Node.js** and **Express.js** and uses **MongoDB** as the database. This backend handles voter registration, authentication, candidate management, and voting functionality.  

## Features  
- Voter registration and login  
- Candidate management (admin-only)  
- Secure voting mechanism  
- MongoDB database integration  

## Requirements  
- Node.js (version 14 or higher)  
- MongoDB Atlas account or local MongoDB setup  
- `.env` file with environment variables  

## Installation  

1. **Clone the repository**  
   ```bash
   git clone https://github.com/NtandoMgo/VotingSystem-backend.git
   cd VotingSystem-backend
   ```  

2. **Install dependencies**  
   ```bash
   npm install
   ```  

3. **Setup environment variables**  
   Create a `.env` file in the root directory and add the following:  
   ```
   MONGO_CONN_URI=mongodb+srv://<your-username>:<your-password>@<your-cluster>.mongodb.net/votingDB?retryWrites=true&w=majority
   PORT=5000
   ```  

4. **Start the server**  
   ```bash
   npm start
   ```  
   The server will run at `http://localhost:5000` by default.  

## API Endpoints  

### Voter Endpoints  
- **POST /register**  
  Register a new voter.  
  Request body:  
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "idNumber": "1234567890123",
    "province": "Western Cape"
  }
  ```  

- **POST /login**  
  Login using ID number.  
  Request body:  
  ```json
  {
    "idNumber": "1234567890123"
  }
  ```  

- **POST /vote**  
  Cast a vote for a candidate.  
  Request body:  
  ```json
  {
    "idNumber": "1234567890123",
    "candidateName": "Candidate 1"
  }
  ```  

### Admin Endpoints  
- **POST /addCandidate**  
  Add a new candidate.  
  Request body:  
  ```json
  {
    "name": "Candidate 1",
    "imageBase64": "<base64-encoded-image>"
  }
  ```  

- **DELETE /removeCandidate/:id**  
  Remove a candidate by ID.  

- **GET /results**  
  Get a list of all candidates and their votes.  

## Database Setup  

1. Create a **MongoDB Atlas** account and cluster.  
2. Create a database named `votingDB`.  
3. Create the following collections:  
   - `voters`  
   - `admins`  
   - `candidates`  

4. Optionally, use **MongoDB Compass** for GUI-based database management.  

## File Structure  

```
.
├── index.js            # Main server file
├── script.js           # Utility scripts for database setup or tasks
├── package.json        # Node.js dependencies and scripts
├── .env                # Environment variables
├── README.md           # Project documentation
├── node_modules/       # Dependencies
```  

## Contact  
For any assistance, reach out to **devvarietyverse@gmail.com**.  
