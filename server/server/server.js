require('dotenv').config();
const express = require("express");
const colors = require("colors");
const moragan = require("morgan");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");





//dotenv conig
dotenv.config();

//mongodb connection
connectDB();

//rest obejct
const app = express();


app.use(cors({
  origin: 'http://localhost:3000', // Replace with your frontend URL
  methods: ['GET', 'POST'], // Specify allowed HTTP methods
  credentials: true // Enable sending cookies with requests
}));

//middlewares
app.use(express.json());
app.use(moragan("dev"));

//routes
app.use("/api/v1/user", require("./routes/userRoutes"));
app.use("/api/v1/admin", require("./routes/adminRoutes"));
app.use("/api/v1/doctor", require("./routes/doctorRoutes"));

//port
// const port = 8080;
// //listen port
// app.listen(port, () => {
//   console.log(
//     `Server Running in ${process.env.NODE_MODE} Mode on port ${process.env.PORT}`
//       .bgCyan.white
//   );
// });


const PORT = 7000;
app.listen(PORT, () => {
  
  console.log(`Server is running on port ${PORT}`);
});
