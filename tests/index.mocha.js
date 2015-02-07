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
  assert.equal(VarStream.stringify(a).split(/\r?\n/).sort().join('\n'),
    VarStream.stringify(b).split(/\r?\n/).sort().join('\n')
  );
}
function recSort(root, childProp) {
  childProp = childProp || 'childs';
  root[childProp].sort(function(childA, childB) {
    if(childA[childProp]) {
      recSort(childA, childProp);
      return -1;
    }
    return childA.title < childB.title ? -1 : 1;
  });
  return root;
}

describe('gulp-vartree', function() {

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
          deepEq(recSort(root),recSort({
            "childs":[{
              "title":"file1",
              "path":"/",
              "name":"file1",
              "ext":".md",
              "href":"/file1.md"
            },{
              "title":"file2",
              "path":"/",
              "name":"file2",
              "ext":".md",
              "href":"/file2.md"
            },{
              "title":"index",
              "path":"/",
              "name":"index",
              "ext":".md",
              "href":"/index.md"
            },{
              "folder":"test",
              "childs":[{
                "title":"test-file1",
                "path":"/test/",
                "name":"file1",
                "ext":".md",
                "href":"/test/file1.md"
              },{
                "title":"test-file2",
                "path":"/test/",
                "name":"file2",
                "ext":".md",
                "href":"/test/file2.md"
              },{
                "title":"test-index",
                "path":"/test/",
                "name":"index",
                "ext":".md",
                "href":"/test/index.md"
              }]
            }]
          }));
          done();
        }));
    });

    it('work when using the base option', function(done) {
      var root = {};
      gulp.src(__dirname + '/**/*.md', {buffer: false})
        .pipe(mdvars())
        .pipe(vartree({
          root: root,
          base: 'fixtures'
        }))
        .pipe(es.map(function(file, cb){
          file.contents.pipe(es.wait(function(err, data) {
              cb(null, file);
            }));
        }))
        .pipe(es.wait(function(){
          deepEq(recSort(root),recSort({
            "childs":[{
              "title":"file1",
              "path":"/",
              "name":"file1",
              "ext":".md",
              "href":"/file1.md"
            },{
              "title":"file2",
              "path":"/",
              "name":"file2",
              "ext":".md",
              "href":"/file2.md"
            },{
              "title":"index",
              "path":"/",
              "name":"index",
              "ext":".md",
              "href":"/index.md"
            },{
              "folder":"test",
              "childs":[{
                "title":"test-file1",
                "path":"/test/",
                "name":"file1",
                "ext":".md",
                "href":"/test/file1.md"
              },{
                "title":"test-file2",
                "path":"/test/",
                "name":"file2",
                "ext":".md",
                "href":"/test/file2.md"
              },{
                "title":"test-index",
                "path":"/test/",
                "name":"index",
                "ext":".md",
                "href":"/test/index.md"
              }]
            }]
          }));
          done();
        }));
    });

    it('emit custopm event whith the varEvent option', function(done) {
      var root = {}
        , filled = false
      ;
      gulp.src(__dirname + '/fixtures/**/*.md', {buffer: false})
        .pipe(mdvars({
          varEvent: 'filled'
        }))
        .pipe(vartree({
          root: root,
          varEvent: 'filled'
        })).on('filled', function() {
          filled = true;
        })
        .pipe(es.map(function(file, cb){
          file.contents.pipe(es.wait(function(err, data) {
              cb(null, file);
            }));
        }))
        .pipe(es.wait(function(){
          assert(filled);
          deepEq(recSort(root),recSort({
            "childs":[{
              "title":"file1",
              "path":"/",
              "name":"file1",
              "ext":".md",
              "href":"/file1.md"
            },{
              "title":"file2",
              "path":"/",
              "name":"file2",
              "ext":".md",
              "href":"/file2.md"
            },{
              "title":"index",
              "path":"/",
              "name":"index",
              "ext":".md",
              "href":"/index.md"
            },{
              "folder":"test",
              "childs":[{
                "title":"test-file1",
                "path":"/test/",
                "name":"file1",
                "ext":".md",
                "href":"/test/file1.md"
              },{
                "title":"test-file2",
                "path":"/test/",
                "name":"file2",
                "ext":".md",
                "href":"/test/file2.md"
              },{
                "title":"test-index",
                "path":"/test/",
                "name":"index",
                "ext":".md",
                "href":"/test/index.md"
              }]
            }]
          }));
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
          deepEq(recSort(root, '__childs'),recSort({
            "__childs":[{
              "__childs":[{
                "title":"test-file1",
                "path":"/test/",
                "name":"file1",
                "ext":".md",
                "href":"/test/file1.md"
              },{
                "title":"test-file2",
                "path":"/test/",
                "name":"file2",
                "ext":".md",
                "href":"/test/file2.md"
              },{
                "title":"test-index",
                "path":"/test/",
                "name":"index",
                "ext":".md",
                "href":"/test/index.md"
              }],
              "folder":"test"
            },{
              "title":"file1",
              "path":"/",
              "name":"file1",
              "ext":".md",
              "href":"/file1.md"
            },{
              "title":"file2",
              "path":"/",
              "name":"file2",
              "ext":".md",
              "href":"/file2.md"
            },{
              "title":"index",
              "path":"/",
              "name":"index",
              "ext":".md",
              "href":"/index.md"
            }],
          }, '__childs'));
          done();
        }));
    });

    it('create a sorted vartree when options.sortProp and options.sortDesc is set to false', function(done) {
      var root = {};
      gulp.src(__dirname + '/fixtures/**/*.md', {buffer: false})
        .pipe(mdvars())
        .pipe(vartree({
          root: root,
          sortProp: 'name',
          sortDesc: false
        }))
        .pipe(es.map(function(file, cb){
          file.contents.pipe(es.wait(function(err, data) {
            cb(null, file);
          }));
        }))
        .pipe(es.wait(function(){
          deepEq(root,{
            "childs":[{
              "title":"file1",
              "path":"/",
              "name":"file1",
              "ext":".md",
              "href":"/file1.md"
            },{
              "title":"file2",
              "path":"/",
              "name":"file2",
              "ext":".md",
              "href":"/file2.md"
            },{
              "title":"index",
              "path":"/",
              "name":"index",
              "ext":".md",
              "href":"/index.md"
            },{
              "childs":[{
                "title":"test-file1",
                "path":"/test/",
                "name":"file1",
                "ext":".md",
                "href":"/test/file1.md"
              },{
                "title":"test-file2",
                "path":"/test/",
                "name":"file2",
                "ext":".md",
                "href":"/test/file2.md"
              },{
                "title":"test-index",
                "path":"/test/",
                "name":"index",
                "ext":".md",
                "href":"/test/index.md"
              }],
              "folder":"test"
            }]
          });
          done();
        }));
    });

    it('create a sorted vartree when options.sortProp and options.sortDesc is set to true', function(done) {
      var root = {};
      gulp.src(__dirname + '/fixtures/**/*.md', {buffer: false})
        .pipe(mdvars())
        .pipe(vartree({
          root: root,
          sortProp: 'name',
          sortDesc: true
        }))
        .pipe(es.map(function(file, cb){
          file.contents.pipe(es.wait(function(err, data) {
            cb(null, file);
          }));
        }))
        .pipe(es.wait(function(){
          deepEq(root,{
            "childs":[{
              "childs":[{
                "title":"test-index",
                "path":"/test/",
                "name":"index",
                "ext":".md",
                "href":"/test/index.md"
              },{
                "title":"test-file2",
                "path":"/test/",
                "name":"file2",
                "ext":".md",
                "href":"/test/file2.md"
              },{
                "title":"test-file1",
                "path":"/test/",
                "name":"file1",
                "ext":".md",
                "href":"/test/file1.md"
              }],
              "folder":"test"
            },{
              "title":"index",
              "path":"/",
              "name":"index",
              "ext":".md",
              "href":"/index.md"
            },{
              "title":"file2",
              "path":"/",
              "name":"file2",
              "ext":".md",
              "href":"/file2.md"
            },{
              "title":"file1",
              "path":"/",
              "name":"file1",
              "ext":".md",
              "href":"/file1.md"
            }]
          });
          done();
        }));
    });

    it('create an indexed vartree when option.index is set', function(done) {
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
          deepEq(recSort(root),recSort({
            "childs":[{
              "childs":[{
                "title":"test-file1",
                "path":"/test/",
                "name":"file1",
                "ext":".md",
                "href":"/test/file1.md"
              },{
                "title":"test-file2",
                "path":"/test/",
                "name":"file2",
                "ext":".md",
                "href":"/test/file2.md"
              }],
              "title":"test-index",
              "folder":"test",
              "path":"/test/",
              "name":"index",
              "ext":".md",
              "href":"/test/index.md"
            },{
              "title":"file1",
              "path":"/",
              "name":"file1",
              "ext":".md",
              "href":"/file1.md"
            },{
              "title":"file2",
              "path":"/",
              "name":"file2",
              "ext":".md",
              "href":"/file2.md"
            }],
            "title":"index",
            "path":"/",
            "name":"index",
            "ext":".md",
            "href":"/index.md"
          }));
          done();
        }));
    });

    it('create a reference to parent when option.parentProp is set', function(done) {
      var root = {};
      gulp.src(__dirname + '/fixtures/**/*.md', {buffer: false})
        .pipe(mdvars())
        .pipe(vartree({
          root: root,
          parentProp: 'parent'
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
            "childs":[{
              "title":"file1",
              "path":"/",
              "name":"file1",
              "ext":".md",
              "href":"/file1.md"
            },{
              "title":"file2",
              "path":"/",
              "name":"file2",
              "ext":".md",
              "href":"/file2.md"
            },{
              "title":"index",
              "path":"/",
              "name":"index",
              "ext":".md",
              "href":"/index.md"
            },{
              "folder":"test",
              "childs":[{
                "title":"test-file1",
                "path":"/test/",
                "name":"file1",
                "ext":".md",
                "href":"/test/file1.md"
              },{
                "title":"test-file2",
                "path":"/test/",
                "name":"file2",
                "ext":".md",
                "href":"/test/file2.md"
              },{
                "title":"test-index",
                "path":"/test/",
                "name":"index",
                "ext":".md",
                "href":"/test/index.md"
              }]
            }]
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
            "__childs":[{
              "title":"file1",
              "path":"/",
              "name":"file1",
              "ext":".md",
              "href":"/file1.md"
            },{
              "title":"file2",
              "path":"/",
              "name":"file2",
              "ext":".md",
              "href":"/file2.md"
            },{
              "title":"index",
              "path":"/",
              "name":"index",
              "ext":".md",
              "href":"/index.md"
            },{
              "folder":"test",
              "__childs":[{
                "title":"test-file1",
                "path":"/test/",
                "name":"file1",
                "ext":".md",
                "href":"/test/file1.md"
              },{
                "title":"test-file2",
                "path":"/test/",
                "name":"file2",
                "ext":".md",
                "href":"/test/file2.md"
              },{
                "title":"test-index",
                "path":"/test/",
                "name":"index",
                "ext":".md",
                "href":"/test/index.md"
              }]
            }]
          });
          done();
        }));
    });

    it('create an indexed vartree when index is set', function(done) {
      var root = {};
      gulp.src(__dirname + '/fixtures/**/*.md', {buffer: true})
        .pipe(mdvars())
        .pipe(vartree({
          root: root,
          index: 'index'
        }))
        .pipe(es.wait(function(){
          deepEq(root,{
            "childs":[{
              "title":"file1",
              "path":"/",
              "name":"file1",
              "ext":".md",
              "href":"/file1.md"
            },{
              "title":"file2",
              "path":"/",
              "name":"file2",
              "ext":".md",
              "href":"/file2.md"
            },{
              "childs":[{
                "title":"test-file1",
                "path":"/test/",
                "name":"file1",
                "ext":".md",
                "href":"/test/file1.md"
              },{
                "title":"test-file2",
                "path":"/test/",
                "name":"file2",
                "ext":".md",
                "href":"/test/file2.md"
              }],
              "title":"test-index",
              "folder":"test",
              "path":"/test/",
              "name":"index",
              "ext":".md",
              "href":"/test/index.md"
            }],
            "title":"index",
            "path":"/",
            "name":"index",
            "ext":".md",
            "href":"/index.md"
          });
          done();
        }));
    });

    it('create a reference to parent when option.parentProp is set', function(done) {
      var root = {}
        , expected = {
          "childs":[{
            "title":"file1",
            "path":"/",
            "name":"file1",
            "ext":".md",
            "href":"/file1.md"
          },{
            "title":"file2",
            "path":"/",
            "name":"file2",
            "ext":".md",
            "href":"/file2.md"
          },{
            "title":"index",
            "path":"/",
            "name":"index",
            "ext":".md",
            "href":"/index.md"
          },{
            "folder": "test",
            "childs":[{
              "title":"test-file1",
              "path":"/test/",
              "name":"file1",
              "ext":".md",
              "href":"/test/file1.md"
            },{
              "title":"test-file2",
              "path":"/test/",
              "name":"file2",
              "ext":".md",
              "href":"/test/file2.md"
            },{
              "title":"test-index",
              "path":"/test/",
              "name":"index",
              "ext":".md",
              "href":"/test/index.md"
            }]
          }]
        };
      function bckRef(node) {
        node.childs && node.childs.forEach(function (child) {
          child.parent = node;
          bckRef(child);
        });
      }
      bckRef(expected);
      gulp.src(__dirname + '/fixtures/**/*.md', {buffer: true})
        .pipe(mdvars())
        .pipe(vartree({
          root: root,
          parentProp: 'parent'
        }))
        .pipe(es.wait(function(){
          deepEq(root, expected);
          assert(root.childs.some(function(scope1) {
            return scope1.childs&&scope1.childs.every(function(scope2) {
              return scope2.parent === scope1;
            });
          }));
          done();
        }));
    });

    it('create a sorted vartree when options.sortProp and options.sortDesc is set to false', function(done) {
      var root = {};
      gulp.src(__dirname + '/fixtures/**/*.md', {buffer: true})
        .pipe(mdvars())
        .pipe(vartree({
          root: root,
          sortProp: 'name',
          sortDesc: false
        }))
        .pipe(es.wait(function(){
          deepEq(root,{
            "childs":[{
              "title":"file1",
              "path":"/",
              "name":"file1",
              "ext":".md",
              "href":"/file1.md"
            },{
              "title":"file2",
              "path":"/",
              "name":"file2",
              "ext":".md",
              "href":"/file2.md"
            },{
              "title":"index",
              "path":"/",
              "name":"index",
              "ext":".md",
              "href":"/index.md"
            },{
              "childs":[{
                "title":"test-file1",
                "path":"/test/",
                "name":"file1",
                "ext":".md",
                "href":"/test/file1.md"
              },{
                "title":"test-file2",
                "path":"/test/",
                "name":"file2",
                "ext":".md",
                "href":"/test/file2.md"
              },{
                "title":"test-index",
                "path":"/test/",
                "name":"index",
                "ext":".md",
                "href":"/test/index.md"
              }],
              "folder":"test"
            }]
          });
          done();
        }));
    });

    it('create a sorted vartree when options.sortProp and options.sortDesc is set to true', function(done) {
      var root = {};
      gulp.src(__dirname + '/fixtures/**/*.md', {buffer: true})
        .pipe(mdvars())
        .pipe(vartree({
          root: root,
          sortProp: 'name',
          sortDesc: true
        }))
        .pipe(es.wait(function(){
          deepEq(root,{
            "childs":[{
              "childs":[{
                "title":"test-index",
                "path":"/test/",
                "name":"index",
                "ext":".md",
                "href":"/test/index.md"
              },{
                "title":"test-file2",
                "path":"/test/",
                "name":"file2",
                "ext":".md",
                "href":"/test/file2.md"
              },{
                "title":"test-file1",
                "path":"/test/",
                "name":"file1",
                "ext":".md",
                "href":"/test/file1.md"
              }],
              "folder":"test"
            },{
              "title":"index",
              "path":"/",
              "name":"index",
              "ext":".md",
              "href":"/index.md"
            },{
              "title":"file2",
              "path":"/",
              "name":"file2",
              "ext":".md",
              "href":"/file2.md"
            },{
              "title":"file1",
              "path":"/",
              "name":"file1",
              "ext":".md",
              "href":"/file1.md"
            }]
          });
          done();
        }));
    });

  });

  describe('misused', function() {

    it('throw an error when no root is given', function() {
      assert.throws(function() {
        gulp.src(__dirname + '/fixtures/**/*.md', {buffer: true})
          .pipe(mdvars())
          .pipe(vartree());
      });
    });

    it('emit an error when base doesn\'t fit', function(done) {
      var errored = false;
      gulp.src(__dirname + '/fixtures/**/*.md', {buffer: true})
        .pipe(mdvars())
        .pipe(
          vartree({
            root: {},
            base: '/pipoaazd'
          })
          .on('error', function(err) {
            done();
          })
        )
        .pipe(es.wait(function(){}));
    });

  });

});
