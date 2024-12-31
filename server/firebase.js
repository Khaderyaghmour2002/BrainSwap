const admin = require('firebase-admin');
const serviceAccount = require('./path/to/your-service-account-file.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://brainswap-bd812.firebaseio.com',
});

// Export the Firebase services
const db = admin.firestore();
const auth = admin.auth();
const storage = admin.storage().bucket();

module.exports = { db, auth, storage };
