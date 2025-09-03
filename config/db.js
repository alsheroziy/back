const mongoose = require("mongoose");
const url = process.env.MONGO_URI;
const connectDB = async() => {
    try {
        const conn = await mongoose.connect(url, {
            useUnifiedTopology: true,
            useNewUrlParser: true,
            useCreateIndex: true,
            useFindAndModify: false,
        });
        console.log(`MongoDB connected : ${conn.connection.host}`);
    } catch (err) {
        console.log(err);
    }
};
module.exports = connectDB;
