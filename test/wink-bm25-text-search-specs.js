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
