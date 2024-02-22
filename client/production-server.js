const express = require('express');
const port = 8000;
const app = express();

app.use((req, res, next) => {
  console.info(`${req.method} ${req.url}`);
  next();
});

app.use(express.static('dist'));
app.get('*', function (req, res) {
  return res.sendFile(__dirname + '/dist/index.html');
});

// Start server
app.listen(port, () => {
  console.log(`Server is now running at http://127.0.0.1:${port}/`);
});
