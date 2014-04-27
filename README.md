# gulp-vartree
> Create a variable tree with the files that are passed in with [Gulp](http://gulpjs.com/).

[![NPM version](https://badge.fury.io/js/gulp-vartree.png)](https://npmjs.org/package/gulp-vartree) [![Build status](https://secure.travis-ci.org/nfroidure/gulp-vartree.png)](https://travis-ci.org/nfroidure/gulp-vartree) [![Dependency Status](https://david-dm.org/nfroidure/gulp-vartree.png)](https://david-dm.org/nfroidure/gulp-vartree) [![devDependency Status](https://david-dm.org/nfroidure/gulp-vartree/dev-status.png)](https://david-dm.org/nfroidure/gulp-vartree#info=devDependencies) [![Coverage Status](https://coveralls.io/repos/nfroidure/gulp-vartree/badge.png?branch=master)](https://coveralls.io/r/nfroidure/gulp-vartree?branch=master)

## Usage

First, install `gulp-vartree` as a development dependency:

```shell
npm install --save-dev gulp-vartree
```

Then, add it to your `gulpfile.js`:

```javascript
var mdvars = require('gulp-mdvars');
var vartree = require('gulp-vartree');
var root = {};

gulp.task('vartree', function() {
  gulp.src(['assets/contents/*.md'])
    .pipe(mdvars({
      prop: 'meta' // will put metadata in the file.meta property
    })
    .pipe(vartree({
      root: root, // the root in which the vartree will be put
      prop: 'metas', // metadata property to collect
      parent: 'parent' // keep a ref to the parent scope in the file.parent property
    }))
    .pipe(marked()) // Do whatever you want with the files later
    .pipe(gulp.dest('www/')).on('end', function() {
      console.log(root);
    });
});
```

The created variable tree looks like this:

```js
{
  "title":"index",
  "childs":[
    {"title":"file1"},
    {"title":"file2"},
    {
      "name": "test",
      "title":"test-index",
      "childs":[
        {"title":"test-file1"},
        {"title":"test-file2"}
      ]
    }
  ]
}
```

for the following directory structure :

* index.md
* file1.md
* file2.md
* test/
  * index.md
  * file1.md
  * file2.md

`gulp-vartree` can be used with
 [gulp-mdvars](https://github.com/nfroidure/gulp-mdvars), or with any Gulp
 plugin that places data in a file property, such as
 [gulp-frontmatter](https://www.npmjs.org/package/gulp-front-matter).

## API

### vartree(options)

#### options.root (required)
Type: `Object`

An object used as the root of the collected tree.

#### options.prop
Type: `String`
Default value: `'metas'`

Indicates which property metadata will be collected from.

#### options.base
Type: `String`

The base directory where you want the tree to begin.

#### options.parentProp
Type: `String`

Indicates the name of the property in which you want to keep a reference to the
 parent scope. This property is not populated per default, because using it will
 make the tree structure circular (and this interferes with e.g. serialization).

#### options.childsProp
Type: `String`
Default value: `'childs'`

Indicates which property children will be pushed to.

#### options.pathProp
Type: `String`
Default value: `'path'`

Indicates which property shall contain the file path.

#### options.nameProp
Type: `String`
Default value: `'name'`

Indicates which property shall contain the file name.

#### options.extProp
Type: `String`
Default value: `'ext'`

Indicates which property shall contain the file extension.

#### options.hrefProp
Type: `String`
Default value: `'href'`

Indicates which property shall contain the file href.

#### options.folderProp
Type: `String`
Default: Value: `'folder'`

This property will be used to indicate nodes that are directories.

#### options.sortProp
Type: `String`
Default value: `undefined`

If sorting is desired, the metadata property to sort the tree by.

#### options.sortDesc
Type: `Boolean`
Default value: `false`

If true, the tree will be sorted in descending order instead of ascending order.

#### options.varEvent
Type: `String`
Default value: `'end'`

For stream mode only. Indicates which event must be listened for to be sure that the
 vars are populated into the files in order to keep them.

## Stats

[![NPM](https://nodei.co/npm/gulp-vartree.png?downloads=true&stars=true)](https://nodei.co/npm/gulp-vartree/)
[![NPM](https://nodei.co/npm-dl/gulp-vartree.png)](https://nodei.co/npm/gulp-vartree/)

