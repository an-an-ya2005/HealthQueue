

const mongoose = require("mongoose");
const ConnectURI = "mongodb+srv://NewUser:x8DDFJSXbpYq2pcv@health.r8urc.mongodb.net/Health-udemy";
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