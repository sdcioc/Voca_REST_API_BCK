const express = require('express')
const mongodb = require('mongodb')
var bodyParser = require('body-parser');
var cors = require('cors')

const app = express()
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors())
let db = null


mongodb.MongoClient.connect('mongodb://localhost:27017', (err, database) => {
  if (err) return console.log(err)
  console.log('Connected to database')
  db = database.db("voca");
  app.listen(3000, function () {
    console.log('Example app listening on port 3000!')
  })
})
/*
DB structure

info collection
{
    number : "string",
    type : "string",
    name : "string",
    date : ISODate
}

tasks
{
    number : "string",
    type : "string",
    "name" : "string"
}
*/

//MOBILE
app.get('/api/mobile/scam/:year/:month/:day', function(req, res) {
    var year = req.params.year;
    var month = req.params.month;
    var day = req.params.day;
    var dataString = year + '-' + month + '-' + day;
    var findQuerry = {
        date : {"$gte" : new Date(dataString)}
    }
    db.collection('info').find(findQuerry).toArray((err, result) => {
        if (err) {
            console.log(err);
            res.send({status:"fail", message:"server intern error"})
        } else {
            if (result.length == 0) {
                res.send({status:"success", message: []})
            } else {
                res.send({status:"success", message:result})
            }
        }
    });
});

app.post('/api/mobile/posiblescam', function(req, res) {
    var number = req.body.number;
    var type = req.body.type;
    var name = req.body.name;
    
    var findQuerry = {
        "number" : number
    };
    var insertQuerry = {
        "number" : number,
        "type" : type,
        "name" : name
    };

    db.collection('tasks').findOne(findQuerry, (err, result) => {
        if (err) {
            console.log(err);
            res.send({status:"fail", message:"server intern error"})
        } else {
            if (result!=null) {
                res.send({status:"fail", message:"number exist"})
            } else {
                db.collection('tasks').insertOne(insertQuerry, (err, result) => {
                    if (err) {
                        console.log(err);
                        res.send({status:"fail", message:"server intern error"})
                    } else {
                        res.send({status:"success", message:"Inserted"})
                    }
                })
            }
        }
    });

});

// AI
app.get('/api/ai/reports', function(req, res) {
    db.collection('tasks').find().toArray((err, result) => {
        if (err) {
            console.log(err);
            res.send({status:"fail", message:"server intern error"})
        } else {
            if (result.length == 0) {
                res.send({status:"success", message: []})
            } else {
                res.send({status:"success", message:result})
            }
        }
    });
});

app.post('/api/ai/scam', function(req, res) {
    var number = req.body.number;
    var type = req.body.type;
    var name = req.body.name;
    
    var findQuerry = {
        "number" : number
    };
    var insertQuerry = {
        "number" : number,
        "type" : type,
        "name" : name,
        "date" :  new Date()
    };

    console.log("my insert querry", insertQuerry);

    db.collection('infoAI').findOne(findQuerry, (err, result) => {
        if (err) {
            console.log(err);
            res.send({status:"fail", message:"server intern error"})
        } else {
            if (result!=null) {
                res.send({status:"fail", message:"number exist"})
            } else {
                db.collection('infoAI').insertOne(insertQuerry, (err, result) => {
                    if (err) {
                        console.log(err);
                        res.send({status:"fail", message:"server intern error"})
                    } else {
                        res.send({status:"success", message:"Inserted"})
                    }
                })
            }
        }
    });

});

// management
app.get('/api/management/scam/:year/:month/:day', function(req, res) {
    var year = req.params.year;
    var month = req.params.month;
    var day = req.params.day;
    var dataString = year + '-' + month + '-' + day;
    var findQuerry = {
        date : {"$gte" : new Date(dataString)}
    }
    db.collection('infoAI').find(findQuerry).toArray((err, result) => {
        if (err) {
            console.log(err);
            res.send({status:"fail", message:"server intern error"})
        } else {
            if (result.length == 0) {
                res.send({status:"success", message: []})
            } else {
                res.send({status:"success", message:result})
            }
        }
    });
});

app.post('/api/management/scam', function(req, res) {
    var number = req.body.number;
    var type = req.body.type;
    var name = req.body.name;
    
    var findQuerry = {
        "number" : number
    };
    var insertQuerry = {
        "number" : number,
        "type" : type,
        "name" : name,
        "date" :  new Date()
    };

    console.log("my insert querry", insertQuerry);

    db.collection('info').findOne(findQuerry, (err, result) => {
        if (err) {
            console.log(err);
            res.send({status:"fail", message:"server intern error"})
        } else {
            if (result!=null) {
                res.send({status:"fail", message:"number exist"})
            } else {
                db.collection('info').insertOne(insertQuerry, (err, result) => {
                    if (err) {
                        console.log(err);
                        res.send({status:"fail", message:"server intern error"})
                    } else {
                        res.send({status:"success", message:"Inserted"})
                    }
                })
            }
        }
    });

});


app.delete('/api/management/info/:number', function (req, res) {
    var number = req.params.number;

    var findQuerry = {
        "number" : number
    };
    var deleteQuerry = {
        "number" : number
    };

    db.collection('info').findOne(findQuerry, (err, result) => {
      if (err) {
        console.log(err);
        res.send({status:"fail", message:"server intern error"})
      } else {
        if (result!=null) {
            db.collection('info').deleteOne(deleteQuerry, (err, result) => {
                if (err) {
                    console.log(err);
                    res.send({status:"fail", message:"server intern error"})
                } else {
                    res.send({status:"success", message:"Deleted"})
                }
            })
        } else {
            res.send({status:"fail", message:"Board with this name not exist"})
        }
      }
    });
});

app.delete('/api/management/infoAI/:number', function (req, res) {
    var number = req.params.number;

    var findQuerry = {
        "number" : number
    };
    var deleteQuerry = {
        "number" : number
    };

    db.collection('infoAI').findOne(findQuerry, (err, result) => {
      if (err) {
        console.log(err);
        res.send({status:"fail", message:"server intern error"})
      } else {
        if (result!=null) {
            db.collection('infoAI').deleteOne(deleteQuerry, (err, result) => {
                if (err) {
                    console.log(err);
                    res.send({status:"fail", message:"server intern error"})
                } else {
                    res.send({status:"success", message:"Deleted"})
                }
            })
        } else {
            res.send({status:"fail", message:"Board with this name not exist"})
        }
      }
    });
});

app.delete('/api/management/tasks/:number', function (req, res) {
    var number = req.params.number;

    var findQuerry = {
        "number" : number
    };
    var deleteQuerry = {
        "number" : number
    };

    db.collection('tasks').findOne(findQuerry, (err, result) => {
      if (err) {
        console.log(err);
        res.send({status:"fail", message:"server intern error"})
      } else {
        if (result!=null) {
            db.collection('tasks').deleteOne(deleteQuerry, (err, result) => {
                if (err) {
                    console.log(err);
                    res.send({status:"fail", message:"server intern error"})
                } else {
                    res.send({status:"success", message:"Deleted"})
                }
            })
        } else {
            res.send({status:"fail", message:"Board with this name not exist"})
        }
      }
    });
});


//OUTER

app.get('/api/all/:number', function(req, res) {
    var number = req.params.number;
    var findQuerry = {
        "number" : number
    }
    db.collection('info').find(findQuerry).toArray((err, result) => {
        if (err) {
            console.log(err);
            res.send({status:"fail", message:"server intern error"})
        } else {
            if (result.length == 0) {
                res.send({status:"success", message: "unknown"})
            } else {
                res.send({status:"success", message: "scamer"})
            }
        }
    });
});