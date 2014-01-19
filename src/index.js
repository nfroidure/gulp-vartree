var gutil = require('gulp-util')
  , Stream = require('stream')
  , Path = require('path')
;

const PLUGIN_NAME = 'gulp-vartree';

function gulpVartree(options) {

  var root
    , files = []
    , endCallback
    , stream = Stream.Transform({objectMode: true})
  ;

  // Giving no root object makes no sense
  if(!(options && options.root instanceof Object)) {
    throw new gutil.PluginError(PLUGIN_NAME,
      'Please provide an Object to put the vartree in.');
  }

  root = options.root

  options.childsProp = options.childsProp || 'childs';

  options.varEvent = options.varEvent || 'end';

  options.folderProp = options.folderProp || 'folder';
  options.pathProp = options.pathProp || 'path';
  options.nameProp = options.nameProp || 'name';
  options.extProp = options.extProp || 'ext';
  options.hrefProp = options.hrefProp || 'href';

  // Property to look for vars
  options.prop = options.prop || 'metas';

  stream._transform = function(file, unused, cb) {
    // When null just pass through
    if(file.isNull()) {
      stream.push(file); cb();
      return;
    }

    // Determining the file base
    var base = Path.dirname(file.path);
    if(file.base) {
      base = Path.relative(file.base, base);
    }
    if(options.base) {
      if(-1 === base.indexOf(options.base)) {
        this.emit('error', new PluginError(PLUGIN_NAME,
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
        if(options.parentProp) {
          curScope[options.parentProp] = parent;
        }
        // Push the new scope in its parent
        parent[options.childsProp].push(curScope);
      }
    }
    // Vars addition
    function populateVars() {
        var obj = file[options.prop] || {};
        obj[options.nameProp] = Path.basename(file.path, Path.extname(file.path));
        obj[options.pathProp] = Path.relative(file.base,Path.dirname(file.path));
        if(obj[options.pathProp]) {
          obj[options.pathProp] = '/' + obj[options.pathProp] + '/';
        } else {
          obj[options.pathProp] = '/';
        }
        obj[options.extProp] = options.extValue || Path.extname(file.path);
        obj[options.hrefProp] = Path.join(
          obj[options.pathProp],
          obj[options.nameProp] + obj[options.extProp]
        );
        // Add a reference to the parent scope
        if(options.parentProp) {
          file[options.prop][options.parentProp] = curScope;
        }
        // Adding the file properties to the scope
        if(options.index
          && options.index === Path.basename(file.path, Path.extname(file.path))) {
          for(var prop in obj) {
            curScope[prop] = obj[prop]
          }
        } else {
          if(!curScope[options.childsProp]) {
            curScope[options.childsProp] = [];
          }
          curScope[options.childsProp].push(file[options.prop]);
        }
    }
    // Populate vars when the event is emitted if dealing with streams
    if(file.isStream()) {
      files.push(file);
      file.contents.on(options.varEvent, function() {
        populateVars();
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
      populateVars();
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
