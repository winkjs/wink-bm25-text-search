//     wink-bm25-text-search
//     Configurable BM25 Text Search Engine with simple
//     semantic search support.
//
//     Copyright (C) 2017-18  GRAYPE Systems Private Limited
//
//     This file is part of “wink-bm25-text-search”.
//
//     “wink-bm25-search” is free software: you can redistribute it
//     and/or modify it under the terms of the GNU Affero
//     General Public License as published by the Free
//     Software Foundation, version 3 of the License.
//
//     “wink-bm25-text-search” is distributed in the hope that it will
//     be useful, but WITHOUT ANY WARRANTY; without even
//     the implied warranty of MERCHANTABILITY or FITNESS
//     FOR A PARTICULAR PURPOSE.  See the GNU Affero General
//     Public License for more details.
//
//     You should have received a copy of the GNU Affero
//     General Public License along with “wink-bm25-text-search”.
//     If not, see <http://www.gnu.org/licenses/>.

//
var chai = require( 'chai' );
var mocha = require( 'mocha' );
var bm25 = require( '../src/wink-bm25-text-search.js' );
var prepare = require( 'wink-nlp-utils' );
var docs = require( '../sample-data/data-for-wink-bm25.json' );

var expect = chai.expect;
var describe = mocha.describe;
var it = mocha.it;

describe( 'definePrepTasks() Error Cases', function () {
  var bts = bm25();
  it( 'should throw error if config is not defined', function () {
    expect( bts.definePrepTasks.bind( null, [ prepare.string.lowerCase ] ) ).to.throw( 'winkBM25S: Config must be defined before defining prepTasks.' );
    // Config must be defined first to test remaining cases.
    bts.defineConfig( { fldWeights: { title: 4, body: 1, tags: 2 } } );
  } );
  var prepTasks = [
    { whenInputIs: [ [ prepare.string.incorrect, prepare.string.lowerCase ] ], expectedOutputIs: 'winkBM25S: Tasks should contain function, instead found: undefined' },
    { whenInputIs: [ [ prepare.string.lowerCase ], {} ], expectedOutputIs: 'winkBM25S: Field name is missing or it is not a string: {}/object' },
    { whenInputIs: [ [ prepare.string.lowerCase ], 'unknown' ], expectedOutputIs: 'winkBM25S: Field name is missing or it is not a string: "unknown"/string' },
    { whenInputIs: [ null ], expectedOutputIs: 'winkBM25S: Tasks should be an array, instead found: null' },
    { whenInputIs: [ undefined ], expectedOutputIs: 'winkBM25S: Tasks should be an array, instead found: undefined' },
    { whenInputIs: [ 1 ], expectedOutputIs: 'winkBM25S: Tasks should be an array, instead found: 1' },
    { whenInputIs: [ { a: 3 } ], expectedOutputIs: 'winkBM25S: Tasks should be an array, instead found: {"a":3}' },
  ];

  prepTasks.forEach( function ( ptask ) {
    it( 'should throw "' + ptask.expectedOutputIs + '" if the input is ' + JSON.stringify( ptask.whenInputIs ), function () {
      expect( bts.definePrepTasks.bind( null, ptask.whenInputIs[ 0 ], ptask.whenInputIs[ 1 ] ) ).to.throw( ptask.expectedOutputIs );
    } );
  } );
} );

describe( 'definePrepTasks() Proper Cases', function () {
  var bts = bm25();
  bts.defineConfig( { fldWeights: { title: 4, body: 1, tags: 2 } } );
  var prepTasks = [
    { whenInputIs: [ prepare.string.tokenize0, prepare.string.stem ], expectedOutputIs: 2 },
    { whenInputIs: [ ], expectedOutputIs: 0 }
  ];

  prepTasks.forEach( function ( ptask ) {
    it( 'should return "' + ptask.expectedOutputIs + '" if the input is ' + JSON.stringify( ptask.whenInputIs ), function () {
      expect( bts.definePrepTasks( ptask.whenInputIs ) ).to.equal( ptask.expectedOutputIs );
    } );
  } );
} );

