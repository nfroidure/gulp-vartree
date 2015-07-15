var fs = require('fs');

var gulp = require('gulp');
var gutil = require('gulp-util');
var through = require('through2');

var vartree = require('../src/index');
var mdvars = require('gulp-mdvars');

var assert = require('chai').assert;
var neatEqual = require('neatequal');
var StreamTest = require('streamtest');

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

function consumeStreams(version) {
  return stream = through.obj(function(obj, enc, cb) {
    obj.contents.pipe(StreamTest[version].toText(function(err, text) {
      cb();
    }));
  });
}

describe('gulp-vartree', function() {

  // Iterating through versions
  StreamTest.versions.forEach(function(version) {

    describe('with null contents', function() {

      it('should let null files pass through', function(done) {

        StreamTest[version].fromObjects([
          new gutil.File({
            path: 'bibabelula.md',
            contents: null
          })
        ]).pipe(vartree({
          root: {}
        })).pipe(StreamTest[version].toObjects(function(err, objs) {
          if(err) {
            done(err);
          }
          assert.equal(objs.length, 1);
          assert.equal(objs[0].path, 'bibabelula.md');
          assert.equal(objs[0].contents, null);
          done();

        }));

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
          .pipe(consumeStreams(version))
          .pipe(StreamTest[version].toObjects(function(err, objs) {
            if(err) {
              done(err);
            }
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
          .pipe(consumeStreams(version))
          .pipe(StreamTest[version].toObjects(function(err, objs) {
            if(err) {
              done(err);
            }
            neatEqual(
              recSort(root),
              recSort(JSON.parse(fs.readFileSync(__dirname + '/expected/base.json', 'utf-8')))
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
          .pipe(consumeStreams(version))
          .pipe(StreamTest[version].toObjects(function(err, objs) {
            if(err) {
              done(err);
            }
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
          .pipe(consumeStreams(version))
          .pipe(StreamTest[version].toObjects(function(err, objs) {
            if(err) {
              done(err);
            }
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
          .pipe(consumeStreams(version))
          .pipe(StreamTest[version].toObjects(function(err, objs) {
            if(err) {
              done(err);
            }
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
          .pipe(consumeStreams(version))
          .pipe(StreamTest[version].toObjects(function(err, objs) {
            if(err) {
              done(err);
            }
            neatEqual(
              recSort(root),
              recSort(JSON.parse(fs.readFileSync(__dirname + '/expected/indexed.json', 'utf-8')))
            );
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
          .pipe(consumeStreams(version))
          .pipe(StreamTest[version].toObjects(function(err, objs) {
            if(err) {
              done(err);
            }
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
          .pipe(StreamTest[version].toObjects(function(err, objs) {
            if(err) {
              done(err);
            }
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
          .pipe(StreamTest[version].toObjects(function(err, objs) {
            if(err) {
              done(err);
            }
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
          .pipe(StreamTest[version].toObjects(function(err, objs) {
            if(err) {
              done(err);
            }
            neatEqual(
              recSort(root),
              recSort(JSON.parse(fs.readFileSync(__dirname + '/expected/buffer-indexed.json', 'utf-8')))
            );
            done();
          }));
      });

      it('create a reference to parent when option.parentProp is set', function(done) {
        var root = {};
        var expected = JSON.parse(fs.readFileSync(__dirname + '/expected/buffer-parentprop.json', 'utf-8'));
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
          .pipe(StreamTest[version].toObjects(function(err, objs) {
            if(err) {
              done(err);
            }
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
          .pipe(StreamTest[version].toObjects(function(err, objs) {
            if(err) {
              done(err);
            }
            neatEqual(
              root,
              JSON.parse(fs.readFileSync(__dirname + '/expected/sortpropssortdescfalse.json', 'utf-8'))
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
          .pipe(StreamTest[version].toObjects(function(err, objs) {
            if(err) {
              done(err);
            }
            neatEqual(
              root,
              JSON.parse(fs.readFileSync(__dirname + '/expected/sortpropssortdesctrue.json', 'utf-8'))
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
          );
      });

    });

  });

});
