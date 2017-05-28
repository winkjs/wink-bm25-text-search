
# wink-bm25-text-search

> Configurable [BM25](http://opensourceconnections.com/blog/2015/10/16/bm25-the-next-generation-of-lucene-relevation/) Text Search Engine with [simple semantic search](http://opensourceconnections.com/blog/2016/10/19/bm25f-in-lucene/) support

### [![Build Status](https://api.travis-ci.org/decisively/wink-bm25-text-search.svg?branch=master)](https://travis-ci.org/decisively/wink-bm25-text-search) [![Coverage Status](https://coveralls.io/repos/github/decisively/wink-bm25-text-search/badge.svg?branch=master)](https://coveralls.io/github/decisively/wink-bm25-text-search?branch=master)

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

1. Configure text preparation task such as *amplify negation*, *tokenize*, *stem*, *remove stop words*, and *propagate negation* using [wink-nlp-utils](https://www.npmjs.com/package/wink-nlp-utils) or any other package of your choice.
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


## Usage


```javascript

// Load wink-bm25-text-search
var bm25 = require( 'wink-bm25-text-search' )();
// Load sample data
var docs = require( './node_modules/wink-bm25-text-search/sample-data/data-for-wink-bm25.json' );

// Set up preparatory tasks for 'body' field
bm25.definePrepTasks( [
  prepare.string.lowerCase,
  prepare.string.removeExtraSpaces,
  prepare.string.tokenize0,
  prepare.tokens.propagateNegations,
  prepare.tokens.removeWords,
  prepare.tokens.stem
], 'body' );
// Set up 'default' preparatory tasks i.e. for everything else
bm25.definePrepTasks( [
  prepare.string.lowerCase,
  prepare.string.removeExtraSpaces,
  prepare.string.tokenize0,
  prepare.tokens.propagateNegations,
  prepare.tokens.stem
] );
// Define BM25 configuration
bm25.defineConfig( {
    fldWeights: { title: 4, body: 1, tags: 2 },
    bm25Params: { k1: 1.2, k: 1, b: 0.75
} );
// Add documents now...
docs.forEach( function ( doc, i ) {
  // Note, 'i' becomes the unique id for 'doc'
  bm25.addDoc( doc, i );
} );
// All set, start searching!
var results = bm25.search( 'who is married to barack' );
// results is an array of [ doc-id, score ], sorted by score
// results[ 0 ][ 0 ].body i.e. the top result is:

// -> Michelle LaVaughn Robinson Obama (born January 17, 1964) is...
```

## API


## Need Help?
If you spot a bug and the same has not yet been reported, raise a new [issue](https://github.com/decisively/wink-bm25-text-search/issues) or consider fixing it and sending a pull request.


## Copyright & License
**wink-bm25-text-search** is copyright 2017 GRAYPE Systems Private Limited.

It is licensed under the under the terms of the GNU Affero General Public License as published by the Free
Software Foundation, version 3 of the License.
