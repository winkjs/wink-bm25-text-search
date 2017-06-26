/* eslint no-console: 0 */
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
bm25.defineConfig( { fldWeights: { title: 4, body: 1, tags: 2 } } );
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
