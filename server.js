const mongoose = require('mongoose');
const dotenv = require('dotenv');
const helmet = require('helmet');

dotenv.config({ path: './config.env' });

const DATABASE = process.env.DATABASE;
process.on('uncaughtException', err => {
  console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.log(err);
  process.exit(1);
});

const app = require('./app');
app.use(helmet.contentSecurityPolicy({
  directives: {
    // Add default-src directive (you can customize this based on your requirements)
    defaultSrc: ["'self'"], // Allows resources from the same origin
    connectSrc: ["'self'", "https://cdnjs.cloudflare.com", "ws://127.0.0.1:51070"],
    // Other directives can be added here as needed
  },
}));

mongoose
  .connect(DATABASE)
  .then(() => console.log('DB connection successful!'))
  .catch((err) => console.log('DB Connection Failed!', err));
  

const port = process.env.PORT;
const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

process.on('unhandledRejection', err => {
  console.log('UNHANDLED REJECTION! 💥 Shutting down...');
  console.log(err);
  server.close(() => {
    process.exit(1);
  });
});
