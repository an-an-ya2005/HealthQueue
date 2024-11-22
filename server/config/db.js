// const mongoose = require("mongoose");
// const colors = require("colors");

// const connectDB = async () => {
//   try {
//     await mongoose.connect(`mongodb://localhost:27017/`);
//     console.log(`Mongodb connected ${mongoose.connection.host}`.bgGreen.white);
//   } catch (error) {
//     console.log(`Mongodb Server Issue ${error}`.bgRed.white);
//   }
// };

// module.exports = connectDB;

const mongoose = require("mongoose");
const ConnectURI = "mongodb://localhost:27017/Healthy";
mongoose.set('strictQuery', true);
const ConnectToMongo = async () => {
  try {
    await mongoose.connect(ConnectURI);
    console.log("Connect To Mongo Successful");
  } catch (err) {
    console.log("Connect To Mongo Unsuccessful", err);
  }
};
module.exports = ConnectToMongo;