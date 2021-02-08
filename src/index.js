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

app.get('/api/users', async (req, res) => {
  // return all users
  try {
    const users = await User.find({});
    res.status(200).send(users);
  } catch (error) {
    res.status(500).send();
  }
});

app.get('/api/users/:id', async (req, res) => {
  // get user by id
  const _id = req.params.id;
  try {
    const user = await User.findById(_id);
    if (!user) {
      res.status(404).send({
        'Not Found': 'No User Exists for that ID',
      });
    }
    res.status(200).send(user);
  } catch (error) {
    if (error) {
      console.error(error);
      res.status(400).send({ error: 'Invalid ID provided' });
    }
  }
});

app.patch('/api/users/:id', async (req, res) => {
  const providedParams = Object.keys(req.body);
  const updatableParams = ['name', 'email', 'password', 'age'];
  const _id = req.params.id;
  const isValidUpdate = providedParams.every((updateKey) => {
    return updatableParams.includes(updateKey);
  });

  if (!isValidUpdate) {
    return res.status(400).send({ error: 'Invalid update attempted' });
  }

  try {
    const user = await User.findByIdAndUpdate(_id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      res.status(404).send({ result: `No user for id ${_id}` });
    }

    res.status(200).send(user);
  } catch (error) {
    // check for validation issue(s); inform user
    res.status(400).send({ result: error._message });
  }
});

app.post('/api/users', async (req, res) => {
  const user = new User(req.body);
  try {
    const _user = await user.save();
    res.status(201).send(_user);
  } catch (error) {
    console.error(error._message);
    res.status(400).send({ status: error._message });
  }
});

app.delete('/api/users/:id', async (req, res) => {
  const _id = req.params.id;
  try {
    const user = await User.findByIdAndDelete(_id);
    // no user to delete
    if (!user) {
      res.status(404).send({ status: 'No user with the provided id' });
    }

    res.status(202).send(user);
  } catch (error) {
    console.error(error._message);
    res.status(400).send({ status: error._message });
  }
});

app.get('/api/tasks', async (req, res) => {
  try {
    const tasks = await Task.find({});
    res.status(200).send(tasks);
  } catch (error) {
    res.status(500).send();
  }
});

app.get('/api/tasks/:id', async (req, res) => {
  // get task by id
  const _id = req.params.id;
  try {
    const task = await Task.findById(_id);
    if (!task) {
      res.status(404).send({
        'Not Found': 'No Task Exists for that ID',
      });
    }
    res.status(200).send(task);
  } catch (error) {
    if (error) {
      console.error(error);
      res.status(400).send({ error: 'Invalid ID provided' });
    }
  }
});

app.patch('/api/tasks/:id', async (req, res) => {
  const providedParams = Object.keys(req.body);
  let isValidUpdate = false;

  // cannot update the task name; can only change the status
  if (providedParams.includes('task')) {
    isValidUpdate = false;
  }

  const updatableParams = ['completed'];
  // the only allowable update here is the completed status
  isValidUpdate = providedParams.every((updateKey) => {
    return updatableParams.includes(updateKey);
  });

  if (!isValidUpdate) {
    return res.status(400).send({ error: 'Invalid update attempted' });
  }

  const _id = req.params.id;
  try {
    const task = await Task.findByIdAndUpdate(_id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!task) {
      res.status(404).send({ result: `No task for id ${_id}` });
    }

    res.status(200).send(task);
  } catch (error) {
    // check for validation issue(s); inform user
    res.status(400).send({ result: error._message });
  }
});

app.post('/api/tasks', async (req, res) => {
  const task = new Task(req.body);
  try {
    const _task = await task.save();
    res.status(201).send(_task);
  } catch (error) {
    console.error(error._message);
    res.status(400).send({ status: error._message });
  }
});

app.delete('/api/tasks/:id', async (req, res) => {
  const _id = req.params.id;
  try {
    const task = await Task.findByIdAndDelete(_id);
    // no user to delete
    if (!task) {
      res.status(404).send({ status: 'No task with the provided id' });
    }
    res.status(202).send(task);
  } catch (error) {
    console.error(error._message);
    res.status(400).send({ status: error._message });
  }
});

app.listen(port, () => {
  console.log(`Server running running on port ${port}`);
});
