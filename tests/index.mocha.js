var fs = require('fs')
  , gulp = require('gulp')
  , gutil = require('gulp-util')
  , es = require('event-stream')
  , vartree = require('../src/index')
  , mdvars = require('gulp-mdvars')
  , assert = require('assert')
  , VarStream = require('varstream')
;

function deepEq(a, b) {
  assert(VarStream.stringify(a).split(/\r?\n/).sort().join(),
    VarStream.stringify(b).split(/\r?\n/).sort().join());
}

describe('gulp-mdvars', function() {

  describe('with null contents', function() {

    it('should let null files pass through', function(done) {

      var s = vartree({
          root: {}
        })
        , n = 0;
      s.pipe(es.through(function(file) {
          assert.equal(file.path,'bibabelula.md');
          assert.equal(file.contents, null);
          n++;
        }, function() {
          assert.equal(n,1);
          done();
        }));
      s.write(new gutil.File({
        path: 'bibabelula.md',
        contents: null
      }));
      s.end();

    });

  });

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
          deepEq(root,{
              "childs":[
                {
                  "name":"test",
                  "childs":[
                    {"title":"test-file1"},
                    {"title":"test-file2"},
                    {"title":"test-index"}
                  ]
                },
                {"title":"file1"},
                {"title":"file2"},
                {"title":"index"}
              ]
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
          deepEq(root,{
              "__childs":[
                {
                  "name":"test",
                  "__childs":[
                    {"title":"test-file1"},
                    {"title":"test-file2"},
                    {"title":"test-index"}
                  ]
                },
                {"title":"file1"},
                {"title":"file2"},
                {"title":"index"}
              ]
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
          deepEq(root,{
            "childs":[
              {
                "name":"test",
                "childs":[
                  {"title":"test-file1"},
                  {"title":"test-file2"},
                ],
                "index": {"title":"test-index"}
              },
              {"title":"file1"},
              {"title":"file2"}
            ],
            index: {"title":"index"}
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
          assert(root.childs.some(function(scope1) {
            return scope1.childs&&scope1.childs.every(function(scope2) {
              return scope2.parent === scope1;
            });
          }));
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
          deepEq(root,{
            "childs":[
              {"title":"file1"},
              {"title":"file2"},
              {"title":"index"},
              {
                "name":"test",
                "childs":[
                  {"title":"test-file1"},
                  {"title":"test-file2"},
                  {"title":"test-index"}
                ]
              }
            ]
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
          deepEq(root,{
            "__childs":[
              {"title":"file1"},
              {"title":"file2"},
              {"title":"index"},
              {
                "name":"test",
                "__childs":[
                  {"title":"test-file1"},
                  {"title":"test-file2"},
                  {"title":"test-index"}
                ]
              }
            ]
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
          deepEq(root,{
            "childs":[
              {"title":"file1"},
              {"title":"file2"},
              {
                "name":"test",
                "childs":[
                  {"title":"test-file1"},
                  {"title":"test-file2"},
                ],
                "index":{"title":"test-index"}
              }
            ],
            "index":{"title":"index"}
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
          assert(root.childs.some(function(scope1) {
            return scope1.childs&&scope1.childs.every(function(scope2) {
              return scope2.parent === scope1;
            });
          }));
          done();
        }));
    });

  });

});
