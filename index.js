const express = require('express')
const mongodb = require('mongodb')
var bodyParser = require('body-parser');
var cors = require('cors')
var crypto = require("crypto");
var path = require("path");
var fs = require("fs");
var ObjectId = require('mongodb').ObjectId;
const constants = require("constants");
const seedrandom = require("seedrandom");

// Security public key
var relativeOrAbsolutePathToPublicKey = "./id_rsa.pub.pem"
var absolutePath = path.resolve(relativeOrAbsolutePathToPublicKey);
var publicKey = fs.readFileSync(absolutePath, "utf8");

var encryptStringWithRsaPublicKey = function(plaintext) {
    //var buffer = new Buffer(toEncrypt);
    //var encrypted = crypto.publicEncrypt(publicKey, buffer);
    //return encrypted.toString("base64");

    var buffer = new Buffer(256);
    // the we copy the plaintext to the beginning of the buffer
    var plaintextBuffer = new Buffer(plaintext, "utf8");
    plaintextBuffer.copy(buffer);
    // we have to pad the buffer with some data that is the same every time we encrypt the same string so
    // 1) we seed the random number generator with something that depends on the plaintext
    //    ops: there is no Math.seed in JavaScript and NodeJs so we use the seedrandom module
    var rng = seedrandom(crypto.createHmac("sha256", plaintext));
    // 2) and fill with random data
    for (var i = 256 - plaintextBuffer.length; i < 256; i++) {
        buffer[i] = Math.floor(rng() * 256);
    }
    // 3) but we'll have a problem when decrypting: where do the plaintext ends and the random data start?
    //    we mark it with a 0, in C tradition
    buffer[plaintextBuffer.length] = 0;

    // 4) we disable automatic padding
    var encryptionOptions = { key: publicKey, padding: constants.RSA_NO_PADDING };
    var encrypted = crypto.publicEncrypt(encryptionOptions, buffer);
    return encrypted.toString("base64");
};
/*
var decryptStringWithRsaPrivateKey = function(toDecrypt, relativeOrAbsolutePathtoPrivateKey) {
    var absolutePath = path.resolve(relativeOrAbsolutePathtoPrivateKey);
    var privateKey = fs.readFileSync(absolutePath, "utf8");
    var buffer = new Buffer(toDecrypt, "base64");
    var decrypted = crypto.privateDecrypt(privateKey, buffer);
    return decrypted.toString("utf8");


    console.log("Good, they were encrypted to the same ciphertext");
    const privateKeyPem = yield readFile("../private_key.pem");
    const decryptionOptions = { key: privateKeyPem, padding: constants.RSA_NO_PADDING };
    console.log("\n\nand they decrypt to the same plaintext:")
    console.log("-----------------");
    const plaintext1 = crypto.privateDecrypt(decryptionOptions, ciphertext1).toString("utf8");
    console.log(plaintext1.substring(0, plaintext1.indexOf("\0")));
    console.log("-----------------");
    const plaintext2 = crypto.privateDecrypt(decryptionOptions, ciphertext2).toString("utf8");
    console.log(plaintext2.substring(0, plaintext2.indexOf("\0")));
    console.log("-----------------");
    
};
*/


const app = express()
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors())
let db = null

// Connect to mongodb
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

numbers collection
{
    _id : ObejctId
    number : "string",
    type : "string",
    level : "float",
    date : ISODate
}

apikeys collection
{
    _id : ObejctId
    querry_number : "int"
    max_querry_number : "int"
}
*/
var authMiddle = function(req, res, next) {
    var API_KEY = req.headers['api-key'];
    if (API_KEY) {
        var findQuerry = {
            "_id" : ObjectId(API_KEY)
        };
        console.log("find querry: ", findQuerry);
        db.collection('apikeys').findOne(findQuerry, (err, result) => {
            if (err) {
                console.log(err);
                return res.send({status:"fail", message:"server intern error"})
            } else {
                if (result==null) {
                    return res.send({
                        status:"fail",
                        message: 'api key not exist'
                    });
                } else {
                    if (result.querry_number >= result.max_querry_number) {
                        return res.send({status:"fail", message:"to many queeries"})
                    } else {
                        var updateQuerry = { $set: { querry_number: result.querry_number + 1} };
                        db.collection('apikeys').updateOne(findQuerry, updateQuerry, (err, result) => {
                            if (err) {
                                console.log(err);
                                return res.send({status:"fail", message:"server intern error"})
                            } else {
                                next();
                            }
                        })
                    }
                }
            }
        });
    } else {
        return res.send({
            status:"fail",
            message: 'No token provided.'
        });
    }
};

//API client
app.get('/api/mobile/:number', authMiddle, (req, res) => {
    var number = req.params.number;
    var findNumber = encryptStringWithRsaPublicKey(number);
    var findQuerry = {
        "number" : findNumber
    };
    console.log("find querry: ", findQuerry);
    db.collection('numbers').findOne(findQuerry, (err, result) => {
        if (err) {
            console.log(err);
            res.send({status:"fail", message:"server intern error"})
        } else {
            if (result==null) {
                res.send({status:"success", type:"unknown"})
            } else {
                res.send({status:"success", type: result.type, level: result.level})
            }
        }
    });
});

//API MANAGEMENT
app.post('/api/management/number', function(req, res) {
    var number = req.body.number;
    var findNumber = encryptStringWithRsaPublicKey(number);
    var type = req.body.type;
    var level = req.body.level;
    
    var findQuerry = {
        "number" : findNumber
    };
    var insertQuerry = {
        "number" : findNumber,
        "type" : type,
        "level" : level,
        "date" :  new Date()
    };

    db.collection('numbers').findOne(findQuerry, (err, result) => {
        if (err) {
            console.log(err);
            res.send({status:"fail", message:"server intern error"})
        } else {
            if (result!=null) {
                var updateQuerry = { $set: { type: type, level: level } };
                db.collection('numbers').updateOne(findQuerry, updateQuerry, (err, result) => {
                    if (err) {
                        console.log(err);
                        res.send({status:"fail", message:"server intern error"})
                    } else {
                        res.send({status:"success", message:"Updated"})
                    }
                })
            } else {
                db.collection('numbers').insertOne(insertQuerry, (err, result) => {
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


app.delete('/api/management/:number', function (req, res) {
    var number = req.params.number;
    var findNumber = encryptStringWithRsaPublicKey(number);
    console.log("number ", number);
    console.log("cryptonumber ", findNumber);
    var findQuerry = {
        "number" : findNumber
    };
    var deleteQuerry = {
        "number" : findNumber
    };

    db.collection('numbers').findOne(findQuerry, (err, result) => {
      if (err) {
        console.log(err);
        res.send({status:"fail", message:"server intern error"})
      } else {
        if (result!=null) {
            db.collection('numbers').deleteOne(deleteQuerry, (err, result) => {
                if (err) {
                    console.log(err);
                    res.send({status:"fail", message:"server intern error"})
                } else {
                    res.send({status:"success", message:"Deleted"})
                }
            })
        } else {
            res.send({status:"fail", message:"Number not exist"})
        }
      }
    });
});

//API KEY GENERATE
app.get('/api/apikey', (req, res) => {
    var insertQuerry = {
        querry_number : 0,
        max_querry_number : 5000
    };
    db.collection('apikeys').insertOne(insertQuerry, (err, result) => {
        if (err) {
            console.log(err);
            res.send({status:"fail", message:"server intern error"})
        } else {
            console.log("api key:", result.insertedId)
            res.send({status:"success", message:"Inserted", api_key:result.insertedId})
        }
    })
});
