const express = require('express');
const morgan = require('morgan');
const winston = require('./config/winston');

require('./db/mongoose');

const node_env = 'development';
process.env.NODE_ENV = node_env;

// routes
const userRouter = require('./routes/user');
const taskRouter = require('./routes/task');

const port = process.env.PORT || 3001;

const app = express();
app.use(express.json());
app.use(require('./middleware/maintenance'));

app.use(morgan('combined', { stream: winston.stream }));
app.use('/api', taskRouter);
app.use('/api', userRouter);

app.listen(port, () => {
  console.log(`Server running running on port ${port}`);
});
