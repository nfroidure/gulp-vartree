var gutil = require('gulp-util')
  , Stream = require('stream')
  , Path = require('path')
;

const PLUGIN_NAME = 'gulp-vartree';

function gulpVartree(options) {

  var stream = Stream.Transform({objectMode: true});

  // Giving no root object makes no sense
  if(!(options && options.root instanceof Object)) {
    throw gutil.PluginError('Please provide an Object to put the vartree in.');
  }

  options.childsProp = options.childsProp || 'childs';

  options.varEvent = options.varEvent || 'end';

  options.folderProp = options.folderProp || 'name';

  var root = options.root;

  var files = [], endCallback;

  // Property to look for vars
  options.prop = options.prop || 'metas';

  stream._transform = function(file, unused, cb) {
    if(file.isNull()) return; // Do nothing

    // Determining the file base
    var base = Path.dirname(file.path);
    if(file.base) {
      base = Path.relative(file.base, base);
    }
    if(options.base) {
      if(-1 === base.indexOf(options.base)) {
        this.emit('error', new PluginError(
          'The given base do not fit with the files base ('+ file.path + ')'));
      }
      base = base.substr(options.base.length);
    }

    // Creating the necessary tree
    var folders = base.split(Path.sep);
    var curScope = root;
    var folder;
    var parent;
    while(folders.length) {
      folder = folders.shift();
      if('' === folder) continue;
      // Create the scope if it doesn''t exist
      if(!curScope[options.childsProp]) {
        curScope[options.childsProp] = [];
      }
      if(!curScope[options.childsProp].some(function(scope){
          if(scope[options.folderProp] === folder) {
            // Set current scope to the one found
            curScope = scope;
            return true;
          }
          return false;
        })) {
        parent = curScope;
        curScope = {};
        curScope[options.folderProp] = folder;
        // Add a reference to the parent scope
        if(parent != root && options.parent) {
          curScope[options.parent] = parent;
        }
        // Push the new scope in its parent
        parent[options.childsProp].push(curScope);
      }
    }
    // Populate vars when the event is emitted if dealing with streams
    if(file.isStream()) {
      files.push(file);
      file.contents.on(options.varEvent, function() {
        // Add a reference to the parent scope
        if(curScope != root && options.parent) {
          file[options.prop][options.parent] = curScope;
        }
        // Adding the file properties to the scope
        if(options.index
          && options.index === Path.basename(file.path, Path.extname(file.path))) {
          curScope.index = file[options.prop];
        } else {
          if(!curScope[options.childsProp]) {
            curScope[options.childsProp] = [];
          }
          curScope[options.childsProp].push(file[options.prop]);
        }
        files.splice(files.indexOf(file));
        if(!files.length) {
          if(endCallback) {
            endCallback();
          } else if('end' !== options.varEvent) {
            stream.emit(options.varEvent);
          }
        }
      });
    // Otherwise do it right now !
    } else {
      // Add a reference to the parent scope
      if(curScope != root && options.parent) {
        file[options.prop][options.parent] = curScope;
      }
      // Adding the file properties to the scope
      if(options.index
        && options.index === Path.basename(file.path, Path.extname(file.path))) {
        curScope.index = file[options.prop];
      } else {
        if(!curScope[options.childsProp]) {
          curScope[options.childsProp] = [];
        }
        curScope[options.childsProp].push(file[options.prop]);
      }
    }
    this.push(file);
    cb();
  };

  // Flush only when everything is populated
  stream._flush = function(cb) {
    if('end' !== options.varEvent) {
      stream.emit(options.varEvent); cb();
    } else if(!files.length) {
      cb();
    } else {
      endCallback = cb;
    }
  };

  return stream;

}

module.exports = gulpVartree;
