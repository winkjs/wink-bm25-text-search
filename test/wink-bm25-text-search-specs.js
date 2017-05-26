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
var docs = require( './toy-data-for-wink-bm25.json' );

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
         title: 3,
         body: 1,
         tags: 4
       },
       bm25Params: {
          k: 2,
          b: 0.1
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

  it( 'search should return \n\t' + docs[ 0 ].body, function () {
    var text = 'Barack Hussein Obama II born August 4, 1961 is an American politician who served as the 44th President of the United States from 2009 to 2017. He is the first African American to have served as president. He previously served in the U.S. Senate representing Illinois from 2005 to 2008, and in the Illinois State Senate from 1997 to 2004.';
    expect( docs[ bts.search( 'who is married to barack' )[ 0 ][ 0 ] ].body ).to.equal( text );
  } );

} );
