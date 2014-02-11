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
      prop: 'meta' // will put meta datas in the file.meta property
    })
    .pipe(vartree({
      root: root, // the root in wich the vartree will be put
      prop: 'metas', // catch the data property
      parent: 'parent' // keep a ref to the parent scope in the file.parent property
    }))
    .pipe(marked()) // Do whatever you want with the files later
    .pipe(gulp.dest('www/')).on('end', function() {
      console.log(root);
    });
});
```
The created variable tree looks like that:
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
for the following directory tree :

* index.md
* file1.md
* file2.md
* * index.md
* * file1.md
* * file2.md

`gulp-vartree` can be used with
 [gulp-mdvars](https://github.com/nfroidure/gulp-mdvars) but also with any Gulp
 plugin putting any data to any file property.

## API

### vartree(options)

#### options.root (required)
Type: `Object`

An object used as the root of the collected tree.

#### options.prop
Type: `String`
Default value: `'metas'`

Indicating in wich property metadatas must be looked for.

#### options.base
Type: `String`

The base directory you want the tree to begin.

#### options.parentProp
Type: `String`

Indicating the name of the property in wich you want to keep a reference to the
 parent scope. This property is not populated per default.

#### options.childsProp
Type: `String`
Default value: `'childs'`

Indicating in wich property childs must pushed.

#### options.pathProp
Type: `String`
Default value: `'path'`

Indicating in wich property the file path will be set.

#### options.nameProp
Type: `String`
Default value: `'name'`

Indicating in wich property the file name will be set.

#### options.extProp
Type: `String`
Default value: `'ext'`

Indicating in wich property the file extension will be set.

#### options.hrefProp
Type: `String`
Default value: `'href'`

Indicating in wich property the file href will be set.


#### options.varEvent
Type: `String`
Default value: `'end'`

For stream mode only. Indicating wich event must be listen to be sure that the
 vars are populated into the files in order to keep them.