describe( 'complete clean workflow test', function () {
  var bts = bm25();
  var prepTasks = [
    {
      whenInputIs: [ [
      prepare.string.lowerCase,
      prepare.string.removeExtraSpaces,
      prepare.string.tokenize0,
      prepare.tokens.stem,
      prepare.tokens.propagateNegations ] ],
      expectedOutputIs: 5
    },
    {
      whenInputIs: [ [
      prepare.string.lowerCase,
      prepare.string.removeExtraSpaces,
      prepare.string.tokenize0,
      prepare.tokens.propagateNegations,
      prepare.tokens.removeWords,
      prepare.tokens.stem ], 'body' ],
      expectedOutputIs: 6
    }
  ];

  it( 'defineConfig should return true when proper config is passed', function () {
    var config = {
      fldWeights: {
         title: 4,
         body: 1,
         tags: 2
       },
       bm25Params: {
          k1: 1.2,
          k: 1,
          b: 0.75
        }
      };
    expect( bts.defineConfig( config ) ).to.equal( true );
  } );

  prepTasks.forEach( function ( ptask ) {
    it( 'definePrepTasks should return "' + JSON.stringify( ptask.expectedOutputIs ) + '" if the input has ' + ptask.whenInputIs[ 0 ].length + ' tasks', function () {
      expect( bts.definePrepTasks( ptask.whenInputIs[ 0 ], ptask.whenInputIs[ 1 ]  ) ).to.equal( ptask.expectedOutputIs );
    } );
  } );

  docs.forEach( function ( doc, i ) {
    it( 'addDoc should return ' + ( i + 1 ) + ' doc count', function () {
      expect( bts.addDoc( doc, i ) ).to.equal( i + 1 );
    } );
  } );

  it( 'consolidate should return true', function () {
    expect( bts.consolidate( ) ).to.equal( true );
  } );

  var text = 'Michelle LaVaughn Robinson Obama (born January 17, 1964) is an American lawyer and writer who was First Lady of the United States from 2009 to 2017. She is married to the 44th President of the United States, Barack Obama, and was the first African-American First Lady. Raised on the South Side of Chicago, Illinois, Obama is a graduate of Princeton University and Harvard Law School, and spent her early legal career working at the law firm Sidley Austin, where she met her husband. She subsequently worked as the Associate Dean of Student Services at the University of Chicago and the Vice President for Community and External Affairs of the University of Chicago Medical Center. Barack and Michelle married in 1992 and have two daughters.';

  it( 'search should return \n\t' + docs[ 1 ].body, function () {
    expect( docs[ bts.search( 'whoes husband is barack' )[ 0 ][ 0 ] ].body ).to.equal( text );
  } );

  var json;
  it( 'exportJSON should return valid json', function () {
    json = bts.exportJSON( );
    expect( typeof JSON.stringify( json ) ).to.equal( 'string' );
  } );

  it( 'reset should return true', function () {
    expect( bts.reset( ) ).to.equal( true );
  } );

  it( 'post reset, consolidate should throw error', function () {
    expect( bts.consolidate.bind( null) ).to.throw( 'winkBM25S: document collection is too small for consolidation; add more docs!' );
  } );

  it( 'post reset, even search should throw error', function () {
    expect( bts.search.bind( null, 'whoes husband is barack' ) ).to.throw( 'winkBM25S: search is not possible unless learnings are consolidated!' );
  } );

  it( 'importJSON should return true', function () {
    expect( bts.importJSON( json ) ).to.equal( true );
  } );

  it( 'post consolidated import, search should return results', function () {
    expect( docs[ bts.search( 'who is married to barack' )[ 0 ][ 0 ] ].body ).to.equal( text );
  } );

  it( 'now consolidate should therefore throw error', function () {
    expect( bts.consolidate.bind( null) ).to.throw( 'winkBM25S: consolidation can be carried out only once!' );
  } );

  it( 'search should once again return \n\t' + docs[ 1 ].body, function () {
    expect( docs[ bts.search( 'who is married to barack' )[ 0 ][ 0 ] ].body ).to.equal( text );
  } );
} );

