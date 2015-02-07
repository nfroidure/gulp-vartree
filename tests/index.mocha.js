var fs = require('fs')
  , gulp = require('gulp')
  , gutil = require('gulp-util')
  , es = require('event-stream')
  , vartree = require('../src/index')
  , mdvars = require('gulp-mdvars')
  , assert = require('assert')
  , neatEqual = require('neatequal')
;

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
          neatEqual(
            recSort(root),
            recSort(JSON.parse(fs.readFileSync(__dirname + '/expected/simple.json', 'utf-8')))
          );
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
          neatEqual(
            recSort(root),
            recSort(JSON.parse(fs.readFileSync(__dirname + '/expected/base.json', 'utf-8')))
          );
          done();
        }));
    });

    it('emit custom event with the varEvent option', function(done) {
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
          neatEqual(
            recSort(root),
            recSort(JSON.parse(fs.readFileSync(__dirname + '/expected/simple.json', 'utf-8')))
          );
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
          neatEqual(
            recSort(root, '__childs'),
            recSort(JSON.parse(fs.readFileSync(__dirname + '/expected/childsprop.json', 'utf-8')), '__childs')
          );
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
          neatEqual(
            recSort(root),
            recSort(JSON.parse(fs.readFileSync(__dirname + '/expected/sortpropssortdescfalse.json', 'utf-8')))
          );
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
        console.log(JSON.stringify(root))
          neatEqual(
            recSort(root),
            recSort(JSON.parse(fs.readFileSync(__dirname + '/expected/sortpropssortdesctrue.json', 'utf-8')))
          );
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
          neatEqual(
            recSort(root),
            recSort(JSON.parse(fs.readFileSync(__dirname + '/expected/indexed.json', 'utf-8')))
          );
          done();
        }))
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
          neatEqual(
            recSort(root),
            recSort(JSON.parse(fs.readFileSync(__dirname + '/expected/buffer-simple.json', 'utf-8')))
          );
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
          neatEqual(
            recSort(root, '__childs'),
            recSort(JSON.parse(fs.readFileSync(__dirname + '/expected/buffer-childsprop.json', 'utf-8')), '__childs')
          );
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
          neatEqual(
            recSort(root),
            recSort(JSON.parse(fs.readFileSync(__dirname + '/expected/buffer-indexed.json', 'utf-8')))
          );
          done();
        }));
    });

    it('create a reference to parent when option.parentProp is set', function(done) {
      var root = {}
        , expected = JSON.parse(fs.readFileSync(__dirname + '/expected/buffer-parentprop.json', 'utf-8'));
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
          neatEqual(root, expected);
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
          neatEqual(
            recSort(root),
            recSort(JSON.parse(fs.readFileSync(__dirname + '/expected/buffer-sortpropssortdescfalse.json', 'utf-8')))
          );
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
          neatEqual(
            recSort(root),
            recSort(JSON.parse(fs.readFileSync(__dirname + '/expected/buffer-sortpropssortdesctrue.json', 'utf-8')))
          );
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
