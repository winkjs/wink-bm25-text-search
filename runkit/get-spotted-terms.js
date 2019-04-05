// ### getFoundTerms
/**
 *
 * Obtains the spotted search terms from the resultant text.
 *
 * @param {array[]} results contains the search results.
 * @param {string} query being searched.
 * @param {Object[]} docs being searched.
 * @param {string[]} fields of the `docs`.
 * @param {function[]} pipe in use for prep task.
 * @param {number} rwIndex index of `removeWords()` function.
 * @return {string[]} of search terms found in the `results` `docs`.
 */
var getSpottedTerms = function ( results, query, docs, fields, pipe, rwIndex ) {
  // Upto the `removeWords` pipe.
  var pipe1 = pipe.slice( 0, rwIndex );
  // From `removeWords` and beyond pipe.
  var pipe2 = pipe.slice( rwIndex );
  // Copy of query.
  var q = query.slice( 0 );
  // Total text for search `results` for `fields`.
  var t = [];
  // Spotted terms.
  var st = Object.create( null );

  // Empty results => empty found terms!
  if ( results.length === 0 ) return [];

  // Transform query as per the overall pipe.
  for ( let i = 0; i < pipe.length; i += 1 ) {
    q = pipe[ i ]( q );
  }

  // Extract total text from all fields of resultant docs.
  results.forEach( function ( r ) {
    fields.forEach( ( f ) => ( t.push( docs[r[ 0 ]][ f ] ) ) );
  } );
  t = t.join( ' ' );

  pipe1.forEach( function ( f ) {
    t = f( t );
  } );
  // It is text that has been LowerCased, tokenized, and stop words removed.
  var tRef = t.slice( 0 );

  // Now stem & negation handling – means words might get transformed i.e.
  // stemmed and may be prefixed with `!` due to negation.
  pipe2.forEach( function ( f ) {
    t = f( t );
  } );

  // Build a list of spotted terms by searching `t[ i ]` in `q` and
  // if found, build the `st` using the corresponding `tRef[ i ]`.
  for ( let i = 0; i < t.length; i += 1 ) {
    if ( q.indexOf( t[ i ] ) !== -1 ) {
      st[ tRef[ i ] ] = true;
    }
  }

  // Convert to array & return!
  return Object.keys( st );
};

module.exports = getSpottedTerms;
