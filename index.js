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

app.get('/api/boards', function (req, res) {
    var aggregateQuerry = [{$project: {name : 1, _id : 0 , lists:[]}}]
    db.collection('boards').aggregate(aggregateQuerry).toArray((err, result) => {
        if (err) {
            console.log(err);
            res.send({status:"fail", message:"server intern error"})
        } else {
            res.send({status:"success", message:result})
        }
    })
});

app.get('/api/board/:boardname', function (req, res) {
    var boardname = req.params.boardname;
    var aggregateQuerry = [{$match: {'name':boardname}},
                            {$project: {
                                'lists.cards.description' : 0,
                                _id: 0
                            }}]
    db.collection('boards').aggregate(aggregateQuerry).toArray((err, result) => {
        if (err) {
            console.log(err);
            res.send({status:"fail", message:"server intern error"})
        } else {
            if (result.length == 0) {
                res.send({status:"fail", message:"Board with this name not exist"})
            } else {
                var currentBoard = result[0];
                for (index1 in currentBoard.lists) {
                    for (index2 in currentBoard.lists[index1].cards) {
                        currentBoard.lists[index1].cards[index2].description="";
                    }
                }
                res.send({status:"success", message:currentBoard})
            }
        }
    })
});

app.post('/api/board', function (req, res) {
    db.collection('boards').findOne({"name":req.body.boardname}, (err, result) => {
      if (err) {
        console.log(err);
        res.send({status:"fail", message:"server intern error"})
      } else {
        if (result!=null) {
          res.send({status:"fail", message:"Board with this name exist"})
        } else {
            db.collection('boards').insertOne({"name":req.body.boardname, "lists" :[]}, (err, result) => {
                if (err) {
                    console.log(err);
                    res.send({status:"fail", message:"server intern error"})
                } else {
                    res.send({status:"success", message:"Inserted"})
                }
            })
        }
      }
    })
});

