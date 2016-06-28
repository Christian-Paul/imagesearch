var express = require('express');
var mongoose = require('mongoose');
var Search = require('bing.search');
var util = require('util');

search = new Search('NAVbtQ40GIEBja/47sSkPTembw0CAeA5ElbapAkXnZY');

var app = express();
app.enable('trust proxy');

var port = process.env.PORT || 3000;

app.use(express.static('public'));

// mongoose initialization
mongoose.connect('mongodb://hero:ku@ds064278.mlab.com:64278/imagesearch');
var db = mongoose.connection;
var searchSchema = new mongoose.Schema({
    query: String,
    time: String
});
var Searches = mongoose.model('Searches', searchSchema);

// pads number with a 0 on the left if the number is single digits
// used for month and day
function zeroPad(num) {
    num = String(num);
    if(num.length < 2) {
        num = '0' + num;
    }
    return num;
}

app.get('/', function(req, res) {
    res.render('public/index.html');
}); 

// search term is placed after /search/
app.get('/search/:id', function(req, res) { 
    // obtain how many items wanted, and search term
    var pageNum = req.query.offset * 10;
    var searchTerm = req.params.id;
    
    // create timestamp for search time
    var now = new Date();
    var searchTime = zeroPad(now.getUTCMonth() + 1) + '/' + zeroPad(now.getUTCDate()) + '/' + now.getUTCFullYear() + ' ' + zeroPad(now.getUTCHours()) + ':' + zeroPad(now.getUTCMinutes()) + ':' + zeroPad(now.getUTCSeconds());
    
    // documents with query term and time searched
    var newsearch = new Searches({
        query: searchTerm,
        time: searchTime
    });
        
    // save document
    newsearch.save(function(err) {
        if(err) {
            console.log('error');
        }
        else {
            console.log('success!');
        }
    });
    
    
    // send search term and number of items wanted to bing search module
    search.images(searchTerm,
      {top: 10,
        skip: pageNum},
      function(err, results) {
        // delete all of the irrelevant information before sending results
        for(var i = 0; i < results.length; i++) {
            delete results[i]['id'];
            delete results[i]['displayUrl'];
            delete results[i]['width'];
            delete results[i]['height'];
            delete results[i]['size'];
            delete results[i]['type'];
            delete results[i]['thumbnail'];            
        }
        res.send(results);
      }
    );
});


// shows history
app.get('/history', function(req, res) {
    
    // find 10 most recent docs, don't return _id or __v
    Searches.find().sort('-time').limit(10).select('-_id -__v').exec(function(err, item) {
        if(err) {
            console.log(err);
        }
        else {
            var history = [];
            for(var i = 0; i < item.length; i++) {
                history.push(item[i]);
            }
            res.json(history);     
        }
    });
    
});

app.listen(port);