const functions = require("firebase-functions/v1");
const express = require("express");
const HMS = require("@100mslive/server-sdk");

const app = express();
app.use(express.json());

const hms = new HMS.SDK(
    functions.config().hms.access_key,
    functions.config().hms.secret,
);

app.post("/generate100msToken", async (req, res) => {
  const {userId, roomId, role = "host"} = req.body;

  if (!userId || !roomId) {
    return res.status(400).json({error: "Missing userId or roomId"});
  }

  try {
    const token = await hms.auth.getAuthToken({userId, roomId, role});
    res.json({token});
  } catch (err) {
    console.error("Token generation failed:", err);
    res.status(500).json({error: "Token generation failed"});
  }
});


exports.api = functions.region("us-central1").https.onRequest(app);