describe( 'complete clean workflow test with field value retained', function () {
  var bts = bm25();
  var prepTasks = [
    {
      whenInputIs: [ [
      prepare.string.lowerCase,
      prepare.string.removeExtraSpaces,
      prepare.string.tokenize0,
      prepare.tokens.stem,
      prepare.tokens.propagateNegations ] ],
      expectedOutputIs: 5
    },
    {
      whenInputIs: [ [
      prepare.string.lowerCase,
      prepare.string.removeExtraSpaces,
      prepare.string.tokenize0,
      prepare.tokens.propagateNegations,
      prepare.tokens.removeWords,
      prepare.tokens.stem ], 'body' ],
      expectedOutputIs: 6
    }
  ];

  var text = 'Ronald Wilson Reagan (/ˈrɒnəld ˈwɪlsən ˈreɪɡən/) (February 6, 1911 – June 5, 2004) was an American politician and actor who served as the 40th President of the United States from 1981 to 1989. Before his presidency, he was the 33rd Governor of California, from 1967 to 1975, after a career as a Hollywood actor and union leader. Raised in a poor family in small towns of northern Illinois, Reagan graduated from Eureka College in 1932 and worked as a sports announcer on several regional radio stations. After moving to Hollywood in 1937, he became an actor and starred in a few major productions. Reagan was twice elected President of the Screen Actors Guild, the labor union for actors, where he worked to root out Communist influence.';

  var mobFilter = function ( fld, month ) {
    return ( fld.mob === month );
  };

  it( 'defineConfig should return true when proper config is passed', function () {
    var config = {
      fldWeights: {
         title: 4,
         body: 1,
         tags: 2
       },
       ovFldNames: [ 'mob' ]
      };
    expect( bts.defineConfig( config ) ).to.equal( true );
  } );

  prepTasks.forEach( function ( ptask ) {
    it( 'definePrepTasks should return "' + JSON.stringify( ptask.expectedOutputIs ) + '" if the input has ' + ptask.whenInputIs[ 0 ].length + ' tasks', function () {
      expect( bts.definePrepTasks( ptask.whenInputIs[ 0 ], ptask.whenInputIs[ 1 ]  ) ).to.equal( ptask.expectedOutputIs );
    } );
  } );

  docs.forEach( function ( doc, i ) {
    it( 'addDoc should return ' + ( i + 1 ) + ' doc count', function () {
      expect( bts.addDoc( doc, i ) ).to.equal( i + 1 );
    } );
  } );

  it( 'consolidate should return true', function () {
    expect( bts.consolidate( 2 ) ).to.equal( true );
  } );

  it( 'search should about Ronald Wilson Reagan', function () {
    expect( docs[ bts.search( 'President of the United States', 10, mobFilter, 'february' )[ 0 ][ 0 ] ].body ).to.equal( text );
  } );
} );

