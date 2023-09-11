let express = require('express');
let cors = require('cors')
let app = express()
let bodyParser = require('body-parser')

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(cors())

const store = {
}

let subscribers = {};

function onSubscribe(req, res) {
  res.setHeader('Content-Type', 'text/plain;charset=utf-8');
  res.setHeader("Cache-Control", "no-cache, must-revalidate");
  
  const {id, initial} = req.query;
  
  if(initial && Object.keys(initial).length) return res.json(store);

  subscribers[id] = res;

  console.log('## subscribing to id', id)

  console.log('--- subscribers:', Object.keys(subscribers))

  console.log(req.query)

  req.on('close', function() {
    console.log('### closing request for id', id)
    delete subscribers[id];
  });
}

function publish() {
  
  for (let id in subscribers) {
    let res = subscribers[id];
    res.json(store);
  }

  subscribers = {};
}

app.get('/subscribe', (req, res) => {
    onSubscribe(req, res);
})

app.get('/test', (req, res) => {
    res.json({
      success: true
    })
})

app.post('/publish', (req, res) => {
    // accept POST
    req.setEncoding('utf8');
    
    const { key, content } = req.body;
    store[key] = content
    
    publish();
    res.end("ok");

    return;
})
const port = process.env.PORT || 8080

app.listen(port, function () {
    console.log('web server listening on port', port)
})