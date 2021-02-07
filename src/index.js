const express = require('express');
const morgan = require('morgan');
const winston = require('./config/winston');
require('./db/mongoose');

const node_env = 'development';
process.env.NODE_ENV = node_env;

// models
const { Task } = require('./models/task');
const { User } = require('./models/user');

const port = process.env.PORT || 3001;

const app = express();
app.use(express.json());
app.use(morgan('combined', { stream: winston.stream }));
// app.use('/api', router);

app.post('/api/users', (req, res) => {
  const user = new User(req.body);
  user
    .save()
    .then((_user) => {
      console.log(_user);
      res.status(201).send(_user);
    })
    .catch((error) => {
      console.error(error._message);
      res.status(400).send({ status: error._message });
    });
});

app.post('/api/tasks', (req, res) => {
  const task = new Task(req.body);
  task
    .save()
    .then((_task) => {
      console.log(_task);
      res.status(201).send(_task);
    })
    .catch((error) => {
      console.error(error);
    });
});

app.listen(port, () => {
  console.log(`Server running running on port ${port}`);
});
