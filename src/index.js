const express = require('express');
const { Task } = require('./models/task');
require('./db/mongoose');
const { User } = require('./models/user');

const port = process.env.PORT || 3001;

const app = express();
app.use(express.json());

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
