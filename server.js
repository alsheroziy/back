const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const app = express();
const Sentry = require("@sentry/node");
const PORT = process.env.PORT || 5000;
const path = require("node:path").join(__dirname, "/public/uploads");

const morgan = require("morgan");
const cors = require("cors");
const {countryMiddleware} = require('./middlewares/country')
const cookieParser = require("cookie-parser");
const connectDB = require("./config/db");
const errorHandler = require("./middlewares/error");
const cronUsers = require("./utils/userCrone");



app.set('trust proxy', true)
// req.headers['x-real-ip']
cronUsers();
app.use(cors());

app.use(Sentry.Handlers.requestHandler());
// Load env vars

// Connect DB
connectDB();

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use("/public/uploads", express.static(path));
app.use(countryMiddleware)
app.use(cookieParser());

// Dev logging middlewares
if (process.env.NODE_ENV === "developer") {
  app.use(morgan("dev"));
}

app.get("/", (req, res) => {

  res.redirect(process.env.FRONT_URI);
});
//Mount routes

app.use("/api/category", require("./routes/categories"));
app.use("/api/janr", require("./routes/janr"));
app.use("/api/kino", require("./routes/kino"));
app.use("/api/season", require("./routes/season"));
app.use("/api", require("./routes/search"));
app.use("/api/slider", require("./routes/slider"));
app.use("/api/home", require("./routes/ui"));
app.use("/api/news", require("./routes/news"));
app.use("/api/anotatsiya", require("./routes/anotatsiya"));
app.use("/api/member", require("./routes/member"));
app.use("/api/rate", require("./routes/rating"));
app.use("/api/ratingSeason", require("./routes/ratingSeason"));
app.use("/api/comment", require("./routes/comment"));
app.use("/api/video", require("./routes/video"));
app.use("/api/pay", require("./routes/pay"));
app.use("/api/pricelist", require("./routes/priceList"));
app.use("/api/like", require("./routes/like"));
app.use("/api/profile", require("./routes/profile"));
app.use("/api/balance", require("./routes/balance"));
app.use("/api/auth", require("./routes/auth"));
app.use("/api/users", require("./routes/auth"));
app.use("/api/seriyaComment", require("./routes/commentSerial"));
app.use("/api/payment", require("./routes/payment"));
app.use("/api/payments", require("./routes/payments"));
app.use("/api/extra", require("./routes/extra"));

app.use("/api/file", require("./routes/file"));

app.get("/redirect", (req, res) => {
  res.redirect(`${req.query.to}`);
});

app.use(errorHandler);
const server = app.listen(
  PORT,
  console.log(
    `Server is running in ${process.env.NODE_ENV} mode on port ${PORT}`
  )
);

// Handle unhanled promise rejection
process.on("unhandledRejection", (err, promise) => {
  console.log(`Error : ${err.message}`);

  server.close(() => process.exit(1));
});
