const express = require('express');
const { db, auth } = require('../firebase'); // Import the Firebase module
const router = express.Router();

// Example: Add a new user to Firestore
router.post('/addUser', async (req, res) => {
  try {
    const { userId, name, email } = req.body;

    await db.collection('users').doc(userId).set({
      name,
      email,
    });

    res.status(200).send('User added successfully!');
  } catch (error) {
    res.status(500).send('Error adding user:', error.message);
  }
});

// Example: Verify Firebase Auth Token
router.post('/verifyToken', async (req, res) => {
  try {
    const { token } = req.body;

    const decodedToken = await auth.verifyIdToken(token);
    res.status(200).send(`Token is valid! User ID: ${decodedToken.uid}`);
  } catch (error) {
    res.status(401).send('Invalid token:', error.message);
  }
});

module.exports = router;
