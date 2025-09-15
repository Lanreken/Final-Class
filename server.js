require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const PORT = process.env.PORT || 4040;
const userRouter = require("./routes/userRouter");

const app = express();
app.use(express.json());

app.use("/api/v1", userRouter);

app.get("/", (req, res) => {
  res.send("Welcome to my Final Class app");
});

app.use((error, req, res, next) => {
  if (error) {
    return res.status(500).json({
      statusCode: false,
      statusText: `Internal Server Error`,
      message: error.message,
    });
  }
  next()
});

mongoose
  .connect(process.env.DB_URL)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
    console.log(`Database is Connected Successfully`);
  })
  .catch((error) => {
    console.log(`Database Connection Failed: ${error.message}`);
  });
