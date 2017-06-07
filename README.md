
# wink-bm25-text-search

> Configurable [BM25](http://opensourceconnections.com/blog/2015/10/16/bm25-the-next-generation-of-lucene-relevation/) Text Search Engine with simple semantic search support

### [![Build Status](https://api.travis-ci.org/decisively/wink-bm25-text-search.svg?branch=master)](https://travis-ci.org/decisively/wink-bm25-text-search) [![Coverage Status](https://coveralls.io/repos/github/decisively/wink-bm25-text-search/badge.svg?branch=master)](https://coveralls.io/github/decisively/wink-bm25-text-search?branch=master) [![Inline docs](http://inch-ci.org/github/decisively/wink-bm25-text-search.svg?branch=master)](http://inch-ci.org/github/decisively/wink-bm25-text-search) [![dependencies Status](https://david-dm.org/decisively/wink-bm25-text-search/status.svg)](https://david-dm.org/decisively/wink-bm25-text-search) [![devDependencies Status](https://david-dm.org/decisively/wink-bm25-text-search/dev-status.svg)](https://david-dm.org/decisively/wink-bm25-text-search?type=dev)

<img align="right" src="https://decisively.github.io/wink-logos/logo-title.png" width="100px" >

**wink-bm25-text-search** is a part of **[wink](https://www.npmjs.com/~sanjaya)**, which is a family of Machine Learning NPM packages. They consist of simple and/or higher order functions that can be combined with NodeJS `stream` and `child processes` to create recipes for analytics driven business solutions.


Easily add *in-memory semantic search* to your application using **wink-bm25-text-search**. It is based on one of the most popular text-retrieval algorithm — BM25F — a Probabilistic Relevance Framework (PRF) for document retrieval. It accepts structured JSON documents as input for creating the model. Following is an example document structure of the sample data JSON contained in this package:
```
{
  title: 'Barack Obama',
  body: 'Barack Hussein Obama II born August 4, 1961 is an American politician...'
  tags: 'democratic nobel peace prize columbia michelle...'
}
```

The sample data is created using excerpts from [Wikipedia](https://en.wikipedia.org/wiki/Main_Page) articles such as one on [Barack Obama](https://en.wikipedia.org/wiki/Barack_Obama).

It's [API](#api) offers a rich set of features:

1. Configure text preparation task such as *amplify negation*, *tokenize*, *stem*, *remove stop words*, and *propagate negation* using **[wink-nlp-utils](https://www.npmjs.com/package/wink-nlp-utils)** or any other package of your choice.
2. Add semantic flavor to the search by:
    1. Defining the text preparation tasks separately for (a) each field (e.g. body or tags), (b) search string, and \(c\) a default for everything else.
    2. Assigning different degree of importance to every field in terms of a numerical weight.
3. Configure all the BM25 parameters — (a) **`k1`** to control TF saturation, (b) **`b`** to control degree of normalization, and \(c\) **`k`** to manage IDF.
4. Export and import learnings from the added documents in a JSON format that can be easily saved on hard-disk.



## Installation
Use **[npm](https://www.npmjs.com/package/wink-bm25-text-search)** to install:
```
npm install wink-bm25-text-search --save
```


## Example [![Try on Runkit](https://badge.runkitcdn.com/wink-bm25-text-search.svg)](https://npm.runkit.com/wink-bm25-text-search)


```javascript
// Load wink-bm25-text-search
var bm25 = require( 'wink-bm25-text-search' )();
// Load NLP utilities
var nlp = require( 'wink-nlp-utils' );
// Load sample data (load any other JSON data instead of sample)
var docs = require( 'wink-bm25-text-search/sample-data/data-for-wink-bm25.json' );
// Set up preparatory tasks for 'body' field
bm25.definePrepTasks( [
  nlp.string.lowerCase,
  nlp.string.removeExtraSpaces,
  nlp.string.tokenize0,
  nlp.tokens.propagateNegations,
  nlp.tokens.removeWords,
  nlp.tokens.stem
], 'body' );
// Set up 'default' preparatory tasks i.e. for everything else
bm25.definePrepTasks( [
  nlp.string.lowerCase,
  nlp.string.removeExtraSpaces,
  nlp.string.tokenize0,
  nlp.tokens.propagateNegations,
  nlp.tokens.stem
] );
// Define BM25 configuration
bm25.defineConfig( {
    fldWeights: { title: 4, body: 1, tags: 2 },
    bm25Params: { k1: 1.2, k: 1, b: 0.75 }
} );
// Add documents now...
docs.forEach( function ( doc, i ) {
  // Note, 'i' becomes the unique id for 'doc'
  bm25.addDoc( doc, i );
} );
// Consolidate before searching
bm25.consolidate();
// All set, start searching!
var results = bm25.search( 'who is married to barack' );
// results is an array of [ doc-id, score ], sorted by score
// results[ 0 ][ 0 ] i.e. the top result is:
console.log( docs[ results[ 0 ][ 0 ] ].body );
// -> Michelle LaVaughn Robinson Obama (born January 17, 1964) is...
```

## API

#### definePrepTasks( tasks [, field ] )

Defines the text preparation `tasks` to transform raw incoming text into an array of tokens required during `addDoc()`, and `search()` operations. The `tasks` should be an array of functions. The first function in this array must accept a string as input; and the last function must return an array of tokens as JavaScript Strings. Each function must accept one input argument and return a single value. `definePrepTasks` returns the count of `tasks`. The second argument — `field` is optional. It defines the `field` of the document for which the `tasks` will be defined; in absence of this argument, the `tasks` become the default for everything else.

As illustrated in the usage, [wink-nlp-utils](https://www.npmjs.com/package/wink-nlp-utils) offers a rich set of such functions.

#### defineConfig( config )
Defines the configuration from the `config` object. This object must define 2 properties viz. (a) `fldWeights` and `bm25Params`. The `fldWeights` is an object where each *key* is the *document's field name* and the *value* is the *numerical weight* i.e. the importance of that field. The `bm25Params` is also an object that defines upto 3 keys viz. `k1`, `b`, and `k`. Thier default values are respectively **1.2**, **0.75**, and **1**.

#### addDoc( doc, uniqueId )
Simply adds the `doc` with the `uniqueId` to the BM25 model. If the input is a JavaScript String, then `definePrepTasks()` must be called before learning. Similarly `defineConfig()` must also be called before this operation.

It has an alias `learn( doc, uniqueId )` to maintain API level uniformity across various [wink](https://www.npmjs.com/~sanjaya) packages such as [wink-naive-bayes-text-classifier](https://www.npmjs.com/package/wink-naive-bayes-text-classifier).


#### consolidate()
Consolidates the BM25 model for all the added documents. It is a prerequisite for `search()`.

#### search( text [, limit ] )
Searches for the `text` and returns upto the `limit` number of results. The result is an array of
`[ uniqueId, relevanceScore ]`, sorted on the `relevanceScore`. The default value of `limit` is **10**.

Like `addDoc()`, tt also has an alias `predict( doc, uniqueId )` to maintain API level uniformity across various [wink](https://www.npmjs.com/~sanjaya) packages such as [wink-naive-bayes-text-classifier](https://www.npmjs.com/package/wink-naive-bayes-text-classifier).


#### exportJSON()
The BM25 model can be exported as JSON text that may be saved in a file.

#### importJSON( json )
An existing JSON BM25 model can be imported for search. It is essential to `definePrepTasks()` and `consolidate()` before attempting to search.

#### reset()
It completely resets the BM25 model by re-initializing all the variables, except the preparatory tasks.


## Need Help?
If you spot a bug and the same has not yet been reported, raise a new [issue](https://github.com/decisively/wink-bm25-text-search/issues) or consider fixing it and sending a pull request.


## Copyright & License
**wink-bm25-text-search** is copyright 2017 GRAYPE Systems Private Limited.

It is licensed under the under the terms of the GNU Affero General Public License as published by the Free
Software Foundation, version 3 of the License.
