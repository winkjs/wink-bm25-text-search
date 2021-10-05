/* eslint no-console: 0 */
// Load wink-bm25-text-search
var bm25 = require( 'wink-bm25-text-search' );
// Create search engine's instance
var engine = bm25();
// Load sample data (load any other JSON data instead of sample)
var docs = require( 'wink-bm25-text-search/sample-data/demo-data-for-wink-bm25.json' );
// Load wink nlp and its model
const winkNLP = require( 'wink-nlp' );
// Use web model
const model = require( 'wink-eng-lite-web-model' );
const nlp = winkNLP( model );
const its = nlp.its;

const prepTask = function ( text ) {
  const tokens = [];
  nlp.readDoc(text)
      .tokens()
      // Use only words ignoring punctuations etc and from them remove stop words
      .filter( (t) => ( t.out(its.type) === 'word' && !t.out(its.stopWordFlag) ) )
      // Handle negation and extract stem of the word
      .each( (t) => tokens.push( (t.out(its.negationFlag)) ? '!' + t.out(its.stem) : t.out(its.stem) ) );

  return tokens;
};

// Contains search query.
var query;

// Step I: Define config
// Only field weights are required in this example.
engine.defineConfig( { fldWeights: { title: 1, body: 2 } } );
// Step II: Define PrepTasks pipe.
// Set up 'default' preparatory tasks i.e. for everything else
engine.definePrepTasks( [ prepTask ] );

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
