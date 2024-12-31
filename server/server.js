const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());

// Example endpoint
app.get('/', (req, res) => {
  res.send({ message: "Welcome to the backend!" });
});

// API Endpoint example
app.post('/api/data', (req, res) => {
  const { name } = req.body;
  res.send({ message: `Hello, ${name}!` });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