app.delete('/api/board/:name', function (req, res) {
    var filter = {"_id": "0","lists":"0"};
    var name = req.params.name;
    db.collection('boards').findOne({"name":name},filter, (err, result) => {
      if (err) {
        console.log(err);
        res.send({status:"fail", message:"server intern error"})
      } else {
        if (result!=null) {
            db.collection('boards').deleteOne({"name":name}, (err, result) => {
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
    })
});

app.put('/api/board', function (req, res) {
    var oldboardname = req.body.oldboardname;
    var newboardname = req.body.newboardname;
    console.log("ce primesc ", req.body)
    db.collection('boards').findOne({"name":oldboardname}, (err, result) => {
      if (err) {
        console.log(err);
        res.send({status:"fail", message:"server intern error"})
      } else {
        if (result!=null) {
            var updateQuerry = { $set: { name: newboardname } };
            db.collection('boards').updateOne({"name":oldboardname}, updateQuerry, (err, result) => {
                if (err) {
                    console.log(err);
                    res.send({status:"fail", message:"server intern error"})
                } else {
                    res.send({status:"success", message:"Updated"})
                }
            })
        } else {
            res.send({status:"fail", message:"Board with this name not exist"})
        }
      }
    })
});


//LISTS
//get a list
app.get('/api/list/:boardname/:listname', function (req, res) {
    var boardname = req.params.boardname;
    var listname = req.params.listname;
    var aggregateQuerry = [{$match: {'name':boardname, 'lists.name': listname}},
                            {$project: {
                                'lists.cards.description' : 0
                            }},
                            {$project: {
                                rez: {$filter: {
                                    input: '$lists',
                                    as: 'list',
                                    cond: {$eq: ['$$list.name', listname]}
                                }},
                                _id: 0
                            }}]
    db.collection('boards').aggregate(aggregateQuerry).toArray((err, result) => {
        if (err) {
            console.log(err);
            res.send({status:"fail", message:"server intern error"})
        } else {
            if (result.length == 0) {
                res.send({status:"fail", message:"Board with this name not exist"})
            } else {
                for (index in result[0].rez[0].cards) {
                    result[0].rez[0].cards[index].description = "";
                }
                res.send({status:"success", message:result[0].rez[0]})
            }
        }
    })
});

//add a list on a board
app.post('/api/list', function (req, res) {
    var boardname = req.body.boardname;
    var listname = req.body.listname;
    console.log("body primit ", req.body)
    var findBoardQuerry = {"name" : boardname}
    var findListQuerry = {"name" : boardname, "lists.name" : listname}
    db.collection('boards').findOne(findBoardQuerry, (err, result) => {
      if (err) {
        console.log(err);
        res.send({status:"fail", message:"server intern error"})
      } else {
        if (result!=null) {
            db.collection('boards').findOne(findListQuerry, (err, result) => {
                if (result!=null) {
                    res.send({status:"fail", message:"List with this name exist"})
                } else {
                    var updateQuerry = { $push: { lists: {"name" : listname, "cards": []} } };
                    db.collection('boards').updateOne(findBoardQuerry, updateQuerry, (err, result) => {
                        if (err) {
                            console.log(err);
                            res.send({status:"fail", message:"server intern error"})
                        } else {
                            res.send({status:"success", message:"Inserted"})
                        }
                    })
                }
            });
        } else {
            res.send({status:"fail", message:"Board with this name not exist"})
        }
      }
    })
});

//delete a list from a board
app.delete('/api/list/:boardname/:listname', function (req, res) {
    var boardname = req.params.boardname;
    var listname = req.params.listname;
    var findBoardQuerry = {"name" : boardname}
    var findListQuerry = {"name" : boardname, "lists.name" : listname}
    db.collection('boards').findOne(findListQuerry, (err, result) => {
      if (err) {
        console.log(err);
        res.send({status:"fail", message:"server intern error"})
      } else {
        if (result!=null) {
            var updateQuerry = { $pull: { lists: {"name" : listname} } };
            db.collection('boards').updateOne(findBoardQuerry, updateQuerry, (err, result) => {
                if (err) {
                    console.log(err);
                    res.send({status:"fail", message:"server intern error"})
                } else {
                    res.send({status:"success", message:"Deleted"})
                }
            })
        } else {
            res.send({status:"fail", message:"Board or List with this name not exist"})
        }
      }
    })
});

//update a list from a board
app.put('/api/list', function (req, res) {
    var boardname = req.body.boardname;
    var oldlistname = req.body.oldlistname;
    var newlistname = req.body.newlistname;
    console.log("body primit ", req.body)
    var findBoardQuerry = {"name" : boardname}
    var findListQuerry = {"name" : boardname, "lists.name" : oldlistname}
    db.collection('boards').findOne(findListQuerry, (err, result) => {
      if (err) {
        console.log(err);
        res.send({status:"fail", message:"server intern error"})
      } else {
        if (result!=null) {
            var updateQuerry = { $set: { "lists.$.name" : newlistname } };
            db.collection('boards').updateOne(findListQuerry, updateQuerry, (err, result) => {
                if (err) {
                    console.log(err);
                    res.send({status:"fail", message:"server intern error"})
                } else {
                    res.send({status:"success", message:"Updated"})
                }
            })
        } else {
            res.send({status:"fail", message:"Board or List with this name not exist"})
        }
      }
    })
});

//CARD
//get a card
app.get('/api/card/:boardname/:listname/:cardtitle', function (req, res) {
    var boardname = req.params.boardname;
    var listname = req.params.listname;
    var cardtitle = req.params.cardtitle;
    var aggregateQuerry = [
                            {$match: {'name':boardname, 'lists.name': listname}},
                            {$project: {
                                rez: {$filter: {
                                    input: '$lists',
                                    as: 'list',
                                    cond: {$eq: ['$$list.name', listname]}
                                }},
                                _id: 0
                            }},
                            {$unwind: "$rez"},
                            {$unwind: "$rez.cards"},
                            {$match: {'rez.cards.title' : cardtitle}}
                        ]
    db.collection('boards').aggregate(aggregateQuerry).toArray((err, result) => {
        if (err) {
            console.log(err);
            res.send({status:"fail", message:"server intern error"})
        } else {
            if (result.length == 0) {
                res.send({status:"fail", message:"Board or List or Card with this name not exist"})
            } else {
                res.send({status:"success", message:result[0].rez.cards})
            }
        }
    })
});

//add a card on a list on a board
app.post('/api/card', function (req, res) {
    var boardname = req.body.boardname;
    var listname = req.body.listname;
    var cardtitle = req.body.cardtitle;
    var carddescription = req.body.carddescription;
    console.log("body primit ", req.body)
    var findBoardQuerry = {"name" : boardname}
    var findListQuerry = {"name" : boardname, "lists.name" : listname}
    db.collection('boards').findOne(findListQuerry, (err, result) => {
      if (err) {
        console.log(err);
        res.send({status:"fail", message:"server intern error"})
      } else {
        if (result!=null) {
            var aggregateQuerry = [
                {$match: {'name':boardname, 'lists.name': listname}},
                {$project: {
                    rez: {$filter: {
                        input: '$lists',
                        as: 'list',
                        cond: {$eq: ['$$list.name', listname]}
                    }},
                    _id: 0
                }},
                {$unwind: "$rez"},
                {$unwind: "$rez.cards"},
                {$match: {'rez.cards.title' : cardtitle}}
            ]
            db.collection('boards').aggregate(aggregateQuerry).toArray((err, result) => {
                if (err) {
                    console.log(err);
                    res.send({status:"fail", message:"server intern error"})
                } else {
                    console.log(result)
                    if (result.length == 0) {
                        var updateQuerry =  { "$push": 
                                                {"lists.$.cards": 
                                                    {
                                                        "title": cardtitle,
                                                        "description": carddescription
                                                    }
                                                }
                                            };
                        db.collection('boards').updateOne(findListQuerry, updateQuerry, (err, result) => {
                            if (err) {
                                console.log(err);
                                res.send({status:"fail", message:"server intern error"})
                            } else {
                                res.send({status:"success", message:"Inserted"})
                            }
                        })
                    } else {
                        res.send({status:"fail", message:"Card with this name exist"})
                    }
                }
            })
        } else {
            res.send({status:"fail", message:"Board or List with this name not exist"})
        }
      }
    })
});

//delete a card from a list on a board
app.delete('/api/card/:boardname/:listname/:cardtitle', function (req, res) {
    var boardname = req.params.boardname;
    var listname = req.params.listname;
    var cardtitle = req.params.cardtitle;
    var findBoardQuerry = {"name" : boardname}
    var findListQuerry = {"name" : boardname, "lists.name" : listname};
    var aggregateQuerry = [
        {$match: {'name':boardname, 'lists.name': listname}},
        {$project: {
            rez: {$filter: {
                input: '$lists',
                as: 'list',
                cond: {$eq: ['$$list.name', listname]}
            }},
            _id: 0
        }},
        {$unwind: "$rez"},
        {$unwind: "$rez.cards"},
        {$match: {'rez.cards.title' : cardtitle}}
    ]
    db.collection('boards').aggregate(aggregateQuerry).toArray((err, result) => {
      if (err) {
        console.log(err);
        res.send({status:"fail", message:"server intern error"})
      } else {
        if (result.length == 0) {
            res.send({status:"fail", message:"Board or List or Card with this name not exist"})
        } else {
            var updateQuerry =  { "$pull": 
                                    {"lists.$.cards": 
                                        {
                                            "title": cardtitle
                                        }
                                    }
                                }
            db.collection('boards').updateOne(findListQuerry, updateQuerry, (err, result) => {
                if (err) {
                    console.log(err);
                    res.send({status:"fail", message:"server intern error"})
                } else {
                    res.send({status:"success", message:"Deleted"})
                }
            })
        }
      }
    })
});

//update a card from a list on a board
app.put('/api/card', function (req, res) {
    var boardname = req.body.boardname;
    var listname = req.body.listname;
    var oldcardtitle = req.body.oldcardtitle;
    var newcardtitle = req.body.newcardtitle;
    var newcarddescription = req.body.newcarddescription;
    console.log("body primit ", req.body)
    var findBoardQuerry = {"name" : boardname}
    var findListQuerry = {"name" : boardname, "lists.name" : listname}
    var aggregateQuerry = [
        {$match: {'name':boardname, 'lists.name': listname}},
        {$project: {
            rez: {$filter: {
                input: '$lists',
                as: 'list',
                cond: {$eq: ['$$list.name', listname]}
            }},
            _id: 0
        }},
        {$unwind: "$rez"},
        {$unwind: "$rez.cards"},
        {$match: {'rez.cards.title' : oldcardtitle}}
    ]
    db.collection('boards').aggregate(aggregateQuerry).toArray((err, result) => {
      if (err) {
        console.log(err);
        res.send({status:"fail", message:"server intern error"})
      } else {
        if (result.length == 0) {
            res.send({status:"fail", message:"Board or List or Card with this name not exist"})
        } else {
            var updateQuerry1 ={ "$set": { "lists.$[t].cards.$[card].description" : newcarddescription } };
            var updateQuerry2 = { arrayFilters: [ { "t.name": listname},{ "card.title" :  oldcardtitle}  ] };
            db.collection('boards').updateOne(findListQuerry, updateQuerry1, updateQuerry2, (err, result) => {
                if (err) {
                    console.log(err);
                    res.send({status:"fail", message:"server intern error -- description"})
                } else {
                    var updateQuerry1 ={ "$set": { "lists.$[t].cards.$[card].title" : newcardtitle } };
                    var updateQuerry2 = { arrayFilters: [ { "t.name": listname},{ "card.title" :  oldcardtitle}  ] };
                    db.collection('boards').updateOne(findListQuerry, updateQuerry1, updateQuerry2, (err, result) => {
                        if (err) {
                            console.log(err);
                            res.send({status:"fail", message:"server intern error -- title"})
                        } else {
                            res.send({status:"success", message:"Updated"})
                        }
                    });
                }
            })
        }
      }
    })
});
