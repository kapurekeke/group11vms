const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = 3000;
const jwt = require('jsonwebtoken');

app.use(express.json());

// MongoDB connection URL
const uri = "mongodb+srv://shivaranjini2:4f8GZeWiJmGhRlEx@cluster0.k1veqjb.mongodb.net/?retryWrites=true&w=majority";


// Create a new MongoClient
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true }, {serverApi:
    {version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
}
});

// Connect to MongoDB
client.connect()
  .then(() => {
    console.log('Connected to MongoDB!');
  })
  .catch((error) => {
    console.error('Failed to connect to MongoDB:', error);
  });

// Define collection names
const db = client.db('PRISON_VMS');
const adminCollection = db.collection ('ADMIN');
const visitorCollection = db.collection ('VISITOR');
const prisonerCollection = db.collection('PRISONER');
const cellCollection = db.collection('CELL');
const emergencyCollection = db.collection('EMERGENCY_CONTACT');
const casedetailCollection = db.collection('CASE_DETAILS');

/**login admin function*/
async function login(reqUsername, reqPassword) {
  return adminCollection.findOne({ username: reqUsername, password: reqPassword })
    .then(matchUsers => {
      if (!matchUsers) {
        return {
          success: false,
          message: "Admin not found!"
        };
      } else {
        return {
          success: true,
          users: matchUsers
        };
      }
    })
    .catch(error => {
        console.error('Error in login:', error);
        return {
          success: false,
          message: "An error occurred during login."
        };
      });
}

/**create admin function */
async function register(reqUsername, reqPassword) {
  return adminCollection.insertOne({
    username: reqUsername,
    password: reqPassword,
    
  })
    .then(() => {
      return "Registration successful!";
    })
    .catch(error => {
      console.error('Registration failed:', error);
      return "Error encountered!";
    });
}

function generateToken(userData) {
  const token = jwt.sign(userData, 'inipassword');
  return token

}

function verifyToken(req, res, next) {
  let header = req.headers.authorization;
  console.log(header);

  let token = header.split(' ')[1];

  jwt.verify(token, 'inipassword', function (err, decoded) {
    if (err) {
      res.send('Invalid Token');
    }

    req.user = decoded;
    next();
  });
}



// Login Admin
app.post('/login', (req, res) => {
  console.log(req.body);

  let result = login(req.body.username, req.body.password);
  result.then(response => {
    console.log(response); // Log the response received

    if (response.success) {
      let token = generateToken(response.users);
      res.send(token);
    } else {
      res.status(401).send(response.message);
    }
  }).catch(error => {
    console.error('Error in login route:', error);
    res.status(500).send("An error occurred during login.");
  });
});


// Register Admin
app.post('/register', (req, res) => {
  console.log(req.body);

  let result = register(req.body.username, req.body.password, req.body.name, req.body.email);
  result.then(response => {
    res.send(response);
  }).catch(error => {
    console.error('Error in register route:', error);
    res.status(500).send("An error occurred during registration.");
  });
});

// Create a visitor
app.post('/createvisitorData', verifyToken, (req, res) => {
  const {
    name,
    city,
    relationship,
    visitorId
  } = req.body;

  const visitorData = {
    name,
    city,
    relationship,
    visitorId
  };

  visitorCollection
    .insertOne(visitorData)
    .then(() => {
      res.send(visitorData);
    })
    .catch((error) => {
      console.error('Error creating visitor:', error);
      res.status(500).send('An error occurred while creating the visitor');
    });
});

//update visitor
app.patch('/updatevisitor/:id', verifyToken, async (req, res) => {
  try {
    const objectId = new ObjectId(req.params.id);
    const {city} = req.body;

    const updateResult = await db.collection('VISITOR').updateOne(
      { _id: objectId }, 
      { $set: {city} });

    if (updateResult.modifiedCount === 1) {
      res.send('Visitor data successfully updated!');
    } else {
      res.status(404).send('Visitor not found');
    }
  } catch (error) {
    console.error('Error updating visitor data:', error);
    res.status(500).send('Error updating visitor data');
  }
});



//Delete a visitor
app.delete('/deletevisitor/:id', verifyToken, async (req, res) => {
  const objectId = new ObjectId(req.params);
  

  try {
    const deleteResult = await db.collection('VISITOR').deleteOne({ _id:objectId });

    if (deleteResult.deletedCount === 1) {
      res.send('Visitor deleted successfully');
    } else {
      res.status(404).send('Visitor not found');
    }
  } catch (error) {
    console.error('Error deleting visitor:', error);
    res.status(500).send('Error deleting visitor');
  }
});


// View all admins
app.get('/admins', async (req, res) => {
  try {
    const db = client.db('PRISON_VMS');
    const prisoner = await db.collection('ADMIN').find().toArray();
    res.send(prisoner);
  } catch (error) {
    res.status(500).send('Error viewing admins');
  }
});



// View all visitors
app.get('/visitors', async (req, res) => {
  try {
    const db = client.db('PRISON_VMS');
    const prisoner = await db.collection('VISITOR').find().toArray();
    res.send(prisoner);
  } catch (error) {
    res.status(500).send('Error viewing visitors');
  }
});



// View all prisoner
app.get('/prisoner', async (req, res) => {
  try {
    const db = client.db('PRISON_VMS');
    const prisoner = await db.collection('PRISONER').find().toArray();
    res.send(prisoner);
  } catch (error) {
    res.status(500).send('Error viewing prisoner');
  }
});


// View all cell
app.get('/cell', async (req, res) => {
  try {
    const db = client.db('PRISON_VMS');
    const cell = await db.collection('CELL').find().toArray();
    res.send(cell);
  } catch (error) {
    res.status(500).send('Error viewing cell');
  }
});


// View all emergency_contact
app.get('/emergency', async (req, res) => {
  try {
    const db = client.db('PRISON_VMS');
    const emergency = await db.collection('EMERGENCY_CONTACT').find().toArray();
    res.send(emergency);
  } catch (error) {
    res.status(500).send('Error viewing emergency_contact');
  }
});


// View all case_details
app.get('/casedetail', async (req, res) => {
  try {
    const db = client.db('PRISON_VMS');
    const casedetail = await db.collection('CASE_DETAILS').find().toArray();
    res.send(casedetail);
  } catch (error) {
    res.status(500).send('Error viewing emergency_contact');
  }
});

app.use(express.json())

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});