describe( 'defineConfig() Error Cases', function () {
  var bts = bm25();

  it( 'should return true if the input is ', function () {
    expect( bts.addDoc.bind( null, { fail: 'why fail?' } ) ).to.throw( 'winkBM25S: Config must be defined before adding a document.' );
  } );

  var configs1 = [
    { whenInputIs: null, expectedOutputIs: 'winkBM25S: config must be a config object, instead found: null' },
    { whenInputIs: undefined, expectedOutputIs: 'winkBM25S: config must be a config object, instead found: undefined' },
    { whenInputIs: new Set([]), expectedOutputIs: 'winkBM25S: config must be a config object, instead found: {}' },
    { whenInputIs: {}, expectedOutputIs: 'winkBM25S: fldWeights must be an object, instead found: undefined' },
    { whenInputIs: { fldWeights: {} }, expectedOutputIs: 'winkBM25S: Field config has no field defined.' },
    { whenInputIs: { fldWeights: { fail: {} } }, expectedOutputIs: 'winkBM25S: Field weight should be number >0, instead found: {}' },
    { whenInputIs: { fldWeights: { fail: 2 }, ovFldNames: 3 }, expectedOutputIs: 'winkBM25S: OV Field names should be an array, instead found: "number"' },
    { whenInputIs: { fldWeights: { fail: 2 }, ovFldNames: [ '' ] }, expectedOutputIs: 'winkBM25S: OV Field name should be a non-empty string, instead found: ""' },
    { whenInputIs: { fldWeights: { fail: 2 }, ovFldNames: [ 3 ] }, expectedOutputIs: 'winkBM25S: OV Field name should be a non-empty string, instead found: 3' },
  ];

  configs1.forEach( function ( cfg ) {
    it( 'should throw "' + cfg.expectedOutputIs + '" if the input is ' + JSON.stringify( cfg.whenInputIs ), function () {
      expect( bts.defineConfig.bind( null, cfg.whenInputIs ) ).to.throw( cfg.expectedOutputIs );
    } );
  } );

  var configs2 = [
    { whenInputIs: { fldWeights: { fail: 3 }, ovFldNames: [ 'broken' ] }, expectedOutputIs: true },
  ];

  configs2.forEach( function ( cfg ) {
    it( 'should return true if the input is ' + JSON.stringify( cfg.whenInputIs ), function () {
      expect( bts.defineConfig( cfg.whenInputIs ) ).to.equal( true );
    } );
  } );

  it( 'should return true if the input is { fail: "why fail?", broken: 2 }, 1', function () {
    expect( bts.addDoc( { fail: 'why fail?', broken: 2 }, 1 ) ).to.equal( 1 );
  } );

  it( 'should return true if the input is  { fail: "why fail?", broken: 2 }, 1 (dup)', function () {
    expect( bts.addDoc.bind( null, { fail: 'why fail?', broken: 2 }, 1 ) ).to.throw( 'winkBM25S: Duplicate document encountered: 1' );
  } );

  it( 'should return true if the input is { fail: "why fail?", broken: 2 }, 2', function () {
    expect( bts.addDoc( { fail: 'why fail?', broken: 2 }, 2 ) ).to.equal( 2 );
  } );

  it( 'should return true if the input is { fail: "why fail?", broken: 2 }, 3', function () {
    expect( bts.addDoc( { fail: 'why fail?', broken: 2 }, 3 ) ).to.equal( 3 );
  } );

  it( 'should return true if the input is { pass: "why not pass?" }, 9', function () {
    expect( bts.addDoc.bind( null, { pass: 'why not pass?' }, 9 ) ).to.throw( 'winkBM25S: Missing field in the document: "fail"' );
  } );

  it( 'should return true if the input is { fail: "why not pass?", mended: 3 }, 10', function () {
    expect( bts.addDoc.bind( null, { fail: 'why not pass?', mended: 3 }, 10 ) ).to.throw( 'winkBM25S: Missing field in the document: "broken"' );
  } );

  it( 'should return true if the input is ', function () {
    expect( bts.defineConfig.bind( null, { fldWeights: { fail: 3 } } ) ).to.throw( 'winkBM25S: config must be defined before learning/addition starts!' );
  } );

  it( 'consolidate should return true, prep to test addDoc post this', function () {
    expect( bts.consolidate( 6 ) ).to.equal( true );
  } );

  it( 'should throw error if attempt to addDoc is made', function () {
    expect( bts.addDoc.bind( null, { fail: 3 }, 4 ) ).to.throw( 'winkBM25S: post consolidation adding/learning is not possible!' );
  } );

  it( 'should throw error if attempt to search not string is made', function () {
    expect( bts.search.bind( null, { fail: 3 } ) ).to.throw( 'winkBM25S: search text should be a string, instead found: object' );
  } );

  it( 'importJSON should throw error when null is passed', function () {
    expect( bts.importJSON.bind( null, null ) ).to.throw( 'winkBM25S: undefined or null JSON encountered, import failed!' );
  } );

  it( 'importJSON should throw error when invalid json is passed i.e. {}', function () {
    expect( bts.importJSON.bind( null, '{}' ) ).to.throw( 'winkBM25S: invalid JSON encountered, can not import.' );
  } );

  it( 'importJSON should throw error when invalid json is passed i.e. [] - incorrect length', function () {
    expect( bts.importJSON.bind( null, '[]' ) ).to.throw( 'winkBM25S: invalid JSON encountered, can not import.' );
  } );

  it( 'importJSON should throw error when invalid json is passed i.e. [ 1,.. ] - incorrect elements', function () {
    expect( bts.importJSON.bind( null, '[ 1, 1, 1, 1, 1, 1, 1, 1, 1 ]' ) ).to.throw( 'winkBM25S: invalid JSON encountered, can not import.' );
  } );
} );

