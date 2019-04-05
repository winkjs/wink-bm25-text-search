
# wink-bm25-text-search

Fast Full Text Search based on [BM25](http://opensourceconnections.com/blog/2015/10/16/bm25-the-next-generation-of-lucene-relevation/)

### [![Build Status](https://api.travis-ci.org/winkjs/wink-bm25-text-search.svg?branch=master)](https://travis-ci.org/winkjs/wink-bm25-text-search) [![Coverage Status](https://coveralls.io/repos/github/winkjs/wink-bm25-text-search/badge.svg?branch=master)](https://coveralls.io/github/winkjs/wink-bm25-text-search?branch=master) [![Inline docs](http://inch-ci.org/github/winkjs/wink-bm25-text-search.svg?branch=master)](http://inch-ci.org/github/winkjs/wink-bm25-text-search) [![dependencies Status](https://david-dm.org/winkjs/wink-bm25-text-search/status.svg)](https://david-dm.org/winkjs/wink-bm25-text-search) [![devDependencies Status](https://david-dm.org/winkjs/wink-bm25-text-search/dev-status.svg)](https://david-dm.org/winkjs/wink-bm25-text-search?type=dev) [![Gitter](https://img.shields.io/gitter/room/nwjs/nw.js.svg)](https://gitter.im/winkjs/Lobby)


<img align="right" src="https://decisively.github.io/wink-logos/logo-title.png" width="100px" >

Add fast in-memory semantic search to your application using **`wink-bm25-text-search`**. It is based on state-of-the-art text search algorithm — BM25 — a Probabilistic Relevance Framework for document retrieval. It's [API](#api) offers a rich set of features:

1. **Scalable Design** allows easy addition/customization of features like **geolocation** and more.

2. **Search on exact values of pre-defined fields**, makes search results more relevant.

3. **Index optimized for size and speed** can be exported (and imported) from the added documents in a JSON format.

4. **Full control over BM25 configuration** — while default values work well for most situations, there is an option to control them.

5. **Add semantic flavor** to the search by:
    1. Assigning different numerical weights to the fields. A negative field weight will pull down the document's score whenever a match with that field occurs.
    2. Using `amplifyNegation()` and `propagateNegations()` from [wink-nlp-utils](https://www.npmjs.com/package/wink-nlp-utils) will ensure different search results for query texts containing phrases like **"good"** and **"not good"**.
    3. Defining different text preparation tasks separately for the fields and query text.

6. **Complete flexibility in text preparation** — perform tasks such as tokenization and stemming using [wink-nlp-utils](https://www.npmjs.com/package/wink-nlp-utils) or any other package of your choice.



## Installation
Use [npm](https://www.npmjs.com/package/wink-bm25-text-search) to install:
```sh
npm install wink-bm25-text-search --save
```


## Example [![Try on Runkit](https://badge.runkitcdn.com/wink-bm25-text-search.svg)](https://npm.runkit.com/wink-bm25-text-search)


```javascript
// Load wink-bm25-text-search
var bm25 = require( '../src/wink-bm25-text-search' );
// Create search engine's instance
var engine = bm25();
// Load NLP utilities
var nlp = require( 'wink-nlp-utils' );
// Load sample data (load any other JSON data instead of sample)
var docs = require( '../sample-data/data-for-wink-bm25.json' );

// Define preparatory task pipe!
var pipe = [
  nlp.string.lowerCase,
  nlp.string.tokenize0,
  nlp.tokens.removeWords,
  nlp.tokens.stem,
  nlp.tokens.propagateNegations
];
// Contains search query.
var query;

// Step I: Define config
// Only field weights are required in this example.
engine.defineConfig( { fldWeights: { title: 1, body: 2 } } );
// Step II: Define PrepTasks pipe.
// Set up 'default' preparatory tasks i.e. for everything else
engine.definePrepTasks( pipe );

// Step III: Add Docs
// Add documents now...
docs.forEach( function ( doc, i ) {
  // Note, 'i' becomes the unique id for 'doc'
  engine.addDoc( doc, i );
} );

// Step IV: Consolidate
// Consolidate before searching
engine.consolidate();

// All set, start searching!
query = 'not studied law';
// `results` is an array of [ doc-id, score ], sorted by score
var results = engine.search( query );
// Print number of results.
console.log( '%d entries found.', results.length );
// -> 1 entries found.
// results[ 0 ][ 0 ] i.e. the top result is:
console.log( docs[ results[ 0 ][ 0 ] ].body );
// -> George Walker Bush (born July 6, 1946) is an...
// -> ... He never studied Law...

// Whereas if you search for `law` then multiple entries will be
// found except the above entry!
```

## API

#### defineConfig( config )
Defines the configuration from the `config` object. This object defines following 3 properties:

1. The `fldWeights` (mandatory) is an object where each *key* is the *document's field name* and the *value* is the *numerical weight* i.e. the importance of that field.

2. The `bm25Params` (optional) is also an object that defines upto 3 keys viz. `k1`, `b`, and `k`. Their default values are respectively `1.2`, `0.75`, and `1`. Note: **`k1`** controls TF saturation; **`b`** controls degree of normalization, and **`k`** manages IDF.

3. The `ovFldNames` (optional) is an array containing the names of the fields, whose original value must be retained. This is useful in reducing the search space using **filter** in `search()` api call.

#### definePrepTasks( tasks [, field ] )

Defines the text preparation `tasks` to transform raw incoming text into an array of tokens required during `addDoc()`, and `search()` operations. It returns the count of `tasks`.

The `tasks` should be an array of functions. The first function in this array must accept a string as input; and the last function must return an array of tokens as JavaScript Strings. Each function must accept one input argument and return a single value.  

The second argument — `field` is optional. It defines the `field` of the document for which the `tasks` will be defined; in absence of this argument, the `tasks` become the default for everything else. The configuration must be defined via `defineConfig()` prior to this call.

As illustrated in the example above, [wink-nlp-utils](https://www.npmjs.com/package/wink-nlp-utils) offers a rich set of such functions.

#### addDoc( doc, uniqueId )
Adds the `doc` with the `uniqueId` to the BM25 model. Prior to adding docs, `defineConfig()` and `definePrepTasks()` must be called. It accepts structured JSON documents as input for creating the model. Following is an example document structure of the sample data JSON contained in this package:
```
{
  title: 'Barack Obama',
  body: 'Barack Hussein Obama II born August 4, 1961 is an American politician...'
  tags: 'democratic nobel peace prize columbia michelle...'
}
```

The sample data is created using excerpts from [Wikipedia](https://en.wikipedia.org/wiki/Main_Page) articles such as one on [Barack Obama](https://en.wikipedia.org/wiki/Barack_Obama).

It has an alias `learn( doc, uniqueId )` to maintain API level uniformity across various [wink](https://www.npmjs.com/~sanjaya) packages such as [wink-naive-bayes-text-classifier](https://www.npmjs.com/package/wink-naive-bayes-text-classifier).



#### consolidate( fp )
Consolidates the BM25 model for all the added documents. The `fp` defines the precision at
which term frequency values are stored. The default value is 4 and is good enough for most situations. It is a prerequisite for `search()` and documents cannot be added post consolidation.

#### search( text [, limit, filter, params ] )
Searches for the `text` and returns upto the `limit` number of results. The `filter` should be a function that must return true or false based on `params`. Think of it as Javascript Array's filter function. It receives two arguments viz. (a) an object containing field name/value pairs as defined via `ovFldNames` in `defineConfig()`, and (b) the `params`.

The last three arguments `limit`, `filter` and `params` are optional. The default value of `limit` is **10**.

The result is an array of
`[ uniqueId, relevanceScore ]`, sorted on the `relevanceScore`.

Like `addDoc()`, it also has an alias `predict( doc, uniqueId )` to maintain API level uniformity across various [wink](https://www.npmjs.com/~sanjaya) packages such as [wink-naive-bayes-text-classifier](https://www.npmjs.com/package/wink-naive-bayes-text-classifier).


#### exportJSON()
The BM25 model can be exported as JSON text that may be saved in a file. It is a good idea to export JSON prior to consolidation and use the same whenever more documents need to be added; whereas JSON exported after consolidation is only good for search operation.

#### importJSON( json )
An existing JSON BM25 model can be imported for search. It is essential to call `definePrepTasks()` before attempting to search.

#### reset()
It completely resets the BM25 model by re-initializing all the variables, except the preparatory tasks.


## Need Help?
If you spot a bug and the same has not yet been reported, raise a new [issue](https://github.com/winkjs/wink-bm25-text-search/issues) or consider fixing it and sending a pull request.

### About wink
[Wink](http://winkjs.org/) is a family of open source packages for **Statistical Analysis**, **Natural Language Processing** and **Machine Learning** in NodeJS. The code is **thoroughly documented** for easy human comprehension and has a **test coverage of ~100%** for reliability to build production grade solutions.


## Copyright & License
**wink-bm25-text-search** is copyright 2017-19 [GRAYPE Systems Private Limited](http://graype.in/).

It is licensed under the terms of the MIT License.
