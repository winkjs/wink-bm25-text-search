//     wink-bm25-text-search
//     Configurable BM25 Text Search Engine with simple
//     semantic search support.
//
//     Copyright (C) 2017  GRAYPE Systems Private Limited
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
  var prepTasks = [
    { whenInputIs: [ prepare.string.incorrect, prepare.string.lowerCase ], expectedOutputIs: 'winkBM25S: Tasks should contain function, instead found: undefined' },
    { whenInputIs: null, expectedOutputIs: 'winkBM25S: Tasks should be an array, instead found: null' },
    { whenInputIs: undefined, expectedOutputIs: 'winkBM25S: Tasks should be an array, instead found: undefined' },
    { whenInputIs: 1, expectedOutputIs: 'winkBM25S: Tasks should be an array, instead found: 1' },
    { whenInputIs: { a: 3 }, expectedOutputIs: 'winkBM25S: Tasks should be an array, instead found: {"a":3}' }
  ];

  prepTasks.forEach( function ( ptask ) {
    it( 'should throw "' + ptask.expectedOutputIs + '" if the input is ' + JSON.stringify( ptask.whenInputIs ), function () {
      expect( bts.definePrepTasks.bind( null, ptask.whenInputIs, undefined ) ).to.throw( ptask.expectedOutputIs );
    } );
  } );
} );

describe( 'definePrepTasks() Proper Cases', function () {
  var bts = bm25();
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
    },
    {
      whenInputIs: [ [
      prepare.string.lowerCase,
      prepare.string.removeExtraSpaces,
      prepare.string.tokenize0,
      prepare.tokens.propagateNegations,
      prepare.tokens.removeWords,
      prepare.tokens.stem ], 'search' ],
      expectedOutputIs: 6
    }
  ];

  prepTasks.forEach( function ( ptask ) {
    it( 'definePrepTasks should return "' + JSON.stringify( ptask.expectedOutputIs ) + '" if the input has ' + ptask.whenInputIs[ 0 ].length + ' tasks', function () {
      expect( bts.definePrepTasks( ptask.whenInputIs[ 0 ], ptask.whenInputIs[ 1 ]  ) ).to.equal( ptask.expectedOutputIs );
    } );
  } );

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

  it( 'post import, search should throw error', function () {
    expect( bts.search.bind( null, 'whoes husband is barack' ) ).to.throw( 'winkBM25S: search is not possible unless learnings are consolidated!' );
  } );

  it( 'now consolidate should return true', function () {
    expect( bts.consolidate( ) ).to.equal( true );
  } );

  it( 'search should once again return \n\t' + docs[ 1 ].body, function () {
    expect( docs[ bts.search( 'who is married to barack' )[ 0 ][ 0 ] ].body ).to.equal( text );
  } );
} );