describe( 'complete workflow to test consildate edge case', function () {
  var bts = bm25();
  var prepTasks = [
    {
      whenInputIs: [ [
      prepare.string.lowerCase,
      prepare.string.removeExtraSpaces,
      prepare.string.tokenize0,
      prepare.tokens.stem,
      prepare.tokens.propagateNegations ] ],
      expectedOutputIs: 5
    },
    {
      whenInputIs: [ [
      prepare.string.lowerCase,
      prepare.string.removeExtraSpaces,
      prepare.string.tokenize0,
      prepare.tokens.propagateNegations,
      prepare.tokens.removeWords,
      prepare.tokens.stem ], 'body' ],
      expectedOutputIs: 6
    }
  ];

  it( 'defineConfig should return true when proper config is passed', function () {
    var config = {
      fldWeights: {
         title: 4,
         body: 1,
         tags: 2
       },
       bm25Params: {
          k1: 1.2,
          k: 1,
          b: 0.75
        }
      };
    expect( bts.defineConfig( config ) ).to.equal( true );
  } );

  prepTasks.forEach( function ( ptask ) {
    it( 'definePrepTasks should return "' + JSON.stringify( ptask.expectedOutputIs ) + '" if the input has ' + ptask.whenInputIs[ 0 ].length + ' tasks', function () {
      expect( bts.definePrepTasks( ptask.whenInputIs[ 0 ], ptask.whenInputIs[ 1 ]  ) ).to.equal( ptask.expectedOutputIs );
    } );
  } );

  docs.forEach( function ( doc, i ) {
    it( 'addDoc should return ' + ( i + 1 ) + ' doc count', function () {
      expect( bts.addDoc( doc, i ) ).to.equal( i + 1 );
    } );
  } );

  it( 'consolidate should return true', function () {
    // consildate edge case lleft out in earlier tests!
    expect( bts.consolidate( 10 ) ).to.equal( true );
  } );

  var text = 'Michelle LaVaughn Robinson Obama (born January 17, 1964) is an American lawyer and writer who was First Lady of the United States from 2009 to 2017. She is married to the 44th President of the United States, Barack Obama, and was the first African-American First Lady. Raised on the South Side of Chicago, Illinois, Obama is a graduate of Princeton University and Harvard Law School, and spent her early legal career working at the law firm Sidley Austin, where she met her husband. She subsequently worked as the Associate Dean of Student Services at the University of Chicago and the Vice President for Community and External Affairs of the University of Chicago Medical Center. Barack and Michelle married in 1992 and have two daughters.';

  it( 'search should return \n\t' + docs[ 1 ].body, function () {
    expect( docs[ bts.search( 'whoes husband is barack' )[ 0 ][ 0 ] ].body ).to.equal( text );
  } );
} );
