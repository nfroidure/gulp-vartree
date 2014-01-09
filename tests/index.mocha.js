var fs = require('fs')
  , gulp = require('gulp')
  , gutil = require('gulp-util')
  , es = require('event-stream')
  , vartree = require('../src/index')
  , mdvars = require('gulp-mdvars')
  , assert = require('assert')
;


describe('gulp-mdvars', function() {

  describe('in stream mode', function() {

    it('create a vartree', function(done) {
      var root = {};
      gulp.src(__dirname + '/fixtures/**/*.md', {buffer: false})
        .pipe(mdvars())
        .pipe(vartree({
          root: root
        }))
        .pipe(es.map(function(file, cb){
          file.contents.pipe(es.wait(function(err, data) {
              cb(null, file);
            }));
        }))
        .pipe(es.wait(function(){
          assert.deepEqual(root, {
            "childs":[
              {"title":"file1"},
              {"title":"file2"},
              {"title":"index"}
            ],
            "test":{
              "childs":[
                {"title":"test-file1"},
                {"title":"test-file2"},
                {"title":"test-index"}
              ]
            }
          });
          done();
        }));
    });

    it('create a vartree with changed child prop when options.childsProp=*', function(done) {
      var root = {};
      gulp.src(__dirname + '/fixtures/**/*.md', {buffer: false})
        .pipe(mdvars())
        .pipe(vartree({
          root: root,
          childsProp: '__childs'
        }))
        .pipe(es.map(function(file, cb){
          file.contents.pipe(es.wait(function(err, data) {
              cb(null, file);
            }));
        }))
        .pipe(es.wait(function(){
          assert.deepEqual(root, {
            "__childs":[
              {"title":"file1"},
              {"title":"file2"},
              {"title":"index"}
            ],
            "test":{
              "__childs":[
                {"title":"test-file1"},
                {"title":"test-file2"},
                {"title":"test-index"}
              ]
            }
          });
          done();
        }));
    });

    it('create an indexed vartree when index=*', function(done) {
      var root = {};
      gulp.src(__dirname + '/fixtures/**/*.md', {buffer: false})
        .pipe(mdvars())
        .pipe(vartree({
          root: root,
          index: 'index'
        }))
        .pipe(es.map(function(file, cb){
          file.contents.pipe(es.wait(function(err, data) {
              cb(null, file);
            }));
        }))
        .pipe(es.wait(function(){
          assert.deepEqual(root, {
            "childs":[
              {"title":"file1"},
              {"title":"file2"}
            ],
            "index" : {"title":"index"},
            "test":{
              "childs":[
                {"title":"test-file1"},
                {"title":"test-file2"}
              ],
              "index" : {"title":"test-index"}
            }
          });
          done();
        }));
    });

    it('create a reference to parent when option.parent=true', function(done) {
      var root = {};
      gulp.src(__dirname + '/fixtures/**/*.md', {buffer: false})
        .pipe(mdvars())
        .pipe(vartree({
          root: root,
          parent: 'parent'
        }))
        .pipe(es.map(function(file, cb){
          file.contents.pipe(es.wait(function(err, data) {
              cb(null, file);
            }));
        }))
        .pipe(es.wait(function(){
          assert.equal(root.test.parent, root);
          done();
        }));
    });

  });

  describe('in buffer mode', function() {

    it('create a vartree', function(done) {
      var root = {};
      gulp.src(__dirname + '/fixtures/**/*.md', {buffer: true})
        .pipe(mdvars())
        .pipe(vartree({
          root: root
        }))
        .pipe(es.wait(function(){
          assert.deepEqual(root, {
            "childs":[
              {"title":"file1"},
              {"title":"file2"},
              {"title":"index"}
            ],
            "test":{
              "childs":[
                {"title":"test-file1"},
                {"title":"test-file2"},
                {"title":"test-index"}
              ]
            }
          });
          done();
        }));
    });

    it('create a vartree with changed child prop when options.childsProp=*', function(done) {
      var root = {};
      gulp.src(__dirname + '/fixtures/**/*.md', {buffer: true})
        .pipe(mdvars())
        .pipe(vartree({
          root: root,
          childsProp: '__childs'
        }))
        .pipe(es.wait(function(){
          assert.deepEqual(root, {
            "__childs":[
              {"title":"file1"},
              {"title":"file2"},
              {"title":"index"}
            ],
            "test":{
              "__childs":[
                {"title":"test-file1"},
                {"title":"test-file2"},
                {"title":"test-index"}
              ]
            }
          });
          done();
        }));
    });

    it('create an indexed vartree when index=*', function(done) {
      var root = {};
      gulp.src(__dirname + '/fixtures/**/*.md', {buffer: true})
        .pipe(mdvars())
        .pipe(vartree({
          root: root,
          index: 'index'
        }))
        .pipe(es.wait(function(){
          assert.deepEqual(root, {
            "childs":[
              {"title":"file1"},
              {"title":"file2"}
            ],
            "index" : {"title":"index"},
            "test":{
              "childs":[
                {"title":"test-file1"},
                {"title":"test-file2"}
              ],
              "index" : {"title":"test-index"}
            }
          });
          done();
        }));
    });

    it('create a reference to parent when option.parent=true', function(done) {
      var root = {};
      gulp.src(__dirname + '/fixtures/**/*.md', {buffer: true})
        .pipe(mdvars())
        .pipe(vartree({
          root: root,
          parent: 'parent'
        }))
        .pipe(es.wait(function(){
          assert.equal(root.test.parent, root);
          done();
        }));
    });

  });

});
