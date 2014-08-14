// The Module object: Our interface to the outside world. We import
// and export values on it, and do the work to get that through
// closure compiler if necessary. There are various ways Module can be used:
// 1. Not defined. We create it here
// 2. A function parameter, function(Module) { ..generated code.. }
// 3. pre-run appended it, var Module = {}; ..generated code..
// 4. External script tag defines var Module.
// We need to do an eval in order to handle the closure compiler
// case, where this code here is minified but Module was defined
// elsewhere (e.g. case 4 above). We also need to check if Module
// already exists (e.g. case 3 above).
// Note that if you want to run closure, and also to use Module
// after the generated code, you will need to define   var Module = {};
// before the code. Then that object will be used in the code, and you
// can continue to use Module afterwards as well.
var Module;
if (!Module) Module = (typeof Module !== 'undefined' ? Module : null) || {};

// Sometimes an existing Module object exists with properties
// meant to overwrite the default module functionality. Here
// we collect those properties and reapply _after_ we configure
// the current environment's defaults to avoid having to be so
// defensive during initialization.
var moduleOverrides = {};
for (var key in Module) {
  if (Module.hasOwnProperty(key)) {
    moduleOverrides[key] = Module[key];
  }
}

// The environment setup code below is customized to use Module.
// *** Environment setup code ***
var ENVIRONMENT_IS_NODE = typeof process === 'object' && typeof require === 'function';
var ENVIRONMENT_IS_WEB = typeof window === 'object';
var ENVIRONMENT_IS_WORKER = typeof importScripts === 'function';
var ENVIRONMENT_IS_SHELL = !ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_NODE && !ENVIRONMENT_IS_WORKER;

if (ENVIRONMENT_IS_NODE) {
  // Expose functionality in the same simple way that the shells work
  // Note that we pollute the global namespace here, otherwise we break in node
  if (!Module['print']) Module['print'] = function print(x) {
    process['stdout'].write(x + '\n');
  };
  if (!Module['printErr']) Module['printErr'] = function printErr(x) {
    process['stderr'].write(x + '\n');
  };

  var nodeFS = require('fs');
  var nodePath = require('path');

  Module['read'] = function read(filename, binary) {
    filename = nodePath['normalize'](filename);
    var ret = nodeFS['readFileSync'](filename);
    // The path is absolute if the normalized version is the same as the resolved.
    if (!ret && filename != nodePath['resolve'](filename)) {
      filename = path.join(__dirname, '..', 'src', filename);
      ret = nodeFS['readFileSync'](filename);
    }
    if (ret && !binary) ret = ret.toString();
    return ret;
  };

  Module['readBinary'] = function readBinary(filename) { return Module['read'](filename, true) };

  Module['load'] = function load(f) {
    globalEval(read(f));
  };

  Module['thisProgram'] = process['argv'][1];
  Module['arguments'] = process['argv'].slice(2);

  module['exports'] = Module;
}
else if (ENVIRONMENT_IS_SHELL) {
  if (!Module['print']) Module['print'] = print;
  if (typeof printErr != 'undefined') Module['printErr'] = printErr; // not present in v8 or older sm

  if (typeof read != 'undefined') {
    Module['read'] = read;
  } else {
    Module['read'] = function read() { throw 'no read() available (jsc?)' };
  }

  Module['readBinary'] = function readBinary(f) {
    return read(f, 'binary');
  };

  if (typeof scriptArgs != 'undefined') {
    Module['arguments'] = scriptArgs;
  } else if (typeof arguments != 'undefined') {
    Module['arguments'] = arguments;
  }

  this['Module'] = Module;

}
else if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
  Module['read'] = function read(url) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, false);
    xhr.send(null);
    return xhr.responseText;
  };

  if (typeof arguments != 'undefined') {
    Module['arguments'] = arguments;
  }

  if (typeof console !== 'undefined') {
    if (!Module['print']) Module['print'] = function print(x) {
      console.log(x);
    };
    if (!Module['printErr']) Module['printErr'] = function printErr(x) {
      console.log(x);
    };
  } else {
    // Probably a worker, and without console.log. We can do very little here...
    var TRY_USE_DUMP = false;
    if (!Module['print']) Module['print'] = (TRY_USE_DUMP && (typeof(dump) !== "undefined") ? (function(x) {
      dump(x);
    }) : (function(x) {
      // self.postMessage(x); // enable this if you want stdout to be sent as messages
    }));
  }

  if (ENVIRONMENT_IS_WEB) {
    window['Module'] = Module;
  } else {
    Module['load'] = importScripts;
  }
}
else {
  // Unreachable because SHELL is dependant on the others
  throw 'Unknown runtime environment. Where are we?';
}

function globalEval(x) {
  eval.call(null, x);
}
if (!Module['load'] == 'undefined' && Module['read']) {
  Module['load'] = function load(f) {
    globalEval(Module['read'](f));
  };
}
if (!Module['print']) {
  Module['print'] = function(){};
}
if (!Module['printErr']) {
  Module['printErr'] = Module['print'];
}
if (!Module['arguments']) {
  Module['arguments'] = [];
}
// *** Environment setup code ***

// Closure helpers
Module.print = Module['print'];
Module.printErr = Module['printErr'];

// Callbacks
Module['preRun'] = [];
Module['postRun'] = [];

// Merge back in the overrides
for (var key in moduleOverrides) {
  if (moduleOverrides.hasOwnProperty(key)) {
    Module[key] = moduleOverrides[key];
  }
}



// === Auto-generated preamble library stuff ===

//========================================
// Runtime code shared with compiler
//========================================

var Runtime = {
  setTempRet0: function (value) {
    tempRet0 = value;
  },
  getTempRet0: function () {
    return tempRet0;
  },
  stackSave: function () {
    return STACKTOP;
  },
  stackRestore: function (stackTop) {
    STACKTOP = stackTop;
  },
  forceAlign: function (target, quantum) {
    quantum = quantum || 4;
    if (quantum == 1) return target;
    if (isNumber(target) && isNumber(quantum)) {
      return Math.ceil(target/quantum)*quantum;
    } else if (isNumber(quantum) && isPowerOfTwo(quantum)) {
      return '(((' +target + ')+' + (quantum-1) + ')&' + -quantum + ')';
    }
    return 'Math.ceil((' + target + ')/' + quantum + ')*' + quantum;
  },
  isNumberType: function (type) {
    return type in Runtime.INT_TYPES || type in Runtime.FLOAT_TYPES;
  },
  isPointerType: function isPointerType(type) {
  return type[type.length-1] == '*';
},
  isStructType: function isStructType(type) {
  if (isPointerType(type)) return false;
  if (isArrayType(type)) return true;
  if (/<?\{ ?[^}]* ?\}>?/.test(type)) return true; // { i32, i8 } etc. - anonymous struct types
  // See comment in isStructPointerType()
  return type[0] == '%';
},
  INT_TYPES: {"i1":0,"i8":0,"i16":0,"i32":0,"i64":0},
  FLOAT_TYPES: {"float":0,"double":0},
  or64: function (x, y) {
    var l = (x | 0) | (y | 0);
    var h = (Math.round(x / 4294967296) | Math.round(y / 4294967296)) * 4294967296;
    return l + h;
  },
  and64: function (x, y) {
    var l = (x | 0) & (y | 0);
    var h = (Math.round(x / 4294967296) & Math.round(y / 4294967296)) * 4294967296;
    return l + h;
  },
  xor64: function (x, y) {
    var l = (x | 0) ^ (y | 0);
    var h = (Math.round(x / 4294967296) ^ Math.round(y / 4294967296)) * 4294967296;
    return l + h;
  },
  getNativeTypeSize: function (type) {
    switch (type) {
      case 'i1': case 'i8': return 1;
      case 'i16': return 2;
      case 'i32': return 4;
      case 'i64': return 8;
      case 'float': return 4;
      case 'double': return 8;
      default: {
        if (type[type.length-1] === '*') {
          return Runtime.QUANTUM_SIZE; // A pointer
        } else if (type[0] === 'i') {
          var bits = parseInt(type.substr(1));
          assert(bits % 8 === 0);
          return bits/8;
        } else {
          return 0;
        }
      }
    }
  },
  getNativeFieldSize: function (type) {
    return Math.max(Runtime.getNativeTypeSize(type), Runtime.QUANTUM_SIZE);
  },
  dedup: function dedup(items, ident) {
  var seen = {};
  if (ident) {
    return items.filter(function(item) {
      if (seen[item[ident]]) return false;
      seen[item[ident]] = true;
      return true;
    });
  } else {
    return items.filter(function(item) {
      if (seen[item]) return false;
      seen[item] = true;
      return true;
    });
  }
},
  set: function set() {
  var args = typeof arguments[0] === 'object' ? arguments[0] : arguments;
  var ret = {};
  for (var i = 0; i < args.length; i++) {
    ret[args[i]] = 0;
  }
  return ret;
},
  STACK_ALIGN: 8,
  getAlignSize: function (type, size, vararg) {
    // we align i64s and doubles on 64-bit boundaries, unlike x86
    if (!vararg && (type == 'i64' || type == 'double')) return 8;
    if (!type) return Math.min(size, 8); // align structures internally to 64 bits
    return Math.min(size || (type ? Runtime.getNativeFieldSize(type) : 0), Runtime.QUANTUM_SIZE);
  },
  calculateStructAlignment: function calculateStructAlignment(type) {
    type.flatSize = 0;
    type.alignSize = 0;
    var diffs = [];
    var prev = -1;
    var index = 0;
    type.flatIndexes = type.fields.map(function(field) {
      index++;
      var size, alignSize;
      if (Runtime.isNumberType(field) || Runtime.isPointerType(field)) {
        size = Runtime.getNativeTypeSize(field); // pack char; char; in structs, also char[X]s.
        alignSize = Runtime.getAlignSize(field, size);
      } else if (Runtime.isStructType(field)) {
        if (field[1] === '0') {
          // this is [0 x something]. When inside another structure like here, it must be at the end,
          // and it adds no size
          // XXX this happens in java-nbody for example... assert(index === type.fields.length, 'zero-length in the middle!');
          size = 0;
          if (Types.types[field]) {
            alignSize = Runtime.getAlignSize(null, Types.types[field].alignSize);
          } else {
            alignSize = type.alignSize || QUANTUM_SIZE;
          }
        } else {
          size = Types.types[field].flatSize;
          alignSize = Runtime.getAlignSize(null, Types.types[field].alignSize);
        }
      } else if (field[0] == 'b') {
        // bN, large number field, like a [N x i8]
        size = field.substr(1)|0;
        alignSize = 1;
      } else if (field[0] === '<') {
        // vector type
        size = alignSize = Types.types[field].flatSize; // fully aligned
      } else if (field[0] === 'i') {
        // illegal integer field, that could not be legalized because it is an internal structure field
        // it is ok to have such fields, if we just use them as markers of field size and nothing more complex
        size = alignSize = parseInt(field.substr(1))/8;
        assert(size % 1 === 0, 'cannot handle non-byte-size field ' + field);
      } else {
        assert(false, 'invalid type for calculateStructAlignment');
      }
      if (type.packed) alignSize = 1;
      type.alignSize = Math.max(type.alignSize, alignSize);
      var curr = Runtime.alignMemory(type.flatSize, alignSize); // if necessary, place this on aligned memory
      type.flatSize = curr + size;
      if (prev >= 0) {
        diffs.push(curr-prev);
      }
      prev = curr;
      return curr;
    });
    if (type.name_ && type.name_[0] === '[') {
      // arrays have 2 elements, so we get the proper difference. then we scale here. that way we avoid
      // allocating a potentially huge array for [999999 x i8] etc.
      type.flatSize = parseInt(type.name_.substr(1))*type.flatSize/2;
    }
    type.flatSize = Runtime.alignMemory(type.flatSize, type.alignSize);
    if (diffs.length == 0) {
      type.flatFactor = type.flatSize;
    } else if (Runtime.dedup(diffs).length == 1) {
      type.flatFactor = diffs[0];
    }
    type.needsFlattening = (type.flatFactor != 1);
    return type.flatIndexes;
  },
  generateStructInfo: function (struct, typeName, offset) {
    var type, alignment;
    if (typeName) {
      offset = offset || 0;
      type = (typeof Types === 'undefined' ? Runtime.typeInfo : Types.types)[typeName];
      if (!type) return null;
      if (type.fields.length != struct.length) {
        printErr('Number of named fields must match the type for ' + typeName + ': possibly duplicate struct names. Cannot return structInfo');
        return null;
      }
      alignment = type.flatIndexes;
    } else {
      var type = { fields: struct.map(function(item) { return item[0] }) };
      alignment = Runtime.calculateStructAlignment(type);
    }
    var ret = {
      __size__: type.flatSize
    };
    if (typeName) {
      struct.forEach(function(item, i) {
        if (typeof item === 'string') {
          ret[item] = alignment[i] + offset;
        } else {
          // embedded struct
          var key;
          for (var k in item) key = k;
          ret[key] = Runtime.generateStructInfo(item[key], type.fields[i], alignment[i]);
        }
      });
    } else {
      struct.forEach(function(item, i) {
        ret[item[1]] = alignment[i];
      });
    }
    return ret;
  },
  dynCall: function (sig, ptr, args) {
    if (args && args.length) {
      if (!args.splice) args = Array.prototype.slice.call(args);
      args.splice(0, 0, ptr);
      return Module['dynCall_' + sig].apply(null, args);
    } else {
      return Module['dynCall_' + sig].call(null, ptr);
    }
  },
  functionPointers: [],
  addFunction: function (func) {
    for (var i = 0; i < Runtime.functionPointers.length; i++) {
      if (!Runtime.functionPointers[i]) {
        Runtime.functionPointers[i] = func;
        return 2*(1 + i);
      }
    }
    throw 'Finished up all reserved function pointers. Use a higher value for RESERVED_FUNCTION_POINTERS.';
  },
  removeFunction: function (index) {
    Runtime.functionPointers[(index-2)/2] = null;
  },
  getAsmConst: function (code, numArgs) {
    // code is a constant string on the heap, so we can cache these
    if (!Runtime.asmConstCache) Runtime.asmConstCache = {};
    var func = Runtime.asmConstCache[code];
    if (func) return func;
    var args = [];
    for (var i = 0; i < numArgs; i++) {
      args.push(String.fromCharCode(36) + i); // $0, $1 etc
    }
    var source = Pointer_stringify(code);
    if (source[0] === '"') {
      // tolerate EM_ASM("..code..") even though EM_ASM(..code..) is correct
      if (source.indexOf('"', 1) === source.length-1) {
        source = source.substr(1, source.length-2);
      } else {
        // something invalid happened, e.g. EM_ASM("..code($0)..", input)
        abort('invalid EM_ASM input |' + source + '|. Please use EM_ASM(..code..) (no quotes) or EM_ASM({ ..code($0).. }, input) (to input values)');
      }
    }
    try {
      var evalled = eval('(function(' + args.join(',') + '){ ' + source + ' })'); // new Function does not allow upvars in node
    } catch(e) {
      Module.printErr('error in executing inline EM_ASM code: ' + e + ' on: \n\n' + source + '\n\nwith args |' + args + '| (make sure to use the right one out of EM_ASM, EM_ASM_ARGS, etc.)');
      throw e;
    }
    return Runtime.asmConstCache[code] = evalled;
  },
  warnOnce: function (text) {
    if (!Runtime.warnOnce.shown) Runtime.warnOnce.shown = {};
    if (!Runtime.warnOnce.shown[text]) {
      Runtime.warnOnce.shown[text] = 1;
      Module.printErr(text);
    }
  },
  funcWrappers: {},
  getFuncWrapper: function (func, sig) {
    assert(sig);
    if (!Runtime.funcWrappers[func]) {
      Runtime.funcWrappers[func] = function dynCall_wrapper() {
        return Runtime.dynCall(sig, func, arguments);
      };
    }
    return Runtime.funcWrappers[func];
  },
  UTF8Processor: function () {
    var buffer = [];
    var needed = 0;
    this.processCChar = function (code) {
      code = code & 0xFF;

      if (buffer.length == 0) {
        if ((code & 0x80) == 0x00) {        // 0xxxxxxx
          return String.fromCharCode(code);
        }
        buffer.push(code);
        if ((code & 0xE0) == 0xC0) {        // 110xxxxx
          needed = 1;
        } else if ((code & 0xF0) == 0xE0) { // 1110xxxx
          needed = 2;
        } else {                            // 11110xxx
          needed = 3;
        }
        return '';
      }

      if (needed) {
        buffer.push(code);
        needed--;
        if (needed > 0) return '';
      }

      var c1 = buffer[0];
      var c2 = buffer[1];
      var c3 = buffer[2];
      var c4 = buffer[3];
      var ret;
      if (buffer.length == 2) {
        ret = String.fromCharCode(((c1 & 0x1F) << 6)  | (c2 & 0x3F));
      } else if (buffer.length == 3) {
        ret = String.fromCharCode(((c1 & 0x0F) << 12) | ((c2 & 0x3F) << 6)  | (c3 & 0x3F));
      } else {
        // http://mathiasbynens.be/notes/javascript-encoding#surrogate-formulae
        var codePoint = ((c1 & 0x07) << 18) | ((c2 & 0x3F) << 12) |
                        ((c3 & 0x3F) << 6)  | (c4 & 0x3F);
        ret = String.fromCharCode(
          Math.floor((codePoint - 0x10000) / 0x400) + 0xD800,
          (codePoint - 0x10000) % 0x400 + 0xDC00);
      }
      buffer.length = 0;
      return ret;
    }
    this.processJSString = function processJSString(string) {
      /* TODO: use TextEncoder when present,
        var encoder = new TextEncoder();
        encoder['encoding'] = "utf-8";
        var utf8Array = encoder['encode'](aMsg.data);
      */
      string = unescape(encodeURIComponent(string));
      var ret = [];
      for (var i = 0; i < string.length; i++) {
        ret.push(string.charCodeAt(i));
      }
      return ret;
    }
  },
  getCompilerSetting: function (name) {
    throw 'You must build with -s RETAIN_COMPILER_SETTINGS=1 for Runtime.getCompilerSetting or emscripten_get_compiler_setting to work';
  },
  stackAlloc: function (size) { var ret = STACKTOP;STACKTOP = (STACKTOP + size)|0;STACKTOP = (((STACKTOP)+7)&-8); return ret; },
  staticAlloc: function (size) { var ret = STATICTOP;STATICTOP = (STATICTOP + size)|0;STATICTOP = (((STATICTOP)+7)&-8); return ret; },
  dynamicAlloc: function (size) { var ret = DYNAMICTOP;DYNAMICTOP = (DYNAMICTOP + size)|0;DYNAMICTOP = (((DYNAMICTOP)+7)&-8); if (DYNAMICTOP >= TOTAL_MEMORY) enlargeMemory();; return ret; },
  alignMemory: function (size,quantum) { var ret = size = Math.ceil((size)/(quantum ? quantum : 8))*(quantum ? quantum : 8); return ret; },
  makeBigInt: function (low,high,unsigned) { var ret = (unsigned ? ((+((low>>>0)))+((+((high>>>0)))*(+4294967296))) : ((+((low>>>0)))+((+((high|0)))*(+4294967296)))); return ret; },
  GLOBAL_BASE: 8,
  QUANTUM_SIZE: 4,
  __dummy__: 0
}


Module['Runtime'] = Runtime;









//========================================
// Runtime essentials
//========================================

var __THREW__ = 0; // Used in checking for thrown exceptions.

var ABORT = false; // whether we are quitting the application. no code should run after this. set in exit() and abort()
var EXITSTATUS = 0;

var undef = 0;
// tempInt is used for 32-bit signed values or smaller. tempBigInt is used
// for 32-bit unsigned values or more than 32 bits. TODO: audit all uses of tempInt
var tempValue, tempInt, tempBigInt, tempInt2, tempBigInt2, tempPair, tempBigIntI, tempBigIntR, tempBigIntS, tempBigIntP, tempBigIntD, tempDouble, tempFloat;
var tempI64, tempI64b;
var tempRet0, tempRet1, tempRet2, tempRet3, tempRet4, tempRet5, tempRet6, tempRet7, tempRet8, tempRet9;

function assert(condition, text) {
  if (!condition) {
    abort('Assertion failed: ' + text);
  }
}

var globalScope = this;

// Returns the C function with a specified identifier (for C++, you need to do manual name mangling)
function getCFunc(ident) {
  var func = Module['_' + ident]; // closure exported function
  if (!func) {
    try {
      func = eval('_' + ident); // explicit lookup
    } catch(e) {}
  }
  assert(func, 'Cannot call unknown function ' + ident + ' (perhaps LLVM optimizations or closure removed it?)');
  return func;
}

var cwrap, ccall;
(function(){
  var stack = 0;
  var JSfuncs = {
    'stackSave' : function() {
      stack = Runtime.stackSave();
    },
    'stackRestore' : function() {
      Runtime.stackRestore(stack);
    },
    // type conversion from js to c
    'arrayToC' : function(arr) {
      var ret = Runtime.stackAlloc(arr.length);
      writeArrayToMemory(arr, ret);
      return ret;
    },
    'stringToC' : function(str) {
      var ret = 0;
      if (str !== null && str !== undefined && str !== 0) { // null string
        ret = Runtime.stackAlloc(str.length + 1); // +1 for the trailing '\0'
        writeStringToMemory(str, ret);
      }
      return ret;
    }
  };
  // For fast lookup of conversion functions
  var toC = {'string' : JSfuncs['stringToC'], 'array' : JSfuncs['arrayToC']};

  // C calling interface. A convenient way to call C functions (in C files, or
  // defined with extern "C").
  //
  // Note: ccall/cwrap use the C stack for temporary values. If you pass a string
  //       then it is only alive until the call is complete. If the code being
  //       called saves the pointer to be used later, it may point to invalid
  //       data. If you need a string to live forever, you can create it (and
  //       must later delete it manually!) using malloc and writeStringToMemory,
  //       for example.
  //
  // Note: LLVM optimizations can inline and remove functions, after which you will not be
  //       able to call them. Closure can also do so. To avoid that, add your function to
  //       the exports using something like
  //
  //         -s EXPORTED_FUNCTIONS='["_main", "_myfunc"]'
  //
  // @param ident      The name of the C function (note that C++ functions will be name-mangled - use extern "C")
  // @param returnType The return type of the function, one of the JS types 'number', 'string' or 'array' (use 'number' for any C pointer, and
  //                   'array' for JavaScript arrays and typed arrays; note that arrays are 8-bit).
  // @param argTypes   An array of the types of arguments for the function (if there are no arguments, this can be ommitted). Types are as in returnType,
  //                   except that 'array' is not possible (there is no way for us to know the length of the array)
  // @param args       An array of the arguments to the function, as native JS values (as in returnType)
  //                   Note that string arguments will be stored on the stack (the JS string will become a C string on the stack).
  // @return           The return value, as a native JS value (as in returnType)
  ccall = function ccallFunc(ident, returnType, argTypes, args) {
    var func = getCFunc(ident);
    var cArgs = [];
    if (args) {
      for (var i = 0; i < args.length; i++) {
        var converter = toC[argTypes[i]];
        if (converter) {
          if (stack === 0) stack = Runtime.stackSave();
          cArgs[i] = converter(args[i]);
        } else {
          cArgs[i] = args[i];
        }
      }
    }
    var ret = func.apply(null, cArgs);
    if (returnType === 'string') ret = Pointer_stringify(ret);
    if (stack !== 0) JSfuncs['stackRestore']();
    return ret;
  }

  var sourceRegex = /^function\s*\(([^)]*)\)\s*{\s*([^*]*?)[\s;]*(?:return\s*(.*?)[;\s]*)?}$/;
  function parseJSFunc(jsfunc) {
    // Match the body and the return value of a javascript function source
    var parsed = jsfunc.toString().match(sourceRegex).slice(1);
    return {arguments : parsed[0], body : parsed[1], returnValue: parsed[2]}
  }
  var JSsource = {};
  for (var fun in JSfuncs) {
    if (JSfuncs.hasOwnProperty(fun)) {
      // Elements of toCsource are arrays of three items:
      // the code, and the return value
      JSsource[fun] = parseJSFunc(JSfuncs[fun]);
    }
  }
  // Returns a native JS wrapper for a C function. This is similar to ccall, but
  // returns a function you can call repeatedly in a normal way. For example:
  //
  //   var my_function = cwrap('my_c_function', 'number', ['number', 'number']);
  //   alert(my_function(5, 22));
  //   alert(my_function(99, 12));
  //
  cwrap = function cwrap(ident, returnType, argTypes) {
    var cfunc = getCFunc(ident);
    // When the function takes numbers and returns a number, we can just return
    // the original function
    var numericArgs = argTypes.every(function(type){ return type === 'number'});
    var numericRet = (returnType !== 'string');
    if ( numericRet && numericArgs) {
      return cfunc;
    }
    // Creation of the arguments list (["$1","$2",...,"$nargs"])
    var argNames = argTypes.map(function(x,i){return '$'+i});
    var funcstr = "(function(" + argNames.join(',') + ") {";
    var nargs = argTypes.length;
    if (!numericArgs) {
      // Generate the code needed to convert the arguments from javascript
      // values to pointers
      funcstr += JSsource['stackSave'].body + ';';
      for (var i = 0; i < nargs; i++) {
        var arg = argNames[i], type = argTypes[i];
        if (type === 'number') continue;
        var convertCode = JSsource[type + 'ToC']; // [code, return]
        funcstr += 'var ' + convertCode.arguments + ' = ' + arg + ';';
        funcstr += convertCode.body + ';';
        funcstr += arg + '=' + convertCode.returnValue + ';';
      }
    }

    // When the code is compressed, the name of cfunc is not literally 'cfunc' anymore
    var cfuncname = parseJSFunc(function(){return cfunc}).returnValue;
    // Call the function
    funcstr += 'var ret = ' + cfuncname + '(' + argNames.join(',') + ');';
    if (!numericRet) { // Return type can only by 'string' or 'number'
      // Convert the result to a string
      var strgfy = parseJSFunc(function(){return Pointer_stringify}).returnValue;
      funcstr += 'ret = ' + strgfy + '(ret);';
    }
    if (!numericArgs) {
      // If we had a stack, restore it
      funcstr += JSsource['stackRestore'].body + ';';
    }
    funcstr += 'return ret})';
    return eval(funcstr);
  };
})();
Module["cwrap"] = cwrap;
Module["ccall"] = ccall;

// Sets a value in memory in a dynamic way at run-time. Uses the
// type data. This is the same as makeSetValue, except that
// makeSetValue is done at compile-time and generates the needed
// code then, whereas this function picks the right code at
// run-time.
// Note that setValue and getValue only do *aligned* writes and reads!
// Note that ccall uses JS types as for defining types, while setValue and
// getValue need LLVM types ('i8', 'i32') - this is a lower-level operation
function setValue(ptr, value, type, noSafe) {
  type = type || 'i8';
  if (type.charAt(type.length-1) === '*') type = 'i32'; // pointers are 32-bit
    switch(type) {
      case 'i1': HEAP8[((ptr)>>0)]=value; break;
      case 'i8': HEAP8[((ptr)>>0)]=value; break;
      case 'i16': HEAP16[((ptr)>>1)]=value; break;
      case 'i32': HEAP32[((ptr)>>2)]=value; break;
      case 'i64': (tempI64 = [value>>>0,(tempDouble=value,(+(Math_abs(tempDouble))) >= (+1) ? (tempDouble > (+0) ? ((Math_min((+(Math_floor((tempDouble)/(+4294967296)))), (+4294967295)))|0)>>>0 : (~~((+(Math_ceil((tempDouble - +(((~~(tempDouble)))>>>0))/(+4294967296))))))>>>0) : 0)],HEAP32[((ptr)>>2)]=tempI64[0],HEAP32[(((ptr)+(4))>>2)]=tempI64[1]); break;
      case 'float': HEAPF32[((ptr)>>2)]=value; break;
      case 'double': HEAPF64[((ptr)>>3)]=value; break;
      default: abort('invalid type for setValue: ' + type);
    }
}
Module['setValue'] = setValue;

// Parallel to setValue.
function getValue(ptr, type, noSafe) {
  type = type || 'i8';
  if (type.charAt(type.length-1) === '*') type = 'i32'; // pointers are 32-bit
    switch(type) {
      case 'i1': return HEAP8[((ptr)>>0)];
      case 'i8': return HEAP8[((ptr)>>0)];
      case 'i16': return HEAP16[((ptr)>>1)];
      case 'i32': return HEAP32[((ptr)>>2)];
      case 'i64': return HEAP32[((ptr)>>2)];
      case 'float': return HEAPF32[((ptr)>>2)];
      case 'double': return HEAPF64[((ptr)>>3)];
      default: abort('invalid type for setValue: ' + type);
    }
  return null;
}
Module['getValue'] = getValue;

var ALLOC_NORMAL = 0; // Tries to use _malloc()
var ALLOC_STACK = 1; // Lives for the duration of the current function call
var ALLOC_STATIC = 2; // Cannot be freed
var ALLOC_DYNAMIC = 3; // Cannot be freed except through sbrk
var ALLOC_NONE = 4; // Do not allocate
Module['ALLOC_NORMAL'] = ALLOC_NORMAL;
Module['ALLOC_STACK'] = ALLOC_STACK;
Module['ALLOC_STATIC'] = ALLOC_STATIC;
Module['ALLOC_DYNAMIC'] = ALLOC_DYNAMIC;
Module['ALLOC_NONE'] = ALLOC_NONE;

// allocate(): This is for internal use. You can use it yourself as well, but the interface
//             is a little tricky (see docs right below). The reason is that it is optimized
//             for multiple syntaxes to save space in generated code. So you should
//             normally not use allocate(), and instead allocate memory using _malloc(),
//             initialize it with setValue(), and so forth.
// @slab: An array of data, or a number. If a number, then the size of the block to allocate,
//        in *bytes* (note that this is sometimes confusing: the next parameter does not
//        affect this!)
// @types: Either an array of types, one for each byte (or 0 if no type at that position),
//         or a single type which is used for the entire block. This only matters if there
//         is initial data - if @slab is a number, then this does not matter at all and is
//         ignored.
// @allocator: How to allocate memory, see ALLOC_*
function allocate(slab, types, allocator, ptr) {
  var zeroinit, size;
  if (typeof slab === 'number') {
    zeroinit = true;
    size = slab;
  } else {
    zeroinit = false;
    size = slab.length;
  }

  var singleType = typeof types === 'string' ? types : null;

  var ret;
  if (allocator == ALLOC_NONE) {
    ret = ptr;
  } else {
    ret = [_malloc, Runtime.stackAlloc, Runtime.staticAlloc, Runtime.dynamicAlloc][allocator === undefined ? ALLOC_STATIC : allocator](Math.max(size, singleType ? 1 : types.length));
  }

  if (zeroinit) {
    var ptr = ret, stop;
    assert((ret & 3) == 0);
    stop = ret + (size & ~3);
    for (; ptr < stop; ptr += 4) {
      HEAP32[((ptr)>>2)]=0;
    }
    stop = ret + size;
    while (ptr < stop) {
      HEAP8[((ptr++)>>0)]=0;
    }
    return ret;
  }

  if (singleType === 'i8') {
    if (slab.subarray || slab.slice) {
      HEAPU8.set(slab, ret);
    } else {
      HEAPU8.set(new Uint8Array(slab), ret);
    }
    return ret;
  }

  var i = 0, type, typeSize, previousType;
  while (i < size) {
    var curr = slab[i];

    if (typeof curr === 'function') {
      curr = Runtime.getFunctionIndex(curr);
    }

    type = singleType || types[i];
    if (type === 0) {
      i++;
      continue;
    }

    if (type == 'i64') type = 'i32'; // special case: we have one i32 here, and one i32 later

    setValue(ret+i, curr, type);

    // no need to look up size unless type changes, so cache it
    if (previousType !== type) {
      typeSize = Runtime.getNativeTypeSize(type);
      previousType = type;
    }
    i += typeSize;
  }

  return ret;
}
Module['allocate'] = allocate;

function Pointer_stringify(ptr, /* optional */ length) {
  // TODO: use TextDecoder
  // Find the length, and check for UTF while doing so
  var hasUtf = false;
  var t;
  var i = 0;
  while (1) {
    t = HEAPU8[(((ptr)+(i))>>0)];
    if (t >= 128) hasUtf = true;
    else if (t == 0 && !length) break;
    i++;
    if (length && i == length) break;
  }
  if (!length) length = i;

  var ret = '';

  if (!hasUtf) {
    var MAX_CHUNK = 1024; // split up into chunks, because .apply on a huge string can overflow the stack
    var curr;
    while (length > 0) {
      curr = String.fromCharCode.apply(String, HEAPU8.subarray(ptr, ptr + Math.min(length, MAX_CHUNK)));
      ret = ret ? ret + curr : curr;
      ptr += MAX_CHUNK;
      length -= MAX_CHUNK;
    }
    return ret;
  }

  var utf8 = new Runtime.UTF8Processor();
  for (i = 0; i < length; i++) {
    t = HEAPU8[(((ptr)+(i))>>0)];
    ret += utf8.processCChar(t);
  }
  return ret;
}
Module['Pointer_stringify'] = Pointer_stringify;

// Given a pointer 'ptr' to a null-terminated UTF16LE-encoded string in the emscripten HEAP, returns
// a copy of that string as a Javascript String object.
function UTF16ToString(ptr) {
  var i = 0;

  var str = '';
  while (1) {
    var codeUnit = HEAP16[(((ptr)+(i*2))>>1)];
    if (codeUnit == 0)
      return str;
    ++i;
    // fromCharCode constructs a character from a UTF-16 code unit, so we can pass the UTF16 string right through.
    str += String.fromCharCode(codeUnit);
  }
}
Module['UTF16ToString'] = UTF16ToString;

// Copies the given Javascript String object 'str' to the emscripten HEAP at address 'outPtr',
// null-terminated and encoded in UTF16LE form. The copy will require at most (str.length*2+1)*2 bytes of space in the HEAP.
function stringToUTF16(str, outPtr) {
  for(var i = 0; i < str.length; ++i) {
    // charCodeAt returns a UTF-16 encoded code unit, so it can be directly written to the HEAP.
    var codeUnit = str.charCodeAt(i); // possibly a lead surrogate
    HEAP16[(((outPtr)+(i*2))>>1)]=codeUnit;
  }
  // Null-terminate the pointer to the HEAP.
  HEAP16[(((outPtr)+(str.length*2))>>1)]=0;
}
Module['stringToUTF16'] = stringToUTF16;

// Given a pointer 'ptr' to a null-terminated UTF32LE-encoded string in the emscripten HEAP, returns
// a copy of that string as a Javascript String object.
function UTF32ToString(ptr) {
  var i = 0;

  var str = '';
  while (1) {
    var utf32 = HEAP32[(((ptr)+(i*4))>>2)];
    if (utf32 == 0)
      return str;
    ++i;
    // Gotcha: fromCharCode constructs a character from a UTF-16 encoded code (pair), not from a Unicode code point! So encode the code point to UTF-16 for constructing.
    if (utf32 >= 0x10000) {
      var ch = utf32 - 0x10000;
      str += String.fromCharCode(0xD800 | (ch >> 10), 0xDC00 | (ch & 0x3FF));
    } else {
      str += String.fromCharCode(utf32);
    }
  }
}
Module['UTF32ToString'] = UTF32ToString;

// Copies the given Javascript String object 'str' to the emscripten HEAP at address 'outPtr',
// null-terminated and encoded in UTF32LE form. The copy will require at most (str.length+1)*4 bytes of space in the HEAP,
// but can use less, since str.length does not return the number of characters in the string, but the number of UTF-16 code units in the string.
function stringToUTF32(str, outPtr) {
  var iChar = 0;
  for(var iCodeUnit = 0; iCodeUnit < str.length; ++iCodeUnit) {
    // Gotcha: charCodeAt returns a 16-bit word that is a UTF-16 encoded code unit, not a Unicode code point of the character! We must decode the string to UTF-32 to the heap.
    var codeUnit = str.charCodeAt(iCodeUnit); // possibly a lead surrogate
    if (codeUnit >= 0xD800 && codeUnit <= 0xDFFF) {
      var trailSurrogate = str.charCodeAt(++iCodeUnit);
      codeUnit = 0x10000 + ((codeUnit & 0x3FF) << 10) | (trailSurrogate & 0x3FF);
    }
    HEAP32[(((outPtr)+(iChar*4))>>2)]=codeUnit;
    ++iChar;
  }
  // Null-terminate the pointer to the HEAP.
  HEAP32[(((outPtr)+(iChar*4))>>2)]=0;
}
Module['stringToUTF32'] = stringToUTF32;

function demangle(func) {
  var i = 3;
  // params, etc.
  var basicTypes = {
    'v': 'void',
    'b': 'bool',
    'c': 'char',
    's': 'short',
    'i': 'int',
    'l': 'long',
    'f': 'float',
    'd': 'double',
    'w': 'wchar_t',
    'a': 'signed char',
    'h': 'unsigned char',
    't': 'unsigned short',
    'j': 'unsigned int',
    'm': 'unsigned long',
    'x': 'long long',
    'y': 'unsigned long long',
    'z': '...'
  };
  var subs = [];
  var first = true;
  function dump(x) {
    //return;
    if (x) Module.print(x);
    Module.print(func);
    var pre = '';
    for (var a = 0; a < i; a++) pre += ' ';
    Module.print (pre + '^');
  }
  function parseNested() {
    i++;
    if (func[i] === 'K') i++; // ignore const
    var parts = [];
    while (func[i] !== 'E') {
      if (func[i] === 'S') { // substitution
        i++;
        var next = func.indexOf('_', i);
        var num = func.substring(i, next) || 0;
        parts.push(subs[num] || '?');
        i = next+1;
        continue;
      }
      if (func[i] === 'C') { // constructor
        parts.push(parts[parts.length-1]);
        i += 2;
        continue;
      }
      var size = parseInt(func.substr(i));
      var pre = size.toString().length;
      if (!size || !pre) { i--; break; } // counter i++ below us
      var curr = func.substr(i + pre, size);
      parts.push(curr);
      subs.push(curr);
      i += pre + size;
    }
    i++; // skip E
    return parts;
  }
  function parse(rawList, limit, allowVoid) { // main parser
    limit = limit || Infinity;
    var ret = '', list = [];
    function flushList() {
      return '(' + list.join(', ') + ')';
    }
    var name;
    if (func[i] === 'N') {
      // namespaced N-E
      name = parseNested().join('::');
      limit--;
      if (limit === 0) return rawList ? [name] : name;
    } else {
      // not namespaced
      if (func[i] === 'K' || (first && func[i] === 'L')) i++; // ignore const and first 'L'
      var size = parseInt(func.substr(i));
      if (size) {
        var pre = size.toString().length;
        name = func.substr(i + pre, size);
        i += pre + size;
      }
    }
    first = false;
    if (func[i] === 'I') {
      i++;
      var iList = parse(true);
      var iRet = parse(true, 1, true);
      ret += iRet[0] + ' ' + name + '<' + iList.join(', ') + '>';
    } else {
      ret = name;
    }
    paramLoop: while (i < func.length && limit-- > 0) {
      //dump('paramLoop');
      var c = func[i++];
      if (c in basicTypes) {
        list.push(basicTypes[c]);
      } else {
        switch (c) {
          case 'P': list.push(parse(true, 1, true)[0] + '*'); break; // pointer
          case 'R': list.push(parse(true, 1, true)[0] + '&'); break; // reference
          case 'L': { // literal
            i++; // skip basic type
            var end = func.indexOf('E', i);
            var size = end - i;
            list.push(func.substr(i, size));
            i += size + 2; // size + 'EE'
            break;
          }
          case 'A': { // array
            var size = parseInt(func.substr(i));
            i += size.toString().length;
            if (func[i] !== '_') throw '?';
            i++; // skip _
            list.push(parse(true, 1, true)[0] + ' [' + size + ']');
            break;
          }
          case 'E': break paramLoop;
          default: ret += '?' + c; break paramLoop;
        }
      }
    }
    if (!allowVoid && list.length === 1 && list[0] === 'void') list = []; // avoid (void)
    if (rawList) {
      if (ret) {
        list.push(ret + '?');
      }
      return list;
    } else {
      return ret + flushList();
    }
  }
  try {
    // Special-case the entry point, since its name differs from other name mangling.
    if (func == 'Object._main' || func == '_main') {
      return 'main()';
    }
    if (typeof func === 'number') func = Pointer_stringify(func);
    if (func[0] !== '_') return func;
    if (func[1] !== '_') return func; // C function
    if (func[2] !== 'Z') return func;
    switch (func[3]) {
      case 'n': return 'operator new()';
      case 'd': return 'operator delete()';
    }
    return parse();
  } catch(e) {
    return func;
  }
}

function demangleAll(text) {
  return text.replace(/__Z[\w\d_]+/g, function(x) { var y = demangle(x); return x === y ? x : (x + ' [' + y + ']') });
}

function stackTrace() {
  var stack = new Error().stack;
  return stack ? demangleAll(stack) : '(no stack trace available)'; // Stack trace is not available at least on IE10 and Safari 6.
}

// Memory management

var PAGE_SIZE = 4096;
function alignMemoryPage(x) {
  return (x+4095)&-4096;
}

var HEAP;
var HEAP8, HEAPU8, HEAP16, HEAPU16, HEAP32, HEAPU32, HEAPF32, HEAPF64;

var STATIC_BASE = 0, STATICTOP = 0, staticSealed = false; // static area
var STACK_BASE = 0, STACKTOP = 0, STACK_MAX = 0; // stack area
var DYNAMIC_BASE = 0, DYNAMICTOP = 0; // dynamic area handled by sbrk

function enlargeMemory() {
  abort('Cannot enlarge memory arrays. Either (1) compile with -s TOTAL_MEMORY=X with X higher than the current value ' + TOTAL_MEMORY + ', (2) compile with ALLOW_MEMORY_GROWTH which adjusts the size at runtime but prevents some optimizations, or (3) set Module.TOTAL_MEMORY before the program runs.');
}

var TOTAL_STACK = Module['TOTAL_STACK'] || 5242880;
var TOTAL_MEMORY = Module['TOTAL_MEMORY'] || 16777216;
var FAST_MEMORY = Module['FAST_MEMORY'] || 2097152;

var totalMemory = 4096;
while (totalMemory < TOTAL_MEMORY || totalMemory < 2*TOTAL_STACK) {
  if (totalMemory < 16*1024*1024) {
    totalMemory *= 2;
  } else {
    totalMemory += 16*1024*1024
  }
}
if (totalMemory !== TOTAL_MEMORY) {
  Module.printErr('increasing TOTAL_MEMORY to ' + totalMemory + ' to be more reasonable');
  TOTAL_MEMORY = totalMemory;
}

// Initialize the runtime's memory
// check for full engine support (use string 'subarray' to avoid closure compiler confusion)
assert(typeof Int32Array !== 'undefined' && typeof Float64Array !== 'undefined' && !!(new Int32Array(1)['subarray']) && !!(new Int32Array(1)['set']),
       'JS engine does not provide full typed array support');

var buffer = new ArrayBuffer(TOTAL_MEMORY);
HEAP8 = new Int8Array(buffer);
HEAP16 = new Int16Array(buffer);
HEAP32 = new Int32Array(buffer);
HEAPU8 = new Uint8Array(buffer);
HEAPU16 = new Uint16Array(buffer);
HEAPU32 = new Uint32Array(buffer);
HEAPF32 = new Float32Array(buffer);
HEAPF64 = new Float64Array(buffer);

// Endianness check (note: assumes compiler arch was little-endian)
HEAP32[0] = 255;
assert(HEAPU8[0] === 255 && HEAPU8[3] === 0, 'Typed arrays 2 must be run on a little-endian system');

Module['HEAP'] = HEAP;
Module['HEAP8'] = HEAP8;
Module['HEAP16'] = HEAP16;
Module['HEAP32'] = HEAP32;
Module['HEAPU8'] = HEAPU8;
Module['HEAPU16'] = HEAPU16;
Module['HEAPU32'] = HEAPU32;
Module['HEAPF32'] = HEAPF32;
Module['HEAPF64'] = HEAPF64;

function callRuntimeCallbacks(callbacks) {
  while(callbacks.length > 0) {
    var callback = callbacks.shift();
    if (typeof callback == 'function') {
      callback();
      continue;
    }
    var func = callback.func;
    if (typeof func === 'number') {
      if (callback.arg === undefined) {
        Runtime.dynCall('v', func);
      } else {
        Runtime.dynCall('vi', func, [callback.arg]);
      }
    } else {
      func(callback.arg === undefined ? null : callback.arg);
    }
  }
}

var __ATPRERUN__  = []; // functions called before the runtime is initialized
var __ATINIT__    = []; // functions called during startup
var __ATMAIN__    = []; // functions called when main() is to be run
var __ATEXIT__    = []; // functions called during shutdown
var __ATPOSTRUN__ = []; // functions called after the runtime has exited

var runtimeInitialized = false;

function preRun() {
  // compatibility - merge in anything from Module['preRun'] at this time
  if (Module['preRun']) {
    if (typeof Module['preRun'] == 'function') Module['preRun'] = [Module['preRun']];
    while (Module['preRun'].length) {
      addOnPreRun(Module['preRun'].shift());
    }
  }
  callRuntimeCallbacks(__ATPRERUN__);
}

function ensureInitRuntime() {
  if (runtimeInitialized) return;
  runtimeInitialized = true;
  callRuntimeCallbacks(__ATINIT__);
}

function preMain() {
  callRuntimeCallbacks(__ATMAIN__);
}

function exitRuntime() {
  callRuntimeCallbacks(__ATEXIT__);
  runtimeInitialized = false;
}

function postRun() {
  // compatibility - merge in anything from Module['postRun'] at this time
  if (Module['postRun']) {
    if (typeof Module['postRun'] == 'function') Module['postRun'] = [Module['postRun']];
    while (Module['postRun'].length) {
      addOnPostRun(Module['postRun'].shift());
    }
  }
  callRuntimeCallbacks(__ATPOSTRUN__);
}

function addOnPreRun(cb) {
  __ATPRERUN__.unshift(cb);
}
Module['addOnPreRun'] = Module.addOnPreRun = addOnPreRun;

function addOnInit(cb) {
  __ATINIT__.unshift(cb);
}
Module['addOnInit'] = Module.addOnInit = addOnInit;

function addOnPreMain(cb) {
  __ATMAIN__.unshift(cb);
}
Module['addOnPreMain'] = Module.addOnPreMain = addOnPreMain;

function addOnExit(cb) {
  __ATEXIT__.unshift(cb);
}
Module['addOnExit'] = Module.addOnExit = addOnExit;

function addOnPostRun(cb) {
  __ATPOSTRUN__.unshift(cb);
}
Module['addOnPostRun'] = Module.addOnPostRun = addOnPostRun;

// Tools

// This processes a JS string into a C-line array of numbers, 0-terminated.
// For LLVM-originating strings, see parser.js:parseLLVMString function
function intArrayFromString(stringy, dontAddNull, length /* optional */) {
  var ret = (new Runtime.UTF8Processor()).processJSString(stringy);
  if (length) {
    ret.length = length;
  }
  if (!dontAddNull) {
    ret.push(0);
  }
  return ret;
}
Module['intArrayFromString'] = intArrayFromString;

function intArrayToString(array) {
  var ret = [];
  for (var i = 0; i < array.length; i++) {
    var chr = array[i];
    if (chr > 0xFF) {
      chr &= 0xFF;
    }
    ret.push(String.fromCharCode(chr));
  }
  return ret.join('');
}
Module['intArrayToString'] = intArrayToString;

// Write a Javascript array to somewhere in the heap
function writeStringToMemory(string, buffer, dontAddNull) {
  var array = intArrayFromString(string, dontAddNull);
  var i = 0;
  while (i < array.length) {
    var chr = array[i];
    HEAP8[(((buffer)+(i))>>0)]=chr;
    i = i + 1;
  }
}
Module['writeStringToMemory'] = writeStringToMemory;

function writeArrayToMemory(array, buffer) {
  for (var i = 0; i < array.length; i++) {
    HEAP8[(((buffer)+(i))>>0)]=array[i];
  }
}
Module['writeArrayToMemory'] = writeArrayToMemory;

function writeAsciiToMemory(str, buffer, dontAddNull) {
  for (var i = 0; i < str.length; i++) {
    HEAP8[(((buffer)+(i))>>0)]=str.charCodeAt(i);
  }
  if (!dontAddNull) HEAP8[(((buffer)+(str.length))>>0)]=0;
}
Module['writeAsciiToMemory'] = writeAsciiToMemory;

function unSign(value, bits, ignore) {
  if (value >= 0) {
    return value;
  }
  return bits <= 32 ? 2*Math.abs(1 << (bits-1)) + value // Need some trickery, since if bits == 32, we are right at the limit of the bits JS uses in bitshifts
                    : Math.pow(2, bits)         + value;
}
function reSign(value, bits, ignore) {
  if (value <= 0) {
    return value;
  }
  var half = bits <= 32 ? Math.abs(1 << (bits-1)) // abs is needed if bits == 32
                        : Math.pow(2, bits-1);
  if (value >= half && (bits <= 32 || value > half)) { // for huge values, we can hit the precision limit and always get true here. so don't do that
                                                       // but, in general there is no perfect solution here. With 64-bit ints, we get rounding and errors
                                                       // TODO: In i64 mode 1, resign the two parts separately and safely
    value = -2*half + value; // Cannot bitshift half, as it may be at the limit of the bits JS uses in bitshifts
  }
  return value;
}

// check for imul support, and also for correctness ( https://bugs.webkit.org/show_bug.cgi?id=126345 )
if (!Math['imul'] || Math['imul'](0xffffffff, 5) !== -5) Math['imul'] = function imul(a, b) {
  var ah  = a >>> 16;
  var al = a & 0xffff;
  var bh  = b >>> 16;
  var bl = b & 0xffff;
  return (al*bl + ((ah*bl + al*bh) << 16))|0;
};
Math.imul = Math['imul'];


var Math_abs = Math.abs;
var Math_cos = Math.cos;
var Math_sin = Math.sin;
var Math_tan = Math.tan;
var Math_acos = Math.acos;
var Math_asin = Math.asin;
var Math_atan = Math.atan;
var Math_atan2 = Math.atan2;
var Math_exp = Math.exp;
var Math_log = Math.log;
var Math_sqrt = Math.sqrt;
var Math_ceil = Math.ceil;
var Math_floor = Math.floor;
var Math_pow = Math.pow;
var Math_imul = Math.imul;
var Math_fround = Math.fround;
var Math_min = Math.min;

// A counter of dependencies for calling run(). If we need to
// do asynchronous work before running, increment this and
// decrement it. Incrementing must happen in a place like
// PRE_RUN_ADDITIONS (used by emcc to add file preloading).
// Note that you can add dependencies in preRun, even though
// it happens right before run - run will be postponed until
// the dependencies are met.
var runDependencies = 0;
var runDependencyWatcher = null;
var dependenciesFulfilled = null; // overridden to take different actions when all run dependencies are fulfilled

function addRunDependency(id) {
  runDependencies++;
  if (Module['monitorRunDependencies']) {
    Module['monitorRunDependencies'](runDependencies);
  }
}
Module['addRunDependency'] = addRunDependency;
function removeRunDependency(id) {
  runDependencies--;
  if (Module['monitorRunDependencies']) {
    Module['monitorRunDependencies'](runDependencies);
  }
  if (runDependencies == 0) {
    if (runDependencyWatcher !== null) {
      clearInterval(runDependencyWatcher);
      runDependencyWatcher = null;
    }
    if (dependenciesFulfilled) {
      var callback = dependenciesFulfilled;
      dependenciesFulfilled = null;
      callback(); // can add another dependenciesFulfilled
    }
  }
}
Module['removeRunDependency'] = removeRunDependency;

Module["preloadedImages"] = {}; // maps url to image data
Module["preloadedAudios"] = {}; // maps url to audio data


var memoryInitializer = null;

// === Body ===





STATIC_BASE = 8;

STATICTOP = STATIC_BASE + Runtime.alignMemory(587);
  /* global initializers */ __ATINIT__.push();
  

/* memory initializer */ allocate([97,118,101,114,97,103,101,32,114,101,115,117,108,116,58,32,37,102,32,37,102,10,0,0,115,105,109,100,65,118,101,114,97,103,101,32,114,101,115,117,108,116,58,32,37,102,32,37,102,10,0,0,0,0,0,0,115,112,101,101,100,32,117,112,58,32,37,102,10,0,0,0,105,110,105,116,32,100,111,110,101,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], "i8", ALLOC_NONE, Runtime.GLOBAL_BASE);




var tempDoublePtr = Runtime.alignMemory(allocate(12, "i8", ALLOC_STATIC), 8);

assert(tempDoublePtr % 8 == 0);

function copyTempFloat(ptr) { // functions, because inlining this code increases code size too much

  HEAP8[tempDoublePtr] = HEAP8[ptr];

  HEAP8[tempDoublePtr+1] = HEAP8[ptr+1];

  HEAP8[tempDoublePtr+2] = HEAP8[ptr+2];

  HEAP8[tempDoublePtr+3] = HEAP8[ptr+3];

}

function copyTempDouble(ptr) {

  HEAP8[tempDoublePtr] = HEAP8[ptr];

  HEAP8[tempDoublePtr+1] = HEAP8[ptr+1];

  HEAP8[tempDoublePtr+2] = HEAP8[ptr+2];

  HEAP8[tempDoublePtr+3] = HEAP8[ptr+3];

  HEAP8[tempDoublePtr+4] = HEAP8[ptr+4];

  HEAP8[tempDoublePtr+5] = HEAP8[ptr+5];

  HEAP8[tempDoublePtr+6] = HEAP8[ptr+6];

  HEAP8[tempDoublePtr+7] = HEAP8[ptr+7];

}


  
  
  
  
  var ERRNO_CODES={EPERM:1,ENOENT:2,ESRCH:3,EINTR:4,EIO:5,ENXIO:6,E2BIG:7,ENOEXEC:8,EBADF:9,ECHILD:10,EAGAIN:11,EWOULDBLOCK:11,ENOMEM:12,EACCES:13,EFAULT:14,ENOTBLK:15,EBUSY:16,EEXIST:17,EXDEV:18,ENODEV:19,ENOTDIR:20,EISDIR:21,EINVAL:22,ENFILE:23,EMFILE:24,ENOTTY:25,ETXTBSY:26,EFBIG:27,ENOSPC:28,ESPIPE:29,EROFS:30,EMLINK:31,EPIPE:32,EDOM:33,ERANGE:34,ENOMSG:42,EIDRM:43,ECHRNG:44,EL2NSYNC:45,EL3HLT:46,EL3RST:47,ELNRNG:48,EUNATCH:49,ENOCSI:50,EL2HLT:51,EDEADLK:35,ENOLCK:37,EBADE:52,EBADR:53,EXFULL:54,ENOANO:55,EBADRQC:56,EBADSLT:57,EDEADLOCK:35,EBFONT:59,ENOSTR:60,ENODATA:61,ETIME:62,ENOSR:63,ENONET:64,ENOPKG:65,EREMOTE:66,ENOLINK:67,EADV:68,ESRMNT:69,ECOMM:70,EPROTO:71,EMULTIHOP:72,EDOTDOT:73,EBADMSG:74,ENOTUNIQ:76,EBADFD:77,EREMCHG:78,ELIBACC:79,ELIBBAD:80,ELIBSCN:81,ELIBMAX:82,ELIBEXEC:83,ENOSYS:38,ENOTEMPTY:39,ENAMETOOLONG:36,ELOOP:40,EOPNOTSUPP:95,EPFNOSUPPORT:96,ECONNRESET:104,ENOBUFS:105,EAFNOSUPPORT:97,EPROTOTYPE:91,ENOTSOCK:88,ENOPROTOOPT:92,ESHUTDOWN:108,ECONNREFUSED:111,EADDRINUSE:98,ECONNABORTED:103,ENETUNREACH:101,ENETDOWN:100,ETIMEDOUT:110,EHOSTDOWN:112,EHOSTUNREACH:113,EINPROGRESS:115,EALREADY:114,EDESTADDRREQ:89,EMSGSIZE:90,EPROTONOSUPPORT:93,ESOCKTNOSUPPORT:94,EADDRNOTAVAIL:99,ENETRESET:102,EISCONN:106,ENOTCONN:107,ETOOMANYREFS:109,EUSERS:87,EDQUOT:122,ESTALE:116,ENOTSUP:95,ENOMEDIUM:123,EILSEQ:84,EOVERFLOW:75,ECANCELED:125,ENOTRECOVERABLE:131,EOWNERDEAD:130,ESTRPIPE:86};
  
  var ERRNO_MESSAGES={0:"Success",1:"Not super-user",2:"No such file or directory",3:"No such process",4:"Interrupted system call",5:"I/O error",6:"No such device or address",7:"Arg list too long",8:"Exec format error",9:"Bad file number",10:"No children",11:"No more processes",12:"Not enough core",13:"Permission denied",14:"Bad address",15:"Block device required",16:"Mount device busy",17:"File exists",18:"Cross-device link",19:"No such device",20:"Not a directory",21:"Is a directory",22:"Invalid argument",23:"Too many open files in system",24:"Too many open files",25:"Not a typewriter",26:"Text file busy",27:"File too large",28:"No space left on device",29:"Illegal seek",30:"Read only file system",31:"Too many links",32:"Broken pipe",33:"Math arg out of domain of func",34:"Math result not representable",35:"File locking deadlock error",36:"File or path name too long",37:"No record locks available",38:"Function not implemented",39:"Directory not empty",40:"Too many symbolic links",42:"No message of desired type",43:"Identifier removed",44:"Channel number out of range",45:"Level 2 not synchronized",46:"Level 3 halted",47:"Level 3 reset",48:"Link number out of range",49:"Protocol driver not attached",50:"No CSI structure available",51:"Level 2 halted",52:"Invalid exchange",53:"Invalid request descriptor",54:"Exchange full",55:"No anode",56:"Invalid request code",57:"Invalid slot",59:"Bad font file fmt",60:"Device not a stream",61:"No data (for no delay io)",62:"Timer expired",63:"Out of streams resources",64:"Machine is not on the network",65:"Package not installed",66:"The object is remote",67:"The link has been severed",68:"Advertise error",69:"Srmount error",70:"Communication error on send",71:"Protocol error",72:"Multihop attempted",73:"Cross mount point (not really error)",74:"Trying to read unreadable message",75:"Value too large for defined data type",76:"Given log. name not unique",77:"f.d. invalid for this operation",78:"Remote address changed",79:"Can   access a needed shared lib",80:"Accessing a corrupted shared lib",81:".lib section in a.out corrupted",82:"Attempting to link in too many libs",83:"Attempting to exec a shared library",84:"Illegal byte sequence",86:"Streams pipe error",87:"Too many users",88:"Socket operation on non-socket",89:"Destination address required",90:"Message too long",91:"Protocol wrong type for socket",92:"Protocol not available",93:"Unknown protocol",94:"Socket type not supported",95:"Not supported",96:"Protocol family not supported",97:"Address family not supported by protocol family",98:"Address already in use",99:"Address not available",100:"Network interface is not configured",101:"Network is unreachable",102:"Connection reset by network",103:"Connection aborted",104:"Connection reset by peer",105:"No buffer space available",106:"Socket is already connected",107:"Socket is not connected",108:"Can't send after socket shutdown",109:"Too many references",110:"Connection timed out",111:"Connection refused",112:"Host is down",113:"Host is unreachable",114:"Socket already connected",115:"Connection already in progress",116:"Stale file handle",122:"Quota exceeded",123:"No medium (in tape drive)",125:"Operation canceled",130:"Previous owner died",131:"State not recoverable"};
  
  
  var ___errno_state=0;function ___setErrNo(value) {
      // For convenient setting and returning of errno.
      HEAP32[((___errno_state)>>2)]=value;
      return value;
    }
  
  var PATH={splitPath:function (filename) {
        var splitPathRe = /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
        return splitPathRe.exec(filename).slice(1);
      },normalizeArray:function (parts, allowAboveRoot) {
        // if the path tries to go above the root, `up` ends up > 0
        var up = 0;
        for (var i = parts.length - 1; i >= 0; i--) {
          var last = parts[i];
          if (last === '.') {
            parts.splice(i, 1);
          } else if (last === '..') {
            parts.splice(i, 1);
            up++;
          } else if (up) {
            parts.splice(i, 1);
            up--;
          }
        }
        // if the path is allowed to go above the root, restore leading ..s
        if (allowAboveRoot) {
          for (; up--; up) {
            parts.unshift('..');
          }
        }
        return parts;
      },normalize:function (path) {
        var isAbsolute = path.charAt(0) === '/',
            trailingSlash = path.substr(-1) === '/';
        // Normalize the path
        path = PATH.normalizeArray(path.split('/').filter(function(p) {
          return !!p;
        }), !isAbsolute).join('/');
        if (!path && !isAbsolute) {
          path = '.';
        }
        if (path && trailingSlash) {
          path += '/';
        }
        return (isAbsolute ? '/' : '') + path;
      },dirname:function (path) {
        var result = PATH.splitPath(path),
            root = result[0],
            dir = result[1];
        if (!root && !dir) {
          // No dirname whatsoever
          return '.';
        }
        if (dir) {
          // It has a dirname, strip trailing slash
          dir = dir.substr(0, dir.length - 1);
        }
        return root + dir;
      },basename:function (path) {
        // EMSCRIPTEN return '/'' for '/', not an empty string
        if (path === '/') return '/';
        var lastSlash = path.lastIndexOf('/');
        if (lastSlash === -1) return path;
        return path.substr(lastSlash+1);
      },extname:function (path) {
        return PATH.splitPath(path)[3];
      },join:function () {
        var paths = Array.prototype.slice.call(arguments, 0);
        return PATH.normalize(paths.join('/'));
      },join2:function (l, r) {
        return PATH.normalize(l + '/' + r);
      },resolve:function () {
        var resolvedPath = '',
          resolvedAbsolute = false;
        for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
          var path = (i >= 0) ? arguments[i] : FS.cwd();
          // Skip empty and invalid entries
          if (typeof path !== 'string') {
            throw new TypeError('Arguments to path.resolve must be strings');
          } else if (!path) {
            continue;
          }
          resolvedPath = path + '/' + resolvedPath;
          resolvedAbsolute = path.charAt(0) === '/';
        }
        // At this point the path should be resolved to a full absolute path, but
        // handle relative paths to be safe (might happen when process.cwd() fails)
        resolvedPath = PATH.normalizeArray(resolvedPath.split('/').filter(function(p) {
          return !!p;
        }), !resolvedAbsolute).join('/');
        return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
      },relative:function (from, to) {
        from = PATH.resolve(from).substr(1);
        to = PATH.resolve(to).substr(1);
        function trim(arr) {
          var start = 0;
          for (; start < arr.length; start++) {
            if (arr[start] !== '') break;
          }
          var end = arr.length - 1;
          for (; end >= 0; end--) {
            if (arr[end] !== '') break;
          }
          if (start > end) return [];
          return arr.slice(start, end - start + 1);
        }
        var fromParts = trim(from.split('/'));
        var toParts = trim(to.split('/'));
        var length = Math.min(fromParts.length, toParts.length);
        var samePartsLength = length;
        for (var i = 0; i < length; i++) {
          if (fromParts[i] !== toParts[i]) {
            samePartsLength = i;
            break;
          }
        }
        var outputParts = [];
        for (var i = samePartsLength; i < fromParts.length; i++) {
          outputParts.push('..');
        }
        outputParts = outputParts.concat(toParts.slice(samePartsLength));
        return outputParts.join('/');
      }};
  
  var TTY={ttys:[],init:function () {
        // https://github.com/kripken/emscripten/pull/1555
        // if (ENVIRONMENT_IS_NODE) {
        //   // currently, FS.init does not distinguish if process.stdin is a file or TTY
        //   // device, it always assumes it's a TTY device. because of this, we're forcing
        //   // process.stdin to UTF8 encoding to at least make stdin reading compatible
        //   // with text files until FS.init can be refactored.
        //   process['stdin']['setEncoding']('utf8');
        // }
      },shutdown:function () {
        // https://github.com/kripken/emscripten/pull/1555
        // if (ENVIRONMENT_IS_NODE) {
        //   // inolen: any idea as to why node -e 'process.stdin.read()' wouldn't exit immediately (with process.stdin being a tty)?
        //   // isaacs: because now it's reading from the stream, you've expressed interest in it, so that read() kicks off a _read() which creates a ReadReq operation
        //   // inolen: I thought read() in that case was a synchronous operation that just grabbed some amount of buffered data if it exists?
        //   // isaacs: it is. but it also triggers a _read() call, which calls readStart() on the handle
        //   // isaacs: do process.stdin.pause() and i'd think it'd probably close the pending call
        //   process['stdin']['pause']();
        // }
      },register:function (dev, ops) {
        TTY.ttys[dev] = { input: [], output: [], ops: ops };
        FS.registerDevice(dev, TTY.stream_ops);
      },stream_ops:{open:function (stream) {
          var tty = TTY.ttys[stream.node.rdev];
          if (!tty) {
            throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
          }
          stream.tty = tty;
          stream.seekable = false;
        },close:function (stream) {
          // flush any pending line data
          if (stream.tty.output.length) {
            stream.tty.ops.put_char(stream.tty, 10);
          }
        },read:function (stream, buffer, offset, length, pos /* ignored */) {
          if (!stream.tty || !stream.tty.ops.get_char) {
            throw new FS.ErrnoError(ERRNO_CODES.ENXIO);
          }
          var bytesRead = 0;
          for (var i = 0; i < length; i++) {
            var result;
            try {
              result = stream.tty.ops.get_char(stream.tty);
            } catch (e) {
              throw new FS.ErrnoError(ERRNO_CODES.EIO);
            }
            if (result === undefined && bytesRead === 0) {
              throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
            }
            if (result === null || result === undefined) break;
            bytesRead++;
            buffer[offset+i] = result;
          }
          if (bytesRead) {
            stream.node.timestamp = Date.now();
          }
          return bytesRead;
        },write:function (stream, buffer, offset, length, pos) {
          if (!stream.tty || !stream.tty.ops.put_char) {
            throw new FS.ErrnoError(ERRNO_CODES.ENXIO);
          }
          for (var i = 0; i < length; i++) {
            try {
              stream.tty.ops.put_char(stream.tty, buffer[offset+i]);
            } catch (e) {
              throw new FS.ErrnoError(ERRNO_CODES.EIO);
            }
          }
          if (length) {
            stream.node.timestamp = Date.now();
          }
          return i;
        }},default_tty_ops:{get_char:function (tty) {
          if (!tty.input.length) {
            var result = null;
            if (ENVIRONMENT_IS_NODE) {
              result = process['stdin']['read']();
              if (!result) {
                if (process['stdin']['_readableState'] && process['stdin']['_readableState']['ended']) {
                  return null;  // EOF
                }
                return undefined;  // no data available
              }
            } else if (typeof window != 'undefined' &&
              typeof window.prompt == 'function') {
              // Browser.
              result = window.prompt('Input: ');  // returns null on cancel
              if (result !== null) {
                result += '\n';
              }
            } else if (typeof readline == 'function') {
              // Command line.
              result = readline();
              if (result !== null) {
                result += '\n';
              }
            }
            if (!result) {
              return null;
            }
            tty.input = intArrayFromString(result, true);
          }
          return tty.input.shift();
        },put_char:function (tty, val) {
          if (val === null || val === 10) {
            Module['print'](tty.output.join(''));
            tty.output = [];
          } else {
            tty.output.push(TTY.utf8.processCChar(val));
          }
        }},default_tty1_ops:{put_char:function (tty, val) {
          if (val === null || val === 10) {
            Module['printErr'](tty.output.join(''));
            tty.output = [];
          } else {
            tty.output.push(TTY.utf8.processCChar(val));
          }
        }}};
  
  var MEMFS={ops_table:null,mount:function (mount) {
        return MEMFS.createNode(null, '/', 16384 | 511 /* 0777 */, 0);
      },createNode:function (parent, name, mode, dev) {
        if (FS.isBlkdev(mode) || FS.isFIFO(mode)) {
          // no supported
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (!MEMFS.ops_table) {
          MEMFS.ops_table = {
            dir: {
              node: {
                getattr: MEMFS.node_ops.getattr,
                setattr: MEMFS.node_ops.setattr,
                lookup: MEMFS.node_ops.lookup,
                mknod: MEMFS.node_ops.mknod,
                rename: MEMFS.node_ops.rename,
                unlink: MEMFS.node_ops.unlink,
                rmdir: MEMFS.node_ops.rmdir,
                readdir: MEMFS.node_ops.readdir,
                symlink: MEMFS.node_ops.symlink
              },
              stream: {
                llseek: MEMFS.stream_ops.llseek
              }
            },
            file: {
              node: {
                getattr: MEMFS.node_ops.getattr,
                setattr: MEMFS.node_ops.setattr
              },
              stream: {
                llseek: MEMFS.stream_ops.llseek,
                read: MEMFS.stream_ops.read,
                write: MEMFS.stream_ops.write,
                allocate: MEMFS.stream_ops.allocate,
                mmap: MEMFS.stream_ops.mmap
              }
            },
            link: {
              node: {
                getattr: MEMFS.node_ops.getattr,
                setattr: MEMFS.node_ops.setattr,
                readlink: MEMFS.node_ops.readlink
              },
              stream: {}
            },
            chrdev: {
              node: {
                getattr: MEMFS.node_ops.getattr,
                setattr: MEMFS.node_ops.setattr
              },
              stream: FS.chrdev_stream_ops
            },
          };
        }
        var node = FS.createNode(parent, name, mode, dev);
        if (FS.isDir(node.mode)) {
          node.node_ops = MEMFS.ops_table.dir.node;
          node.stream_ops = MEMFS.ops_table.dir.stream;
          node.contents = {};
        } else if (FS.isFile(node.mode)) {
          node.node_ops = MEMFS.ops_table.file.node;
          node.stream_ops = MEMFS.ops_table.file.stream;
          node.usedBytes = 0; // The actual number of bytes used in the typed array, as opposed to contents.buffer.byteLength which gives the whole capacity.
          // When the byte data of the file is populated, this will point to either a typed array, or a normal JS array. Typed arrays are preferred
          // for performance, and used by default. However, typed arrays are not resizable like normal JS arrays are, so there is a small disk size
          // penalty involved for appending file writes that continuously grow a file similar to std::vector capacity vs used -scheme.
          node.contents = null; 
        } else if (FS.isLink(node.mode)) {
          node.node_ops = MEMFS.ops_table.link.node;
          node.stream_ops = MEMFS.ops_table.link.stream;
        } else if (FS.isChrdev(node.mode)) {
          node.node_ops = MEMFS.ops_table.chrdev.node;
          node.stream_ops = MEMFS.ops_table.chrdev.stream;
        }
        node.timestamp = Date.now();
        // add the new node to the parent
        if (parent) {
          parent.contents[name] = node;
        }
        return node;
      },getFileDataAsRegularArray:function (node) {
        if (node.contents && node.contents.subarray) {
          var arr = [];
          for (var i = 0; i < node.usedBytes; ++i) arr.push(node.contents[i]);
          return arr; // Returns a copy of the original data.
        }
        return node.contents; // No-op, the file contents are already in a JS array. Return as-is.
      },getFileDataAsTypedArray:function (node) {
        if (node.contents && node.contents.subarray) return node.contents.subarray(0, node.usedBytes); // Make sure to not return excess unused bytes.
        return new Uint8Array(node.contents);
      },expandFileStorage:function (node, newCapacity) {
  
        // If we are asked to expand the size of a file that already exists, revert to using a standard JS array to store the file
        // instead of a typed array. This makes resizing the array more flexible because we can just .push() elements at the back to
        // increase the size.
        if (node.contents && node.contents.subarray && newCapacity > node.contents.length) {
          node.contents = MEMFS.getFileDataAsRegularArray(node);
          node.usedBytes = node.contents.length; // We might be writing to a lazy-loaded file which had overridden this property, so force-reset it.
        }
  
        if (!node.contents || node.contents.subarray) { // Keep using a typed array if creating a new storage, or if old one was a typed array as well.
          var prevCapacity = node.contents ? node.contents.buffer.byteLength : 0;
          if (prevCapacity >= newCapacity) return; // No need to expand, the storage was already large enough.
          // Don't expand strictly to the given requested limit if it's only a very small increase, but instead geometrically grow capacity.
          // For small filesizes (<1MB), perform size*2 geometric increase, but for large sizes, do a much more conservative size*1.125 increase to
          // avoid overshooting the allocation cap by a very large margin.
          var CAPACITY_DOUBLING_MAX = 1024 * 1024;
          newCapacity = Math.max(newCapacity, (prevCapacity * (prevCapacity < CAPACITY_DOUBLING_MAX ? 2.0 : 1.125)) | 0);
          if (prevCapacity != 0) newCapacity = Math.max(newCapacity, 256); // At minimum allocate 256b for each file when expanding.
          var oldContents = node.contents;
          node.contents = new Uint8Array(newCapacity); // Allocate new storage.
          if (node.usedBytes > 0) node.contents.set(oldContents.subarray(0, node.usedBytes), 0); // Copy old data over to the new storage.
          return;
        }
        // Not using a typed array to back the file storage. Use a standard JS array instead.
        if (!node.contents && newCapacity > 0) node.contents = [];
        while (node.contents.length < newCapacity) node.contents.push(0);
      },resizeFileStorage:function (node, newSize) {
        if (node.usedBytes == newSize) return;
        if (newSize == 0) {
          node.contents = null; // Fully decommit when requesting a resize to zero.
          node.usedBytes = 0;
          return;
        }
  
        if (!node.contents || node.contents.subarray) { // Resize a typed array if that is being used as the backing store.
          var oldContents = node.contents;
          node.contents = new Uint8Array(new ArrayBuffer(newSize)); // Allocate new storage.
          node.contents.set(oldContents.subarray(0, Math.min(newSize, node.usedBytes))); // Copy old data over to the new storage.
          node.usedBytes = newSize;
          return;
        }
        // Backing with a JS array.
        if (!node.contents) node.contents = [];
        if (node.contents.length > newSize) node.contents.length = newSize;
        else while (node.contents.length < newSize) node.contents.push(0);
        node.usedBytes = newSize;
      },node_ops:{getattr:function (node) {
          var attr = {};
          // device numbers reuse inode numbers.
          attr.dev = FS.isChrdev(node.mode) ? node.id : 1;
          attr.ino = node.id;
          attr.mode = node.mode;
          attr.nlink = 1;
          attr.uid = 0;
          attr.gid = 0;
          attr.rdev = node.rdev;
          if (FS.isDir(node.mode)) {
            attr.size = 4096;
          } else if (FS.isFile(node.mode)) {
            attr.size = node.usedBytes;
          } else if (FS.isLink(node.mode)) {
            attr.size = node.link.length;
          } else {
            attr.size = 0;
          }
          attr.atime = new Date(node.timestamp);
          attr.mtime = new Date(node.timestamp);
          attr.ctime = new Date(node.timestamp);
          // NOTE: In our implementation, st_blocks = Math.ceil(st_size/st_blksize),
          //       but this is not required by the standard.
          attr.blksize = 4096;
          attr.blocks = Math.ceil(attr.size / attr.blksize);
          return attr;
        },setattr:function (node, attr) {
          if (attr.mode !== undefined) {
            node.mode = attr.mode;
          }
          if (attr.timestamp !== undefined) {
            node.timestamp = attr.timestamp;
          }
          if (attr.size !== undefined) {
            MEMFS.resizeFileStorage(node, attr.size);
          }
        },lookup:function (parent, name) {
          throw FS.genericErrors[ERRNO_CODES.ENOENT];
        },mknod:function (parent, name, mode, dev) {
          return MEMFS.createNode(parent, name, mode, dev);
        },rename:function (old_node, new_dir, new_name) {
          // if we're overwriting a directory at new_name, make sure it's empty.
          if (FS.isDir(old_node.mode)) {
            var new_node;
            try {
              new_node = FS.lookupNode(new_dir, new_name);
            } catch (e) {
            }
            if (new_node) {
              for (var i in new_node.contents) {
                throw new FS.ErrnoError(ERRNO_CODES.ENOTEMPTY);
              }
            }
          }
          // do the internal rewiring
          delete old_node.parent.contents[old_node.name];
          old_node.name = new_name;
          new_dir.contents[new_name] = old_node;
          old_node.parent = new_dir;
        },unlink:function (parent, name) {
          delete parent.contents[name];
        },rmdir:function (parent, name) {
          var node = FS.lookupNode(parent, name);
          for (var i in node.contents) {
            throw new FS.ErrnoError(ERRNO_CODES.ENOTEMPTY);
          }
          delete parent.contents[name];
        },readdir:function (node) {
          var entries = ['.', '..']
          for (var key in node.contents) {
            if (!node.contents.hasOwnProperty(key)) {
              continue;
            }
            entries.push(key);
          }
          return entries;
        },symlink:function (parent, newname, oldpath) {
          var node = MEMFS.createNode(parent, newname, 511 /* 0777 */ | 40960, 0);
          node.link = oldpath;
          return node;
        },readlink:function (node) {
          if (!FS.isLink(node.mode)) {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
          }
          return node.link;
        }},stream_ops:{read:function (stream, buffer, offset, length, position) {
          var contents = stream.node.contents;
          if (position >= stream.node.usedBytes) return 0;
          var size = Math.min(stream.node.usedBytes - position, length);
          assert(size >= 0);
          if (size > 8 && contents.subarray) { // non-trivial, and typed array
            buffer.set(contents.subarray(position, position + size), offset);
          } else
          {
            for (var i = 0; i < size; i++) buffer[offset + i] = contents[position + i];
          }
          return size;
        },write:function (stream, buffer, offset, length, position, canOwn) {
          if (!length) return 0;
          var node = stream.node;
          node.timestamp = Date.now();
  
          if (buffer.subarray && (!node.contents || node.contents.subarray)) { // This write is from a typed array to a typed array?
            if (canOwn) { // Can we just reuse the buffer we are given?
              node.contents = buffer.subarray(offset, offset + length);
              node.usedBytes = length;
              return length;
            } else if (node.usedBytes === 0 && position === 0) { // If this is a simple first write to an empty file, do a fast set since we don't need to care about old data.
              node.contents = new Uint8Array(buffer.subarray(offset, offset + length));
              node.usedBytes = length;
              return length;
            } else if (position + length <= node.usedBytes) { // Writing to an already allocated and used subrange of the file?
              node.contents.set(buffer.subarray(offset, offset + length), position);
              return length;
            }
          }
          // Appending to an existing file and we need to reallocate, or source data did not come as a typed array.
          MEMFS.expandFileStorage(node, position+length);
          if (node.contents.subarray && buffer.subarray) node.contents.set(buffer.subarray(offset, offset + length), position); // Use typed array write if available.
          else
            for (var i = 0; i < length; i++) {
             node.contents[position + i] = buffer[offset + i]; // Or fall back to manual write if not.
            }
          node.usedBytes = Math.max(node.usedBytes, position+length);
          return length;
        },llseek:function (stream, offset, whence) {
          var position = offset;
          if (whence === 1) {  // SEEK_CUR.
            position += stream.position;
          } else if (whence === 2) {  // SEEK_END.
            if (FS.isFile(stream.node.mode)) {
              position += stream.node.usedBytes;
            }
          }
          if (position < 0) {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
          }
          stream.ungotten = [];
          stream.position = position;
          return position;
        },allocate:function (stream, offset, length) {
          MEMFS.expandFileStorage(stream.node, offset + length);
          stream.node.usedBytes = Math.max(stream.node.usedBytes, offset + length);
        },mmap:function (stream, buffer, offset, length, position, prot, flags) {
          if (!FS.isFile(stream.node.mode)) {
            throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
          }
          var ptr;
          var allocated;
          var contents = stream.node.contents;
          // Only make a new copy when MAP_PRIVATE is specified.
          if ( !(flags & 2) &&
                (contents.buffer === buffer || contents.buffer === buffer.buffer) ) {
            // We can't emulate MAP_SHARED when the file is not backed by the buffer
            // we're mapping to (e.g. the HEAP buffer).
            allocated = false;
            ptr = contents.byteOffset;
          } else {
            // Try to avoid unnecessary slices.
            if (position > 0 || position + length < stream.node.usedBytes) {
              if (contents.subarray) {
                contents = contents.subarray(position, position + length);
              } else {
                contents = Array.prototype.slice.call(contents, position, position + length);
              }
            }
            allocated = true;
            ptr = _malloc(length);
            if (!ptr) {
              throw new FS.ErrnoError(ERRNO_CODES.ENOMEM);
            }
            buffer.set(contents, ptr);
          }
          return { ptr: ptr, allocated: allocated };
        }}};
  
  var IDBFS={dbs:{},indexedDB:function () {
        return window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
      },DB_VERSION:21,DB_STORE_NAME:"FILE_DATA",mount:function (mount) {
        // reuse all of the core MEMFS functionality
        return MEMFS.mount.apply(null, arguments);
      },syncfs:function (mount, populate, callback) {
        IDBFS.getLocalSet(mount, function(err, local) {
          if (err) return callback(err);
  
          IDBFS.getRemoteSet(mount, function(err, remote) {
            if (err) return callback(err);
  
            var src = populate ? remote : local;
            var dst = populate ? local : remote;
  
            IDBFS.reconcile(src, dst, callback);
          });
        });
      },getDB:function (name, callback) {
        // check the cache first
        var db = IDBFS.dbs[name];
        if (db) {
          return callback(null, db);
        }
  
        var req;
        try {
          req = IDBFS.indexedDB().open(name, IDBFS.DB_VERSION);
        } catch (e) {
          return callback(e);
        }
        req.onupgradeneeded = function(e) {
          var db = e.target.result;
          var transaction = e.target.transaction;
  
          var fileStore;
  
          if (db.objectStoreNames.contains(IDBFS.DB_STORE_NAME)) {
            fileStore = transaction.objectStore(IDBFS.DB_STORE_NAME);
          } else {
            fileStore = db.createObjectStore(IDBFS.DB_STORE_NAME);
          }
  
          fileStore.createIndex('timestamp', 'timestamp', { unique: false });
        };
        req.onsuccess = function() {
          db = req.result;
  
          // add to the cache
          IDBFS.dbs[name] = db;
          callback(null, db);
        };
        req.onerror = function() {
          callback(this.error);
        };
      },getLocalSet:function (mount, callback) {
        var entries = {};
  
        function isRealDir(p) {
          return p !== '.' && p !== '..';
        };
        function toAbsolute(root) {
          return function(p) {
            return PATH.join2(root, p);
          }
        };
  
        var check = FS.readdir(mount.mountpoint).filter(isRealDir).map(toAbsolute(mount.mountpoint));
  
        while (check.length) {
          var path = check.pop();
          var stat;
  
          try {
            stat = FS.stat(path);
          } catch (e) {
            return callback(e);
          }
  
          if (FS.isDir(stat.mode)) {
            check.push.apply(check, FS.readdir(path).filter(isRealDir).map(toAbsolute(path)));
          }
  
          entries[path] = { timestamp: stat.mtime };
        }
  
        return callback(null, { type: 'local', entries: entries });
      },getRemoteSet:function (mount, callback) {
        var entries = {};
  
        IDBFS.getDB(mount.mountpoint, function(err, db) {
          if (err) return callback(err);
  
          var transaction = db.transaction([IDBFS.DB_STORE_NAME], 'readonly');
          transaction.onerror = function() { callback(this.error); };
  
          var store = transaction.objectStore(IDBFS.DB_STORE_NAME);
          var index = store.index('timestamp');
  
          index.openKeyCursor().onsuccess = function(event) {
            var cursor = event.target.result;
  
            if (!cursor) {
              return callback(null, { type: 'remote', db: db, entries: entries });
            }
  
            entries[cursor.primaryKey] = { timestamp: cursor.key };
  
            cursor.continue();
          };
        });
      },loadLocalEntry:function (path, callback) {
        var stat, node;
  
        try {
          var lookup = FS.lookupPath(path);
          node = lookup.node;
          stat = FS.stat(path);
        } catch (e) {
          return callback(e);
        }
  
        if (FS.isDir(stat.mode)) {
          return callback(null, { timestamp: stat.mtime, mode: stat.mode });
        } else if (FS.isFile(stat.mode)) {
          // Performance consideration: storing a normal JavaScript array to a IndexedDB is much slower than storing a typed array.
          // Therefore always convert the file contents to a typed array first before writing the data to IndexedDB.
          node.contents = MEMFS.getFileDataAsTypedArray(node);
          return callback(null, { timestamp: stat.mtime, mode: stat.mode, contents: node.contents });
        } else {
          return callback(new Error('node type not supported'));
        }
      },storeLocalEntry:function (path, entry, callback) {
        try {
          if (FS.isDir(entry.mode)) {
            FS.mkdir(path, entry.mode);
          } else if (FS.isFile(entry.mode)) {
            FS.writeFile(path, entry.contents, { encoding: 'binary', canOwn: true });
          } else {
            return callback(new Error('node type not supported'));
          }
  
          FS.utime(path, entry.timestamp, entry.timestamp);
        } catch (e) {
          return callback(e);
        }
  
        callback(null);
      },removeLocalEntry:function (path, callback) {
        try {
          var lookup = FS.lookupPath(path);
          var stat = FS.stat(path);
  
          if (FS.isDir(stat.mode)) {
            FS.rmdir(path);
          } else if (FS.isFile(stat.mode)) {
            FS.unlink(path);
          }
        } catch (e) {
          return callback(e);
        }
  
        callback(null);
      },loadRemoteEntry:function (store, path, callback) {
        var req = store.get(path);
        req.onsuccess = function(event) { callback(null, event.target.result); };
        req.onerror = function() { callback(this.error); };
      },storeRemoteEntry:function (store, path, entry, callback) {
        var req = store.put(entry, path);
        req.onsuccess = function() { callback(null); };
        req.onerror = function() { callback(this.error); };
      },removeRemoteEntry:function (store, path, callback) {
        var req = store.delete(path);
        req.onsuccess = function() { callback(null); };
        req.onerror = function() { callback(this.error); };
      },reconcile:function (src, dst, callback) {
        var total = 0;
  
        var create = [];
        Object.keys(src.entries).forEach(function (key) {
          var e = src.entries[key];
          var e2 = dst.entries[key];
          if (!e2 || e.timestamp > e2.timestamp) {
            create.push(key);
            total++;
          }
        });
  
        var remove = [];
        Object.keys(dst.entries).forEach(function (key) {
          var e = dst.entries[key];
          var e2 = src.entries[key];
          if (!e2) {
            remove.push(key);
            total++;
          }
        });
  
        if (!total) {
          return callback(null);
        }
  
        var errored = false;
        var completed = 0;
        var db = src.type === 'remote' ? src.db : dst.db;
        var transaction = db.transaction([IDBFS.DB_STORE_NAME], 'readwrite');
        var store = transaction.objectStore(IDBFS.DB_STORE_NAME);
  
        function done(err) {
          if (err) {
            if (!done.errored) {
              done.errored = true;
              return callback(err);
            }
            return;
          }
          if (++completed >= total) {
            return callback(null);
          }
        };
  
        transaction.onerror = function() { done(this.error); };
  
        // sort paths in ascending order so directory entries are created
        // before the files inside them
        create.sort().forEach(function (path) {
          if (dst.type === 'local') {
            IDBFS.loadRemoteEntry(store, path, function (err, entry) {
              if (err) return done(err);
              IDBFS.storeLocalEntry(path, entry, done);
            });
          } else {
            IDBFS.loadLocalEntry(path, function (err, entry) {
              if (err) return done(err);
              IDBFS.storeRemoteEntry(store, path, entry, done);
            });
          }
        });
  
        // sort paths in descending order so files are deleted before their
        // parent directories
        remove.sort().reverse().forEach(function(path) {
          if (dst.type === 'local') {
            IDBFS.removeLocalEntry(path, done);
          } else {
            IDBFS.removeRemoteEntry(store, path, done);
          }
        });
      }};
  
  var NODEFS={isWindows:false,staticInit:function () {
        NODEFS.isWindows = !!process.platform.match(/^win/);
      },mount:function (mount) {
        assert(ENVIRONMENT_IS_NODE);
        return NODEFS.createNode(null, '/', NODEFS.getMode(mount.opts.root), 0);
      },createNode:function (parent, name, mode, dev) {
        if (!FS.isDir(mode) && !FS.isFile(mode) && !FS.isLink(mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var node = FS.createNode(parent, name, mode);
        node.node_ops = NODEFS.node_ops;
        node.stream_ops = NODEFS.stream_ops;
        return node;
      },getMode:function (path) {
        var stat;
        try {
          stat = fs.lstatSync(path);
          if (NODEFS.isWindows) {
            // On Windows, directories return permission bits 'rw-rw-rw-', even though they have 'rwxrwxrwx', so 
            // propagate write bits to execute bits.
            stat.mode = stat.mode | ((stat.mode & 146) >> 1);
          }
        } catch (e) {
          if (!e.code) throw e;
          throw new FS.ErrnoError(ERRNO_CODES[e.code]);
        }
        return stat.mode;
      },realPath:function (node) {
        var parts = [];
        while (node.parent !== node) {
          parts.push(node.name);
          node = node.parent;
        }
        parts.push(node.mount.opts.root);
        parts.reverse();
        return PATH.join.apply(null, parts);
      },flagsToPermissionStringMap:{0:"r",1:"r+",2:"r+",64:"r",65:"r+",66:"r+",129:"rx+",193:"rx+",514:"w+",577:"w",578:"w+",705:"wx",706:"wx+",1024:"a",1025:"a",1026:"a+",1089:"a",1090:"a+",1153:"ax",1154:"ax+",1217:"ax",1218:"ax+",4096:"rs",4098:"rs+"},flagsToPermissionString:function (flags) {
        if (flags in NODEFS.flagsToPermissionStringMap) {
          return NODEFS.flagsToPermissionStringMap[flags];
        } else {
          return flags;
        }
      },node_ops:{getattr:function (node) {
          var path = NODEFS.realPath(node);
          var stat;
          try {
            stat = fs.lstatSync(path);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
          // node.js v0.10.20 doesn't report blksize and blocks on Windows. Fake them with default blksize of 4096.
          // See http://support.microsoft.com/kb/140365
          if (NODEFS.isWindows && !stat.blksize) {
            stat.blksize = 4096;
          }
          if (NODEFS.isWindows && !stat.blocks) {
            stat.blocks = (stat.size+stat.blksize-1)/stat.blksize|0;
          }
          return {
            dev: stat.dev,
            ino: stat.ino,
            mode: stat.mode,
            nlink: stat.nlink,
            uid: stat.uid,
            gid: stat.gid,
            rdev: stat.rdev,
            size: stat.size,
            atime: stat.atime,
            mtime: stat.mtime,
            ctime: stat.ctime,
            blksize: stat.blksize,
            blocks: stat.blocks
          };
        },setattr:function (node, attr) {
          var path = NODEFS.realPath(node);
          try {
            if (attr.mode !== undefined) {
              fs.chmodSync(path, attr.mode);
              // update the common node structure mode as well
              node.mode = attr.mode;
            }
            if (attr.timestamp !== undefined) {
              var date = new Date(attr.timestamp);
              fs.utimesSync(path, date, date);
            }
            if (attr.size !== undefined) {
              fs.truncateSync(path, attr.size);
            }
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },lookup:function (parent, name) {
          var path = PATH.join2(NODEFS.realPath(parent), name);
          var mode = NODEFS.getMode(path);
          return NODEFS.createNode(parent, name, mode);
        },mknod:function (parent, name, mode, dev) {
          var node = NODEFS.createNode(parent, name, mode, dev);
          // create the backing node for this in the fs root as well
          var path = NODEFS.realPath(node);
          try {
            if (FS.isDir(node.mode)) {
              fs.mkdirSync(path, node.mode);
            } else {
              fs.writeFileSync(path, '', { mode: node.mode });
            }
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
          return node;
        },rename:function (oldNode, newDir, newName) {
          var oldPath = NODEFS.realPath(oldNode);
          var newPath = PATH.join2(NODEFS.realPath(newDir), newName);
          try {
            fs.renameSync(oldPath, newPath);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },unlink:function (parent, name) {
          var path = PATH.join2(NODEFS.realPath(parent), name);
          try {
            fs.unlinkSync(path);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },rmdir:function (parent, name) {
          var path = PATH.join2(NODEFS.realPath(parent), name);
          try {
            fs.rmdirSync(path);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },readdir:function (node) {
          var path = NODEFS.realPath(node);
          try {
            return fs.readdirSync(path);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },symlink:function (parent, newName, oldPath) {
          var newPath = PATH.join2(NODEFS.realPath(parent), newName);
          try {
            fs.symlinkSync(oldPath, newPath);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },readlink:function (node) {
          var path = NODEFS.realPath(node);
          try {
            return fs.readlinkSync(path);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        }},stream_ops:{open:function (stream) {
          var path = NODEFS.realPath(stream.node);
          try {
            if (FS.isFile(stream.node.mode)) {
              stream.nfd = fs.openSync(path, NODEFS.flagsToPermissionString(stream.flags));
            }
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },close:function (stream) {
          try {
            if (FS.isFile(stream.node.mode) && stream.nfd) {
              fs.closeSync(stream.nfd);
            }
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },read:function (stream, buffer, offset, length, position) {
          // FIXME this is terrible.
          var nbuffer = new Buffer(length);
          var res;
          try {
            res = fs.readSync(stream.nfd, nbuffer, 0, length, position);
          } catch (e) {
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
          if (res > 0) {
            for (var i = 0; i < res; i++) {
              buffer[offset + i] = nbuffer[i];
            }
          }
          return res;
        },write:function (stream, buffer, offset, length, position) {
          // FIXME this is terrible.
          var nbuffer = new Buffer(buffer.subarray(offset, offset + length));
          var res;
          try {
            res = fs.writeSync(stream.nfd, nbuffer, 0, length, position);
          } catch (e) {
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
          return res;
        },llseek:function (stream, offset, whence) {
          var position = offset;
          if (whence === 1) {  // SEEK_CUR.
            position += stream.position;
          } else if (whence === 2) {  // SEEK_END.
            if (FS.isFile(stream.node.mode)) {
              try {
                var stat = fs.fstatSync(stream.nfd);
                position += stat.size;
              } catch (e) {
                throw new FS.ErrnoError(ERRNO_CODES[e.code]);
              }
            }
          }
  
          if (position < 0) {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
          }
  
          stream.position = position;
          return position;
        }}};
  
  var _stdin=allocate(1, "i32*", ALLOC_STATIC);
  
  var _stdout=allocate(1, "i32*", ALLOC_STATIC);
  
  var _stderr=allocate(1, "i32*", ALLOC_STATIC);
  
  function _fflush(stream) {
      // int fflush(FILE *stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fflush.html
      // we don't currently perform any user-space buffering of data
    }var FS={root:null,mounts:[],devices:[null],streams:[],nextInode:1,nameTable:null,currentPath:"/",initialized:false,ignorePermissions:true,trackingDelegate:{},tracking:{openFlags:{READ:1,WRITE:2}},ErrnoError:null,genericErrors:{},handleFSError:function (e) {
        if (!(e instanceof FS.ErrnoError)) throw e + ' : ' + stackTrace();
        return ___setErrNo(e.errno);
      },lookupPath:function (path, opts) {
        path = PATH.resolve(FS.cwd(), path);
        opts = opts || {};
  
        var defaults = {
          follow_mount: true,
          recurse_count: 0
        };
        for (var key in defaults) {
          if (opts[key] === undefined) {
            opts[key] = defaults[key];
          }
        }
  
        if (opts.recurse_count > 8) {  // max recursive lookup of 8
          throw new FS.ErrnoError(ERRNO_CODES.ELOOP);
        }
  
        // split the path
        var parts = PATH.normalizeArray(path.split('/').filter(function(p) {
          return !!p;
        }), false);
  
        // start at the root
        var current = FS.root;
        var current_path = '/';
  
        for (var i = 0; i < parts.length; i++) {
          var islast = (i === parts.length-1);
          if (islast && opts.parent) {
            // stop resolving
            break;
          }
  
          current = FS.lookupNode(current, parts[i]);
          current_path = PATH.join2(current_path, parts[i]);
  
          // jump to the mount's root node if this is a mountpoint
          if (FS.isMountpoint(current)) {
            if (!islast || (islast && opts.follow_mount)) {
              current = current.mounted.root;
            }
          }
  
          // by default, lookupPath will not follow a symlink if it is the final path component.
          // setting opts.follow = true will override this behavior.
          if (!islast || opts.follow) {
            var count = 0;
            while (FS.isLink(current.mode)) {
              var link = FS.readlink(current_path);
              current_path = PATH.resolve(PATH.dirname(current_path), link);
              
              var lookup = FS.lookupPath(current_path, { recurse_count: opts.recurse_count });
              current = lookup.node;
  
              if (count++ > 40) {  // limit max consecutive symlinks to 40 (SYMLOOP_MAX).
                throw new FS.ErrnoError(ERRNO_CODES.ELOOP);
              }
            }
          }
        }
  
        return { path: current_path, node: current };
      },getPath:function (node) {
        var path;
        while (true) {
          if (FS.isRoot(node)) {
            var mount = node.mount.mountpoint;
            if (!path) return mount;
            return mount[mount.length-1] !== '/' ? mount + '/' + path : mount + path;
          }
          path = path ? node.name + '/' + path : node.name;
          node = node.parent;
        }
      },hashName:function (parentid, name) {
        var hash = 0;
  
  
        for (var i = 0; i < name.length; i++) {
          hash = ((hash << 5) - hash + name.charCodeAt(i)) | 0;
        }
        return ((parentid + hash) >>> 0) % FS.nameTable.length;
      },hashAddNode:function (node) {
        var hash = FS.hashName(node.parent.id, node.name);
        node.name_next = FS.nameTable[hash];
        FS.nameTable[hash] = node;
      },hashRemoveNode:function (node) {
        var hash = FS.hashName(node.parent.id, node.name);
        if (FS.nameTable[hash] === node) {
          FS.nameTable[hash] = node.name_next;
        } else {
          var current = FS.nameTable[hash];
          while (current) {
            if (current.name_next === node) {
              current.name_next = node.name_next;
              break;
            }
            current = current.name_next;
          }
        }
      },lookupNode:function (parent, name) {
        var err = FS.mayLookup(parent);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        var hash = FS.hashName(parent.id, name);
        for (var node = FS.nameTable[hash]; node; node = node.name_next) {
          var nodeName = node.name;
          if (node.parent.id === parent.id && nodeName === name) {
            return node;
          }
        }
        // if we failed to find it in the cache, call into the VFS
        return FS.lookup(parent, name);
      },createNode:function (parent, name, mode, rdev) {
        if (!FS.FSNode) {
          FS.FSNode = function(parent, name, mode, rdev) {
            if (!parent) {
              parent = this;  // root node sets parent to itself
            }
            this.parent = parent;
            this.mount = parent.mount;
            this.mounted = null;
            this.id = FS.nextInode++;
            this.name = name;
            this.mode = mode;
            this.node_ops = {};
            this.stream_ops = {};
            this.rdev = rdev;
          };
  
          FS.FSNode.prototype = {};
  
          // compatibility
          var readMode = 292 | 73;
          var writeMode = 146;
  
          // NOTE we must use Object.defineProperties instead of individual calls to
          // Object.defineProperty in order to make closure compiler happy
          Object.defineProperties(FS.FSNode.prototype, {
            read: {
              get: function() { return (this.mode & readMode) === readMode; },
              set: function(val) { val ? this.mode |= readMode : this.mode &= ~readMode; }
            },
            write: {
              get: function() { return (this.mode & writeMode) === writeMode; },
              set: function(val) { val ? this.mode |= writeMode : this.mode &= ~writeMode; }
            },
            isFolder: {
              get: function() { return FS.isDir(this.mode); },
            },
            isDevice: {
              get: function() { return FS.isChrdev(this.mode); },
            },
          });
        }
  
        var node = new FS.FSNode(parent, name, mode, rdev);
  
        FS.hashAddNode(node);
  
        return node;
      },destroyNode:function (node) {
        FS.hashRemoveNode(node);
      },isRoot:function (node) {
        return node === node.parent;
      },isMountpoint:function (node) {
        return !!node.mounted;
      },isFile:function (mode) {
        return (mode & 61440) === 32768;
      },isDir:function (mode) {
        return (mode & 61440) === 16384;
      },isLink:function (mode) {
        return (mode & 61440) === 40960;
      },isChrdev:function (mode) {
        return (mode & 61440) === 8192;
      },isBlkdev:function (mode) {
        return (mode & 61440) === 24576;
      },isFIFO:function (mode) {
        return (mode & 61440) === 4096;
      },isSocket:function (mode) {
        return (mode & 49152) === 49152;
      },flagModes:{"r":0,"rs":1052672,"r+":2,"w":577,"wx":705,"xw":705,"w+":578,"wx+":706,"xw+":706,"a":1089,"ax":1217,"xa":1217,"a+":1090,"ax+":1218,"xa+":1218},modeStringToFlags:function (str) {
        var flags = FS.flagModes[str];
        if (typeof flags === 'undefined') {
          throw new Error('Unknown file open mode: ' + str);
        }
        return flags;
      },flagsToPermissionString:function (flag) {
        var accmode = flag & 2097155;
        var perms = ['r', 'w', 'rw'][accmode];
        if ((flag & 512)) {
          perms += 'w';
        }
        return perms;
      },nodePermissions:function (node, perms) {
        if (FS.ignorePermissions) {
          return 0;
        }
        // return 0 if any user, group or owner bits are set.
        if (perms.indexOf('r') !== -1 && !(node.mode & 292)) {
          return ERRNO_CODES.EACCES;
        } else if (perms.indexOf('w') !== -1 && !(node.mode & 146)) {
          return ERRNO_CODES.EACCES;
        } else if (perms.indexOf('x') !== -1 && !(node.mode & 73)) {
          return ERRNO_CODES.EACCES;
        }
        return 0;
      },mayLookup:function (dir) {
        return FS.nodePermissions(dir, 'x');
      },mayCreate:function (dir, name) {
        try {
          var node = FS.lookupNode(dir, name);
          return ERRNO_CODES.EEXIST;
        } catch (e) {
        }
        return FS.nodePermissions(dir, 'wx');
      },mayDelete:function (dir, name, isdir) {
        var node;
        try {
          node = FS.lookupNode(dir, name);
        } catch (e) {
          return e.errno;
        }
        var err = FS.nodePermissions(dir, 'wx');
        if (err) {
          return err;
        }
        if (isdir) {
          if (!FS.isDir(node.mode)) {
            return ERRNO_CODES.ENOTDIR;
          }
          if (FS.isRoot(node) || FS.getPath(node) === FS.cwd()) {
            return ERRNO_CODES.EBUSY;
          }
        } else {
          if (FS.isDir(node.mode)) {
            return ERRNO_CODES.EISDIR;
          }
        }
        return 0;
      },mayOpen:function (node, flags) {
        if (!node) {
          return ERRNO_CODES.ENOENT;
        }
        if (FS.isLink(node.mode)) {
          return ERRNO_CODES.ELOOP;
        } else if (FS.isDir(node.mode)) {
          if ((flags & 2097155) !== 0 ||  // opening for write
              (flags & 512)) {
            return ERRNO_CODES.EISDIR;
          }
        }
        return FS.nodePermissions(node, FS.flagsToPermissionString(flags));
      },MAX_OPEN_FDS:4096,nextfd:function (fd_start, fd_end) {
        fd_start = fd_start || 0;
        fd_end = fd_end || FS.MAX_OPEN_FDS;
        for (var fd = fd_start; fd <= fd_end; fd++) {
          if (!FS.streams[fd]) {
            return fd;
          }
        }
        throw new FS.ErrnoError(ERRNO_CODES.EMFILE);
      },getStream:function (fd) {
        return FS.streams[fd];
      },createStream:function (stream, fd_start, fd_end) {
        if (!FS.FSStream) {
          FS.FSStream = function(){};
          FS.FSStream.prototype = {};
          // compatibility
          Object.defineProperties(FS.FSStream.prototype, {
            object: {
              get: function() { return this.node; },
              set: function(val) { this.node = val; }
            },
            isRead: {
              get: function() { return (this.flags & 2097155) !== 1; }
            },
            isWrite: {
              get: function() { return (this.flags & 2097155) !== 0; }
            },
            isAppend: {
              get: function() { return (this.flags & 1024); }
            }
          });
        }
        // clone it, so we can return an instance of FSStream
        var newStream = new FS.FSStream();
        for (var p in stream) {
          newStream[p] = stream[p];
        }
        stream = newStream;
        var fd = FS.nextfd(fd_start, fd_end);
        stream.fd = fd;
        FS.streams[fd] = stream;
        return stream;
      },closeStream:function (fd) {
        FS.streams[fd] = null;
      },getStreamFromPtr:function (ptr) {
        return FS.streams[ptr - 1];
      },getPtrForStream:function (stream) {
        return stream ? stream.fd + 1 : 0;
      },chrdev_stream_ops:{open:function (stream) {
          var device = FS.getDevice(stream.node.rdev);
          // override node's stream ops with the device's
          stream.stream_ops = device.stream_ops;
          // forward the open call
          if (stream.stream_ops.open) {
            stream.stream_ops.open(stream);
          }
        },llseek:function () {
          throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
        }},major:function (dev) {
        return ((dev) >> 8);
      },minor:function (dev) {
        return ((dev) & 0xff);
      },makedev:function (ma, mi) {
        return ((ma) << 8 | (mi));
      },registerDevice:function (dev, ops) {
        FS.devices[dev] = { stream_ops: ops };
      },getDevice:function (dev) {
        return FS.devices[dev];
      },getMounts:function (mount) {
        var mounts = [];
        var check = [mount];
  
        while (check.length) {
          var m = check.pop();
  
          mounts.push(m);
  
          check.push.apply(check, m.mounts);
        }
  
        return mounts;
      },syncfs:function (populate, callback) {
        if (typeof(populate) === 'function') {
          callback = populate;
          populate = false;
        }
  
        var mounts = FS.getMounts(FS.root.mount);
        var completed = 0;
  
        function done(err) {
          if (err) {
            if (!done.errored) {
              done.errored = true;
              return callback(err);
            }
            return;
          }
          if (++completed >= mounts.length) {
            callback(null);
          }
        };
  
        // sync all mounts
        mounts.forEach(function (mount) {
          if (!mount.type.syncfs) {
            return done(null);
          }
          mount.type.syncfs(mount, populate, done);
        });
      },mount:function (type, opts, mountpoint) {
        var root = mountpoint === '/';
        var pseudo = !mountpoint;
        var node;
  
        if (root && FS.root) {
          throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        } else if (!root && !pseudo) {
          var lookup = FS.lookupPath(mountpoint, { follow_mount: false });
  
          mountpoint = lookup.path;  // use the absolute path
          node = lookup.node;
  
          if (FS.isMountpoint(node)) {
            throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
          }
  
          if (!FS.isDir(node.mode)) {
            throw new FS.ErrnoError(ERRNO_CODES.ENOTDIR);
          }
        }
  
        var mount = {
          type: type,
          opts: opts,
          mountpoint: mountpoint,
          mounts: []
        };
  
        // create a root node for the fs
        var mountRoot = type.mount(mount);
        mountRoot.mount = mount;
        mount.root = mountRoot;
  
        if (root) {
          FS.root = mountRoot;
        } else if (node) {
          // set as a mountpoint
          node.mounted = mount;
  
          // add the new mount to the current mount's children
          if (node.mount) {
            node.mount.mounts.push(mount);
          }
        }
  
        return mountRoot;
      },unmount:function (mountpoint) {
        var lookup = FS.lookupPath(mountpoint, { follow_mount: false });
  
        if (!FS.isMountpoint(lookup.node)) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
  
        // destroy the nodes for this mount, and all its child mounts
        var node = lookup.node;
        var mount = node.mounted;
        var mounts = FS.getMounts(mount);
  
        Object.keys(FS.nameTable).forEach(function (hash) {
          var current = FS.nameTable[hash];
  
          while (current) {
            var next = current.name_next;
  
            if (mounts.indexOf(current.mount) !== -1) {
              FS.destroyNode(current);
            }
  
            current = next;
          }
        });
  
        // no longer a mountpoint
        node.mounted = null;
  
        // remove this mount from the child mounts
        var idx = node.mount.mounts.indexOf(mount);
        assert(idx !== -1);
        node.mount.mounts.splice(idx, 1);
      },lookup:function (parent, name) {
        return parent.node_ops.lookup(parent, name);
      },mknod:function (path, mode, dev) {
        var lookup = FS.lookupPath(path, { parent: true });
        var parent = lookup.node;
        var name = PATH.basename(path);
        var err = FS.mayCreate(parent, name);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        if (!parent.node_ops.mknod) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        return parent.node_ops.mknod(parent, name, mode, dev);
      },create:function (path, mode) {
        mode = mode !== undefined ? mode : 438 /* 0666 */;
        mode &= 4095;
        mode |= 32768;
        return FS.mknod(path, mode, 0);
      },mkdir:function (path, mode) {
        mode = mode !== undefined ? mode : 511 /* 0777 */;
        mode &= 511 | 512;
        mode |= 16384;
        return FS.mknod(path, mode, 0);
      },mkdev:function (path, mode, dev) {
        if (typeof(dev) === 'undefined') {
          dev = mode;
          mode = 438 /* 0666 */;
        }
        mode |= 8192;
        return FS.mknod(path, mode, dev);
      },symlink:function (oldpath, newpath) {
        var lookup = FS.lookupPath(newpath, { parent: true });
        var parent = lookup.node;
        var newname = PATH.basename(newpath);
        var err = FS.mayCreate(parent, newname);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        if (!parent.node_ops.symlink) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        return parent.node_ops.symlink(parent, newname, oldpath);
      },rename:function (old_path, new_path) {
        var old_dirname = PATH.dirname(old_path);
        var new_dirname = PATH.dirname(new_path);
        var old_name = PATH.basename(old_path);
        var new_name = PATH.basename(new_path);
        // parents must exist
        var lookup, old_dir, new_dir;
        try {
          lookup = FS.lookupPath(old_path, { parent: true });
          old_dir = lookup.node;
          lookup = FS.lookupPath(new_path, { parent: true });
          new_dir = lookup.node;
        } catch (e) {
          throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        }
        // need to be part of the same mount
        if (old_dir.mount !== new_dir.mount) {
          throw new FS.ErrnoError(ERRNO_CODES.EXDEV);
        }
        // source must exist
        var old_node = FS.lookupNode(old_dir, old_name);
        // old path should not be an ancestor of the new path
        var relative = PATH.relative(old_path, new_dirname);
        if (relative.charAt(0) !== '.') {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        // new path should not be an ancestor of the old path
        relative = PATH.relative(new_path, old_dirname);
        if (relative.charAt(0) !== '.') {
          throw new FS.ErrnoError(ERRNO_CODES.ENOTEMPTY);
        }
        // see if the new path already exists
        var new_node;
        try {
          new_node = FS.lookupNode(new_dir, new_name);
        } catch (e) {
          // not fatal
        }
        // early out if nothing needs to change
        if (old_node === new_node) {
          return;
        }
        // we'll need to delete the old entry
        var isdir = FS.isDir(old_node.mode);
        var err = FS.mayDelete(old_dir, old_name, isdir);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        // need delete permissions if we'll be overwriting.
        // need create permissions if new doesn't already exist.
        err = new_node ?
          FS.mayDelete(new_dir, new_name, isdir) :
          FS.mayCreate(new_dir, new_name);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        if (!old_dir.node_ops.rename) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (FS.isMountpoint(old_node) || (new_node && FS.isMountpoint(new_node))) {
          throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        }
        // if we are going to change the parent, check write permissions
        if (new_dir !== old_dir) {
          err = FS.nodePermissions(old_dir, 'w');
          if (err) {
            throw new FS.ErrnoError(err);
          }
        }
        try {
          if (FS.trackingDelegate['willMovePath']) {
            FS.trackingDelegate['willMovePath'](old_path, new_path);
          }
        } catch(e) {
          console.log("FS.trackingDelegate['willMovePath']('"+old_path+"', '"+new_path+"') threw an exception: " + e.message);
        }
        // remove the node from the lookup hash
        FS.hashRemoveNode(old_node);
        // do the underlying fs rename
        try {
          old_dir.node_ops.rename(old_node, new_dir, new_name);
        } catch (e) {
          throw e;
        } finally {
          // add the node back to the hash (in case node_ops.rename
          // changed its name)
          FS.hashAddNode(old_node);
        }
        try {
          if (FS.trackingDelegate['onMovePath']) FS.trackingDelegate['onMovePath'](old_path, new_path);
        } catch(e) {
          console.log("FS.trackingDelegate['onMovePath']('"+old_path+"', '"+new_path+"') threw an exception: " + e.message);
        }
      },rmdir:function (path) {
        var lookup = FS.lookupPath(path, { parent: true });
        var parent = lookup.node;
        var name = PATH.basename(path);
        var node = FS.lookupNode(parent, name);
        var err = FS.mayDelete(parent, name, true);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        if (!parent.node_ops.rmdir) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (FS.isMountpoint(node)) {
          throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        }
        try {
          if (FS.trackingDelegate['willDeletePath']) {
            FS.trackingDelegate['willDeletePath'](path);
          }
        } catch(e) {
          console.log("FS.trackingDelegate['willDeletePath']('"+path+"') threw an exception: " + e.message);
        }
        parent.node_ops.rmdir(parent, name);
        FS.destroyNode(node);
        try {
          if (FS.trackingDelegate['onDeletePath']) FS.trackingDelegate['onDeletePath'](path);
        } catch(e) {
          console.log("FS.trackingDelegate['onDeletePath']('"+path+"') threw an exception: " + e.message);
        }
      },readdir:function (path) {
        var lookup = FS.lookupPath(path, { follow: true });
        var node = lookup.node;
        if (!node.node_ops.readdir) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOTDIR);
        }
        return node.node_ops.readdir(node);
      },unlink:function (path) {
        var lookup = FS.lookupPath(path, { parent: true });
        var parent = lookup.node;
        var name = PATH.basename(path);
        var node = FS.lookupNode(parent, name);
        var err = FS.mayDelete(parent, name, false);
        if (err) {
          // POSIX says unlink should set EPERM, not EISDIR
          if (err === ERRNO_CODES.EISDIR) err = ERRNO_CODES.EPERM;
          throw new FS.ErrnoError(err);
        }
        if (!parent.node_ops.unlink) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (FS.isMountpoint(node)) {
          throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        }
        try {
          if (FS.trackingDelegate['willDeletePath']) {
            FS.trackingDelegate['willDeletePath'](path);
          }
        } catch(e) {
          console.log("FS.trackingDelegate['willDeletePath']('"+path+"') threw an exception: " + e.message);
        }
        parent.node_ops.unlink(parent, name);
        FS.destroyNode(node);
        try {
          if (FS.trackingDelegate['onDeletePath']) FS.trackingDelegate['onDeletePath'](path);
        } catch(e) {
          console.log("FS.trackingDelegate['onDeletePath']('"+path+"') threw an exception: " + e.message);
        }
      },readlink:function (path) {
        var lookup = FS.lookupPath(path);
        var link = lookup.node;
        if (!link.node_ops.readlink) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        return link.node_ops.readlink(link);
      },stat:function (path, dontFollow) {
        var lookup = FS.lookupPath(path, { follow: !dontFollow });
        var node = lookup.node;
        if (!node.node_ops.getattr) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        return node.node_ops.getattr(node);
      },lstat:function (path) {
        return FS.stat(path, true);
      },chmod:function (path, mode, dontFollow) {
        var node;
        if (typeof path === 'string') {
          var lookup = FS.lookupPath(path, { follow: !dontFollow });
          node = lookup.node;
        } else {
          node = path;
        }
        if (!node.node_ops.setattr) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        node.node_ops.setattr(node, {
          mode: (mode & 4095) | (node.mode & ~4095),
          timestamp: Date.now()
        });
      },lchmod:function (path, mode) {
        FS.chmod(path, mode, true);
      },fchmod:function (fd, mode) {
        var stream = FS.getStream(fd);
        if (!stream) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        FS.chmod(stream.node, mode);
      },chown:function (path, uid, gid, dontFollow) {
        var node;
        if (typeof path === 'string') {
          var lookup = FS.lookupPath(path, { follow: !dontFollow });
          node = lookup.node;
        } else {
          node = path;
        }
        if (!node.node_ops.setattr) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        node.node_ops.setattr(node, {
          timestamp: Date.now()
          // we ignore the uid / gid for now
        });
      },lchown:function (path, uid, gid) {
        FS.chown(path, uid, gid, true);
      },fchown:function (fd, uid, gid) {
        var stream = FS.getStream(fd);
        if (!stream) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        FS.chown(stream.node, uid, gid);
      },truncate:function (path, len) {
        if (len < 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var node;
        if (typeof path === 'string') {
          var lookup = FS.lookupPath(path, { follow: true });
          node = lookup.node;
        } else {
          node = path;
        }
        if (!node.node_ops.setattr) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (FS.isDir(node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EISDIR);
        }
        if (!FS.isFile(node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var err = FS.nodePermissions(node, 'w');
        if (err) {
          throw new FS.ErrnoError(err);
        }
        node.node_ops.setattr(node, {
          size: len,
          timestamp: Date.now()
        });
      },ftruncate:function (fd, len) {
        var stream = FS.getStream(fd);
        if (!stream) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        if ((stream.flags & 2097155) === 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        FS.truncate(stream.node, len);
      },utime:function (path, atime, mtime) {
        var lookup = FS.lookupPath(path, { follow: true });
        var node = lookup.node;
        node.node_ops.setattr(node, {
          timestamp: Math.max(atime, mtime)
        });
      },open:function (path, flags, mode, fd_start, fd_end) {
        if (path === "") {
          throw new FS.ErrnoError(ERRNO_CODES.ENOENT);
        }
        flags = typeof flags === 'string' ? FS.modeStringToFlags(flags) : flags;
        mode = typeof mode === 'undefined' ? 438 /* 0666 */ : mode;
        if ((flags & 64)) {
          mode = (mode & 4095) | 32768;
        } else {
          mode = 0;
        }
        var node;
        if (typeof path === 'object') {
          node = path;
        } else {
          path = PATH.normalize(path);
          try {
            var lookup = FS.lookupPath(path, {
              follow: !(flags & 131072)
            });
            node = lookup.node;
          } catch (e) {
            // ignore
          }
        }
        // perhaps we need to create the node
        if ((flags & 64)) {
          if (node) {
            // if O_CREAT and O_EXCL are set, error out if the node already exists
            if ((flags & 128)) {
              throw new FS.ErrnoError(ERRNO_CODES.EEXIST);
            }
          } else {
            // node doesn't exist, try to create it
            node = FS.mknod(path, mode, 0);
          }
        }
        if (!node) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOENT);
        }
        // can't truncate a device
        if (FS.isChrdev(node.mode)) {
          flags &= ~512;
        }
        // check permissions
        var err = FS.mayOpen(node, flags);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        // do truncation if necessary
        if ((flags & 512)) {
          FS.truncate(node, 0);
        }
        // we've already handled these, don't pass down to the underlying vfs
        flags &= ~(128 | 512);
  
        // register the stream with the filesystem
        var stream = FS.createStream({
          node: node,
          path: FS.getPath(node),  // we want the absolute path to the node
          flags: flags,
          seekable: true,
          position: 0,
          stream_ops: node.stream_ops,
          // used by the file family libc calls (fopen, fwrite, ferror, etc.)
          ungotten: [],
          error: false
        }, fd_start, fd_end);
        // call the new stream's open function
        if (stream.stream_ops.open) {
          stream.stream_ops.open(stream);
        }
        if (Module['logReadFiles'] && !(flags & 1)) {
          if (!FS.readFiles) FS.readFiles = {};
          if (!(path in FS.readFiles)) {
            FS.readFiles[path] = 1;
            Module['printErr']('read file: ' + path);
          }
        }
        try {
          if (FS.trackingDelegate['onOpenFile']) {
            var trackingFlags = 0;
            if ((flags & 2097155) !== 1) {
              trackingFlags |= FS.tracking.openFlags.READ;
            }
            if ((flags & 2097155) !== 0) {
              trackingFlags |= FS.tracking.openFlags.WRITE;
            }
            FS.trackingDelegate['onOpenFile'](path, trackingFlags);
          }
        } catch(e) {
          console.log("FS.trackingDelegate['onOpenFile']('"+path+"', flags) threw an exception: " + e.message);
        }
        return stream;
      },close:function (stream) {
        try {
          if (stream.stream_ops.close) {
            stream.stream_ops.close(stream);
          }
        } catch (e) {
          throw e;
        } finally {
          FS.closeStream(stream.fd);
        }
      },llseek:function (stream, offset, whence) {
        if (!stream.seekable || !stream.stream_ops.llseek) {
          throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
        }
        return stream.stream_ops.llseek(stream, offset, whence);
      },read:function (stream, buffer, offset, length, position) {
        if (length < 0 || position < 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        if ((stream.flags & 2097155) === 1) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        if (FS.isDir(stream.node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EISDIR);
        }
        if (!stream.stream_ops.read) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var seeking = true;
        if (typeof position === 'undefined') {
          position = stream.position;
          seeking = false;
        } else if (!stream.seekable) {
          throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
        }
        var bytesRead = stream.stream_ops.read(stream, buffer, offset, length, position);
        if (!seeking) stream.position += bytesRead;
        return bytesRead;
      },write:function (stream, buffer, offset, length, position, canOwn) {
        if (length < 0 || position < 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        if ((stream.flags & 2097155) === 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        if (FS.isDir(stream.node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EISDIR);
        }
        if (!stream.stream_ops.write) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        if (stream.flags & 1024) {
          // seek to the end before writing in append mode
          FS.llseek(stream, 0, 2);
        }
        var seeking = true;
        if (typeof position === 'undefined') {
          position = stream.position;
          seeking = false;
        } else if (!stream.seekable) {
          throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
        }
        var bytesWritten = stream.stream_ops.write(stream, buffer, offset, length, position, canOwn);
        if (!seeking) stream.position += bytesWritten;
        try {
          if (stream.path && FS.trackingDelegate['onWriteToFile']) FS.trackingDelegate['onWriteToFile'](stream.path);
        } catch(e) {
          console.log("FS.trackingDelegate['onWriteToFile']('"+path+"') threw an exception: " + e.message);
        }
        return bytesWritten;
      },allocate:function (stream, offset, length) {
        if (offset < 0 || length <= 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        if ((stream.flags & 2097155) === 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        if (!FS.isFile(stream.node.mode) && !FS.isDir(node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
        }
        if (!stream.stream_ops.allocate) {
          throw new FS.ErrnoError(ERRNO_CODES.EOPNOTSUPP);
        }
        stream.stream_ops.allocate(stream, offset, length);
      },mmap:function (stream, buffer, offset, length, position, prot, flags) {
        // TODO if PROT is PROT_WRITE, make sure we have write access
        if ((stream.flags & 2097155) === 1) {
          throw new FS.ErrnoError(ERRNO_CODES.EACCES);
        }
        if (!stream.stream_ops.mmap) {
          throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
        }
        return stream.stream_ops.mmap(stream, buffer, offset, length, position, prot, flags);
      },ioctl:function (stream, cmd, arg) {
        if (!stream.stream_ops.ioctl) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOTTY);
        }
        return stream.stream_ops.ioctl(stream, cmd, arg);
      },readFile:function (path, opts) {
        opts = opts || {};
        opts.flags = opts.flags || 'r';
        opts.encoding = opts.encoding || 'binary';
        if (opts.encoding !== 'utf8' && opts.encoding !== 'binary') {
          throw new Error('Invalid encoding type "' + opts.encoding + '"');
        }
        var ret;
        var stream = FS.open(path, opts.flags);
        var stat = FS.stat(path);
        var length = stat.size;
        var buf = new Uint8Array(length);
        FS.read(stream, buf, 0, length, 0);
        if (opts.encoding === 'utf8') {
          ret = '';
          var utf8 = new Runtime.UTF8Processor();
          for (var i = 0; i < length; i++) {
            ret += utf8.processCChar(buf[i]);
          }
        } else if (opts.encoding === 'binary') {
          ret = buf;
        }
        FS.close(stream);
        return ret;
      },writeFile:function (path, data, opts) {
        opts = opts || {};
        opts.flags = opts.flags || 'w';
        opts.encoding = opts.encoding || 'utf8';
        if (opts.encoding !== 'utf8' && opts.encoding !== 'binary') {
          throw new Error('Invalid encoding type "' + opts.encoding + '"');
        }
        var stream = FS.open(path, opts.flags, opts.mode);
        if (opts.encoding === 'utf8') {
          var utf8 = new Runtime.UTF8Processor();
          var buf = new Uint8Array(utf8.processJSString(data));
          FS.write(stream, buf, 0, buf.length, 0, opts.canOwn);
        } else if (opts.encoding === 'binary') {
          FS.write(stream, data, 0, data.length, 0, opts.canOwn);
        }
        FS.close(stream);
      },cwd:function () {
        return FS.currentPath;
      },chdir:function (path) {
        var lookup = FS.lookupPath(path, { follow: true });
        if (!FS.isDir(lookup.node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOTDIR);
        }
        var err = FS.nodePermissions(lookup.node, 'x');
        if (err) {
          throw new FS.ErrnoError(err);
        }
        FS.currentPath = lookup.path;
      },createDefaultDirectories:function () {
        FS.mkdir('/tmp');
      },createDefaultDevices:function () {
        // create /dev
        FS.mkdir('/dev');
        // setup /dev/null
        FS.registerDevice(FS.makedev(1, 3), {
          read: function() { return 0; },
          write: function() { return 0; }
        });
        FS.mkdev('/dev/null', FS.makedev(1, 3));
        // setup /dev/tty and /dev/tty1
        // stderr needs to print output using Module['printErr']
        // so we register a second tty just for it.
        TTY.register(FS.makedev(5, 0), TTY.default_tty_ops);
        TTY.register(FS.makedev(6, 0), TTY.default_tty1_ops);
        FS.mkdev('/dev/tty', FS.makedev(5, 0));
        FS.mkdev('/dev/tty1', FS.makedev(6, 0));
        // setup /dev/[u]random
        var random_device;
        if (typeof crypto !== 'undefined') {
          // for modern web browsers
          var randomBuffer = new Uint8Array(1);
          random_device = function() { crypto.getRandomValues(randomBuffer); return randomBuffer[0]; };
        } else if (ENVIRONMENT_IS_NODE) {
          // for nodejs
          random_device = function() { return require('crypto').randomBytes(1)[0]; };
        } else {
          // default for ES5 platforms
          random_device = function() { return Math.floor(Math.random()*256); };
        }
        FS.createDevice('/dev', 'random', random_device);
        FS.createDevice('/dev', 'urandom', random_device);
        // we're not going to emulate the actual shm device,
        // just create the tmp dirs that reside in it commonly
        FS.mkdir('/dev/shm');
        FS.mkdir('/dev/shm/tmp');
      },createStandardStreams:function () {
        // TODO deprecate the old functionality of a single
        // input / output callback and that utilizes FS.createDevice
        // and instead require a unique set of stream ops
  
        // by default, we symlink the standard streams to the
        // default tty devices. however, if the standard streams
        // have been overwritten we create a unique device for
        // them instead.
        if (Module['stdin']) {
          FS.createDevice('/dev', 'stdin', Module['stdin']);
        } else {
          FS.symlink('/dev/tty', '/dev/stdin');
        }
        if (Module['stdout']) {
          FS.createDevice('/dev', 'stdout', null, Module['stdout']);
        } else {
          FS.symlink('/dev/tty', '/dev/stdout');
        }
        if (Module['stderr']) {
          FS.createDevice('/dev', 'stderr', null, Module['stderr']);
        } else {
          FS.symlink('/dev/tty1', '/dev/stderr');
        }
  
        // open default streams for the stdin, stdout and stderr devices
        var stdin = FS.open('/dev/stdin', 'r');
        HEAP32[((_stdin)>>2)]=FS.getPtrForStream(stdin);
        assert(stdin.fd === 0, 'invalid handle for stdin (' + stdin.fd + ')');
  
        var stdout = FS.open('/dev/stdout', 'w');
        HEAP32[((_stdout)>>2)]=FS.getPtrForStream(stdout);
        assert(stdout.fd === 1, 'invalid handle for stdout (' + stdout.fd + ')');
  
        var stderr = FS.open('/dev/stderr', 'w');
        HEAP32[((_stderr)>>2)]=FS.getPtrForStream(stderr);
        assert(stderr.fd === 2, 'invalid handle for stderr (' + stderr.fd + ')');
      },ensureErrnoError:function () {
        if (FS.ErrnoError) return;
        FS.ErrnoError = function ErrnoError(errno) {
          this.errno = errno;
          for (var key in ERRNO_CODES) {
            if (ERRNO_CODES[key] === errno) {
              this.code = key;
              break;
            }
          }
          this.message = ERRNO_MESSAGES[errno];
        };
        FS.ErrnoError.prototype = new Error();
        FS.ErrnoError.prototype.constructor = FS.ErrnoError;
        // Some errors may happen quite a bit, to avoid overhead we reuse them (and suffer a lack of stack info)
        [ERRNO_CODES.ENOENT].forEach(function(code) {
          FS.genericErrors[code] = new FS.ErrnoError(code);
          FS.genericErrors[code].stack = '<generic error, no stack>';
        });
      },staticInit:function () {
        FS.ensureErrnoError();
  
        FS.nameTable = new Array(4096);
  
        FS.mount(MEMFS, {}, '/');
  
        FS.createDefaultDirectories();
        FS.createDefaultDevices();
      },init:function (input, output, error) {
        assert(!FS.init.initialized, 'FS.init was previously called. If you want to initialize later with custom parameters, remove any earlier calls (note that one is automatically added to the generated code)');
        FS.init.initialized = true;
  
        FS.ensureErrnoError();
  
        // Allow Module.stdin etc. to provide defaults, if none explicitly passed to us here
        Module['stdin'] = input || Module['stdin'];
        Module['stdout'] = output || Module['stdout'];
        Module['stderr'] = error || Module['stderr'];
  
        FS.createStandardStreams();
      },quit:function () {
        FS.init.initialized = false;
        for (var i = 0; i < FS.streams.length; i++) {
          var stream = FS.streams[i];
          if (!stream) {
            continue;
          }
          FS.close(stream);
        }
      },getMode:function (canRead, canWrite) {
        var mode = 0;
        if (canRead) mode |= 292 | 73;
        if (canWrite) mode |= 146;
        return mode;
      },joinPath:function (parts, forceRelative) {
        var path = PATH.join.apply(null, parts);
        if (forceRelative && path[0] == '/') path = path.substr(1);
        return path;
      },absolutePath:function (relative, base) {
        return PATH.resolve(base, relative);
      },standardizePath:function (path) {
        return PATH.normalize(path);
      },findObject:function (path, dontResolveLastLink) {
        var ret = FS.analyzePath(path, dontResolveLastLink);
        if (ret.exists) {
          return ret.object;
        } else {
          ___setErrNo(ret.error);
          return null;
        }
      },analyzePath:function (path, dontResolveLastLink) {
        // operate from within the context of the symlink's target
        try {
          var lookup = FS.lookupPath(path, { follow: !dontResolveLastLink });
          path = lookup.path;
        } catch (e) {
        }
        var ret = {
          isRoot: false, exists: false, error: 0, name: null, path: null, object: null,
          parentExists: false, parentPath: null, parentObject: null
        };
        try {
          var lookup = FS.lookupPath(path, { parent: true });
          ret.parentExists = true;
          ret.parentPath = lookup.path;
          ret.parentObject = lookup.node;
          ret.name = PATH.basename(path);
          lookup = FS.lookupPath(path, { follow: !dontResolveLastLink });
          ret.exists = true;
          ret.path = lookup.path;
          ret.object = lookup.node;
          ret.name = lookup.node.name;
          ret.isRoot = lookup.path === '/';
        } catch (e) {
          ret.error = e.errno;
        };
        return ret;
      },createFolder:function (parent, name, canRead, canWrite) {
        var path = PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name);
        var mode = FS.getMode(canRead, canWrite);
        return FS.mkdir(path, mode);
      },createPath:function (parent, path, canRead, canWrite) {
        parent = typeof parent === 'string' ? parent : FS.getPath(parent);
        var parts = path.split('/').reverse();
        while (parts.length) {
          var part = parts.pop();
          if (!part) continue;
          var current = PATH.join2(parent, part);
          try {
            FS.mkdir(current);
          } catch (e) {
            // ignore EEXIST
          }
          parent = current;
        }
        return current;
      },createFile:function (parent, name, properties, canRead, canWrite) {
        var path = PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name);
        var mode = FS.getMode(canRead, canWrite);
        return FS.create(path, mode);
      },createDataFile:function (parent, name, data, canRead, canWrite, canOwn) {
        var path = name ? PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name) : parent;
        var mode = FS.getMode(canRead, canWrite);
        var node = FS.create(path, mode);
        if (data) {
          if (typeof data === 'string') {
            var arr = new Array(data.length);
            for (var i = 0, len = data.length; i < len; ++i) arr[i] = data.charCodeAt(i);
            data = arr;
          }
          // make sure we can write to the file
          FS.chmod(node, mode | 146);
          var stream = FS.open(node, 'w');
          FS.write(stream, data, 0, data.length, 0, canOwn);
          FS.close(stream);
          FS.chmod(node, mode);
        }
        return node;
      },createDevice:function (parent, name, input, output) {
        var path = PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name);
        var mode = FS.getMode(!!input, !!output);
        if (!FS.createDevice.major) FS.createDevice.major = 64;
        var dev = FS.makedev(FS.createDevice.major++, 0);
        // Create a fake device that a set of stream ops to emulate
        // the old behavior.
        FS.registerDevice(dev, {
          open: function(stream) {
            stream.seekable = false;
          },
          close: function(stream) {
            // flush any pending line data
            if (output && output.buffer && output.buffer.length) {
              output(10);
            }
          },
          read: function(stream, buffer, offset, length, pos /* ignored */) {
            var bytesRead = 0;
            for (var i = 0; i < length; i++) {
              var result;
              try {
                result = input();
              } catch (e) {
                throw new FS.ErrnoError(ERRNO_CODES.EIO);
              }
              if (result === undefined && bytesRead === 0) {
                throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
              }
              if (result === null || result === undefined) break;
              bytesRead++;
              buffer[offset+i] = result;
            }
            if (bytesRead) {
              stream.node.timestamp = Date.now();
            }
            return bytesRead;
          },
          write: function(stream, buffer, offset, length, pos) {
            for (var i = 0; i < length; i++) {
              try {
                output(buffer[offset+i]);
              } catch (e) {
                throw new FS.ErrnoError(ERRNO_CODES.EIO);
              }
            }
            if (length) {
              stream.node.timestamp = Date.now();
            }
            return i;
          }
        });
        return FS.mkdev(path, mode, dev);
      },createLink:function (parent, name, target, canRead, canWrite) {
        var path = PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name);
        return FS.symlink(target, path);
      },forceLoadFile:function (obj) {
        if (obj.isDevice || obj.isFolder || obj.link || obj.contents) return true;
        var success = true;
        if (typeof XMLHttpRequest !== 'undefined') {
          throw new Error("Lazy loading should have been performed (contents set) in createLazyFile, but it was not. Lazy loading only works in web workers. Use --embed-file or --preload-file in emcc on the main thread.");
        } else if (Module['read']) {
          // Command-line.
          try {
            // WARNING: Can't read binary files in V8's d8 or tracemonkey's js, as
            //          read() will try to parse UTF8.
            obj.contents = intArrayFromString(Module['read'](obj.url), true);
            obj.usedBytes = obj.contents.length;
          } catch (e) {
            success = false;
          }
        } else {
          throw new Error('Cannot load without read() or XMLHttpRequest.');
        }
        if (!success) ___setErrNo(ERRNO_CODES.EIO);
        return success;
      },createLazyFile:function (parent, name, url, canRead, canWrite) {
        // Lazy chunked Uint8Array (implements get and length from Uint8Array). Actual getting is abstracted away for eventual reuse.
        function LazyUint8Array() {
          this.lengthKnown = false;
          this.chunks = []; // Loaded chunks. Index is the chunk number
        }
        LazyUint8Array.prototype.get = function LazyUint8Array_get(idx) {
          if (idx > this.length-1 || idx < 0) {
            return undefined;
          }
          var chunkOffset = idx % this.chunkSize;
          var chunkNum = Math.floor(idx / this.chunkSize);
          return this.getter(chunkNum)[chunkOffset];
        }
        LazyUint8Array.prototype.setDataGetter = function LazyUint8Array_setDataGetter(getter) {
          this.getter = getter;
        }
        LazyUint8Array.prototype.cacheLength = function LazyUint8Array_cacheLength() {
            // Find length
            var xhr = new XMLHttpRequest();
            xhr.open('HEAD', url, false);
            xhr.send(null);
            if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304)) throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
            var datalength = Number(xhr.getResponseHeader("Content-length"));
            var header;
            var hasByteServing = (header = xhr.getResponseHeader("Accept-Ranges")) && header === "bytes";
            var chunkSize = 1024*1024; // Chunk size in bytes
  
            if (!hasByteServing) chunkSize = datalength;
  
            // Function to get a range from the remote URL.
            var doXHR = (function(from, to) {
              if (from > to) throw new Error("invalid range (" + from + ", " + to + ") or no bytes requested!");
              if (to > datalength-1) throw new Error("only " + datalength + " bytes available! programmer error!");
  
              // TODO: Use mozResponseArrayBuffer, responseStream, etc. if available.
              var xhr = new XMLHttpRequest();
              xhr.open('GET', url, false);
              if (datalength !== chunkSize) xhr.setRequestHeader("Range", "bytes=" + from + "-" + to);
  
              // Some hints to the browser that we want binary data.
              if (typeof Uint8Array != 'undefined') xhr.responseType = 'arraybuffer';
              if (xhr.overrideMimeType) {
                xhr.overrideMimeType('text/plain; charset=x-user-defined');
              }
  
              xhr.send(null);
              if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304)) throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
              if (xhr.response !== undefined) {
                return new Uint8Array(xhr.response || []);
              } else {
                return intArrayFromString(xhr.responseText || '', true);
              }
            });
            var lazyArray = this;
            lazyArray.setDataGetter(function(chunkNum) {
              var start = chunkNum * chunkSize;
              var end = (chunkNum+1) * chunkSize - 1; // including this byte
              end = Math.min(end, datalength-1); // if datalength-1 is selected, this is the last block
              if (typeof(lazyArray.chunks[chunkNum]) === "undefined") {
                lazyArray.chunks[chunkNum] = doXHR(start, end);
              }
              if (typeof(lazyArray.chunks[chunkNum]) === "undefined") throw new Error("doXHR failed!");
              return lazyArray.chunks[chunkNum];
            });
  
            this._length = datalength;
            this._chunkSize = chunkSize;
            this.lengthKnown = true;
        }
        if (typeof XMLHttpRequest !== 'undefined') {
          if (!ENVIRONMENT_IS_WORKER) throw 'Cannot do synchronous binary XHRs outside webworkers in modern browsers. Use --embed-file or --preload-file in emcc';
          var lazyArray = new LazyUint8Array();
          Object.defineProperty(lazyArray, "length", {
              get: function() {
                  if(!this.lengthKnown) {
                      this.cacheLength();
                  }
                  return this._length;
              }
          });
          Object.defineProperty(lazyArray, "chunkSize", {
              get: function() {
                  if(!this.lengthKnown) {
                      this.cacheLength();
                  }
                  return this._chunkSize;
              }
          });
  
          var properties = { isDevice: false, contents: lazyArray };
        } else {
          var properties = { isDevice: false, url: url };
        }
  
        var node = FS.createFile(parent, name, properties, canRead, canWrite);
        // This is a total hack, but I want to get this lazy file code out of the
        // core of MEMFS. If we want to keep this lazy file concept I feel it should
        // be its own thin LAZYFS proxying calls to MEMFS.
        if (properties.contents) {
          node.contents = properties.contents;
        } else if (properties.url) {
          node.contents = null;
          node.url = properties.url;
        }
        // Add a function that defers querying the file size until it is asked the first time.
        Object.defineProperty(node, "usedBytes", {
            get: function() { return this.contents.length; }
        });
        // override each stream op with one that tries to force load the lazy file first
        var stream_ops = {};
        var keys = Object.keys(node.stream_ops);
        keys.forEach(function(key) {
          var fn = node.stream_ops[key];
          stream_ops[key] = function forceLoadLazyFile() {
            if (!FS.forceLoadFile(node)) {
              throw new FS.ErrnoError(ERRNO_CODES.EIO);
            }
            return fn.apply(null, arguments);
          };
        });
        // use a custom read function
        stream_ops.read = function stream_ops_read(stream, buffer, offset, length, position) {
          if (!FS.forceLoadFile(node)) {
            throw new FS.ErrnoError(ERRNO_CODES.EIO);
          }
          var contents = stream.node.contents;
          if (position >= contents.length)
            return 0;
          var size = Math.min(contents.length - position, length);
          assert(size >= 0);
          if (contents.slice) { // normal array
            for (var i = 0; i < size; i++) {
              buffer[offset + i] = contents[position + i];
            }
          } else {
            for (var i = 0; i < size; i++) { // LazyUint8Array from sync binary XHR
              buffer[offset + i] = contents.get(position + i);
            }
          }
          return size;
        };
        node.stream_ops = stream_ops;
        return node;
      },createPreloadedFile:function (parent, name, url, canRead, canWrite, onload, onerror, dontCreateFile, canOwn) {
        Browser.init();
        // TODO we should allow people to just pass in a complete filename instead
        // of parent and name being that we just join them anyways
        var fullname = name ? PATH.resolve(PATH.join2(parent, name)) : parent;
        function processData(byteArray) {
          function finish(byteArray) {
            if (!dontCreateFile) {
              FS.createDataFile(parent, name, byteArray, canRead, canWrite, canOwn);
            }
            if (onload) onload();
            removeRunDependency('cp ' + fullname);
          }
          var handled = false;
          Module['preloadPlugins'].forEach(function(plugin) {
            if (handled) return;
            if (plugin['canHandle'](fullname)) {
              plugin['handle'](byteArray, fullname, finish, function() {
                if (onerror) onerror();
                removeRunDependency('cp ' + fullname);
              });
              handled = true;
            }
          });
          if (!handled) finish(byteArray);
        }
        addRunDependency('cp ' + fullname);
        if (typeof url == 'string') {
          Browser.asyncLoad(url, function(byteArray) {
            processData(byteArray);
          }, onerror);
        } else {
          processData(url);
        }
      },indexedDB:function () {
        return window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
      },DB_NAME:function () {
        return 'EM_FS_' + window.location.pathname;
      },DB_VERSION:20,DB_STORE_NAME:"FILE_DATA",saveFilesToDB:function (paths, onload, onerror) {
        onload = onload || function(){};
        onerror = onerror || function(){};
        var indexedDB = FS.indexedDB();
        try {
          var openRequest = indexedDB.open(FS.DB_NAME(), FS.DB_VERSION);
        } catch (e) {
          return onerror(e);
        }
        openRequest.onupgradeneeded = function openRequest_onupgradeneeded() {
          console.log('creating db');
          var db = openRequest.result;
          db.createObjectStore(FS.DB_STORE_NAME);
        };
        openRequest.onsuccess = function openRequest_onsuccess() {
          var db = openRequest.result;
          var transaction = db.transaction([FS.DB_STORE_NAME], 'readwrite');
          var files = transaction.objectStore(FS.DB_STORE_NAME);
          var ok = 0, fail = 0, total = paths.length;
          function finish() {
            if (fail == 0) onload(); else onerror();
          }
          paths.forEach(function(path) {
            var putRequest = files.put(FS.analyzePath(path).object.contents, path);
            putRequest.onsuccess = function putRequest_onsuccess() { ok++; if (ok + fail == total) finish() };
            putRequest.onerror = function putRequest_onerror() { fail++; if (ok + fail == total) finish() };
          });
          transaction.onerror = onerror;
        };
        openRequest.onerror = onerror;
      },loadFilesFromDB:function (paths, onload, onerror) {
        onload = onload || function(){};
        onerror = onerror || function(){};
        var indexedDB = FS.indexedDB();
        try {
          var openRequest = indexedDB.open(FS.DB_NAME(), FS.DB_VERSION);
        } catch (e) {
          return onerror(e);
        }
        openRequest.onupgradeneeded = onerror; // no database to load from
        openRequest.onsuccess = function openRequest_onsuccess() {
          var db = openRequest.result;
          try {
            var transaction = db.transaction([FS.DB_STORE_NAME], 'readonly');
          } catch(e) {
            onerror(e);
            return;
          }
          var files = transaction.objectStore(FS.DB_STORE_NAME);
          var ok = 0, fail = 0, total = paths.length;
          function finish() {
            if (fail == 0) onload(); else onerror();
          }
          paths.forEach(function(path) {
            var getRequest = files.get(path);
            getRequest.onsuccess = function getRequest_onsuccess() {
              if (FS.analyzePath(path).exists) {
                FS.unlink(path);
              }
              FS.createDataFile(PATH.dirname(path), PATH.basename(path), getRequest.result, true, true, true);
              ok++;
              if (ok + fail == total) finish();
            };
            getRequest.onerror = function getRequest_onerror() { fail++; if (ok + fail == total) finish() };
          });
          transaction.onerror = onerror;
        };
        openRequest.onerror = onerror;
      }};
  
  
  
  
  function _mkport() { throw 'TODO' }var SOCKFS={mount:function (mount) {
        return FS.createNode(null, '/', 16384 | 511 /* 0777 */, 0);
      },createSocket:function (family, type, protocol) {
        var streaming = type == 1;
        if (protocol) {
          assert(streaming == (protocol == 6)); // if SOCK_STREAM, must be tcp
        }
  
        // create our internal socket structure
        var sock = {
          family: family,
          type: type,
          protocol: protocol,
          server: null,
          peers: {},
          pending: [],
          recv_queue: [],
          sock_ops: SOCKFS.websocket_sock_ops
        };
  
        // create the filesystem node to store the socket structure
        var name = SOCKFS.nextname();
        var node = FS.createNode(SOCKFS.root, name, 49152, 0);
        node.sock = sock;
  
        // and the wrapping stream that enables library functions such
        // as read and write to indirectly interact with the socket
        var stream = FS.createStream({
          path: name,
          node: node,
          flags: FS.modeStringToFlags('r+'),
          seekable: false,
          stream_ops: SOCKFS.stream_ops
        });
  
        // map the new stream to the socket structure (sockets have a 1:1
        // relationship with a stream)
        sock.stream = stream;
  
        return sock;
      },getSocket:function (fd) {
        var stream = FS.getStream(fd);
        if (!stream || !FS.isSocket(stream.node.mode)) {
          return null;
        }
        return stream.node.sock;
      },stream_ops:{poll:function (stream) {
          var sock = stream.node.sock;
          return sock.sock_ops.poll(sock);
        },ioctl:function (stream, request, varargs) {
          var sock = stream.node.sock;
          return sock.sock_ops.ioctl(sock, request, varargs);
        },read:function (stream, buffer, offset, length, position /* ignored */) {
          var sock = stream.node.sock;
          var msg = sock.sock_ops.recvmsg(sock, length);
          if (!msg) {
            // socket is closed
            return 0;
          }
          buffer.set(msg.buffer, offset);
          return msg.buffer.length;
        },write:function (stream, buffer, offset, length, position /* ignored */) {
          var sock = stream.node.sock;
          return sock.sock_ops.sendmsg(sock, buffer, offset, length);
        },close:function (stream) {
          var sock = stream.node.sock;
          sock.sock_ops.close(sock);
        }},nextname:function () {
        if (!SOCKFS.nextname.current) {
          SOCKFS.nextname.current = 0;
        }
        return 'socket[' + (SOCKFS.nextname.current++) + ']';
      },websocket_sock_ops:{createPeer:function (sock, addr, port) {
          var ws;
  
          if (typeof addr === 'object') {
            ws = addr;
            addr = null;
            port = null;
          }
  
          if (ws) {
            // for sockets that've already connected (e.g. we're the server)
            // we can inspect the _socket property for the address
            if (ws._socket) {
              addr = ws._socket.remoteAddress;
              port = ws._socket.remotePort;
            }
            // if we're just now initializing a connection to the remote,
            // inspect the url property
            else {
              var result = /ws[s]?:\/\/([^:]+):(\d+)/.exec(ws.url);
              if (!result) {
                throw new Error('WebSocket URL must be in the format ws(s)://address:port');
              }
              addr = result[1];
              port = parseInt(result[2], 10);
            }
          } else {
            // create the actual websocket object and connect
            try {
              // runtimeConfig gets set to true if WebSocket runtime configuration is available.
              var runtimeConfig = (Module['websocket'] && ('object' === typeof Module['websocket']));
  
              // The default value is 'ws://' the replace is needed because the compiler replaces "//" comments with '#'
              // comments without checking context, so we'd end up with ws:#, the replace swaps the "#" for "//" again.
              var url = 'ws:#'.replace('#', '//');
  
              if (runtimeConfig) {
                if ('string' === typeof Module['websocket']['url']) {
                  url = Module['websocket']['url']; // Fetch runtime WebSocket URL config.
                }
              }
  
              if (url === 'ws://' || url === 'wss://') { // Is the supplied URL config just a prefix, if so complete it.
                url = url + addr + ':' + port;
              }
  
              // Make the WebSocket subprotocol (Sec-WebSocket-Protocol) default to binary if no configuration is set.
              var subProtocols = 'binary'; // The default value is 'binary'
  
              if (runtimeConfig) {
                if ('string' === typeof Module['websocket']['subprotocol']) {
                  subProtocols = Module['websocket']['subprotocol']; // Fetch runtime WebSocket subprotocol config.
                }
              }
  
              // The regex trims the string (removes spaces at the beginning and end, then splits the string by
              // <any space>,<any space> into an Array. Whitespace removal is important for Websockify and ws.
              subProtocols = subProtocols.replace(/^ +| +$/g,"").split(/ *, */);
  
              // The node ws library API for specifying optional subprotocol is slightly different than the browser's.
              var opts = ENVIRONMENT_IS_NODE ? {'protocol': subProtocols.toString()} : subProtocols;
  
              // If node we use the ws library.
              var WebSocket = ENVIRONMENT_IS_NODE ? require('ws') : window['WebSocket'];
              ws = new WebSocket(url, opts);
              ws.binaryType = 'arraybuffer';
            } catch (e) {
              throw new FS.ErrnoError(ERRNO_CODES.EHOSTUNREACH);
            }
          }
  
  
          var peer = {
            addr: addr,
            port: port,
            socket: ws,
            dgram_send_queue: []
          };
  
          SOCKFS.websocket_sock_ops.addPeer(sock, peer);
          SOCKFS.websocket_sock_ops.handlePeerEvents(sock, peer);
  
          // if this is a bound dgram socket, send the port number first to allow
          // us to override the ephemeral port reported to us by remotePort on the
          // remote end.
          if (sock.type === 2 && typeof sock.sport !== 'undefined') {
            peer.dgram_send_queue.push(new Uint8Array([
                255, 255, 255, 255,
                'p'.charCodeAt(0), 'o'.charCodeAt(0), 'r'.charCodeAt(0), 't'.charCodeAt(0),
                ((sock.sport & 0xff00) >> 8) , (sock.sport & 0xff)
            ]));
          }
  
          return peer;
        },getPeer:function (sock, addr, port) {
          return sock.peers[addr + ':' + port];
        },addPeer:function (sock, peer) {
          sock.peers[peer.addr + ':' + peer.port] = peer;
        },removePeer:function (sock, peer) {
          delete sock.peers[peer.addr + ':' + peer.port];
        },handlePeerEvents:function (sock, peer) {
          var first = true;
  
          var handleOpen = function () {
            try {
              var queued = peer.dgram_send_queue.shift();
              while (queued) {
                peer.socket.send(queued);
                queued = peer.dgram_send_queue.shift();
              }
            } catch (e) {
              // not much we can do here in the way of proper error handling as we've already
              // lied and said this data was sent. shut it down.
              peer.socket.close();
            }
          };
  
          function handleMessage(data) {
            assert(typeof data !== 'string' && data.byteLength !== undefined);  // must receive an ArrayBuffer
            data = new Uint8Array(data);  // make a typed array view on the array buffer
  
  
            // if this is the port message, override the peer's port with it
            var wasfirst = first;
            first = false;
            if (wasfirst &&
                data.length === 10 &&
                data[0] === 255 && data[1] === 255 && data[2] === 255 && data[3] === 255 &&
                data[4] === 'p'.charCodeAt(0) && data[5] === 'o'.charCodeAt(0) && data[6] === 'r'.charCodeAt(0) && data[7] === 't'.charCodeAt(0)) {
              // update the peer's port and it's key in the peer map
              var newport = ((data[8] << 8) | data[9]);
              SOCKFS.websocket_sock_ops.removePeer(sock, peer);
              peer.port = newport;
              SOCKFS.websocket_sock_ops.addPeer(sock, peer);
              return;
            }
  
            sock.recv_queue.push({ addr: peer.addr, port: peer.port, data: data });
          };
  
          if (ENVIRONMENT_IS_NODE) {
            peer.socket.on('open', handleOpen);
            peer.socket.on('message', function(data, flags) {
              if (!flags.binary) {
                return;
              }
              handleMessage((new Uint8Array(data)).buffer);  // copy from node Buffer -> ArrayBuffer
            });
            peer.socket.on('error', function() {
              // don't throw
            });
          } else {
            peer.socket.onopen = handleOpen;
            peer.socket.onmessage = function peer_socket_onmessage(event) {
              handleMessage(event.data);
            };
          }
        },poll:function (sock) {
          if (sock.type === 1 && sock.server) {
            // listen sockets should only say they're available for reading
            // if there are pending clients.
            return sock.pending.length ? (64 | 1) : 0;
          }
  
          var mask = 0;
          var dest = sock.type === 1 ?  // we only care about the socket state for connection-based sockets
            SOCKFS.websocket_sock_ops.getPeer(sock, sock.daddr, sock.dport) :
            null;
  
          if (sock.recv_queue.length ||
              !dest ||  // connection-less sockets are always ready to read
              (dest && dest.socket.readyState === dest.socket.CLOSING) ||
              (dest && dest.socket.readyState === dest.socket.CLOSED)) {  // let recv return 0 once closed
            mask |= (64 | 1);
          }
  
          if (!dest ||  // connection-less sockets are always ready to write
              (dest && dest.socket.readyState === dest.socket.OPEN)) {
            mask |= 4;
          }
  
          if ((dest && dest.socket.readyState === dest.socket.CLOSING) ||
              (dest && dest.socket.readyState === dest.socket.CLOSED)) {
            mask |= 16;
          }
  
          return mask;
        },ioctl:function (sock, request, arg) {
          switch (request) {
            case 21531:
              var bytes = 0;
              if (sock.recv_queue.length) {
                bytes = sock.recv_queue[0].data.length;
              }
              HEAP32[((arg)>>2)]=bytes;
              return 0;
            default:
              return ERRNO_CODES.EINVAL;
          }
        },close:function (sock) {
          // if we've spawned a listen server, close it
          if (sock.server) {
            try {
              sock.server.close();
            } catch (e) {
            }
            sock.server = null;
          }
          // close any peer connections
          var peers = Object.keys(sock.peers);
          for (var i = 0; i < peers.length; i++) {
            var peer = sock.peers[peers[i]];
            try {
              peer.socket.close();
            } catch (e) {
            }
            SOCKFS.websocket_sock_ops.removePeer(sock, peer);
          }
          return 0;
        },bind:function (sock, addr, port) {
          if (typeof sock.saddr !== 'undefined' || typeof sock.sport !== 'undefined') {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);  // already bound
          }
          sock.saddr = addr;
          sock.sport = port || _mkport();
          // in order to emulate dgram sockets, we need to launch a listen server when
          // binding on a connection-less socket
          // note: this is only required on the server side
          if (sock.type === 2) {
            // close the existing server if it exists
            if (sock.server) {
              sock.server.close();
              sock.server = null;
            }
            // swallow error operation not supported error that occurs when binding in the
            // browser where this isn't supported
            try {
              sock.sock_ops.listen(sock, 0);
            } catch (e) {
              if (!(e instanceof FS.ErrnoError)) throw e;
              if (e.errno !== ERRNO_CODES.EOPNOTSUPP) throw e;
            }
          }
        },connect:function (sock, addr, port) {
          if (sock.server) {
            throw new FS.ErrnoError(ERRNO_CODS.EOPNOTSUPP);
          }
  
          // TODO autobind
          // if (!sock.addr && sock.type == 2) {
          // }
  
          // early out if we're already connected / in the middle of connecting
          if (typeof sock.daddr !== 'undefined' && typeof sock.dport !== 'undefined') {
            var dest = SOCKFS.websocket_sock_ops.getPeer(sock, sock.daddr, sock.dport);
            if (dest) {
              if (dest.socket.readyState === dest.socket.CONNECTING) {
                throw new FS.ErrnoError(ERRNO_CODES.EALREADY);
              } else {
                throw new FS.ErrnoError(ERRNO_CODES.EISCONN);
              }
            }
          }
  
          // add the socket to our peer list and set our
          // destination address / port to match
          var peer = SOCKFS.websocket_sock_ops.createPeer(sock, addr, port);
          sock.daddr = peer.addr;
          sock.dport = peer.port;
  
          // always "fail" in non-blocking mode
          throw new FS.ErrnoError(ERRNO_CODES.EINPROGRESS);
        },listen:function (sock, backlog) {
          if (!ENVIRONMENT_IS_NODE) {
            throw new FS.ErrnoError(ERRNO_CODES.EOPNOTSUPP);
          }
          if (sock.server) {
             throw new FS.ErrnoError(ERRNO_CODES.EINVAL);  // already listening
          }
          var WebSocketServer = require('ws').Server;
          var host = sock.saddr;
          sock.server = new WebSocketServer({
            host: host,
            port: sock.sport
            // TODO support backlog
          });
  
          sock.server.on('connection', function(ws) {
            if (sock.type === 1) {
              var newsock = SOCKFS.createSocket(sock.family, sock.type, sock.protocol);
  
              // create a peer on the new socket
              var peer = SOCKFS.websocket_sock_ops.createPeer(newsock, ws);
              newsock.daddr = peer.addr;
              newsock.dport = peer.port;
  
              // push to queue for accept to pick up
              sock.pending.push(newsock);
            } else {
              // create a peer on the listen socket so calling sendto
              // with the listen socket and an address will resolve
              // to the correct client
              SOCKFS.websocket_sock_ops.createPeer(sock, ws);
            }
          });
          sock.server.on('closed', function() {
            sock.server = null;
          });
          sock.server.on('error', function() {
            // don't throw
          });
        },accept:function (listensock) {
          if (!listensock.server) {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
          }
          var newsock = listensock.pending.shift();
          newsock.stream.flags = listensock.stream.flags;
          return newsock;
        },getname:function (sock, peer) {
          var addr, port;
          if (peer) {
            if (sock.daddr === undefined || sock.dport === undefined) {
              throw new FS.ErrnoError(ERRNO_CODES.ENOTCONN);
            }
            addr = sock.daddr;
            port = sock.dport;
          } else {
            // TODO saddr and sport will be set for bind()'d UDP sockets, but what
            // should we be returning for TCP sockets that've been connect()'d?
            addr = sock.saddr || 0;
            port = sock.sport || 0;
          }
          return { addr: addr, port: port };
        },sendmsg:function (sock, buffer, offset, length, addr, port) {
          if (sock.type === 2) {
            // connection-less sockets will honor the message address,
            // and otherwise fall back to the bound destination address
            if (addr === undefined || port === undefined) {
              addr = sock.daddr;
              port = sock.dport;
            }
            // if there was no address to fall back to, error out
            if (addr === undefined || port === undefined) {
              throw new FS.ErrnoError(ERRNO_CODES.EDESTADDRREQ);
            }
          } else {
            // connection-based sockets will only use the bound
            addr = sock.daddr;
            port = sock.dport;
          }
  
          // find the peer for the destination address
          var dest = SOCKFS.websocket_sock_ops.getPeer(sock, addr, port);
  
          // early out if not connected with a connection-based socket
          if (sock.type === 1) {
            if (!dest || dest.socket.readyState === dest.socket.CLOSING || dest.socket.readyState === dest.socket.CLOSED) {
              throw new FS.ErrnoError(ERRNO_CODES.ENOTCONN);
            } else if (dest.socket.readyState === dest.socket.CONNECTING) {
              throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
            }
          }
  
          // create a copy of the incoming data to send, as the WebSocket API
          // doesn't work entirely with an ArrayBufferView, it'll just send
          // the entire underlying buffer
          var data;
          if (buffer instanceof Array || buffer instanceof ArrayBuffer) {
            data = buffer.slice(offset, offset + length);
          } else {  // ArrayBufferView
            data = buffer.buffer.slice(buffer.byteOffset + offset, buffer.byteOffset + offset + length);
          }
  
          // if we're emulating a connection-less dgram socket and don't have
          // a cached connection, queue the buffer to send upon connect and
          // lie, saying the data was sent now.
          if (sock.type === 2) {
            if (!dest || dest.socket.readyState !== dest.socket.OPEN) {
              // if we're not connected, open a new connection
              if (!dest || dest.socket.readyState === dest.socket.CLOSING || dest.socket.readyState === dest.socket.CLOSED) {
                dest = SOCKFS.websocket_sock_ops.createPeer(sock, addr, port);
              }
              dest.dgram_send_queue.push(data);
              return length;
            }
          }
  
          try {
            // send the actual data
            dest.socket.send(data);
            return length;
          } catch (e) {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
          }
        },recvmsg:function (sock, length) {
          // http://pubs.opengroup.org/onlinepubs/7908799/xns/recvmsg.html
          if (sock.type === 1 && sock.server) {
            // tcp servers should not be recv()'ing on the listen socket
            throw new FS.ErrnoError(ERRNO_CODES.ENOTCONN);
          }
  
          var queued = sock.recv_queue.shift();
          if (!queued) {
            if (sock.type === 1) {
              var dest = SOCKFS.websocket_sock_ops.getPeer(sock, sock.daddr, sock.dport);
  
              if (!dest) {
                // if we have a destination address but are not connected, error out
                throw new FS.ErrnoError(ERRNO_CODES.ENOTCONN);
              }
              else if (dest.socket.readyState === dest.socket.CLOSING || dest.socket.readyState === dest.socket.CLOSED) {
                // return null if the socket has closed
                return null;
              }
              else {
                // else, our socket is in a valid state but truly has nothing available
                throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
              }
            } else {
              throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
            }
          }
  
          // queued.data will be an ArrayBuffer if it's unadulterated, but if it's
          // requeued TCP data it'll be an ArrayBufferView
          var queuedLength = queued.data.byteLength || queued.data.length;
          var queuedOffset = queued.data.byteOffset || 0;
          var queuedBuffer = queued.data.buffer || queued.data;
          var bytesRead = Math.min(length, queuedLength);
          var res = {
            buffer: new Uint8Array(queuedBuffer, queuedOffset, bytesRead),
            addr: queued.addr,
            port: queued.port
          };
  
  
          // push back any unread data for TCP connections
          if (sock.type === 1 && bytesRead < queuedLength) {
            var bytesRemaining = queuedLength - bytesRead;
            queued.data = new Uint8Array(queuedBuffer, queuedOffset + bytesRead, bytesRemaining);
            sock.recv_queue.unshift(queued);
          }
  
          return res;
        }}};function _send(fd, buf, len, flags) {
      var sock = SOCKFS.getSocket(fd);
      if (!sock) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
      // TODO honor flags
      return _write(fd, buf, len);
    }
  
  function _pwrite(fildes, buf, nbyte, offset) {
      // ssize_t pwrite(int fildes, const void *buf, size_t nbyte, off_t offset);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/write.html
      var stream = FS.getStream(fildes);
      if (!stream) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
      try {
        var slab = HEAP8;
        return FS.write(stream, slab, buf, nbyte, offset);
      } catch (e) {
        FS.handleFSError(e);
        return -1;
      }
    }function _write(fildes, buf, nbyte) {
      // ssize_t write(int fildes, const void *buf, size_t nbyte);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/write.html
      var stream = FS.getStream(fildes);
      if (!stream) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
  
  
      try {
        var slab = HEAP8;
        return FS.write(stream, slab, buf, nbyte);
      } catch (e) {
        FS.handleFSError(e);
        return -1;
      }
    }
  
  function _fileno(stream) {
      // int fileno(FILE *stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fileno.html
      stream = FS.getStreamFromPtr(stream);
      if (!stream) return -1;
      return stream.fd;
    }function _fwrite(ptr, size, nitems, stream) {
      // size_t fwrite(const void *restrict ptr, size_t size, size_t nitems, FILE *restrict stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fwrite.html
      var bytesToWrite = nitems * size;
      if (bytesToWrite == 0) return 0;
      var fd = _fileno(stream);
      var bytesWritten = _write(fd, ptr, bytesToWrite);
      if (bytesWritten == -1) {
        var streamObj = FS.getStreamFromPtr(stream);
        if (streamObj) streamObj.error = true;
        return 0;
      } else {
        return Math.floor(bytesWritten / size);
      }
    }
  
  
   
  Module["_strlen"] = _strlen;
  
  function __reallyNegative(x) {
      return x < 0 || (x === 0 && (1/x) === -Infinity);
    }function __formatString(format, varargs) {
      var textIndex = format;
      var argIndex = 0;
      function getNextArg(type) {
        // NOTE: Explicitly ignoring type safety. Otherwise this fails:
        //       int x = 4; printf("%c\n", (char)x);
        var ret;
        if (type === 'double') {
          ret = (HEAP32[((tempDoublePtr)>>2)]=HEAP32[(((varargs)+(argIndex))>>2)],HEAP32[(((tempDoublePtr)+(4))>>2)]=HEAP32[(((varargs)+((argIndex)+(4)))>>2)],(+(HEAPF64[(tempDoublePtr)>>3])));
        } else if (type == 'i64') {
          ret = [HEAP32[(((varargs)+(argIndex))>>2)],
                 HEAP32[(((varargs)+(argIndex+4))>>2)]];
  
        } else {
          type = 'i32'; // varargs are always i32, i64, or double
          ret = HEAP32[(((varargs)+(argIndex))>>2)];
        }
        argIndex += Runtime.getNativeFieldSize(type);
        return ret;
      }
  
      var ret = [];
      var curr, next, currArg;
      while(1) {
        var startTextIndex = textIndex;
        curr = HEAP8[((textIndex)>>0)];
        if (curr === 0) break;
        next = HEAP8[((textIndex+1)>>0)];
        if (curr == 37) {
          // Handle flags.
          var flagAlwaysSigned = false;
          var flagLeftAlign = false;
          var flagAlternative = false;
          var flagZeroPad = false;
          var flagPadSign = false;
          flagsLoop: while (1) {
            switch (next) {
              case 43:
                flagAlwaysSigned = true;
                break;
              case 45:
                flagLeftAlign = true;
                break;
              case 35:
                flagAlternative = true;
                break;
              case 48:
                if (flagZeroPad) {
                  break flagsLoop;
                } else {
                  flagZeroPad = true;
                  break;
                }
              case 32:
                flagPadSign = true;
                break;
              default:
                break flagsLoop;
            }
            textIndex++;
            next = HEAP8[((textIndex+1)>>0)];
          }
  
          // Handle width.
          var width = 0;
          if (next == 42) {
            width = getNextArg('i32');
            textIndex++;
            next = HEAP8[((textIndex+1)>>0)];
          } else {
            while (next >= 48 && next <= 57) {
              width = width * 10 + (next - 48);
              textIndex++;
              next = HEAP8[((textIndex+1)>>0)];
            }
          }
  
          // Handle precision.
          var precisionSet = false, precision = -1;
          if (next == 46) {
            precision = 0;
            precisionSet = true;
            textIndex++;
            next = HEAP8[((textIndex+1)>>0)];
            if (next == 42) {
              precision = getNextArg('i32');
              textIndex++;
            } else {
              while(1) {
                var precisionChr = HEAP8[((textIndex+1)>>0)];
                if (precisionChr < 48 ||
                    precisionChr > 57) break;
                precision = precision * 10 + (precisionChr - 48);
                textIndex++;
              }
            }
            next = HEAP8[((textIndex+1)>>0)];
          }
          if (precision < 0) {
            precision = 6; // Standard default.
            precisionSet = false;
          }
  
          // Handle integer sizes. WARNING: These assume a 32-bit architecture!
          var argSize;
          switch (String.fromCharCode(next)) {
            case 'h':
              var nextNext = HEAP8[((textIndex+2)>>0)];
              if (nextNext == 104) {
                textIndex++;
                argSize = 1; // char (actually i32 in varargs)
              } else {
                argSize = 2; // short (actually i32 in varargs)
              }
              break;
            case 'l':
              var nextNext = HEAP8[((textIndex+2)>>0)];
              if (nextNext == 108) {
                textIndex++;
                argSize = 8; // long long
              } else {
                argSize = 4; // long
              }
              break;
            case 'L': // long long
            case 'q': // int64_t
            case 'j': // intmax_t
              argSize = 8;
              break;
            case 'z': // size_t
            case 't': // ptrdiff_t
            case 'I': // signed ptrdiff_t or unsigned size_t
              argSize = 4;
              break;
            default:
              argSize = null;
          }
          if (argSize) textIndex++;
          next = HEAP8[((textIndex+1)>>0)];
  
          // Handle type specifier.
          switch (String.fromCharCode(next)) {
            case 'd': case 'i': case 'u': case 'o': case 'x': case 'X': case 'p': {
              // Integer.
              var signed = next == 100 || next == 105;
              argSize = argSize || 4;
              var currArg = getNextArg('i' + (argSize * 8));
              var origArg = currArg;
              var argText;
              // Flatten i64-1 [low, high] into a (slightly rounded) double
              if (argSize == 8) {
                currArg = Runtime.makeBigInt(currArg[0], currArg[1], next == 117);
              }
              // Truncate to requested size.
              if (argSize <= 4) {
                var limit = Math.pow(256, argSize) - 1;
                currArg = (signed ? reSign : unSign)(currArg & limit, argSize * 8);
              }
              // Format the number.
              var currAbsArg = Math.abs(currArg);
              var prefix = '';
              if (next == 100 || next == 105) {
                if (argSize == 8 && i64Math) argText = i64Math.stringify(origArg[0], origArg[1], null); else
                argText = reSign(currArg, 8 * argSize, 1).toString(10);
              } else if (next == 117) {
                if (argSize == 8 && i64Math) argText = i64Math.stringify(origArg[0], origArg[1], true); else
                argText = unSign(currArg, 8 * argSize, 1).toString(10);
                currArg = Math.abs(currArg);
              } else if (next == 111) {
                argText = (flagAlternative ? '0' : '') + currAbsArg.toString(8);
              } else if (next == 120 || next == 88) {
                prefix = (flagAlternative && currArg != 0) ? '0x' : '';
                if (argSize == 8 && i64Math) {
                  if (origArg[1]) {
                    argText = (origArg[1]>>>0).toString(16);
                    var lower = (origArg[0]>>>0).toString(16);
                    while (lower.length < 8) lower = '0' + lower;
                    argText += lower;
                  } else {
                    argText = (origArg[0]>>>0).toString(16);
                  }
                } else
                if (currArg < 0) {
                  // Represent negative numbers in hex as 2's complement.
                  currArg = -currArg;
                  argText = (currAbsArg - 1).toString(16);
                  var buffer = [];
                  for (var i = 0; i < argText.length; i++) {
                    buffer.push((0xF - parseInt(argText[i], 16)).toString(16));
                  }
                  argText = buffer.join('');
                  while (argText.length < argSize * 2) argText = 'f' + argText;
                } else {
                  argText = currAbsArg.toString(16);
                }
                if (next == 88) {
                  prefix = prefix.toUpperCase();
                  argText = argText.toUpperCase();
                }
              } else if (next == 112) {
                if (currAbsArg === 0) {
                  argText = '(nil)';
                } else {
                  prefix = '0x';
                  argText = currAbsArg.toString(16);
                }
              }
              if (precisionSet) {
                while (argText.length < precision) {
                  argText = '0' + argText;
                }
              }
  
              // Add sign if needed
              if (currArg >= 0) {
                if (flagAlwaysSigned) {
                  prefix = '+' + prefix;
                } else if (flagPadSign) {
                  prefix = ' ' + prefix;
                }
              }
  
              // Move sign to prefix so we zero-pad after the sign
              if (argText.charAt(0) == '-') {
                prefix = '-' + prefix;
                argText = argText.substr(1);
              }
  
              // Add padding.
              while (prefix.length + argText.length < width) {
                if (flagLeftAlign) {
                  argText += ' ';
                } else {
                  if (flagZeroPad) {
                    argText = '0' + argText;
                  } else {
                    prefix = ' ' + prefix;
                  }
                }
              }
  
              // Insert the result into the buffer.
              argText = prefix + argText;
              argText.split('').forEach(function(chr) {
                ret.push(chr.charCodeAt(0));
              });
              break;
            }
            case 'f': case 'F': case 'e': case 'E': case 'g': case 'G': {
              // Float.
              var currArg = getNextArg('double');
              var argText;
              if (isNaN(currArg)) {
                argText = 'nan';
                flagZeroPad = false;
              } else if (!isFinite(currArg)) {
                argText = (currArg < 0 ? '-' : '') + 'inf';
                flagZeroPad = false;
              } else {
                var isGeneral = false;
                var effectivePrecision = Math.min(precision, 20);
  
                // Convert g/G to f/F or e/E, as per:
                // http://pubs.opengroup.org/onlinepubs/9699919799/functions/printf.html
                if (next == 103 || next == 71) {
                  isGeneral = true;
                  precision = precision || 1;
                  var exponent = parseInt(currArg.toExponential(effectivePrecision).split('e')[1], 10);
                  if (precision > exponent && exponent >= -4) {
                    next = ((next == 103) ? 'f' : 'F').charCodeAt(0);
                    precision -= exponent + 1;
                  } else {
                    next = ((next == 103) ? 'e' : 'E').charCodeAt(0);
                    precision--;
                  }
                  effectivePrecision = Math.min(precision, 20);
                }
  
                if (next == 101 || next == 69) {
                  argText = currArg.toExponential(effectivePrecision);
                  // Make sure the exponent has at least 2 digits.
                  if (/[eE][-+]\d$/.test(argText)) {
                    argText = argText.slice(0, -1) + '0' + argText.slice(-1);
                  }
                } else if (next == 102 || next == 70) {
                  argText = currArg.toFixed(effectivePrecision);
                  if (currArg === 0 && __reallyNegative(currArg)) {
                    argText = '-' + argText;
                  }
                }
  
                var parts = argText.split('e');
                if (isGeneral && !flagAlternative) {
                  // Discard trailing zeros and periods.
                  while (parts[0].length > 1 && parts[0].indexOf('.') != -1 &&
                         (parts[0].slice(-1) == '0' || parts[0].slice(-1) == '.')) {
                    parts[0] = parts[0].slice(0, -1);
                  }
                } else {
                  // Make sure we have a period in alternative mode.
                  if (flagAlternative && argText.indexOf('.') == -1) parts[0] += '.';
                  // Zero pad until required precision.
                  while (precision > effectivePrecision++) parts[0] += '0';
                }
                argText = parts[0] + (parts.length > 1 ? 'e' + parts[1] : '');
  
                // Capitalize 'E' if needed.
                if (next == 69) argText = argText.toUpperCase();
  
                // Add sign.
                if (currArg >= 0) {
                  if (flagAlwaysSigned) {
                    argText = '+' + argText;
                  } else if (flagPadSign) {
                    argText = ' ' + argText;
                  }
                }
              }
  
              // Add padding.
              while (argText.length < width) {
                if (flagLeftAlign) {
                  argText += ' ';
                } else {
                  if (flagZeroPad && (argText[0] == '-' || argText[0] == '+')) {
                    argText = argText[0] + '0' + argText.slice(1);
                  } else {
                    argText = (flagZeroPad ? '0' : ' ') + argText;
                  }
                }
              }
  
              // Adjust case.
              if (next < 97) argText = argText.toUpperCase();
  
              // Insert the result into the buffer.
              argText.split('').forEach(function(chr) {
                ret.push(chr.charCodeAt(0));
              });
              break;
            }
            case 's': {
              // String.
              var arg = getNextArg('i8*');
              var argLength = arg ? _strlen(arg) : '(null)'.length;
              if (precisionSet) argLength = Math.min(argLength, precision);
              if (!flagLeftAlign) {
                while (argLength < width--) {
                  ret.push(32);
                }
              }
              if (arg) {
                for (var i = 0; i < argLength; i++) {
                  ret.push(HEAPU8[((arg++)>>0)]);
                }
              } else {
                ret = ret.concat(intArrayFromString('(null)'.substr(0, argLength), true));
              }
              if (flagLeftAlign) {
                while (argLength < width--) {
                  ret.push(32);
                }
              }
              break;
            }
            case 'c': {
              // Character.
              if (flagLeftAlign) ret.push(getNextArg('i8'));
              while (--width > 0) {
                ret.push(32);
              }
              if (!flagLeftAlign) ret.push(getNextArg('i8'));
              break;
            }
            case 'n': {
              // Write the length written so far to the next parameter.
              var ptr = getNextArg('i32*');
              HEAP32[((ptr)>>2)]=ret.length;
              break;
            }
            case '%': {
              // Literal percent sign.
              ret.push(curr);
              break;
            }
            default: {
              // Unknown specifiers remain untouched.
              for (var i = startTextIndex; i < textIndex + 2; i++) {
                ret.push(HEAP8[((i)>>0)]);
              }
            }
          }
          textIndex += 2;
          // TODO: Support a/A (hex float) and m (last error) specifiers.
          // TODO: Support %1${specifier} for arg selection.
        } else {
          ret.push(curr);
          textIndex += 1;
        }
      }
      return ret;
    }function _fprintf(stream, format, varargs) {
      // int fprintf(FILE *restrict stream, const char *restrict format, ...);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/printf.html
      var result = __formatString(format, varargs);
      var stack = Runtime.stackSave();
      var ret = _fwrite(allocate(result, 'i8', ALLOC_STACK), 1, result.length, stream);
      Runtime.stackRestore(stack);
      return ret;
    }function _printf(format, varargs) {
      // int printf(const char *restrict format, ...);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/printf.html
      var stdout = HEAP32[((_stdout)>>2)];
      return _fprintf(stdout, format, varargs);
    }

  
  function _fputs(s, stream) {
      // int fputs(const char *restrict s, FILE *restrict stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fputs.html
      var fd = _fileno(stream);
      return _write(fd, s, _strlen(s));
    }
  
  function _fputc(c, stream) {
      // int fputc(int c, FILE *stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fputc.html
      var chr = unSign(c & 0xFF);
      HEAP8[((_fputc.ret)>>0)]=chr;
      var fd = _fileno(stream);
      var ret = _write(fd, _fputc.ret, 1);
      if (ret == -1) {
        var streamObj = FS.getStreamFromPtr(stream);
        if (streamObj) streamObj.error = true;
        return -1;
      } else {
        return chr;
      }
    }function _puts(s) {
      // int puts(const char *s);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/puts.html
      // NOTE: puts() always writes an extra newline.
      var stdout = HEAP32[((_stdout)>>2)];
      var ret = _fputs(s, stdout);
      if (ret < 0) {
        return ret;
      } else {
        var newlineRet = _fputc(10, stdout);
        return (newlineRet < 0) ? -1 : ret + 1;
      }
    }

  function _sbrk(bytes) {
      // Implement a Linux-like 'memory area' for our 'process'.
      // Changes the size of the memory area by |bytes|; returns the
      // address of the previous top ('break') of the memory area
      // We control the "dynamic" memory - DYNAMIC_BASE to DYNAMICTOP
      var self = _sbrk;
      if (!self.called) {
        DYNAMICTOP = alignMemoryPage(DYNAMICTOP); // make sure we start out aligned
        self.called = true;
        assert(Runtime.dynamicAlloc);
        self.alloc = Runtime.dynamicAlloc;
        Runtime.dynamicAlloc = function() { abort('cannot dynamically allocate, sbrk now has control') };
      }
      var ret = DYNAMICTOP;
      if (bytes != 0) self.alloc(bytes);
      return ret;  // Previous break location.
    }

  function _sysconf(name) {
      // long sysconf(int name);
      // http://pubs.opengroup.org/onlinepubs/009695399/functions/sysconf.html
      switch(name) {
        case 30: return PAGE_SIZE;
        case 132:
        case 133:
        case 12:
        case 137:
        case 138:
        case 15:
        case 235:
        case 16:
        case 17:
        case 18:
        case 19:
        case 20:
        case 149:
        case 13:
        case 10:
        case 236:
        case 153:
        case 9:
        case 21:
        case 22:
        case 159:
        case 154:
        case 14:
        case 77:
        case 78:
        case 139:
        case 80:
        case 81:
        case 79:
        case 82:
        case 68:
        case 67:
        case 164:
        case 11:
        case 29:
        case 47:
        case 48:
        case 95:
        case 52:
        case 51:
        case 46:
          return 200809;
        case 27:
        case 246:
        case 127:
        case 128:
        case 23:
        case 24:
        case 160:
        case 161:
        case 181:
        case 182:
        case 242:
        case 183:
        case 184:
        case 243:
        case 244:
        case 245:
        case 165:
        case 178:
        case 179:
        case 49:
        case 50:
        case 168:
        case 169:
        case 175:
        case 170:
        case 171:
        case 172:
        case 97:
        case 76:
        case 32:
        case 173:
        case 35:
          return -1;
        case 176:
        case 177:
        case 7:
        case 155:
        case 8:
        case 157:
        case 125:
        case 126:
        case 92:
        case 93:
        case 129:
        case 130:
        case 131:
        case 94:
        case 91:
          return 1;
        case 74:
        case 60:
        case 69:
        case 70:
        case 4:
          return 1024;
        case 31:
        case 42:
        case 72:
          return 32;
        case 87:
        case 26:
        case 33:
          return 2147483647;
        case 34:
        case 1:
          return 47839;
        case 38:
        case 36:
          return 99;
        case 43:
        case 37:
          return 2048;
        case 0: return 2097152;
        case 3: return 65536;
        case 28: return 32768;
        case 44: return 32767;
        case 75: return 16384;
        case 39: return 1000;
        case 89: return 700;
        case 71: return 256;
        case 40: return 255;
        case 2: return 100;
        case 180: return 64;
        case 25: return 20;
        case 5: return 16;
        case 6: return 6;
        case 73: return 4;
        case 84: {
          if (typeof navigator === 'object') return navigator['hardwareConcurrency'] || 1;
          return 1;
        }
      }
      ___setErrNo(ERRNO_CODES.EINVAL);
      return -1;
    }

  function _clock() {
      if (_clock.start === undefined) _clock.start = Date.now();
      return Math.floor((Date.now() - _clock.start) * (1000000/1000));
    }

   
  Module["_memset"] = _memset;

  function ___errno_location() {
      return ___errno_state;
    }

  function _abort() {
      Module['abort']();
    }

  var Browser={mainLoop:{scheduler:null,method:"",shouldPause:false,paused:false,queue:[],pause:function () {
          Browser.mainLoop.shouldPause = true;
        },resume:function () {
          if (Browser.mainLoop.paused) {
            Browser.mainLoop.paused = false;
            Browser.mainLoop.scheduler();
          }
          Browser.mainLoop.shouldPause = false;
        },updateStatus:function () {
          if (Module['setStatus']) {
            var message = Module['statusMessage'] || 'Please wait...';
            var remaining = Browser.mainLoop.remainingBlockers;
            var expected = Browser.mainLoop.expectedBlockers;
            if (remaining) {
              if (remaining < expected) {
                Module['setStatus'](message + ' (' + (expected - remaining) + '/' + expected + ')');
              } else {
                Module['setStatus'](message);
              }
            } else {
              Module['setStatus']('');
            }
          }
        },runIter:function (func) {
          if (ABORT) return;
          if (Module['preMainLoop']) {
            var preRet = Module['preMainLoop']();
            if (preRet === false) {
              return; // |return false| skips a frame
            }
          }
          try {
            func();
          } catch (e) {
            if (e instanceof ExitStatus) {
              return;
            } else {
              if (e && typeof e === 'object' && e.stack) Module.printErr('exception thrown: ' + [e, e.stack]);
              throw e;
            }
          }
          if (Module['postMainLoop']) Module['postMainLoop']();
        }},isFullScreen:false,pointerLock:false,moduleContextCreatedCallbacks:[],workers:[],init:function () {
        if (!Module["preloadPlugins"]) Module["preloadPlugins"] = []; // needs to exist even in workers
  
        if (Browser.initted) return;
        Browser.initted = true;
  
        try {
          new Blob();
          Browser.hasBlobConstructor = true;
        } catch(e) {
          Browser.hasBlobConstructor = false;
          console.log("warning: no blob constructor, cannot create blobs with mimetypes");
        }
        Browser.BlobBuilder = typeof MozBlobBuilder != "undefined" ? MozBlobBuilder : (typeof WebKitBlobBuilder != "undefined" ? WebKitBlobBuilder : (!Browser.hasBlobConstructor ? console.log("warning: no BlobBuilder") : null));
        Browser.URLObject = typeof window != "undefined" ? (window.URL ? window.URL : window.webkitURL) : undefined;
        if (!Module.noImageDecoding && typeof Browser.URLObject === 'undefined') {
          console.log("warning: Browser does not support creating object URLs. Built-in browser image decoding will not be available.");
          Module.noImageDecoding = true;
        }
  
        // Support for plugins that can process preloaded files. You can add more of these to
        // your app by creating and appending to Module.preloadPlugins.
        //
        // Each plugin is asked if it can handle a file based on the file's name. If it can,
        // it is given the file's raw data. When it is done, it calls a callback with the file's
        // (possibly modified) data. For example, a plugin might decompress a file, or it
        // might create some side data structure for use later (like an Image element, etc.).
  
        var imagePlugin = {};
        imagePlugin['canHandle'] = function imagePlugin_canHandle(name) {
          return !Module.noImageDecoding && /\.(jpg|jpeg|png|bmp)$/i.test(name);
        };
        imagePlugin['handle'] = function imagePlugin_handle(byteArray, name, onload, onerror) {
          var b = null;
          if (Browser.hasBlobConstructor) {
            try {
              b = new Blob([byteArray], { type: Browser.getMimetype(name) });
              if (b.size !== byteArray.length) { // Safari bug #118630
                // Safari's Blob can only take an ArrayBuffer
                b = new Blob([(new Uint8Array(byteArray)).buffer], { type: Browser.getMimetype(name) });
              }
            } catch(e) {
              Runtime.warnOnce('Blob constructor present but fails: ' + e + '; falling back to blob builder');
            }
          }
          if (!b) {
            var bb = new Browser.BlobBuilder();
            bb.append((new Uint8Array(byteArray)).buffer); // we need to pass a buffer, and must copy the array to get the right data range
            b = bb.getBlob();
          }
          var url = Browser.URLObject.createObjectURL(b);
          var img = new Image();
          img.onload = function img_onload() {
            assert(img.complete, 'Image ' + name + ' could not be decoded');
            var canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            var ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            Module["preloadedImages"][name] = canvas;
            Browser.URLObject.revokeObjectURL(url);
            if (onload) onload(byteArray);
          };
          img.onerror = function img_onerror(event) {
            console.log('Image ' + url + ' could not be decoded');
            if (onerror) onerror();
          };
          img.src = url;
        };
        Module['preloadPlugins'].push(imagePlugin);
  
        var audioPlugin = {};
        audioPlugin['canHandle'] = function audioPlugin_canHandle(name) {
          return !Module.noAudioDecoding && name.substr(-4) in { '.ogg': 1, '.wav': 1, '.mp3': 1 };
        };
        audioPlugin['handle'] = function audioPlugin_handle(byteArray, name, onload, onerror) {
          var done = false;
          function finish(audio) {
            if (done) return;
            done = true;
            Module["preloadedAudios"][name] = audio;
            if (onload) onload(byteArray);
          }
          function fail() {
            if (done) return;
            done = true;
            Module["preloadedAudios"][name] = new Audio(); // empty shim
            if (onerror) onerror();
          }
          if (Browser.hasBlobConstructor) {
            try {
              var b = new Blob([byteArray], { type: Browser.getMimetype(name) });
            } catch(e) {
              return fail();
            }
            var url = Browser.URLObject.createObjectURL(b); // XXX we never revoke this!
            var audio = new Audio();
            audio.addEventListener('canplaythrough', function() { finish(audio) }, false); // use addEventListener due to chromium bug 124926
            audio.onerror = function audio_onerror(event) {
              if (done) return;
              console.log('warning: browser could not fully decode audio ' + name + ', trying slower base64 approach');
              function encode64(data) {
                var BASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
                var PAD = '=';
                var ret = '';
                var leftchar = 0;
                var leftbits = 0;
                for (var i = 0; i < data.length; i++) {
                  leftchar = (leftchar << 8) | data[i];
                  leftbits += 8;
                  while (leftbits >= 6) {
                    var curr = (leftchar >> (leftbits-6)) & 0x3f;
                    leftbits -= 6;
                    ret += BASE[curr];
                  }
                }
                if (leftbits == 2) {
                  ret += BASE[(leftchar&3) << 4];
                  ret += PAD + PAD;
                } else if (leftbits == 4) {
                  ret += BASE[(leftchar&0xf) << 2];
                  ret += PAD;
                }
                return ret;
              }
              audio.src = 'data:audio/x-' + name.substr(-3) + ';base64,' + encode64(byteArray);
              finish(audio); // we don't wait for confirmation this worked - but it's worth trying
            };
            audio.src = url;
            // workaround for chrome bug 124926 - we do not always get oncanplaythrough or onerror
            Browser.safeSetTimeout(function() {
              finish(audio); // try to use it even though it is not necessarily ready to play
            }, 10000);
          } else {
            return fail();
          }
        };
        Module['preloadPlugins'].push(audioPlugin);
  
        // Canvas event setup
  
        var canvas = Module['canvas'];
        function pointerLockChange() {
          Browser.pointerLock = document['pointerLockElement'] === canvas ||
                                document['mozPointerLockElement'] === canvas ||
                                document['webkitPointerLockElement'] === canvas ||
                                document['msPointerLockElement'] === canvas;
        }
        if (canvas) {
          // forced aspect ratio can be enabled by defining 'forcedAspectRatio' on Module
          // Module['forcedAspectRatio'] = 4 / 3;
          
          canvas.requestPointerLock = canvas['requestPointerLock'] ||
                                      canvas['mozRequestPointerLock'] ||
                                      canvas['webkitRequestPointerLock'] ||
                                      canvas['msRequestPointerLock'] ||
                                      function(){};
          canvas.exitPointerLock = document['exitPointerLock'] ||
                                   document['mozExitPointerLock'] ||
                                   document['webkitExitPointerLock'] ||
                                   document['msExitPointerLock'] ||
                                   function(){}; // no-op if function does not exist
          canvas.exitPointerLock = canvas.exitPointerLock.bind(document);
  
  
          document.addEventListener('pointerlockchange', pointerLockChange, false);
          document.addEventListener('mozpointerlockchange', pointerLockChange, false);
          document.addEventListener('webkitpointerlockchange', pointerLockChange, false);
          document.addEventListener('mspointerlockchange', pointerLockChange, false);
  
          if (Module['elementPointerLock']) {
            canvas.addEventListener("click", function(ev) {
              if (!Browser.pointerLock && canvas.requestPointerLock) {
                canvas.requestPointerLock();
                ev.preventDefault();
              }
            }, false);
          }
        }
      },createContext:function (canvas, useWebGL, setInModule, webGLContextAttributes) {
        if (useWebGL && Module.ctx) return Module.ctx; // no need to recreate singleton GL context
  
        var ctx;
        var errorInfo = '?';
        function onContextCreationError(event) {
          errorInfo = event.statusMessage || errorInfo;
        }
        try {
          if (useWebGL) {
            var contextAttributes = {
              antialias: false,
              alpha: false
            };
  
            if (webGLContextAttributes) {
              for (var attribute in webGLContextAttributes) {
                contextAttributes[attribute] = webGLContextAttributes[attribute];
              }
            }
  
  
            canvas.addEventListener('webglcontextcreationerror', onContextCreationError, false);
            try {
              ['experimental-webgl', 'webgl'].some(function(webglId) {
                return ctx = canvas.getContext(webglId, contextAttributes);
              });
            } finally {
              canvas.removeEventListener('webglcontextcreationerror', onContextCreationError, false);
            }
          } else {
            ctx = canvas.getContext('2d');
          }
          if (!ctx) throw ':(';
        } catch (e) {
          Module.print('Could not create canvas: ' + [errorInfo, e]);
          return null;
        }
        if (useWebGL) {
          // possible GL_DEBUG entry point: ctx = wrapDebugGL(ctx);
  
          // Set the background of the WebGL canvas to black
          canvas.style.backgroundColor = "black";
        }
        if (setInModule) {
          if (!useWebGL) assert(typeof GLctx === 'undefined', 'cannot set in module if GLctx is used, but we are a non-GL context that would replace it');
          Module.ctx = ctx;
          if (useWebGL) GLctx = ctx;
          Module.useWebGL = useWebGL;
          Browser.moduleContextCreatedCallbacks.forEach(function(callback) { callback() });
          Browser.init();
        }
        return ctx;
      },destroyContext:function (canvas, useWebGL, setInModule) {},fullScreenHandlersInstalled:false,lockPointer:undefined,resizeCanvas:undefined,requestFullScreen:function (lockPointer, resizeCanvas) {
        Browser.lockPointer = lockPointer;
        Browser.resizeCanvas = resizeCanvas;
        if (typeof Browser.lockPointer === 'undefined') Browser.lockPointer = true;
        if (typeof Browser.resizeCanvas === 'undefined') Browser.resizeCanvas = false;
  
        var canvas = Module['canvas'];
        function fullScreenChange() {
          Browser.isFullScreen = false;
          var canvasContainer = canvas.parentNode;
          if ((document['webkitFullScreenElement'] || document['webkitFullscreenElement'] ||
               document['mozFullScreenElement'] || document['mozFullscreenElement'] ||
               document['fullScreenElement'] || document['fullscreenElement'] ||
               document['msFullScreenElement'] || document['msFullscreenElement'] ||
               document['webkitCurrentFullScreenElement']) === canvasContainer) {
            canvas.cancelFullScreen = document['cancelFullScreen'] ||
                                      document['mozCancelFullScreen'] ||
                                      document['webkitCancelFullScreen'] ||
                                      document['msExitFullscreen'] ||
                                      document['exitFullscreen'] ||
                                      function() {};
            canvas.cancelFullScreen = canvas.cancelFullScreen.bind(document);
            if (Browser.lockPointer) canvas.requestPointerLock();
            Browser.isFullScreen = true;
            if (Browser.resizeCanvas) Browser.setFullScreenCanvasSize();
          } else {
            
            // remove the full screen specific parent of the canvas again to restore the HTML structure from before going full screen
            canvasContainer.parentNode.insertBefore(canvas, canvasContainer);
            canvasContainer.parentNode.removeChild(canvasContainer);
            
            if (Browser.resizeCanvas) Browser.setWindowedCanvasSize();
          }
          if (Module['onFullScreen']) Module['onFullScreen'](Browser.isFullScreen);
          Browser.updateCanvasDimensions(canvas);
        }
  
        if (!Browser.fullScreenHandlersInstalled) {
          Browser.fullScreenHandlersInstalled = true;
          document.addEventListener('fullscreenchange', fullScreenChange, false);
          document.addEventListener('mozfullscreenchange', fullScreenChange, false);
          document.addEventListener('webkitfullscreenchange', fullScreenChange, false);
          document.addEventListener('MSFullscreenChange', fullScreenChange, false);
        }
  
        // create a new parent to ensure the canvas has no siblings. this allows browsers to optimize full screen performance when its parent is the full screen root
        var canvasContainer = document.createElement("div");
        canvas.parentNode.insertBefore(canvasContainer, canvas);
        canvasContainer.appendChild(canvas);
        
        // use parent of canvas as full screen root to allow aspect ratio correction (Firefox stretches the root to screen size)
        canvasContainer.requestFullScreen = canvasContainer['requestFullScreen'] ||
                                            canvasContainer['mozRequestFullScreen'] ||
                                            canvasContainer['msRequestFullscreen'] ||
                                           (canvasContainer['webkitRequestFullScreen'] ? function() { canvasContainer['webkitRequestFullScreen'](Element['ALLOW_KEYBOARD_INPUT']) } : null);
        canvasContainer.requestFullScreen();
      },nextRAF:0,fakeRequestAnimationFrame:function (func) {
        // try to keep 60fps between calls to here
        var now = Date.now();
        if (Browser.nextRAF === 0) {
          Browser.nextRAF = now + 1000/60;
        } else {
          while (now + 2 >= Browser.nextRAF) { // fudge a little, to avoid timer jitter causing us to do lots of delay:0
            Browser.nextRAF += 1000/60;
          }
        }
        var delay = Math.max(Browser.nextRAF - now, 0);
        setTimeout(func, delay);
      },requestAnimationFrame:function requestAnimationFrame(func) {
        if (typeof window === 'undefined') { // Provide fallback to setTimeout if window is undefined (e.g. in Node.js)
          Browser.fakeRequestAnimationFrame(func);
        } else {
          if (!window.requestAnimationFrame) {
            window.requestAnimationFrame = window['requestAnimationFrame'] ||
                                           window['mozRequestAnimationFrame'] ||
                                           window['webkitRequestAnimationFrame'] ||
                                           window['msRequestAnimationFrame'] ||
                                           window['oRequestAnimationFrame'] ||
                                           Browser.fakeRequestAnimationFrame;
          }
          window.requestAnimationFrame(func);
        }
      },safeCallback:function (func) {
        return function() {
          if (!ABORT) return func.apply(null, arguments);
        };
      },safeRequestAnimationFrame:function (func) {
        return Browser.requestAnimationFrame(function() {
          if (!ABORT) func();
        });
      },safeSetTimeout:function (func, timeout) {
        Module['noExitRuntime'] = true;
        return setTimeout(function() {
          if (!ABORT) func();
        }, timeout);
      },safeSetInterval:function (func, timeout) {
        Module['noExitRuntime'] = true;
        return setInterval(function() {
          if (!ABORT) func();
        }, timeout);
      },getMimetype:function (name) {
        return {
          'jpg': 'image/jpeg',
          'jpeg': 'image/jpeg',
          'png': 'image/png',
          'bmp': 'image/bmp',
          'ogg': 'audio/ogg',
          'wav': 'audio/wav',
          'mp3': 'audio/mpeg'
        }[name.substr(name.lastIndexOf('.')+1)];
      },getUserMedia:function (func) {
        if(!window.getUserMedia) {
          window.getUserMedia = navigator['getUserMedia'] ||
                                navigator['mozGetUserMedia'];
        }
        window.getUserMedia(func);
      },getMovementX:function (event) {
        return event['movementX'] ||
               event['mozMovementX'] ||
               event['webkitMovementX'] ||
               0;
      },getMovementY:function (event) {
        return event['movementY'] ||
               event['mozMovementY'] ||
               event['webkitMovementY'] ||
               0;
      },getMouseWheelDelta:function (event) {
        var delta = 0;
        switch (event.type) {
          case 'DOMMouseScroll': 
            delta = event.detail;
            break;
          case 'mousewheel': 
            delta = -event.wheelDelta;
            break;
          case 'wheel': 
            delta = event.deltaY;
            break;
          default:
            throw 'unrecognized mouse wheel event: ' + event.type;
        }
        return Math.max(-1, Math.min(1, delta));
      },mouseX:0,mouseY:0,mouseMovementX:0,mouseMovementY:0,touches:{},lastTouches:{},calculateMouseEvent:function (event) { // event should be mousemove, mousedown or mouseup
        if (Browser.pointerLock) {
          // When the pointer is locked, calculate the coordinates
          // based on the movement of the mouse.
          // Workaround for Firefox bug 764498
          if (event.type != 'mousemove' &&
              ('mozMovementX' in event)) {
            Browser.mouseMovementX = Browser.mouseMovementY = 0;
          } else {
            Browser.mouseMovementX = Browser.getMovementX(event);
            Browser.mouseMovementY = Browser.getMovementY(event);
          }
          
          // check if SDL is available
          if (typeof SDL != "undefined") {
          	Browser.mouseX = SDL.mouseX + Browser.mouseMovementX;
          	Browser.mouseY = SDL.mouseY + Browser.mouseMovementY;
          } else {
          	// just add the mouse delta to the current absolut mouse position
          	// FIXME: ideally this should be clamped against the canvas size and zero
          	Browser.mouseX += Browser.mouseMovementX;
          	Browser.mouseY += Browser.mouseMovementY;
          }        
        } else {
          // Otherwise, calculate the movement based on the changes
          // in the coordinates.
          var rect = Module["canvas"].getBoundingClientRect();
          var cw = Module["canvas"].width;
          var ch = Module["canvas"].height;
  
          // Neither .scrollX or .pageXOffset are defined in a spec, but
          // we prefer .scrollX because it is currently in a spec draft.
          // (see: http://www.w3.org/TR/2013/WD-cssom-view-20131217/)
          var scrollX = ((typeof window.scrollX !== 'undefined') ? window.scrollX : window.pageXOffset);
          var scrollY = ((typeof window.scrollY !== 'undefined') ? window.scrollY : window.pageYOffset);
  
          if (event.type === 'touchstart' || event.type === 'touchend' || event.type === 'touchmove') {
            var touch = event.touch;
            if (touch === undefined) {
              return; // the "touch" property is only defined in SDL
  
            }
            var adjustedX = touch.pageX - (scrollX + rect.left);
            var adjustedY = touch.pageY - (scrollY + rect.top);
  
            adjustedX = adjustedX * (cw / rect.width);
            adjustedY = adjustedY * (ch / rect.height);
  
            var coords = { x: adjustedX, y: adjustedY };
            
            if (event.type === 'touchstart') {
              Browser.lastTouches[touch.identifier] = coords;
              Browser.touches[touch.identifier] = coords;
            } else if (event.type === 'touchend' || event.type === 'touchmove') {
              Browser.lastTouches[touch.identifier] = Browser.touches[touch.identifier];
              Browser.touches[touch.identifier] = { x: adjustedX, y: adjustedY };
            } 
            return;
          }
  
          var x = event.pageX - (scrollX + rect.left);
          var y = event.pageY - (scrollY + rect.top);
  
          // the canvas might be CSS-scaled compared to its backbuffer;
          // SDL-using content will want mouse coordinates in terms
          // of backbuffer units.
          x = x * (cw / rect.width);
          y = y * (ch / rect.height);
  
          Browser.mouseMovementX = x - Browser.mouseX;
          Browser.mouseMovementY = y - Browser.mouseY;
          Browser.mouseX = x;
          Browser.mouseY = y;
        }
      },xhrLoad:function (url, onload, onerror) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.responseType = 'arraybuffer';
        xhr.onload = function xhr_onload() {
          if (xhr.status == 200 || (xhr.status == 0 && xhr.response)) { // file URLs can return 0
            onload(xhr.response);
          } else {
            onerror();
          }
        };
        xhr.onerror = onerror;
        xhr.send(null);
      },asyncLoad:function (url, onload, onerror, noRunDep) {
        Browser.xhrLoad(url, function(arrayBuffer) {
          assert(arrayBuffer, 'Loading data file "' + url + '" failed (no arrayBuffer).');
          onload(new Uint8Array(arrayBuffer));
          if (!noRunDep) removeRunDependency('al ' + url);
        }, function(event) {
          if (onerror) {
            onerror();
          } else {
            throw 'Loading data file "' + url + '" failed.';
          }
        });
        if (!noRunDep) addRunDependency('al ' + url);
      },resizeListeners:[],updateResizeListeners:function () {
        var canvas = Module['canvas'];
        Browser.resizeListeners.forEach(function(listener) {
          listener(canvas.width, canvas.height);
        });
      },setCanvasSize:function (width, height, noUpdates) {
        var canvas = Module['canvas'];
        Browser.updateCanvasDimensions(canvas, width, height);
        if (!noUpdates) Browser.updateResizeListeners();
      },windowedWidth:0,windowedHeight:0,setFullScreenCanvasSize:function () {
        // check if SDL is available   
        if (typeof SDL != "undefined") {
        	var flags = HEAPU32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)];
        	flags = flags | 0x00800000; // set SDL_FULLSCREEN flag
        	HEAP32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)]=flags
        }
        Browser.updateResizeListeners();
      },setWindowedCanvasSize:function () {
        // check if SDL is available       
        if (typeof SDL != "undefined") {
        	var flags = HEAPU32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)];
        	flags = flags & ~0x00800000; // clear SDL_FULLSCREEN flag
        	HEAP32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)]=flags
        }
        Browser.updateResizeListeners();
      },updateCanvasDimensions:function (canvas, wNative, hNative) {
        if (wNative && hNative) {
          canvas.widthNative = wNative;
          canvas.heightNative = hNative;
        } else {
          wNative = canvas.widthNative;
          hNative = canvas.heightNative;
        }
        var w = wNative;
        var h = hNative;
        if (Module['forcedAspectRatio'] && Module['forcedAspectRatio'] > 0) {
          if (w/h < Module['forcedAspectRatio']) {
            w = Math.round(h * Module['forcedAspectRatio']);
          } else {
            h = Math.round(w / Module['forcedAspectRatio']);
          }
        }
        if (((document['webkitFullScreenElement'] || document['webkitFullscreenElement'] ||
             document['mozFullScreenElement'] || document['mozFullscreenElement'] ||
             document['fullScreenElement'] || document['fullscreenElement'] ||
             document['msFullScreenElement'] || document['msFullscreenElement'] ||
             document['webkitCurrentFullScreenElement']) === canvas.parentNode) && (typeof screen != 'undefined')) {
           var factor = Math.min(screen.width / w, screen.height / h);
           w = Math.round(w * factor);
           h = Math.round(h * factor);
        }
        if (Browser.resizeCanvas) {
          if (canvas.width  != w) canvas.width  = w;
          if (canvas.height != h) canvas.height = h;
          if (typeof canvas.style != 'undefined') {
            canvas.style.removeProperty( "width");
            canvas.style.removeProperty("height");
          }
        } else {
          if (canvas.width  != wNative) canvas.width  = wNative;
          if (canvas.height != hNative) canvas.height = hNative;
          if (typeof canvas.style != 'undefined') {
            if (w != wNative || h != hNative) {
              canvas.style.setProperty( "width", w + "px", "important");
              canvas.style.setProperty("height", h + "px", "important");
            } else {
              canvas.style.removeProperty( "width");
              canvas.style.removeProperty("height");
            }
          }
        }
      }};

  function _time(ptr) {
      var ret = Math.floor(Date.now()/1000);
      if (ptr) {
        HEAP32[((ptr)>>2)]=ret;
      }
      return ret;
    }


  
  function _emscripten_memcpy_big(dest, src, num) {
      HEAPU8.set(HEAPU8.subarray(src, src+num), dest);
      return dest;
    } 
  Module["_memcpy"] = _memcpy;
FS.staticInit();__ATINIT__.unshift({ func: function() { if (!Module["noFSInit"] && !FS.init.initialized) FS.init() } });__ATMAIN__.push({ func: function() { FS.ignorePermissions = false } });__ATEXIT__.push({ func: function() { FS.quit() } });Module["FS_createFolder"] = FS.createFolder;Module["FS_createPath"] = FS.createPath;Module["FS_createDataFile"] = FS.createDataFile;Module["FS_createPreloadedFile"] = FS.createPreloadedFile;Module["FS_createLazyFile"] = FS.createLazyFile;Module["FS_createLink"] = FS.createLink;Module["FS_createDevice"] = FS.createDevice;
___errno_state = Runtime.staticAlloc(4); HEAP32[((___errno_state)>>2)]=0;
__ATINIT__.unshift({ func: function() { TTY.init() } });__ATEXIT__.push({ func: function() { TTY.shutdown() } });TTY.utf8 = new Runtime.UTF8Processor();
if (ENVIRONMENT_IS_NODE) { var fs = require("fs"); NODEFS.staticInit(); }
__ATINIT__.push({ func: function() { SOCKFS.root = FS.mount(SOCKFS, {}, null); } });
_fputc.ret = allocate([0], "i8", ALLOC_STATIC);
Module["requestFullScreen"] = function Module_requestFullScreen(lockPointer, resizeCanvas) { Browser.requestFullScreen(lockPointer, resizeCanvas) };
  Module["requestAnimationFrame"] = function Module_requestAnimationFrame(func) { Browser.requestAnimationFrame(func) };
  Module["setCanvasSize"] = function Module_setCanvasSize(width, height, noUpdates) { Browser.setCanvasSize(width, height, noUpdates) };
  Module["pauseMainLoop"] = function Module_pauseMainLoop() { Browser.mainLoop.pause() };
  Module["resumeMainLoop"] = function Module_resumeMainLoop() { Browser.mainLoop.resume() };
  Module["getUserMedia"] = function Module_getUserMedia() { Browser.getUserMedia() }
STACK_BASE = STACKTOP = Runtime.alignMemory(STATICTOP);

staticSealed = true; // seal the static portion of memory

STACK_MAX = STACK_BASE + 5242880;

DYNAMIC_BASE = DYNAMICTOP = Runtime.alignMemory(STACK_MAX);

assert(DYNAMIC_BASE < TOTAL_MEMORY, "TOTAL_MEMORY not big enough for stack");


  var Math_min = Math.min;
  function asmPrintInt(x, y) {
    Module.print('int ' + x + ',' + y);// + ' ' + new Error().stack);
  }
  function asmPrintFloat(x, y) {
    Module.print('float ' + x + ',' + y);// + ' ' + new Error().stack);
  }
  // EMSCRIPTEN_START_ASM
  var asm = (function(global, env, buffer) {
    'almost asm';
    var HEAP8 = new global.Int8Array(buffer);
    var HEAP16 = new global.Int16Array(buffer);
    var HEAP32 = new global.Int32Array(buffer);
    var HEAPU8 = new global.Uint8Array(buffer);
    var HEAPU16 = new global.Uint16Array(buffer);
    var HEAPU32 = new global.Uint32Array(buffer);
    var HEAPF32 = new global.Float32Array(buffer);
    var HEAPF64 = new global.Float64Array(buffer);
  
  var STACKTOP=env.STACKTOP|0;
  var STACK_MAX=env.STACK_MAX|0;
  var tempDoublePtr=env.tempDoublePtr|0;
  var ABORT=env.ABORT|0;

    var __THREW__ = 0;
    var threwValue = 0;
    var setjmpId = 0;
    var undef = 0;
    var nan = +env.NaN, inf = +env.Infinity;
    var tempInt = 0, tempBigInt = 0, tempBigIntP = 0, tempBigIntS = 0, tempBigIntR = 0.0, tempBigIntI = 0, tempBigIntD = 0, tempValue = 0, tempDouble = 0.0;
  
    var tempRet0 = 0;
    var tempRet1 = 0;
    var tempRet2 = 0;
    var tempRet3 = 0;
    var tempRet4 = 0;
    var tempRet5 = 0;
    var tempRet6 = 0;
    var tempRet7 = 0;
    var tempRet8 = 0;
    var tempRet9 = 0;
  var Math_floor=global.Math.floor;
  var Math_abs=global.Math.abs;
  var Math_sqrt=global.Math.sqrt;
  var Math_pow=global.Math.pow;
  var Math_cos=global.Math.cos;
  var Math_sin=global.Math.sin;
  var Math_tan=global.Math.tan;
  var Math_acos=global.Math.acos;
  var Math_asin=global.Math.asin;
  var Math_atan=global.Math.atan;
  var Math_atan2=global.Math.atan2;
  var Math_exp=global.Math.exp;
  var Math_log=global.Math.log;
  var Math_ceil=global.Math.ceil;
  var Math_imul=global.Math.imul;
  var abort=env.abort;
  var assert=env.assert;
  var asmPrintInt=env.asmPrintInt;
  var asmPrintFloat=env.asmPrintFloat;
  var Math_min=env.min;
  var _send=env._send;
  var ___setErrNo=env.___setErrNo;
  var _fflush=env._fflush;
  var _pwrite=env._pwrite;
  var _fprintf=env._fprintf;
  var __reallyNegative=env.__reallyNegative;
  var _sbrk=env._sbrk;
  var _emscripten_memcpy_big=env._emscripten_memcpy_big;
  var _fileno=env._fileno;
  var _sysconf=env._sysconf;
  var _clock=env._clock;
  var _puts=env._puts;
  var _printf=env._printf;
  var _write=env._write;
  var ___errno_location=env.___errno_location;
  var _fputc=env._fputc;
  var _abort=env._abort;
  var _fwrite=env._fwrite;
  var _time=env._time;
  var _mkport=env._mkport;
  var __formatString=env.__formatString;
  var _fputs=env._fputs;
  var tempFloat = 0.0;

  // EMSCRIPTEN_START_FUNCS
function _malloc($bytes) {
 $bytes = $bytes | 0;
 var $$pre$phi$i$iZ2D = 0, $$pre$phi$i26$iZ2D = 0, $$pre$phi$i26Z2D = 0, $$pre$phi$iZ2D = 0, $$pre$phi58$i$iZ2D = 0, $$pre$phiZ2D = 0, $$rsize$3$i = 0, $$sum$i21$i = 0, $$sum2$i23$i = 0, $$sum3132$i$i = 0, $$sum67$i$i = 0, $100 = 0, $1004 = 0, $1005 = 0, $1008 = 0, $1010 = 0, $1013 = 0, $1018 = 0, $1024 = 0, $1028 = 0, $1029 = 0, $1036 = 0, $1045 = 0, $1048 = 0, $1053 = 0, $106 = 0, $1060 = 0, $1061 = 0, $1062 = 0, $1069 = 0, $1071 = 0, $1072 = 0, $110 = 0, $112 = 0, $113 = 0, $115 = 0, $117 = 0, $119 = 0, $12 = 0, $121 = 0, $123 = 0, $125 = 0, $127 = 0, $13 = 0, $132 = 0, $138 = 0, $14 = 0, $141 = 0, $144 = 0, $147 = 0, $148 = 0, $149 = 0, $15 = 0, $151 = 0, $154 = 0, $156 = 0, $159 = 0, $16 = 0, $161 = 0, $164 = 0, $167 = 0, $168 = 0, $17 = 0, $170 = 0, $171 = 0, $173 = 0, $174 = 0, $176 = 0, $177 = 0, $18 = 0, $182 = 0, $183 = 0, $192 = 0, $201 = 0, $208 = 0, $215 = 0, $218 = 0, $226 = 0, $228 = 0, $229 = 0, $230 = 0, $231 = 0, $232 = 0, $233 = 0, $237 = 0, $238 = 0, $246 = 0, $247 = 0, $248 = 0, $25 = 0, $250 = 0, $251 = 0, $256 = 0, $257 = 0, $260 = 0, $262 = 0, $265 = 0, $270 = 0, $277 = 0, $28 = 0, $283 = 0, $286 = 0, $287 = 0, $291 = 0, $301 = 0, $304 = 0, $308 = 0, $31 = 0, $310 = 0, $311 = 0, $313 = 0, $315 = 0, $317 = 0, $319 = 0, $321 = 0, $323 = 0, $325 = 0, $335 = 0, $336 = 0, $338 = 0, $347 = 0, $349 = 0, $352 = 0, $354 = 0, $357 = 0, $359 = 0, $362 = 0, $365 = 0, $366 = 0, $368 = 0, $369 = 0, $371 = 0, $372 = 0, $374 = 0, $375 = 0, $38 = 0, $380 = 0, $381 = 0, $390 = 0, $399 = 0, $4 = 0, $406 = 0, $41 = 0, $413 = 0, $416 = 0, $424 = 0, $426 = 0, $427 = 0, $428 = 0, $429 = 0, $433 = 0, $434 = 0, $44 = 0, $440 = 0, $445 = 0, $446 = 0, $449 = 0, $451 = 0, $454 = 0, $459 = 0, $46 = 0, $465 = 0, $469 = 0, $47 = 0, $470 = 0, $477 = 0, $486 = 0, $489 = 0, $49 = 0, $494 = 0, $5 = 0, $501 = 0, $502 = 0, $503 = 0, $51 = 0, $511 = 0, $513 = 0, $514 = 0, $524 = 0, $528 = 0, $53 = 0, $530 = 0, $531 = 0, $540 = 0, $547 = 0, $548 = 0, $549 = 0, $55 = 0, $550 = 0, $551 = 0, $552 = 0, $554 = 0, $556 = 0, $557 = 0, $563 = 0, $565 = 0, $567 = 0, $57 = 0, $572 = 0, $575 = 0, $577 = 0, $578 = 0, $579 = 0, $587 = 0, $588 = 0, $59 = 0, $591 = 0, $595 = 0, $596 = 0, $599 = 0, $6 = 0, $601 = 0, $605 = 0, $606 = 0, $61 = 0, $611 = 0, $615 = 0, $624 = 0, $625 = 0, $629 = 0, $631 = 0, $633 = 0, $636 = 0, $638 = 0, $64 = 0, $642 = 0, $643 = 0, $649 = 0, $65 = 0, $655 = 0, $656 = 0, $66 = 0, $661 = 0, $662 = 0, $663 = 0, $667 = 0, $67 = 0, $677 = 0, $679 = 0, $68 = 0, $685 = 0, $686 = 0, $69 = 0, $693 = 0, $697 = 0, $7 = 0, $70 = 0, $703 = 0, $707 = 0, $713 = 0, $715 = 0, $720 = 0, $721 = 0, $725 = 0, $726 = 0, $732 = 0, $738 = 0, $743 = 0, $746 = 0, $747 = 0, $750 = 0, $752 = 0, $754 = 0, $769 = 0, $77 = 0, $774 = 0, $776 = 0, $779 = 0, $782 = 0, $785 = 0, $788 = 0, $789 = 0, $791 = 0, $792 = 0, $794 = 0, $795 = 0, $797 = 0, $798 = 0, $80 = 0, $804 = 0, $805 = 0, $81 = 0, $814 = 0, $823 = 0, $830 = 0, $838 = 0, $84 = 0, $844 = 0, $846 = 0, $847 = 0, $848 = 0, $849 = 0, $853 = 0, $854 = 0, $860 = 0, $865 = 0, $866 = 0, $869 = 0, $871 = 0, $874 = 0, $879 = 0, $88 = 0, $885 = 0, $889 = 0, $890 = 0, $897 = 0, $90 = 0, $906 = 0, $909 = 0, $91 = 0, $914 = 0, $92 = 0, $921 = 0, $922 = 0, $923 = 0, $93 = 0, $931 = 0, $934 = 0, $935 = 0, $94 = 0, $940 = 0, $945 = 0, $946 = 0, $949 = 0, $95 = 0, $950 = 0, $953 = 0, $959 = 0, $960 = 0, $966 = 0, $970 = 0, $976 = 0, $978 = 0, $983 = 0, $985 = 0, $986 = 0, $987 = 0, $988 = 0, $99 = 0, $992 = 0, $993 = 0, $999 = 0, $F$0$i$i = 0, $F1$0$i = 0, $F4$0 = 0, $F4$0$i$i = 0, $F5$0$i = 0, $I1$0$i$i = 0, $I7$0$i = 0, $I7$0$i$i = 0, $K12$025$i = 0, $K2$014$i$i = 0, $K8$052$i$i = 0, $R$0$i = 0, $R$0$i$i = 0, $R$0$i18 = 0, $R$1$i = 0, $R$1$i$i = 0, $R$1$i20 = 0, $RP$0$i = 0, $RP$0$i$i = 0, $RP$0$i17 = 0, $T$0$lcssa$i = 0, $T$0$lcssa$i$i = 0, $T$0$lcssa$i28$i = 0, $T$013$i$i = 0, $T$024$i = 0, $T$051$i$i = 0, $br$0$i = 0, $i$02$i$i = 0, $idx$0$i = 0, $mem$0 = 0, $nb$0 = 0, $oldfirst$0$i$i = 0, $qsize$0$i$i = 0, $rsize$0$i = 0, $rsize$0$i15 = 0, $rsize$1$i = 0, $rsize$2$i = 0, $rsize$3$lcssa$i = 0, $rsize$329$i = 0, $rst$0$i = 0, $rst$1$i = 0, $sizebits$0$i = 0, $sp$0$i$i = 0, $sp$0$i$i$i = 0, $sp$075$i = 0, $sp$168$i = 0, $ssize$0$i = 0, $ssize$1$i = 0, $ssize$2$i = 0, $t$0$i = 0, $t$0$i14 = 0, $t$1$i = 0, $t$2$ph$i = 0, $t$2$v$3$i = 0, $t$228$i = 0, $tbase$0$i = 0, $tbase$247$i = 0, $tsize$0$i = 0, $tsize$0323841$i = 0, $tsize$1$i = 0, $tsize$246$i = 0, $v$0$i = 0, $v$0$i16 = 0, $v$1$i = 0, $v$2$i = 0, $v$3$lcssa$i = 0, $v$330$i = 0, label = 0, sp = 0, $970$looptemp = 0;
 sp = STACKTOP;
 do {
  if ($bytes >>> 0 < 245) {
   if ($bytes >>> 0 < 11) {
    $5 = 16;
   } else {
    $5 = $bytes + 11 & -8;
   }
   $4 = $5 >>> 3;
   $6 = HEAP32[24] | 0;
   $7 = $6 >>> $4;
   if (($7 & 3 | 0) != 0) {
    $12 = ($7 & 1 ^ 1) + $4 | 0;
    $13 = $12 << 1;
    $14 = 136 + ($13 << 2) | 0;
    $15 = 136 + ($13 + 2 << 2) | 0;
    $16 = HEAP32[$15 >> 2] | 0;
    $17 = $16 + 8 | 0;
    $18 = HEAP32[$17 >> 2] | 0;
    do {
     if (($14 | 0) == ($18 | 0)) {
      HEAP32[24] = $6 & ~(1 << $12);
     } else {
      if ($18 >>> 0 < (HEAP32[112 >> 2] | 0) >>> 0) {
       _abort();
      }
      $25 = $18 + 12 | 0;
      if ((HEAP32[$25 >> 2] | 0) == ($16 | 0)) {
       HEAP32[$25 >> 2] = $14;
       HEAP32[$15 >> 2] = $18;
       break;
      } else {
       _abort();
      }
     }
    } while (0);
    $28 = $12 << 3;
    HEAP32[$16 + 4 >> 2] = $28 | 3;
    $31 = $16 + ($28 | 4) | 0;
    HEAP32[$31 >> 2] = HEAP32[$31 >> 2] | 1;
    $mem$0 = $17;
    STACKTOP = sp;
    return $mem$0 | 0;
   }
   if ($5 >>> 0 > (HEAP32[104 >> 2] | 0) >>> 0) {
    if (($7 | 0) != 0) {
     $38 = 2 << $4;
     $41 = $7 << $4 & ($38 | 0 - $38);
     $44 = ($41 & 0 - $41) + -1 | 0;
     $46 = $44 >>> 12 & 16;
     $47 = $44 >>> $46;
     $49 = $47 >>> 5 & 8;
     $51 = $47 >>> $49;
     $53 = $51 >>> 2 & 4;
     $55 = $51 >>> $53;
     $57 = $55 >>> 1 & 2;
     $59 = $55 >>> $57;
     $61 = $59 >>> 1 & 1;
     $64 = ($49 | $46 | $53 | $57 | $61) + ($59 >>> $61) | 0;
     $65 = $64 << 1;
     $66 = 136 + ($65 << 2) | 0;
     $67 = 136 + ($65 + 2 << 2) | 0;
     $68 = HEAP32[$67 >> 2] | 0;
     $69 = $68 + 8 | 0;
     $70 = HEAP32[$69 >> 2] | 0;
     do {
      if (($66 | 0) == ($70 | 0)) {
       HEAP32[24] = $6 & ~(1 << $64);
      } else {
       if ($70 >>> 0 < (HEAP32[112 >> 2] | 0) >>> 0) {
        _abort();
       }
       $77 = $70 + 12 | 0;
       if ((HEAP32[$77 >> 2] | 0) == ($68 | 0)) {
        HEAP32[$77 >> 2] = $66;
        HEAP32[$67 >> 2] = $70;
        break;
       } else {
        _abort();
       }
      }
     } while (0);
     $80 = $64 << 3;
     $81 = $80 - $5 | 0;
     HEAP32[$68 + 4 >> 2] = $5 | 3;
     $84 = $68 + $5 | 0;
     HEAP32[$68 + ($5 | 4) >> 2] = $81 | 1;
     HEAP32[$68 + $80 >> 2] = $81;
     $88 = HEAP32[104 >> 2] | 0;
     if (($88 | 0) != 0) {
      $90 = HEAP32[116 >> 2] | 0;
      $91 = $88 >>> 3;
      $92 = $91 << 1;
      $93 = 136 + ($92 << 2) | 0;
      $94 = HEAP32[24] | 0;
      $95 = 1 << $91;
      if (($94 & $95 | 0) == 0) {
       HEAP32[24] = $94 | $95;
       $$pre$phiZ2D = 136 + ($92 + 2 << 2) | 0;
       $F4$0 = $93;
      } else {
       $99 = 136 + ($92 + 2 << 2) | 0;
       $100 = HEAP32[$99 >> 2] | 0;
       if ($100 >>> 0 < (HEAP32[112 >> 2] | 0) >>> 0) {
        _abort();
       } else {
        $$pre$phiZ2D = $99;
        $F4$0 = $100;
       }
      }
      HEAP32[$$pre$phiZ2D >> 2] = $90;
      HEAP32[$F4$0 + 12 >> 2] = $90;
      HEAP32[$90 + 8 >> 2] = $F4$0;
      HEAP32[$90 + 12 >> 2] = $93;
     }
     HEAP32[104 >> 2] = $81;
     HEAP32[116 >> 2] = $84;
     $mem$0 = $69;
     STACKTOP = sp;
     return $mem$0 | 0;
    }
    $106 = HEAP32[100 >> 2] | 0;
    if (($106 | 0) == 0) {
     $nb$0 = $5;
    } else {
     $110 = ($106 & 0 - $106) + -1 | 0;
     $112 = $110 >>> 12 & 16;
     $113 = $110 >>> $112;
     $115 = $113 >>> 5 & 8;
     $117 = $113 >>> $115;
     $119 = $117 >>> 2 & 4;
     $121 = $117 >>> $119;
     $123 = $121 >>> 1 & 2;
     $125 = $121 >>> $123;
     $127 = $125 >>> 1 & 1;
     $132 = HEAP32[400 + (($115 | $112 | $119 | $123 | $127) + ($125 >>> $127) << 2) >> 2] | 0;
     $rsize$0$i = (HEAP32[$132 + 4 >> 2] & -8) - $5 | 0;
     $t$0$i = $132;
     $v$0$i = $132;
     while (1) {
      $138 = HEAP32[$t$0$i + 16 >> 2] | 0;
      if (($138 | 0) == 0) {
       $141 = HEAP32[$t$0$i + 20 >> 2] | 0;
       if (($141 | 0) == 0) {
        break;
       } else {
        $144 = $141;
       }
      } else {
       $144 = $138;
      }
      $147 = (HEAP32[$144 + 4 >> 2] & -8) - $5 | 0;
      $148 = $147 >>> 0 < $rsize$0$i >>> 0;
      $rsize$0$i = $148 ? $147 : $rsize$0$i;
      $t$0$i = $144;
      $v$0$i = $148 ? $144 : $v$0$i;
     }
     $149 = HEAP32[112 >> 2] | 0;
     if ($v$0$i >>> 0 < $149 >>> 0) {
      _abort();
     }
     $151 = $v$0$i + $5 | 0;
     if (!($v$0$i >>> 0 < $151 >>> 0)) {
      _abort();
     }
     $154 = HEAP32[$v$0$i + 24 >> 2] | 0;
     $156 = HEAP32[$v$0$i + 12 >> 2] | 0;
     do {
      if (($156 | 0) == ($v$0$i | 0)) {
       $167 = $v$0$i + 20 | 0;
       $168 = HEAP32[$167 >> 2] | 0;
       if (($168 | 0) == 0) {
        $170 = $v$0$i + 16 | 0;
        $171 = HEAP32[$170 >> 2] | 0;
        if (($171 | 0) == 0) {
         $R$1$i = 0;
         break;
        } else {
         $R$0$i = $171;
         $RP$0$i = $170;
        }
       } else {
        $R$0$i = $168;
        $RP$0$i = $167;
       }
       while (1) {
        $173 = $R$0$i + 20 | 0;
        $174 = HEAP32[$173 >> 2] | 0;
        if (($174 | 0) != 0) {
         $R$0$i = $174;
         $RP$0$i = $173;
         continue;
        }
        $176 = $R$0$i + 16 | 0;
        $177 = HEAP32[$176 >> 2] | 0;
        if (($177 | 0) == 0) {
         break;
        } else {
         $R$0$i = $177;
         $RP$0$i = $176;
        }
       }
       if ($RP$0$i >>> 0 < $149 >>> 0) {
        _abort();
       } else {
        HEAP32[$RP$0$i >> 2] = 0;
        $R$1$i = $R$0$i;
        break;
       }
      } else {
       $159 = HEAP32[$v$0$i + 8 >> 2] | 0;
       if ($159 >>> 0 < $149 >>> 0) {
        _abort();
       }
       $161 = $159 + 12 | 0;
       if ((HEAP32[$161 >> 2] | 0) != ($v$0$i | 0)) {
        _abort();
       }
       $164 = $156 + 8 | 0;
       if ((HEAP32[$164 >> 2] | 0) == ($v$0$i | 0)) {
        HEAP32[$161 >> 2] = $156;
        HEAP32[$164 >> 2] = $159;
        $R$1$i = $156;
        break;
       } else {
        _abort();
       }
      }
     } while (0);
     do {
      if (($154 | 0) != 0) {
       $182 = HEAP32[$v$0$i + 28 >> 2] | 0;
       $183 = 400 + ($182 << 2) | 0;
       if (($v$0$i | 0) == (HEAP32[$183 >> 2] | 0)) {
        HEAP32[$183 >> 2] = $R$1$i;
        if (($R$1$i | 0) == 0) {
         HEAP32[100 >> 2] = HEAP32[100 >> 2] & ~(1 << $182);
         break;
        }
       } else {
        if ($154 >>> 0 < (HEAP32[112 >> 2] | 0) >>> 0) {
         _abort();
        }
        $192 = $154 + 16 | 0;
        if ((HEAP32[$192 >> 2] | 0) == ($v$0$i | 0)) {
         HEAP32[$192 >> 2] = $R$1$i;
        } else {
         HEAP32[$154 + 20 >> 2] = $R$1$i;
        }
        if (($R$1$i | 0) == 0) {
         break;
        }
       }
       if ($R$1$i >>> 0 < (HEAP32[112 >> 2] | 0) >>> 0) {
        _abort();
       }
       HEAP32[$R$1$i + 24 >> 2] = $154;
       $201 = HEAP32[$v$0$i + 16 >> 2] | 0;
       do {
        if (($201 | 0) != 0) {
         if ($201 >>> 0 < (HEAP32[112 >> 2] | 0) >>> 0) {
          _abort();
         } else {
          HEAP32[$R$1$i + 16 >> 2] = $201;
          HEAP32[$201 + 24 >> 2] = $R$1$i;
          break;
         }
        }
       } while (0);
       $208 = HEAP32[$v$0$i + 20 >> 2] | 0;
       if (($208 | 0) != 0) {
        if ($208 >>> 0 < (HEAP32[112 >> 2] | 0) >>> 0) {
         _abort();
        } else {
         HEAP32[$R$1$i + 20 >> 2] = $208;
         HEAP32[$208 + 24 >> 2] = $R$1$i;
         break;
        }
       }
      }
     } while (0);
     if ($rsize$0$i >>> 0 < 16) {
      $215 = $rsize$0$i + $5 | 0;
      HEAP32[$v$0$i + 4 >> 2] = $215 | 3;
      $218 = $v$0$i + ($215 + 4) | 0;
      HEAP32[$218 >> 2] = HEAP32[$218 >> 2] | 1;
     } else {
      HEAP32[$v$0$i + 4 >> 2] = $5 | 3;
      HEAP32[$v$0$i + ($5 | 4) >> 2] = $rsize$0$i | 1;
      HEAP32[$v$0$i + ($rsize$0$i + $5) >> 2] = $rsize$0$i;
      $226 = HEAP32[104 >> 2] | 0;
      if (($226 | 0) != 0) {
       $228 = HEAP32[116 >> 2] | 0;
       $229 = $226 >>> 3;
       $230 = $229 << 1;
       $231 = 136 + ($230 << 2) | 0;
       $232 = HEAP32[24] | 0;
       $233 = 1 << $229;
       if (($232 & $233 | 0) == 0) {
        HEAP32[24] = $232 | $233;
        $$pre$phi$iZ2D = 136 + ($230 + 2 << 2) | 0;
        $F1$0$i = $231;
       } else {
        $237 = 136 + ($230 + 2 << 2) | 0;
        $238 = HEAP32[$237 >> 2] | 0;
        if ($238 >>> 0 < (HEAP32[112 >> 2] | 0) >>> 0) {
         _abort();
        } else {
         $$pre$phi$iZ2D = $237;
         $F1$0$i = $238;
        }
       }
       HEAP32[$$pre$phi$iZ2D >> 2] = $228;
       HEAP32[$F1$0$i + 12 >> 2] = $228;
       HEAP32[$228 + 8 >> 2] = $F1$0$i;
       HEAP32[$228 + 12 >> 2] = $231;
      }
      HEAP32[104 >> 2] = $rsize$0$i;
      HEAP32[116 >> 2] = $151;
     }
     $mem$0 = $v$0$i + 8 | 0;
     STACKTOP = sp;
     return $mem$0 | 0;
    }
   } else {
    $nb$0 = $5;
   }
  } else {
   if ($bytes >>> 0 > 4294967231) {
    $nb$0 = -1;
   } else {
    $246 = $bytes + 11 | 0;
    $247 = $246 & -8;
    $248 = HEAP32[100 >> 2] | 0;
    if (($248 | 0) == 0) {
     $nb$0 = $247;
    } else {
     $250 = 0 - $247 | 0;
     $251 = $246 >>> 8;
     if (($251 | 0) == 0) {
      $idx$0$i = 0;
     } else {
      if ($247 >>> 0 > 16777215) {
       $idx$0$i = 31;
      } else {
       $256 = ($251 + 1048320 | 0) >>> 16 & 8;
       $257 = $251 << $256;
       $260 = ($257 + 520192 | 0) >>> 16 & 4;
       $262 = $257 << $260;
       $265 = ($262 + 245760 | 0) >>> 16 & 2;
       $270 = 14 - ($260 | $256 | $265) + ($262 << $265 >>> 15) | 0;
       $idx$0$i = $247 >>> ($270 + 7 | 0) & 1 | $270 << 1;
      }
     }
     $277 = HEAP32[400 + ($idx$0$i << 2) >> 2] | 0;
     L126 : do {
      if (($277 | 0) == 0) {
       $rsize$2$i = $250;
       $t$1$i = 0;
       $v$2$i = 0;
      } else {
       if (($idx$0$i | 0) == 31) {
        $283 = 0;
       } else {
        $283 = 25 - ($idx$0$i >>> 1) | 0;
       }
       $rsize$0$i15 = $250;
       $rst$0$i = 0;
       $sizebits$0$i = $247 << $283;
       $t$0$i14 = $277;
       $v$0$i16 = 0;
       while (1) {
        $286 = HEAP32[$t$0$i14 + 4 >> 2] & -8;
        $287 = $286 - $247 | 0;
        if ($287 >>> 0 < $rsize$0$i15 >>> 0) {
         if (($286 | 0) == ($247 | 0)) {
          $rsize$2$i = $287;
          $t$1$i = $t$0$i14;
          $v$2$i = $t$0$i14;
          break L126;
         } else {
          $rsize$1$i = $287;
          $v$1$i = $t$0$i14;
         }
        } else {
         $rsize$1$i = $rsize$0$i15;
         $v$1$i = $v$0$i16;
        }
        $291 = HEAP32[$t$0$i14 + 20 >> 2] | 0;
        $t$0$i14 = HEAP32[$t$0$i14 + ($sizebits$0$i >>> 31 << 2) + 16 >> 2] | 0;
        $rst$1$i = ($291 | 0) == 0 | ($291 | 0) == ($t$0$i14 | 0) ? $rst$0$i : $291;
        if (($t$0$i14 | 0) == 0) {
         $rsize$2$i = $rsize$1$i;
         $t$1$i = $rst$1$i;
         $v$2$i = $v$1$i;
         break;
        } else {
         $rsize$0$i15 = $rsize$1$i;
         $rst$0$i = $rst$1$i;
         $sizebits$0$i = $sizebits$0$i << 1;
         $v$0$i16 = $v$1$i;
        }
       }
      }
     } while (0);
     if (($t$1$i | 0) == 0 & ($v$2$i | 0) == 0) {
      $301 = 2 << $idx$0$i;
      $304 = $248 & ($301 | 0 - $301);
      if (($304 | 0) == 0) {
       $nb$0 = $247;
       break;
      }
      $308 = ($304 & 0 - $304) + -1 | 0;
      $310 = $308 >>> 12 & 16;
      $311 = $308 >>> $310;
      $313 = $311 >>> 5 & 8;
      $315 = $311 >>> $313;
      $317 = $315 >>> 2 & 4;
      $319 = $315 >>> $317;
      $321 = $319 >>> 1 & 2;
      $323 = $319 >>> $321;
      $325 = $323 >>> 1 & 1;
      $t$2$ph$i = HEAP32[400 + (($313 | $310 | $317 | $321 | $325) + ($323 >>> $325) << 2) >> 2] | 0;
     } else {
      $t$2$ph$i = $t$1$i;
     }
     if (($t$2$ph$i | 0) == 0) {
      $rsize$3$lcssa$i = $rsize$2$i;
      $v$3$lcssa$i = $v$2$i;
     } else {
      $rsize$329$i = $rsize$2$i;
      $t$228$i = $t$2$ph$i;
      $v$330$i = $v$2$i;
      while (1) {
       $335 = (HEAP32[$t$228$i + 4 >> 2] & -8) - $247 | 0;
       $336 = $335 >>> 0 < $rsize$329$i >>> 0;
       $$rsize$3$i = $336 ? $335 : $rsize$329$i;
       $t$2$v$3$i = $336 ? $t$228$i : $v$330$i;
       $338 = HEAP32[$t$228$i + 16 >> 2] | 0;
       if (($338 | 0) != 0) {
        $rsize$329$i = $$rsize$3$i;
        $t$228$i = $338;
        $v$330$i = $t$2$v$3$i;
        continue;
       }
       $t$228$i = HEAP32[$t$228$i + 20 >> 2] | 0;
       if (($t$228$i | 0) == 0) {
        $rsize$3$lcssa$i = $$rsize$3$i;
        $v$3$lcssa$i = $t$2$v$3$i;
        break;
       } else {
        $rsize$329$i = $$rsize$3$i;
        $v$330$i = $t$2$v$3$i;
       }
      }
     }
     if (($v$3$lcssa$i | 0) == 0) {
      $nb$0 = $247;
     } else {
      if ($rsize$3$lcssa$i >>> 0 < ((HEAP32[104 >> 2] | 0) - $247 | 0) >>> 0) {
       $347 = HEAP32[112 >> 2] | 0;
       if ($v$3$lcssa$i >>> 0 < $347 >>> 0) {
        _abort();
       }
       $349 = $v$3$lcssa$i + $247 | 0;
       if (!($v$3$lcssa$i >>> 0 < $349 >>> 0)) {
        _abort();
       }
       $352 = HEAP32[$v$3$lcssa$i + 24 >> 2] | 0;
       $354 = HEAP32[$v$3$lcssa$i + 12 >> 2] | 0;
       do {
        if (($354 | 0) == ($v$3$lcssa$i | 0)) {
         $365 = $v$3$lcssa$i + 20 | 0;
         $366 = HEAP32[$365 >> 2] | 0;
         if (($366 | 0) == 0) {
          $368 = $v$3$lcssa$i + 16 | 0;
          $369 = HEAP32[$368 >> 2] | 0;
          if (($369 | 0) == 0) {
           $R$1$i20 = 0;
           break;
          } else {
           $R$0$i18 = $369;
           $RP$0$i17 = $368;
          }
         } else {
          $R$0$i18 = $366;
          $RP$0$i17 = $365;
         }
         while (1) {
          $371 = $R$0$i18 + 20 | 0;
          $372 = HEAP32[$371 >> 2] | 0;
          if (($372 | 0) != 0) {
           $R$0$i18 = $372;
           $RP$0$i17 = $371;
           continue;
          }
          $374 = $R$0$i18 + 16 | 0;
          $375 = HEAP32[$374 >> 2] | 0;
          if (($375 | 0) == 0) {
           break;
          } else {
           $R$0$i18 = $375;
           $RP$0$i17 = $374;
          }
         }
         if ($RP$0$i17 >>> 0 < $347 >>> 0) {
          _abort();
         } else {
          HEAP32[$RP$0$i17 >> 2] = 0;
          $R$1$i20 = $R$0$i18;
          break;
         }
        } else {
         $357 = HEAP32[$v$3$lcssa$i + 8 >> 2] | 0;
         if ($357 >>> 0 < $347 >>> 0) {
          _abort();
         }
         $359 = $357 + 12 | 0;
         if ((HEAP32[$359 >> 2] | 0) != ($v$3$lcssa$i | 0)) {
          _abort();
         }
         $362 = $354 + 8 | 0;
         if ((HEAP32[$362 >> 2] | 0) == ($v$3$lcssa$i | 0)) {
          HEAP32[$359 >> 2] = $354;
          HEAP32[$362 >> 2] = $357;
          $R$1$i20 = $354;
          break;
         } else {
          _abort();
         }
        }
       } while (0);
       do {
        if (($352 | 0) != 0) {
         $380 = HEAP32[$v$3$lcssa$i + 28 >> 2] | 0;
         $381 = 400 + ($380 << 2) | 0;
         if (($v$3$lcssa$i | 0) == (HEAP32[$381 >> 2] | 0)) {
          HEAP32[$381 >> 2] = $R$1$i20;
          if (($R$1$i20 | 0) == 0) {
           HEAP32[100 >> 2] = HEAP32[100 >> 2] & ~(1 << $380);
           break;
          }
         } else {
          if ($352 >>> 0 < (HEAP32[112 >> 2] | 0) >>> 0) {
           _abort();
          }
          $390 = $352 + 16 | 0;
          if ((HEAP32[$390 >> 2] | 0) == ($v$3$lcssa$i | 0)) {
           HEAP32[$390 >> 2] = $R$1$i20;
          } else {
           HEAP32[$352 + 20 >> 2] = $R$1$i20;
          }
          if (($R$1$i20 | 0) == 0) {
           break;
          }
         }
         if ($R$1$i20 >>> 0 < (HEAP32[112 >> 2] | 0) >>> 0) {
          _abort();
         }
         HEAP32[$R$1$i20 + 24 >> 2] = $352;
         $399 = HEAP32[$v$3$lcssa$i + 16 >> 2] | 0;
         do {
          if (($399 | 0) != 0) {
           if ($399 >>> 0 < (HEAP32[112 >> 2] | 0) >>> 0) {
            _abort();
           } else {
            HEAP32[$R$1$i20 + 16 >> 2] = $399;
            HEAP32[$399 + 24 >> 2] = $R$1$i20;
            break;
           }
          }
         } while (0);
         $406 = HEAP32[$v$3$lcssa$i + 20 >> 2] | 0;
         if (($406 | 0) != 0) {
          if ($406 >>> 0 < (HEAP32[112 >> 2] | 0) >>> 0) {
           _abort();
          } else {
           HEAP32[$R$1$i20 + 20 >> 2] = $406;
           HEAP32[$406 + 24 >> 2] = $R$1$i20;
           break;
          }
         }
        }
       } while (0);
       L204 : do {
        if ($rsize$3$lcssa$i >>> 0 < 16) {
         $413 = $rsize$3$lcssa$i + $247 | 0;
         HEAP32[$v$3$lcssa$i + 4 >> 2] = $413 | 3;
         $416 = $v$3$lcssa$i + ($413 + 4) | 0;
         HEAP32[$416 >> 2] = HEAP32[$416 >> 2] | 1;
        } else {
         HEAP32[$v$3$lcssa$i + 4 >> 2] = $247 | 3;
         HEAP32[$v$3$lcssa$i + ($247 | 4) >> 2] = $rsize$3$lcssa$i | 1;
         HEAP32[$v$3$lcssa$i + ($rsize$3$lcssa$i + $247) >> 2] = $rsize$3$lcssa$i;
         $424 = $rsize$3$lcssa$i >>> 3;
         if ($rsize$3$lcssa$i >>> 0 < 256) {
          $426 = $424 << 1;
          $427 = 136 + ($426 << 2) | 0;
          $428 = HEAP32[24] | 0;
          $429 = 1 << $424;
          do {
           if (($428 & $429 | 0) == 0) {
            HEAP32[24] = $428 | $429;
            $$pre$phi$i26Z2D = 136 + ($426 + 2 << 2) | 0;
            $F5$0$i = $427;
           } else {
            $433 = 136 + ($426 + 2 << 2) | 0;
            $434 = HEAP32[$433 >> 2] | 0;
            if (!($434 >>> 0 < (HEAP32[112 >> 2] | 0) >>> 0)) {
             $$pre$phi$i26Z2D = $433;
             $F5$0$i = $434;
             break;
            }
            _abort();
           }
          } while (0);
          HEAP32[$$pre$phi$i26Z2D >> 2] = $349;
          HEAP32[$F5$0$i + 12 >> 2] = $349;
          HEAP32[$v$3$lcssa$i + ($247 + 8) >> 2] = $F5$0$i;
          HEAP32[$v$3$lcssa$i + ($247 + 12) >> 2] = $427;
          break;
         }
         $440 = $rsize$3$lcssa$i >>> 8;
         if (($440 | 0) == 0) {
          $I7$0$i = 0;
         } else {
          if ($rsize$3$lcssa$i >>> 0 > 16777215) {
           $I7$0$i = 31;
          } else {
           $445 = ($440 + 1048320 | 0) >>> 16 & 8;
           $446 = $440 << $445;
           $449 = ($446 + 520192 | 0) >>> 16 & 4;
           $451 = $446 << $449;
           $454 = ($451 + 245760 | 0) >>> 16 & 2;
           $459 = 14 - ($449 | $445 | $454) + ($451 << $454 >>> 15) | 0;
           $I7$0$i = $rsize$3$lcssa$i >>> ($459 + 7 | 0) & 1 | $459 << 1;
          }
         }
         $465 = 400 + ($I7$0$i << 2) | 0;
         HEAP32[$v$3$lcssa$i + ($247 + 28) >> 2] = $I7$0$i;
         HEAP32[$v$3$lcssa$i + ($247 + 20) >> 2] = 0;
         HEAP32[$v$3$lcssa$i + ($247 + 16) >> 2] = 0;
         $469 = HEAP32[100 >> 2] | 0;
         $470 = 1 << $I7$0$i;
         if (($469 & $470 | 0) == 0) {
          HEAP32[100 >> 2] = $469 | $470;
          HEAP32[$465 >> 2] = $349;
          HEAP32[$v$3$lcssa$i + ($247 + 24) >> 2] = $465;
          HEAP32[$v$3$lcssa$i + ($247 + 12) >> 2] = $349;
          HEAP32[$v$3$lcssa$i + ($247 + 8) >> 2] = $349;
          break;
         }
         $477 = HEAP32[$465 >> 2] | 0;
         if (($I7$0$i | 0) == 31) {
          $486 = 0;
         } else {
          $486 = 25 - ($I7$0$i >>> 1) | 0;
         }
         L225 : do {
          if ((HEAP32[$477 + 4 >> 2] & -8 | 0) == ($rsize$3$lcssa$i | 0)) {
           $T$0$lcssa$i = $477;
          } else {
           $K12$025$i = $rsize$3$lcssa$i << $486;
           $T$024$i = $477;
           while (1) {
            $494 = $T$024$i + ($K12$025$i >>> 31 << 2) + 16 | 0;
            $489 = HEAP32[$494 >> 2] | 0;
            if (($489 | 0) == 0) {
             break;
            }
            if ((HEAP32[$489 + 4 >> 2] & -8 | 0) == ($rsize$3$lcssa$i | 0)) {
             $T$0$lcssa$i = $489;
             break L225;
            } else {
             $K12$025$i = $K12$025$i << 1;
             $T$024$i = $489;
            }
           }
           if ($494 >>> 0 < (HEAP32[112 >> 2] | 0) >>> 0) {
            _abort();
           } else {
            HEAP32[$494 >> 2] = $349;
            HEAP32[$v$3$lcssa$i + ($247 + 24) >> 2] = $T$024$i;
            HEAP32[$v$3$lcssa$i + ($247 + 12) >> 2] = $349;
            HEAP32[$v$3$lcssa$i + ($247 + 8) >> 2] = $349;
            break L204;
           }
          }
         } while (0);
         $501 = $T$0$lcssa$i + 8 | 0;
         $502 = HEAP32[$501 >> 2] | 0;
         $503 = HEAP32[112 >> 2] | 0;
         if ($T$0$lcssa$i >>> 0 < $503 >>> 0) {
          _abort();
         }
         if ($502 >>> 0 < $503 >>> 0) {
          _abort();
         } else {
          HEAP32[$502 + 12 >> 2] = $349;
          HEAP32[$501 >> 2] = $349;
          HEAP32[$v$3$lcssa$i + ($247 + 8) >> 2] = $502;
          HEAP32[$v$3$lcssa$i + ($247 + 12) >> 2] = $T$0$lcssa$i;
          HEAP32[$v$3$lcssa$i + ($247 + 24) >> 2] = 0;
          break;
         }
        }
       } while (0);
       $mem$0 = $v$3$lcssa$i + 8 | 0;
       STACKTOP = sp;
       return $mem$0 | 0;
      } else {
       $nb$0 = $247;
      }
     }
    }
   }
  }
 } while (0);
 $511 = HEAP32[104 >> 2] | 0;
 if (!($nb$0 >>> 0 > $511 >>> 0)) {
  $513 = $511 - $nb$0 | 0;
  $514 = HEAP32[116 >> 2] | 0;
  if ($513 >>> 0 > 15) {
   HEAP32[116 >> 2] = $514 + $nb$0;
   HEAP32[104 >> 2] = $513;
   HEAP32[$514 + ($nb$0 + 4) >> 2] = $513 | 1;
   HEAP32[$514 + $511 >> 2] = $513;
   HEAP32[$514 + 4 >> 2] = $nb$0 | 3;
  } else {
   HEAP32[104 >> 2] = 0;
   HEAP32[116 >> 2] = 0;
   HEAP32[$514 + 4 >> 2] = $511 | 3;
   $524 = $514 + ($511 + 4) | 0;
   HEAP32[$524 >> 2] = HEAP32[$524 >> 2] | 1;
  }
  $mem$0 = $514 + 8 | 0;
  STACKTOP = sp;
  return $mem$0 | 0;
 }
 $528 = HEAP32[108 >> 2] | 0;
 if ($nb$0 >>> 0 < $528 >>> 0) {
  $530 = $528 - $nb$0 | 0;
  HEAP32[108 >> 2] = $530;
  $531 = HEAP32[120 >> 2] | 0;
  HEAP32[120 >> 2] = $531 + $nb$0;
  HEAP32[$531 + ($nb$0 + 4) >> 2] = $530 | 1;
  HEAP32[$531 + 4 >> 2] = $nb$0 | 3;
  $mem$0 = $531 + 8 | 0;
  STACKTOP = sp;
  return $mem$0 | 0;
 }
 do {
  if ((HEAP32[142] | 0) == 0) {
   $540 = _sysconf(30) | 0;
   if (($540 + -1 & $540 | 0) == 0) {
    HEAP32[576 >> 2] = $540;
    HEAP32[572 >> 2] = $540;
    HEAP32[580 >> 2] = -1;
    HEAP32[584 >> 2] = -1;
    HEAP32[588 >> 2] = 0;
    HEAP32[540 >> 2] = 0;
    HEAP32[142] = (_time(0) | 0) & -16 ^ 1431655768;
    break;
   } else {
    _abort();
   }
  }
 } while (0);
 $547 = $nb$0 + 48 | 0;
 $548 = HEAP32[576 >> 2] | 0;
 $549 = $nb$0 + 47 | 0;
 $550 = $548 + $549 | 0;
 $551 = 0 - $548 | 0;
 $552 = $550 & $551;
 if (!($552 >>> 0 > $nb$0 >>> 0)) {
  $mem$0 = 0;
  STACKTOP = sp;
  return $mem$0 | 0;
 }
 $554 = HEAP32[536 >> 2] | 0;
 if (($554 | 0) != 0) {
  $556 = HEAP32[528 >> 2] | 0;
  $557 = $556 + $552 | 0;
  if ($557 >>> 0 <= $556 >>> 0 | $557 >>> 0 > $554 >>> 0) {
   $mem$0 = 0;
   STACKTOP = sp;
   return $mem$0 | 0;
  }
 }
 L269 : do {
  if ((HEAP32[540 >> 2] & 4 | 0) == 0) {
   $563 = HEAP32[120 >> 2] | 0;
   L271 : do {
    if (($563 | 0) == 0) {
     label = 182;
    } else {
     $sp$0$i$i = 544 | 0;
     while (1) {
      $565 = HEAP32[$sp$0$i$i >> 2] | 0;
      if (!($565 >>> 0 > $563 >>> 0)) {
       $567 = $sp$0$i$i + 4 | 0;
       if (($565 + (HEAP32[$567 >> 2] | 0) | 0) >>> 0 > $563 >>> 0) {
        break;
       }
      }
      $572 = HEAP32[$sp$0$i$i + 8 >> 2] | 0;
      if (($572 | 0) == 0) {
       label = 182;
       break L271;
      } else {
       $sp$0$i$i = $572;
      }
     }
     if (($sp$0$i$i | 0) == 0) {
      label = 182;
     } else {
      $599 = $550 - (HEAP32[108 >> 2] | 0) & $551;
      if ($599 >>> 0 < 2147483647) {
       $601 = _sbrk($599 | 0) | 0;
       $605 = ($601 | 0) == ((HEAP32[$sp$0$i$i >> 2] | 0) + (HEAP32[$567 >> 2] | 0) | 0);
       $br$0$i = $601;
       $ssize$1$i = $599;
       $tbase$0$i = $605 ? $601 : -1;
       $tsize$0$i = $605 ? $599 : 0;
       label = 191;
      } else {
       $tsize$0323841$i = 0;
      }
     }
    }
   } while (0);
   do {
    if ((label | 0) == 182) {
     $575 = _sbrk(0) | 0;
     if (($575 | 0) == (-1 | 0)) {
      $tsize$0323841$i = 0;
     } else {
      $577 = $575;
      $578 = HEAP32[572 >> 2] | 0;
      $579 = $578 + -1 | 0;
      if (($579 & $577 | 0) == 0) {
       $ssize$0$i = $552;
      } else {
       $ssize$0$i = $552 - $577 + ($579 + $577 & 0 - $578) | 0;
      }
      $587 = HEAP32[528 >> 2] | 0;
      $588 = $587 + $ssize$0$i | 0;
      if ($ssize$0$i >>> 0 > $nb$0 >>> 0 & $ssize$0$i >>> 0 < 2147483647) {
       $591 = HEAP32[536 >> 2] | 0;
       if (($591 | 0) != 0) {
        if ($588 >>> 0 <= $587 >>> 0 | $588 >>> 0 > $591 >>> 0) {
         $tsize$0323841$i = 0;
         break;
        }
       }
       $595 = _sbrk($ssize$0$i | 0) | 0;
       $596 = ($595 | 0) == ($575 | 0);
       $br$0$i = $595;
       $ssize$1$i = $ssize$0$i;
       $tbase$0$i = $596 ? $575 : -1;
       $tsize$0$i = $596 ? $ssize$0$i : 0;
       label = 191;
      } else {
       $tsize$0323841$i = 0;
      }
     }
    }
   } while (0);
   L291 : do {
    if ((label | 0) == 191) {
     $606 = 0 - $ssize$1$i | 0;
     if (($tbase$0$i | 0) != (-1 | 0)) {
      $tbase$247$i = $tbase$0$i;
      $tsize$246$i = $tsize$0$i;
      label = 202;
      break L269;
     }
     do {
      if (($br$0$i | 0) != (-1 | 0) & $ssize$1$i >>> 0 < 2147483647 & $ssize$1$i >>> 0 < $547 >>> 0) {
       $611 = HEAP32[576 >> 2] | 0;
       $615 = $549 - $ssize$1$i + $611 & 0 - $611;
       if ($615 >>> 0 < 2147483647) {
        if ((_sbrk($615 | 0) | 0) == (-1 | 0)) {
         _sbrk($606 | 0) | 0;
         $tsize$0323841$i = $tsize$0$i;
         break L291;
        } else {
         $ssize$2$i = $615 + $ssize$1$i | 0;
         break;
        }
       } else {
        $ssize$2$i = $ssize$1$i;
       }
      } else {
       $ssize$2$i = $ssize$1$i;
      }
     } while (0);
     if (($br$0$i | 0) == (-1 | 0)) {
      $tsize$0323841$i = $tsize$0$i;
     } else {
      $tbase$247$i = $br$0$i;
      $tsize$246$i = $ssize$2$i;
      label = 202;
      break L269;
     }
    }
   } while (0);
   HEAP32[540 >> 2] = HEAP32[540 >> 2] | 4;
   $tsize$1$i = $tsize$0323841$i;
   label = 199;
  } else {
   $tsize$1$i = 0;
   label = 199;
  }
 } while (0);
 if ((label | 0) == 199) {
  if ($552 >>> 0 < 2147483647) {
   $624 = _sbrk($552 | 0) | 0;
   $625 = _sbrk(0) | 0;
   if (($625 | 0) != (-1 | 0) & ($624 | 0) != (-1 | 0) & $624 >>> 0 < $625 >>> 0) {
    $629 = $625 - $624 | 0;
    $631 = $629 >>> 0 > ($nb$0 + 40 | 0) >>> 0;
    if ($631) {
     $tbase$247$i = $624;
     $tsize$246$i = $631 ? $629 : $tsize$1$i;
     label = 202;
    }
   }
  }
 }
 if ((label | 0) == 202) {
  $633 = (HEAP32[528 >> 2] | 0) + $tsize$246$i | 0;
  HEAP32[528 >> 2] = $633;
  if ($633 >>> 0 > (HEAP32[532 >> 2] | 0) >>> 0) {
   HEAP32[532 >> 2] = $633;
  }
  $636 = HEAP32[120 >> 2] | 0;
  L311 : do {
   if (($636 | 0) == 0) {
    $638 = HEAP32[112 >> 2] | 0;
    if (($638 | 0) == 0 | $tbase$247$i >>> 0 < $638 >>> 0) {
     HEAP32[112 >> 2] = $tbase$247$i;
    }
    HEAP32[544 >> 2] = $tbase$247$i;
    HEAP32[548 >> 2] = $tsize$246$i;
    HEAP32[556 >> 2] = 0;
    HEAP32[132 >> 2] = HEAP32[142];
    HEAP32[128 >> 2] = -1;
    $i$02$i$i = 0;
    do {
     $642 = $i$02$i$i << 1;
     $643 = 136 + ($642 << 2) | 0;
     HEAP32[136 + ($642 + 3 << 2) >> 2] = $643;
     HEAP32[136 + ($642 + 2 << 2) >> 2] = $643;
     $i$02$i$i = $i$02$i$i + 1 | 0;
    } while (($i$02$i$i | 0) != 32);
    $649 = $tbase$247$i + 8 | 0;
    if (($649 & 7 | 0) == 0) {
     $655 = 0;
    } else {
     $655 = 0 - $649 & 7;
    }
    $656 = $tsize$246$i + -40 - $655 | 0;
    HEAP32[120 >> 2] = $tbase$247$i + $655;
    HEAP32[108 >> 2] = $656;
    HEAP32[$tbase$247$i + ($655 + 4) >> 2] = $656 | 1;
    HEAP32[$tbase$247$i + ($tsize$246$i + -36) >> 2] = 40;
    HEAP32[124 >> 2] = HEAP32[584 >> 2];
   } else {
    $sp$075$i = 544 | 0;
    while (1) {
     $661 = HEAP32[$sp$075$i >> 2] | 0;
     $662 = $sp$075$i + 4 | 0;
     $663 = HEAP32[$662 >> 2] | 0;
     if (($tbase$247$i | 0) == ($661 + $663 | 0)) {
      label = 214;
      break;
     }
     $667 = HEAP32[$sp$075$i + 8 >> 2] | 0;
     if (($667 | 0) == 0) {
      break;
     } else {
      $sp$075$i = $667;
     }
    }
    if ((label | 0) == 214) {
     if ((HEAP32[$sp$075$i + 12 >> 2] & 8 | 0) == 0) {
      if ($636 >>> 0 >= $661 >>> 0 & $636 >>> 0 < $tbase$247$i >>> 0) {
       HEAP32[$662 >> 2] = $663 + $tsize$246$i;
       $677 = (HEAP32[108 >> 2] | 0) + $tsize$246$i | 0;
       $679 = $636 + 8 | 0;
       if (($679 & 7 | 0) == 0) {
        $685 = 0;
       } else {
        $685 = 0 - $679 & 7;
       }
       $686 = $677 - $685 | 0;
       HEAP32[120 >> 2] = $636 + $685;
       HEAP32[108 >> 2] = $686;
       HEAP32[$636 + ($685 + 4) >> 2] = $686 | 1;
       HEAP32[$636 + ($677 + 4) >> 2] = 40;
       HEAP32[124 >> 2] = HEAP32[584 >> 2];
       break;
      }
     }
    }
    if ($tbase$247$i >>> 0 < (HEAP32[112 >> 2] | 0) >>> 0) {
     HEAP32[112 >> 2] = $tbase$247$i;
    }
    $693 = $tbase$247$i + $tsize$246$i | 0;
    $sp$168$i = 544 | 0;
    while (1) {
     if ((HEAP32[$sp$168$i >> 2] | 0) == ($693 | 0)) {
      label = 224;
      break;
     }
     $697 = HEAP32[$sp$168$i + 8 >> 2] | 0;
     if (($697 | 0) == 0) {
      break;
     } else {
      $sp$168$i = $697;
     }
    }
    if ((label | 0) == 224) {
     if ((HEAP32[$sp$168$i + 12 >> 2] & 8 | 0) == 0) {
      HEAP32[$sp$168$i >> 2] = $tbase$247$i;
      $703 = $sp$168$i + 4 | 0;
      HEAP32[$703 >> 2] = (HEAP32[$703 >> 2] | 0) + $tsize$246$i;
      $707 = $tbase$247$i + 8 | 0;
      if (($707 & 7 | 0) == 0) {
       $713 = 0;
      } else {
       $713 = 0 - $707 & 7;
      }
      $715 = $tbase$247$i + ($tsize$246$i + 8) | 0;
      if (($715 & 7 | 0) == 0) {
       $720 = 0;
      } else {
       $720 = 0 - $715 & 7;
      }
      $721 = $tbase$247$i + ($720 + $tsize$246$i) | 0;
      $$sum$i21$i = $713 + $nb$0 | 0;
      $725 = $tbase$247$i + $$sum$i21$i | 0;
      $726 = $721 - ($tbase$247$i + $713) - $nb$0 | 0;
      HEAP32[$tbase$247$i + ($713 + 4) >> 2] = $nb$0 | 3;
      L338 : do {
       if (($721 | 0) == (HEAP32[120 >> 2] | 0)) {
        $732 = (HEAP32[108 >> 2] | 0) + $726 | 0;
        HEAP32[108 >> 2] = $732;
        HEAP32[120 >> 2] = $725;
        HEAP32[$tbase$247$i + ($$sum$i21$i + 4) >> 2] = $732 | 1;
       } else {
        if (($721 | 0) == (HEAP32[116 >> 2] | 0)) {
         $738 = (HEAP32[104 >> 2] | 0) + $726 | 0;
         HEAP32[104 >> 2] = $738;
         HEAP32[116 >> 2] = $725;
         HEAP32[$tbase$247$i + ($$sum$i21$i + 4) >> 2] = $738 | 1;
         HEAP32[$tbase$247$i + ($738 + $$sum$i21$i) >> 2] = $738;
         break;
        }
        $$sum2$i23$i = $tsize$246$i + 4 | 0;
        $743 = HEAP32[$tbase$247$i + ($$sum2$i23$i + $720) >> 2] | 0;
        if (($743 & 3 | 0) == 1) {
         $746 = $743 & -8;
         $747 = $743 >>> 3;
         L346 : do {
          if ($743 >>> 0 < 256) {
           $750 = HEAP32[$tbase$247$i + (($720 | 8) + $tsize$246$i) >> 2] | 0;
           $752 = HEAP32[$tbase$247$i + ($tsize$246$i + 12 + $720) >> 2] | 0;
           $754 = 136 + ($747 << 1 << 2) | 0;
           do {
            if (($750 | 0) != ($754 | 0)) {
             if ($750 >>> 0 < (HEAP32[112 >> 2] | 0) >>> 0) {
              _abort();
             }
             if ((HEAP32[$750 + 12 >> 2] | 0) == ($721 | 0)) {
              break;
             }
             _abort();
            }
           } while (0);
           if (($752 | 0) == ($750 | 0)) {
            HEAP32[24] = HEAP32[24] & ~(1 << $747);
            break;
           }
           do {
            if (($752 | 0) == ($754 | 0)) {
             $$pre$phi58$i$iZ2D = $752 + 8 | 0;
            } else {
             if ($752 >>> 0 < (HEAP32[112 >> 2] | 0) >>> 0) {
              _abort();
             }
             $769 = $752 + 8 | 0;
             if ((HEAP32[$769 >> 2] | 0) == ($721 | 0)) {
              $$pre$phi58$i$iZ2D = $769;
              break;
             }
             _abort();
            }
           } while (0);
           HEAP32[$750 + 12 >> 2] = $752;
           HEAP32[$$pre$phi58$i$iZ2D >> 2] = $750;
          } else {
           $774 = HEAP32[$tbase$247$i + (($720 | 24) + $tsize$246$i) >> 2] | 0;
           $776 = HEAP32[$tbase$247$i + ($tsize$246$i + 12 + $720) >> 2] | 0;
           do {
            if (($776 | 0) == ($721 | 0)) {
             $$sum67$i$i = $720 | 16;
             $788 = $tbase$247$i + ($$sum2$i23$i + $$sum67$i$i) | 0;
             $789 = HEAP32[$788 >> 2] | 0;
             if (($789 | 0) == 0) {
              $791 = $tbase$247$i + ($$sum67$i$i + $tsize$246$i) | 0;
              $792 = HEAP32[$791 >> 2] | 0;
              if (($792 | 0) == 0) {
               $R$1$i$i = 0;
               break;
              } else {
               $R$0$i$i = $792;
               $RP$0$i$i = $791;
              }
             } else {
              $R$0$i$i = $789;
              $RP$0$i$i = $788;
             }
             while (1) {
              $794 = $R$0$i$i + 20 | 0;
              $795 = HEAP32[$794 >> 2] | 0;
              if (($795 | 0) != 0) {
               $R$0$i$i = $795;
               $RP$0$i$i = $794;
               continue;
              }
              $797 = $R$0$i$i + 16 | 0;
              $798 = HEAP32[$797 >> 2] | 0;
              if (($798 | 0) == 0) {
               break;
              } else {
               $R$0$i$i = $798;
               $RP$0$i$i = $797;
              }
             }
             if ($RP$0$i$i >>> 0 < (HEAP32[112 >> 2] | 0) >>> 0) {
              _abort();
             } else {
              HEAP32[$RP$0$i$i >> 2] = 0;
              $R$1$i$i = $R$0$i$i;
              break;
             }
            } else {
             $779 = HEAP32[$tbase$247$i + (($720 | 8) + $tsize$246$i) >> 2] | 0;
             if ($779 >>> 0 < (HEAP32[112 >> 2] | 0) >>> 0) {
              _abort();
             }
             $782 = $779 + 12 | 0;
             if ((HEAP32[$782 >> 2] | 0) != ($721 | 0)) {
              _abort();
             }
             $785 = $776 + 8 | 0;
             if ((HEAP32[$785 >> 2] | 0) == ($721 | 0)) {
              HEAP32[$782 >> 2] = $776;
              HEAP32[$785 >> 2] = $779;
              $R$1$i$i = $776;
              break;
             } else {
              _abort();
             }
            }
           } while (0);
           if (($774 | 0) == 0) {
            break;
           }
           $804 = HEAP32[$tbase$247$i + ($tsize$246$i + 28 + $720) >> 2] | 0;
           $805 = 400 + ($804 << 2) | 0;
           do {
            if (($721 | 0) == (HEAP32[$805 >> 2] | 0)) {
             HEAP32[$805 >> 2] = $R$1$i$i;
             if (($R$1$i$i | 0) != 0) {
              break;
             }
             HEAP32[100 >> 2] = HEAP32[100 >> 2] & ~(1 << $804);
             break L346;
            } else {
             if ($774 >>> 0 < (HEAP32[112 >> 2] | 0) >>> 0) {
              _abort();
             }
             $814 = $774 + 16 | 0;
             if ((HEAP32[$814 >> 2] | 0) == ($721 | 0)) {
              HEAP32[$814 >> 2] = $R$1$i$i;
             } else {
              HEAP32[$774 + 20 >> 2] = $R$1$i$i;
             }
             if (($R$1$i$i | 0) == 0) {
              break L346;
             }
            }
           } while (0);
           if ($R$1$i$i >>> 0 < (HEAP32[112 >> 2] | 0) >>> 0) {
            _abort();
           }
           HEAP32[$R$1$i$i + 24 >> 2] = $774;
           $$sum3132$i$i = $720 | 16;
           $823 = HEAP32[$tbase$247$i + ($$sum3132$i$i + $tsize$246$i) >> 2] | 0;
           do {
            if (($823 | 0) != 0) {
             if ($823 >>> 0 < (HEAP32[112 >> 2] | 0) >>> 0) {
              _abort();
             } else {
              HEAP32[$R$1$i$i + 16 >> 2] = $823;
              HEAP32[$823 + 24 >> 2] = $R$1$i$i;
              break;
             }
            }
           } while (0);
           $830 = HEAP32[$tbase$247$i + ($$sum2$i23$i + $$sum3132$i$i) >> 2] | 0;
           if (($830 | 0) == 0) {
            break;
           }
           if ($830 >>> 0 < (HEAP32[112 >> 2] | 0) >>> 0) {
            _abort();
           } else {
            HEAP32[$R$1$i$i + 20 >> 2] = $830;
            HEAP32[$830 + 24 >> 2] = $R$1$i$i;
            break;
           }
          }
         } while (0);
         $oldfirst$0$i$i = $tbase$247$i + (($746 | $720) + $tsize$246$i) | 0;
         $qsize$0$i$i = $746 + $726 | 0;
        } else {
         $oldfirst$0$i$i = $721;
         $qsize$0$i$i = $726;
        }
        $838 = $oldfirst$0$i$i + 4 | 0;
        HEAP32[$838 >> 2] = HEAP32[$838 >> 2] & -2;
        HEAP32[$tbase$247$i + ($$sum$i21$i + 4) >> 2] = $qsize$0$i$i | 1;
        HEAP32[$tbase$247$i + ($qsize$0$i$i + $$sum$i21$i) >> 2] = $qsize$0$i$i;
        $844 = $qsize$0$i$i >>> 3;
        if ($qsize$0$i$i >>> 0 < 256) {
         $846 = $844 << 1;
         $847 = 136 + ($846 << 2) | 0;
         $848 = HEAP32[24] | 0;
         $849 = 1 << $844;
         do {
          if (($848 & $849 | 0) == 0) {
           HEAP32[24] = $848 | $849;
           $$pre$phi$i26$iZ2D = 136 + ($846 + 2 << 2) | 0;
           $F4$0$i$i = $847;
          } else {
           $853 = 136 + ($846 + 2 << 2) | 0;
           $854 = HEAP32[$853 >> 2] | 0;
           if (!($854 >>> 0 < (HEAP32[112 >> 2] | 0) >>> 0)) {
            $$pre$phi$i26$iZ2D = $853;
            $F4$0$i$i = $854;
            break;
           }
           _abort();
          }
         } while (0);
         HEAP32[$$pre$phi$i26$iZ2D >> 2] = $725;
         HEAP32[$F4$0$i$i + 12 >> 2] = $725;
         HEAP32[$tbase$247$i + ($$sum$i21$i + 8) >> 2] = $F4$0$i$i;
         HEAP32[$tbase$247$i + ($$sum$i21$i + 12) >> 2] = $847;
         break;
        }
        $860 = $qsize$0$i$i >>> 8;
        do {
         if (($860 | 0) == 0) {
          $I7$0$i$i = 0;
         } else {
          if ($qsize$0$i$i >>> 0 > 16777215) {
           $I7$0$i$i = 31;
           break;
          }
          $865 = ($860 + 1048320 | 0) >>> 16 & 8;
          $866 = $860 << $865;
          $869 = ($866 + 520192 | 0) >>> 16 & 4;
          $871 = $866 << $869;
          $874 = ($871 + 245760 | 0) >>> 16 & 2;
          $879 = 14 - ($869 | $865 | $874) + ($871 << $874 >>> 15) | 0;
          $I7$0$i$i = $qsize$0$i$i >>> ($879 + 7 | 0) & 1 | $879 << 1;
         }
        } while (0);
        $885 = 400 + ($I7$0$i$i << 2) | 0;
        HEAP32[$tbase$247$i + ($$sum$i21$i + 28) >> 2] = $I7$0$i$i;
        HEAP32[$tbase$247$i + ($$sum$i21$i + 20) >> 2] = 0;
        HEAP32[$tbase$247$i + ($$sum$i21$i + 16) >> 2] = 0;
        $889 = HEAP32[100 >> 2] | 0;
        $890 = 1 << $I7$0$i$i;
        if (($889 & $890 | 0) == 0) {
         HEAP32[100 >> 2] = $889 | $890;
         HEAP32[$885 >> 2] = $725;
         HEAP32[$tbase$247$i + ($$sum$i21$i + 24) >> 2] = $885;
         HEAP32[$tbase$247$i + ($$sum$i21$i + 12) >> 2] = $725;
         HEAP32[$tbase$247$i + ($$sum$i21$i + 8) >> 2] = $725;
         break;
        }
        $897 = HEAP32[$885 >> 2] | 0;
        if (($I7$0$i$i | 0) == 31) {
         $906 = 0;
        } else {
         $906 = 25 - ($I7$0$i$i >>> 1) | 0;
        }
        L435 : do {
         if ((HEAP32[$897 + 4 >> 2] & -8 | 0) == ($qsize$0$i$i | 0)) {
          $T$0$lcssa$i28$i = $897;
         } else {
          $K8$052$i$i = $qsize$0$i$i << $906;
          $T$051$i$i = $897;
          while (1) {
           $914 = $T$051$i$i + ($K8$052$i$i >>> 31 << 2) + 16 | 0;
           $909 = HEAP32[$914 >> 2] | 0;
           if (($909 | 0) == 0) {
            break;
           }
           if ((HEAP32[$909 + 4 >> 2] & -8 | 0) == ($qsize$0$i$i | 0)) {
            $T$0$lcssa$i28$i = $909;
            break L435;
           } else {
            $K8$052$i$i = $K8$052$i$i << 1;
            $T$051$i$i = $909;
           }
          }
          if ($914 >>> 0 < (HEAP32[112 >> 2] | 0) >>> 0) {
           _abort();
          } else {
           HEAP32[$914 >> 2] = $725;
           HEAP32[$tbase$247$i + ($$sum$i21$i + 24) >> 2] = $T$051$i$i;
           HEAP32[$tbase$247$i + ($$sum$i21$i + 12) >> 2] = $725;
           HEAP32[$tbase$247$i + ($$sum$i21$i + 8) >> 2] = $725;
           break L338;
          }
         }
        } while (0);
        $921 = $T$0$lcssa$i28$i + 8 | 0;
        $922 = HEAP32[$921 >> 2] | 0;
        $923 = HEAP32[112 >> 2] | 0;
        if ($T$0$lcssa$i28$i >>> 0 < $923 >>> 0) {
         _abort();
        }
        if ($922 >>> 0 < $923 >>> 0) {
         _abort();
        } else {
         HEAP32[$922 + 12 >> 2] = $725;
         HEAP32[$921 >> 2] = $725;
         HEAP32[$tbase$247$i + ($$sum$i21$i + 8) >> 2] = $922;
         HEAP32[$tbase$247$i + ($$sum$i21$i + 12) >> 2] = $T$0$lcssa$i28$i;
         HEAP32[$tbase$247$i + ($$sum$i21$i + 24) >> 2] = 0;
         break;
        }
       }
      } while (0);
      $mem$0 = $tbase$247$i + ($713 | 8) | 0;
      STACKTOP = sp;
      return $mem$0 | 0;
     }
    }
    $sp$0$i$i$i = 544 | 0;
    while (1) {
     $931 = HEAP32[$sp$0$i$i$i >> 2] | 0;
     if (!($931 >>> 0 > $636 >>> 0)) {
      $934 = HEAP32[$sp$0$i$i$i + 4 >> 2] | 0;
      $935 = $931 + $934 | 0;
      if ($935 >>> 0 > $636 >>> 0) {
       break;
      }
     }
     $sp$0$i$i$i = HEAP32[$sp$0$i$i$i + 8 >> 2] | 0;
    }
    $940 = $931 + ($934 + -39) | 0;
    if (($940 & 7 | 0) == 0) {
     $945 = 0;
    } else {
     $945 = 0 - $940 & 7;
    }
    $946 = $931 + ($934 + -47 + $945) | 0;
    $949 = $946 >>> 0 < ($636 + 16 | 0) >>> 0 ? $636 : $946;
    $950 = $949 + 8 | 0;
    $953 = $tbase$247$i + 8 | 0;
    if (($953 & 7 | 0) == 0) {
     $959 = 0;
    } else {
     $959 = 0 - $953 & 7;
    }
    $960 = $tsize$246$i + -40 - $959 | 0;
    HEAP32[120 >> 2] = $tbase$247$i + $959;
    HEAP32[108 >> 2] = $960;
    HEAP32[$tbase$247$i + ($959 + 4) >> 2] = $960 | 1;
    HEAP32[$tbase$247$i + ($tsize$246$i + -36) >> 2] = 40;
    HEAP32[124 >> 2] = HEAP32[584 >> 2];
    HEAP32[$949 + 4 >> 2] = 27;
    HEAP32[$950 + 0 >> 2] = HEAP32[544 >> 2];
    HEAP32[$950 + 4 >> 2] = HEAP32[548 >> 2];
    HEAP32[$950 + 8 >> 2] = HEAP32[552 >> 2];
    HEAP32[$950 + 12 >> 2] = HEAP32[556 >> 2];
    HEAP32[544 >> 2] = $tbase$247$i;
    HEAP32[548 >> 2] = $tsize$246$i;
    HEAP32[556 >> 2] = 0;
    HEAP32[552 >> 2] = $950;
    $966 = $949 + 28 | 0;
    HEAP32[$966 >> 2] = 7;
    if (($949 + 32 | 0) >>> 0 < $935 >>> 0) {
     $970 = $966;
     do {
      $970$looptemp = $970;
      $970 = $970 + 4 | 0;
      HEAP32[$970 >> 2] = 7;
     } while (($970$looptemp + 8 | 0) >>> 0 < $935 >>> 0);
    }
    if (($949 | 0) != ($636 | 0)) {
     $976 = $949 - $636 | 0;
     $978 = $636 + ($976 + 4) | 0;
     HEAP32[$978 >> 2] = HEAP32[$978 >> 2] & -2;
     HEAP32[$636 + 4 >> 2] = $976 | 1;
     HEAP32[$636 + $976 >> 2] = $976;
     $983 = $976 >>> 3;
     if ($976 >>> 0 < 256) {
      $985 = $983 << 1;
      $986 = 136 + ($985 << 2) | 0;
      $987 = HEAP32[24] | 0;
      $988 = 1 << $983;
      do {
       if (($987 & $988 | 0) == 0) {
        HEAP32[24] = $987 | $988;
        $$pre$phi$i$iZ2D = 136 + ($985 + 2 << 2) | 0;
        $F$0$i$i = $986;
       } else {
        $992 = 136 + ($985 + 2 << 2) | 0;
        $993 = HEAP32[$992 >> 2] | 0;
        if (!($993 >>> 0 < (HEAP32[112 >> 2] | 0) >>> 0)) {
         $$pre$phi$i$iZ2D = $992;
         $F$0$i$i = $993;
         break;
        }
        _abort();
       }
      } while (0);
      HEAP32[$$pre$phi$i$iZ2D >> 2] = $636;
      HEAP32[$F$0$i$i + 12 >> 2] = $636;
      HEAP32[$636 + 8 >> 2] = $F$0$i$i;
      HEAP32[$636 + 12 >> 2] = $986;
      break;
     }
     $999 = $976 >>> 8;
     if (($999 | 0) == 0) {
      $I1$0$i$i = 0;
     } else {
      if ($976 >>> 0 > 16777215) {
       $I1$0$i$i = 31;
      } else {
       $1004 = ($999 + 1048320 | 0) >>> 16 & 8;
       $1005 = $999 << $1004;
       $1008 = ($1005 + 520192 | 0) >>> 16 & 4;
       $1010 = $1005 << $1008;
       $1013 = ($1010 + 245760 | 0) >>> 16 & 2;
       $1018 = 14 - ($1008 | $1004 | $1013) + ($1010 << $1013 >>> 15) | 0;
       $I1$0$i$i = $976 >>> ($1018 + 7 | 0) & 1 | $1018 << 1;
      }
     }
     $1024 = 400 + ($I1$0$i$i << 2) | 0;
     HEAP32[$636 + 28 >> 2] = $I1$0$i$i;
     HEAP32[$636 + 20 >> 2] = 0;
     HEAP32[$636 + 16 >> 2] = 0;
     $1028 = HEAP32[100 >> 2] | 0;
     $1029 = 1 << $I1$0$i$i;
     if (($1028 & $1029 | 0) == 0) {
      HEAP32[100 >> 2] = $1028 | $1029;
      HEAP32[$1024 >> 2] = $636;
      HEAP32[$636 + 24 >> 2] = $1024;
      HEAP32[$636 + 12 >> 2] = $636;
      HEAP32[$636 + 8 >> 2] = $636;
      break;
     }
     $1036 = HEAP32[$1024 >> 2] | 0;
     if (($I1$0$i$i | 0) == 31) {
      $1045 = 0;
     } else {
      $1045 = 25 - ($I1$0$i$i >>> 1) | 0;
     }
     L489 : do {
      if ((HEAP32[$1036 + 4 >> 2] & -8 | 0) == ($976 | 0)) {
       $T$0$lcssa$i$i = $1036;
      } else {
       $K2$014$i$i = $976 << $1045;
       $T$013$i$i = $1036;
       while (1) {
        $1053 = $T$013$i$i + ($K2$014$i$i >>> 31 << 2) + 16 | 0;
        $1048 = HEAP32[$1053 >> 2] | 0;
        if (($1048 | 0) == 0) {
         break;
        }
        if ((HEAP32[$1048 + 4 >> 2] & -8 | 0) == ($976 | 0)) {
         $T$0$lcssa$i$i = $1048;
         break L489;
        } else {
         $K2$014$i$i = $K2$014$i$i << 1;
         $T$013$i$i = $1048;
        }
       }
       if ($1053 >>> 0 < (HEAP32[112 >> 2] | 0) >>> 0) {
        _abort();
       } else {
        HEAP32[$1053 >> 2] = $636;
        HEAP32[$636 + 24 >> 2] = $T$013$i$i;
        HEAP32[$636 + 12 >> 2] = $636;
        HEAP32[$636 + 8 >> 2] = $636;
        break L311;
       }
      }
     } while (0);
     $1060 = $T$0$lcssa$i$i + 8 | 0;
     $1061 = HEAP32[$1060 >> 2] | 0;
     $1062 = HEAP32[112 >> 2] | 0;
     if ($T$0$lcssa$i$i >>> 0 < $1062 >>> 0) {
      _abort();
     }
     if ($1061 >>> 0 < $1062 >>> 0) {
      _abort();
     } else {
      HEAP32[$1061 + 12 >> 2] = $636;
      HEAP32[$1060 >> 2] = $636;
      HEAP32[$636 + 8 >> 2] = $1061;
      HEAP32[$636 + 12 >> 2] = $T$0$lcssa$i$i;
      HEAP32[$636 + 24 >> 2] = 0;
      break;
     }
    }
   }
  } while (0);
  $1069 = HEAP32[108 >> 2] | 0;
  if ($1069 >>> 0 > $nb$0 >>> 0) {
   $1071 = $1069 - $nb$0 | 0;
   HEAP32[108 >> 2] = $1071;
   $1072 = HEAP32[120 >> 2] | 0;
   HEAP32[120 >> 2] = $1072 + $nb$0;
   HEAP32[$1072 + ($nb$0 + 4) >> 2] = $1071 | 1;
   HEAP32[$1072 + 4 >> 2] = $nb$0 | 3;
   $mem$0 = $1072 + 8 | 0;
   STACKTOP = sp;
   return $mem$0 | 0;
  }
 }
 HEAP32[(___errno_location() | 0) >> 2] = 12;
 $mem$0 = 0;
 STACKTOP = sp;
 return $mem$0 | 0;
}
function _free($mem) {
 $mem = $mem | 0;
 var $$pre$phi68Z2D = 0, $$pre$phi70Z2D = 0, $$pre$phiZ2D = 0, $$sum2 = 0, $1 = 0, $104 = 0, $113 = 0, $114 = 0, $12 = 0, $122 = 0, $130 = 0, $135 = 0, $136 = 0, $139 = 0, $14 = 0, $141 = 0, $143 = 0, $15 = 0, $158 = 0, $163 = 0, $165 = 0, $168 = 0, $171 = 0, $174 = 0, $177 = 0, $178 = 0, $180 = 0, $181 = 0, $183 = 0, $184 = 0, $186 = 0, $187 = 0, $19 = 0, $193 = 0, $194 = 0, $2 = 0, $203 = 0, $212 = 0, $219 = 0, $22 = 0, $234 = 0, $236 = 0, $237 = 0, $238 = 0, $239 = 0, $24 = 0, $243 = 0, $244 = 0, $250 = 0, $255 = 0, $256 = 0, $259 = 0, $26 = 0, $261 = 0, $264 = 0, $269 = 0, $275 = 0, $279 = 0, $280 = 0, $287 = 0, $296 = 0, $299 = 0, $304 = 0, $311 = 0, $312 = 0, $313 = 0, $321 = 0, $39 = 0, $44 = 0, $46 = 0, $49 = 0, $5 = 0, $51 = 0, $54 = 0, $57 = 0, $58 = 0, $6 = 0, $60 = 0, $61 = 0, $63 = 0, $64 = 0, $66 = 0, $67 = 0, $72 = 0, $73 = 0, $8 = 0, $82 = 0, $9 = 0, $91 = 0, $98 = 0, $F16$0 = 0, $I18$0 = 0, $K19$057 = 0, $R$0 = 0, $R$1 = 0, $R7$0 = 0, $R7$1 = 0, $RP$0 = 0, $RP9$0 = 0, $T$0$lcssa = 0, $T$056 = 0, $p$0 = 0, $psize$0 = 0, $psize$1 = 0, $sp$0$i = 0, $sp$0$in$i = 0, sp = 0;
 sp = STACKTOP;
 if (($mem | 0) == 0) {
  STACKTOP = sp;
  return;
 }
 $1 = $mem + -8 | 0;
 $2 = HEAP32[112 >> 2] | 0;
 if ($1 >>> 0 < $2 >>> 0) {
  _abort();
 }
 $5 = HEAP32[$mem + -4 >> 2] | 0;
 $6 = $5 & 3;
 if (($6 | 0) == 1) {
  _abort();
 }
 $8 = $5 & -8;
 $9 = $mem + ($8 + -8) | 0;
 do {
  if (($5 & 1 | 0) == 0) {
   $12 = HEAP32[$1 >> 2] | 0;
   if (($6 | 0) == 0) {
    STACKTOP = sp;
    return;
   }
   $$sum2 = -8 - $12 | 0;
   $14 = $mem + $$sum2 | 0;
   $15 = $12 + $8 | 0;
   if ($14 >>> 0 < $2 >>> 0) {
    _abort();
   }
   if (($14 | 0) == (HEAP32[116 >> 2] | 0)) {
    $104 = $mem + ($8 + -4) | 0;
    if ((HEAP32[$104 >> 2] & 3 | 0) != 3) {
     $p$0 = $14;
     $psize$0 = $15;
     break;
    }
    HEAP32[104 >> 2] = $15;
    HEAP32[$104 >> 2] = HEAP32[$104 >> 2] & -2;
    HEAP32[$mem + ($$sum2 + 4) >> 2] = $15 | 1;
    HEAP32[$9 >> 2] = $15;
    STACKTOP = sp;
    return;
   }
   $19 = $12 >>> 3;
   if ($12 >>> 0 < 256) {
    $22 = HEAP32[$mem + ($$sum2 + 8) >> 2] | 0;
    $24 = HEAP32[$mem + ($$sum2 + 12) >> 2] | 0;
    $26 = 136 + ($19 << 1 << 2) | 0;
    if (($22 | 0) != ($26 | 0)) {
     if ($22 >>> 0 < $2 >>> 0) {
      _abort();
     }
     if ((HEAP32[$22 + 12 >> 2] | 0) != ($14 | 0)) {
      _abort();
     }
    }
    if (($24 | 0) == ($22 | 0)) {
     HEAP32[24] = HEAP32[24] & ~(1 << $19);
     $p$0 = $14;
     $psize$0 = $15;
     break;
    }
    if (($24 | 0) == ($26 | 0)) {
     $$pre$phi70Z2D = $24 + 8 | 0;
    } else {
     if ($24 >>> 0 < $2 >>> 0) {
      _abort();
     }
     $39 = $24 + 8 | 0;
     if ((HEAP32[$39 >> 2] | 0) == ($14 | 0)) {
      $$pre$phi70Z2D = $39;
     } else {
      _abort();
     }
    }
    HEAP32[$22 + 12 >> 2] = $24;
    HEAP32[$$pre$phi70Z2D >> 2] = $22;
    $p$0 = $14;
    $psize$0 = $15;
    break;
   }
   $44 = HEAP32[$mem + ($$sum2 + 24) >> 2] | 0;
   $46 = HEAP32[$mem + ($$sum2 + 12) >> 2] | 0;
   do {
    if (($46 | 0) == ($14 | 0)) {
     $57 = $mem + ($$sum2 + 20) | 0;
     $58 = HEAP32[$57 >> 2] | 0;
     if (($58 | 0) == 0) {
      $60 = $mem + ($$sum2 + 16) | 0;
      $61 = HEAP32[$60 >> 2] | 0;
      if (($61 | 0) == 0) {
       $R$1 = 0;
       break;
      } else {
       $R$0 = $61;
       $RP$0 = $60;
      }
     } else {
      $R$0 = $58;
      $RP$0 = $57;
     }
     while (1) {
      $63 = $R$0 + 20 | 0;
      $64 = HEAP32[$63 >> 2] | 0;
      if (($64 | 0) != 0) {
       $R$0 = $64;
       $RP$0 = $63;
       continue;
      }
      $66 = $R$0 + 16 | 0;
      $67 = HEAP32[$66 >> 2] | 0;
      if (($67 | 0) == 0) {
       break;
      } else {
       $R$0 = $67;
       $RP$0 = $66;
      }
     }
     if ($RP$0 >>> 0 < $2 >>> 0) {
      _abort();
     } else {
      HEAP32[$RP$0 >> 2] = 0;
      $R$1 = $R$0;
      break;
     }
    } else {
     $49 = HEAP32[$mem + ($$sum2 + 8) >> 2] | 0;
     if ($49 >>> 0 < $2 >>> 0) {
      _abort();
     }
     $51 = $49 + 12 | 0;
     if ((HEAP32[$51 >> 2] | 0) != ($14 | 0)) {
      _abort();
     }
     $54 = $46 + 8 | 0;
     if ((HEAP32[$54 >> 2] | 0) == ($14 | 0)) {
      HEAP32[$51 >> 2] = $46;
      HEAP32[$54 >> 2] = $49;
      $R$1 = $46;
      break;
     } else {
      _abort();
     }
    }
   } while (0);
   if (($44 | 0) == 0) {
    $p$0 = $14;
    $psize$0 = $15;
   } else {
    $72 = HEAP32[$mem + ($$sum2 + 28) >> 2] | 0;
    $73 = 400 + ($72 << 2) | 0;
    if (($14 | 0) == (HEAP32[$73 >> 2] | 0)) {
     HEAP32[$73 >> 2] = $R$1;
     if (($R$1 | 0) == 0) {
      HEAP32[100 >> 2] = HEAP32[100 >> 2] & ~(1 << $72);
      $p$0 = $14;
      $psize$0 = $15;
      break;
     }
    } else {
     if ($44 >>> 0 < (HEAP32[112 >> 2] | 0) >>> 0) {
      _abort();
     }
     $82 = $44 + 16 | 0;
     if ((HEAP32[$82 >> 2] | 0) == ($14 | 0)) {
      HEAP32[$82 >> 2] = $R$1;
     } else {
      HEAP32[$44 + 20 >> 2] = $R$1;
     }
     if (($R$1 | 0) == 0) {
      $p$0 = $14;
      $psize$0 = $15;
      break;
     }
    }
    if ($R$1 >>> 0 < (HEAP32[112 >> 2] | 0) >>> 0) {
     _abort();
    }
    HEAP32[$R$1 + 24 >> 2] = $44;
    $91 = HEAP32[$mem + ($$sum2 + 16) >> 2] | 0;
    do {
     if (($91 | 0) != 0) {
      if ($91 >>> 0 < (HEAP32[112 >> 2] | 0) >>> 0) {
       _abort();
      } else {
       HEAP32[$R$1 + 16 >> 2] = $91;
       HEAP32[$91 + 24 >> 2] = $R$1;
       break;
      }
     }
    } while (0);
    $98 = HEAP32[$mem + ($$sum2 + 20) >> 2] | 0;
    if (($98 | 0) == 0) {
     $p$0 = $14;
     $psize$0 = $15;
    } else {
     if ($98 >>> 0 < (HEAP32[112 >> 2] | 0) >>> 0) {
      _abort();
     } else {
      HEAP32[$R$1 + 20 >> 2] = $98;
      HEAP32[$98 + 24 >> 2] = $R$1;
      $p$0 = $14;
      $psize$0 = $15;
      break;
     }
    }
   }
  } else {
   $p$0 = $1;
   $psize$0 = $8;
  }
 } while (0);
 if (!($p$0 >>> 0 < $9 >>> 0)) {
  _abort();
 }
 $113 = $mem + ($8 + -4) | 0;
 $114 = HEAP32[$113 >> 2] | 0;
 if (($114 & 1 | 0) == 0) {
  _abort();
 }
 if (($114 & 2 | 0) == 0) {
  if (($9 | 0) == (HEAP32[120 >> 2] | 0)) {
   $122 = (HEAP32[108 >> 2] | 0) + $psize$0 | 0;
   HEAP32[108 >> 2] = $122;
   HEAP32[120 >> 2] = $p$0;
   HEAP32[$p$0 + 4 >> 2] = $122 | 1;
   if (($p$0 | 0) != (HEAP32[116 >> 2] | 0)) {
    STACKTOP = sp;
    return;
   }
   HEAP32[116 >> 2] = 0;
   HEAP32[104 >> 2] = 0;
   STACKTOP = sp;
   return;
  }
  if (($9 | 0) == (HEAP32[116 >> 2] | 0)) {
   $130 = (HEAP32[104 >> 2] | 0) + $psize$0 | 0;
   HEAP32[104 >> 2] = $130;
   HEAP32[116 >> 2] = $p$0;
   HEAP32[$p$0 + 4 >> 2] = $130 | 1;
   HEAP32[$p$0 + $130 >> 2] = $130;
   STACKTOP = sp;
   return;
  }
  $135 = ($114 & -8) + $psize$0 | 0;
  $136 = $114 >>> 3;
  do {
   if ($114 >>> 0 < 256) {
    $139 = HEAP32[$mem + $8 >> 2] | 0;
    $141 = HEAP32[$mem + ($8 | 4) >> 2] | 0;
    $143 = 136 + ($136 << 1 << 2) | 0;
    if (($139 | 0) != ($143 | 0)) {
     if ($139 >>> 0 < (HEAP32[112 >> 2] | 0) >>> 0) {
      _abort();
     }
     if ((HEAP32[$139 + 12 >> 2] | 0) != ($9 | 0)) {
      _abort();
     }
    }
    if (($141 | 0) == ($139 | 0)) {
     HEAP32[24] = HEAP32[24] & ~(1 << $136);
     break;
    }
    if (($141 | 0) == ($143 | 0)) {
     $$pre$phi68Z2D = $141 + 8 | 0;
    } else {
     if ($141 >>> 0 < (HEAP32[112 >> 2] | 0) >>> 0) {
      _abort();
     }
     $158 = $141 + 8 | 0;
     if ((HEAP32[$158 >> 2] | 0) == ($9 | 0)) {
      $$pre$phi68Z2D = $158;
     } else {
      _abort();
     }
    }
    HEAP32[$139 + 12 >> 2] = $141;
    HEAP32[$$pre$phi68Z2D >> 2] = $139;
   } else {
    $163 = HEAP32[$mem + ($8 + 16) >> 2] | 0;
    $165 = HEAP32[$mem + ($8 | 4) >> 2] | 0;
    do {
     if (($165 | 0) == ($9 | 0)) {
      $177 = $mem + ($8 + 12) | 0;
      $178 = HEAP32[$177 >> 2] | 0;
      if (($178 | 0) == 0) {
       $180 = $mem + ($8 + 8) | 0;
       $181 = HEAP32[$180 >> 2] | 0;
       if (($181 | 0) == 0) {
        $R7$1 = 0;
        break;
       } else {
        $R7$0 = $181;
        $RP9$0 = $180;
       }
      } else {
       $R7$0 = $178;
       $RP9$0 = $177;
      }
      while (1) {
       $183 = $R7$0 + 20 | 0;
       $184 = HEAP32[$183 >> 2] | 0;
       if (($184 | 0) != 0) {
        $R7$0 = $184;
        $RP9$0 = $183;
        continue;
       }
       $186 = $R7$0 + 16 | 0;
       $187 = HEAP32[$186 >> 2] | 0;
       if (($187 | 0) == 0) {
        break;
       } else {
        $R7$0 = $187;
        $RP9$0 = $186;
       }
      }
      if ($RP9$0 >>> 0 < (HEAP32[112 >> 2] | 0) >>> 0) {
       _abort();
      } else {
       HEAP32[$RP9$0 >> 2] = 0;
       $R7$1 = $R7$0;
       break;
      }
     } else {
      $168 = HEAP32[$mem + $8 >> 2] | 0;
      if ($168 >>> 0 < (HEAP32[112 >> 2] | 0) >>> 0) {
       _abort();
      }
      $171 = $168 + 12 | 0;
      if ((HEAP32[$171 >> 2] | 0) != ($9 | 0)) {
       _abort();
      }
      $174 = $165 + 8 | 0;
      if ((HEAP32[$174 >> 2] | 0) == ($9 | 0)) {
       HEAP32[$171 >> 2] = $165;
       HEAP32[$174 >> 2] = $168;
       $R7$1 = $165;
       break;
      } else {
       _abort();
      }
     }
    } while (0);
    if (($163 | 0) != 0) {
     $193 = HEAP32[$mem + ($8 + 20) >> 2] | 0;
     $194 = 400 + ($193 << 2) | 0;
     if (($9 | 0) == (HEAP32[$194 >> 2] | 0)) {
      HEAP32[$194 >> 2] = $R7$1;
      if (($R7$1 | 0) == 0) {
       HEAP32[100 >> 2] = HEAP32[100 >> 2] & ~(1 << $193);
       break;
      }
     } else {
      if ($163 >>> 0 < (HEAP32[112 >> 2] | 0) >>> 0) {
       _abort();
      }
      $203 = $163 + 16 | 0;
      if ((HEAP32[$203 >> 2] | 0) == ($9 | 0)) {
       HEAP32[$203 >> 2] = $R7$1;
      } else {
       HEAP32[$163 + 20 >> 2] = $R7$1;
      }
      if (($R7$1 | 0) == 0) {
       break;
      }
     }
     if ($R7$1 >>> 0 < (HEAP32[112 >> 2] | 0) >>> 0) {
      _abort();
     }
     HEAP32[$R7$1 + 24 >> 2] = $163;
     $212 = HEAP32[$mem + ($8 + 8) >> 2] | 0;
     do {
      if (($212 | 0) != 0) {
       if ($212 >>> 0 < (HEAP32[112 >> 2] | 0) >>> 0) {
        _abort();
       } else {
        HEAP32[$R7$1 + 16 >> 2] = $212;
        HEAP32[$212 + 24 >> 2] = $R7$1;
        break;
       }
      }
     } while (0);
     $219 = HEAP32[$mem + ($8 + 12) >> 2] | 0;
     if (($219 | 0) != 0) {
      if ($219 >>> 0 < (HEAP32[112 >> 2] | 0) >>> 0) {
       _abort();
      } else {
       HEAP32[$R7$1 + 20 >> 2] = $219;
       HEAP32[$219 + 24 >> 2] = $R7$1;
       break;
      }
     }
    }
   }
  } while (0);
  HEAP32[$p$0 + 4 >> 2] = $135 | 1;
  HEAP32[$p$0 + $135 >> 2] = $135;
  if (($p$0 | 0) == (HEAP32[116 >> 2] | 0)) {
   HEAP32[104 >> 2] = $135;
   STACKTOP = sp;
   return;
  } else {
   $psize$1 = $135;
  }
 } else {
  HEAP32[$113 >> 2] = $114 & -2;
  HEAP32[$p$0 + 4 >> 2] = $psize$0 | 1;
  HEAP32[$p$0 + $psize$0 >> 2] = $psize$0;
  $psize$1 = $psize$0;
 }
 $234 = $psize$1 >>> 3;
 if ($psize$1 >>> 0 < 256) {
  $236 = $234 << 1;
  $237 = 136 + ($236 << 2) | 0;
  $238 = HEAP32[24] | 0;
  $239 = 1 << $234;
  if (($238 & $239 | 0) == 0) {
   HEAP32[24] = $238 | $239;
   $$pre$phiZ2D = 136 + ($236 + 2 << 2) | 0;
   $F16$0 = $237;
  } else {
   $243 = 136 + ($236 + 2 << 2) | 0;
   $244 = HEAP32[$243 >> 2] | 0;
   if ($244 >>> 0 < (HEAP32[112 >> 2] | 0) >>> 0) {
    _abort();
   } else {
    $$pre$phiZ2D = $243;
    $F16$0 = $244;
   }
  }
  HEAP32[$$pre$phiZ2D >> 2] = $p$0;
  HEAP32[$F16$0 + 12 >> 2] = $p$0;
  HEAP32[$p$0 + 8 >> 2] = $F16$0;
  HEAP32[$p$0 + 12 >> 2] = $237;
  STACKTOP = sp;
  return;
 }
 $250 = $psize$1 >>> 8;
 if (($250 | 0) == 0) {
  $I18$0 = 0;
 } else {
  if ($psize$1 >>> 0 > 16777215) {
   $I18$0 = 31;
  } else {
   $255 = ($250 + 1048320 | 0) >>> 16 & 8;
   $256 = $250 << $255;
   $259 = ($256 + 520192 | 0) >>> 16 & 4;
   $261 = $256 << $259;
   $264 = ($261 + 245760 | 0) >>> 16 & 2;
   $269 = 14 - ($259 | $255 | $264) + ($261 << $264 >>> 15) | 0;
   $I18$0 = $psize$1 >>> ($269 + 7 | 0) & 1 | $269 << 1;
  }
 }
 $275 = 400 + ($I18$0 << 2) | 0;
 HEAP32[$p$0 + 28 >> 2] = $I18$0;
 HEAP32[$p$0 + 20 >> 2] = 0;
 HEAP32[$p$0 + 16 >> 2] = 0;
 $279 = HEAP32[100 >> 2] | 0;
 $280 = 1 << $I18$0;
 L199 : do {
  if (($279 & $280 | 0) == 0) {
   HEAP32[100 >> 2] = $279 | $280;
   HEAP32[$275 >> 2] = $p$0;
   HEAP32[$p$0 + 24 >> 2] = $275;
   HEAP32[$p$0 + 12 >> 2] = $p$0;
   HEAP32[$p$0 + 8 >> 2] = $p$0;
  } else {
   $287 = HEAP32[$275 >> 2] | 0;
   if (($I18$0 | 0) == 31) {
    $296 = 0;
   } else {
    $296 = 25 - ($I18$0 >>> 1) | 0;
   }
   L204 : do {
    if ((HEAP32[$287 + 4 >> 2] & -8 | 0) == ($psize$1 | 0)) {
     $T$0$lcssa = $287;
    } else {
     $K19$057 = $psize$1 << $296;
     $T$056 = $287;
     while (1) {
      $304 = $T$056 + ($K19$057 >>> 31 << 2) + 16 | 0;
      $299 = HEAP32[$304 >> 2] | 0;
      if (($299 | 0) == 0) {
       break;
      }
      if ((HEAP32[$299 + 4 >> 2] & -8 | 0) == ($psize$1 | 0)) {
       $T$0$lcssa = $299;
       break L204;
      } else {
       $K19$057 = $K19$057 << 1;
       $T$056 = $299;
      }
     }
     if ($304 >>> 0 < (HEAP32[112 >> 2] | 0) >>> 0) {
      _abort();
     } else {
      HEAP32[$304 >> 2] = $p$0;
      HEAP32[$p$0 + 24 >> 2] = $T$056;
      HEAP32[$p$0 + 12 >> 2] = $p$0;
      HEAP32[$p$0 + 8 >> 2] = $p$0;
      break L199;
     }
    }
   } while (0);
   $311 = $T$0$lcssa + 8 | 0;
   $312 = HEAP32[$311 >> 2] | 0;
   $313 = HEAP32[112 >> 2] | 0;
   if ($T$0$lcssa >>> 0 < $313 >>> 0) {
    _abort();
   }
   if ($312 >>> 0 < $313 >>> 0) {
    _abort();
   } else {
    HEAP32[$312 + 12 >> 2] = $p$0;
    HEAP32[$311 >> 2] = $p$0;
    HEAP32[$p$0 + 8 >> 2] = $312;
    HEAP32[$p$0 + 12 >> 2] = $T$0$lcssa;
    HEAP32[$p$0 + 24 >> 2] = 0;
    break;
   }
  }
 } while (0);
 $321 = (HEAP32[128 >> 2] | 0) + -1 | 0;
 HEAP32[128 >> 2] = $321;
 if (($321 | 0) == 0) {
  $sp$0$in$i = 552 | 0;
 } else {
  STACKTOP = sp;
  return;
 }
 while (1) {
  $sp$0$i = HEAP32[$sp$0$in$i >> 2] | 0;
  if (($sp$0$i | 0) == 0) {
   break;
  } else {
   $sp$0$in$i = $sp$0$i + 8 | 0;
  }
 }
 HEAP32[128 >> 2] = -1;
 STACKTOP = sp;
 return;
}
function _dispose_chunk($p, $psize) {
 $p = $p | 0;
 $psize = $psize | 0;
 var $$0 = 0, $$02 = 0, $$1 = 0, $$pre$phi63Z2D = 0, $$pre$phi65Z2D = 0, $$pre$phiZ2D = 0, $$sum24 = 0, $$sum27 = 0, $0 = 0, $10 = 0, $100 = 0, $108 = 0, $11 = 0, $110 = 0, $111 = 0, $117 = 0, $125 = 0, $130 = 0, $131 = 0, $134 = 0, $136 = 0, $138 = 0, $15 = 0, $151 = 0, $156 = 0, $158 = 0, $161 = 0, $163 = 0, $166 = 0, $169 = 0, $170 = 0, $172 = 0, $173 = 0, $175 = 0, $176 = 0, $178 = 0, $179 = 0, $18 = 0, $184 = 0, $185 = 0, $194 = 0, $2 = 0, $20 = 0, $203 = 0, $210 = 0, $22 = 0, $225 = 0, $227 = 0, $228 = 0, $229 = 0, $230 = 0, $234 = 0, $235 = 0, $241 = 0, $246 = 0, $247 = 0, $250 = 0, $252 = 0, $255 = 0, $260 = 0, $266 = 0, $270 = 0, $271 = 0, $278 = 0, $287 = 0, $290 = 0, $295 = 0, $302 = 0, $303 = 0, $304 = 0, $35 = 0, $40 = 0, $42 = 0, $45 = 0, $47 = 0, $5 = 0, $50 = 0, $53 = 0, $54 = 0, $56 = 0, $57 = 0, $59 = 0, $60 = 0, $62 = 0, $63 = 0, $68 = 0, $69 = 0, $78 = 0, $87 = 0, $9 = 0, $94 = 0, $F16$0 = 0, $I19$0 = 0, $K20$049 = 0, $R$0 = 0, $R$1 = 0, $R7$0 = 0, $R7$1 = 0, $RP$0 = 0, $RP9$0 = 0, $T$0$lcssa = 0, $T$048 = 0, sp = 0;
 sp = STACKTOP;
 $0 = $p + $psize | 0;
 $2 = HEAP32[$p + 4 >> 2] | 0;
 do {
  if (($2 & 1 | 0) == 0) {
   $5 = HEAP32[$p >> 2] | 0;
   if (($2 & 3 | 0) == 0) {
    STACKTOP = sp;
    return;
   }
   $9 = $p + (0 - $5) | 0;
   $10 = $5 + $psize | 0;
   $11 = HEAP32[112 >> 2] | 0;
   if ($9 >>> 0 < $11 >>> 0) {
    _abort();
   }
   if (($9 | 0) == (HEAP32[116 >> 2] | 0)) {
    $100 = $p + ($psize + 4) | 0;
    if ((HEAP32[$100 >> 2] & 3 | 0) != 3) {
     $$0 = $9;
     $$02 = $10;
     break;
    }
    HEAP32[104 >> 2] = $10;
    HEAP32[$100 >> 2] = HEAP32[$100 >> 2] & -2;
    HEAP32[$p + (4 - $5) >> 2] = $10 | 1;
    HEAP32[$0 >> 2] = $10;
    STACKTOP = sp;
    return;
   }
   $15 = $5 >>> 3;
   if ($5 >>> 0 < 256) {
    $18 = HEAP32[$p + (8 - $5) >> 2] | 0;
    $20 = HEAP32[$p + (12 - $5) >> 2] | 0;
    $22 = 136 + ($15 << 1 << 2) | 0;
    if (($18 | 0) != ($22 | 0)) {
     if ($18 >>> 0 < $11 >>> 0) {
      _abort();
     }
     if ((HEAP32[$18 + 12 >> 2] | 0) != ($9 | 0)) {
      _abort();
     }
    }
    if (($20 | 0) == ($18 | 0)) {
     HEAP32[24] = HEAP32[24] & ~(1 << $15);
     $$0 = $9;
     $$02 = $10;
     break;
    }
    if (($20 | 0) == ($22 | 0)) {
     $$pre$phi65Z2D = $20 + 8 | 0;
    } else {
     if ($20 >>> 0 < $11 >>> 0) {
      _abort();
     }
     $35 = $20 + 8 | 0;
     if ((HEAP32[$35 >> 2] | 0) == ($9 | 0)) {
      $$pre$phi65Z2D = $35;
     } else {
      _abort();
     }
    }
    HEAP32[$18 + 12 >> 2] = $20;
    HEAP32[$$pre$phi65Z2D >> 2] = $18;
    $$0 = $9;
    $$02 = $10;
    break;
   }
   $40 = HEAP32[$p + (24 - $5) >> 2] | 0;
   $42 = HEAP32[$p + (12 - $5) >> 2] | 0;
   do {
    if (($42 | 0) == ($9 | 0)) {
     $$sum24 = 16 - $5 | 0;
     $53 = $p + ($$sum24 + 4) | 0;
     $54 = HEAP32[$53 >> 2] | 0;
     if (($54 | 0) == 0) {
      $56 = $p + $$sum24 | 0;
      $57 = HEAP32[$56 >> 2] | 0;
      if (($57 | 0) == 0) {
       $R$1 = 0;
       break;
      } else {
       $R$0 = $57;
       $RP$0 = $56;
      }
     } else {
      $R$0 = $54;
      $RP$0 = $53;
     }
     while (1) {
      $59 = $R$0 + 20 | 0;
      $60 = HEAP32[$59 >> 2] | 0;
      if (($60 | 0) != 0) {
       $R$0 = $60;
       $RP$0 = $59;
       continue;
      }
      $62 = $R$0 + 16 | 0;
      $63 = HEAP32[$62 >> 2] | 0;
      if (($63 | 0) == 0) {
       break;
      } else {
       $R$0 = $63;
       $RP$0 = $62;
      }
     }
     if ($RP$0 >>> 0 < $11 >>> 0) {
      _abort();
     } else {
      HEAP32[$RP$0 >> 2] = 0;
      $R$1 = $R$0;
      break;
     }
    } else {
     $45 = HEAP32[$p + (8 - $5) >> 2] | 0;
     if ($45 >>> 0 < $11 >>> 0) {
      _abort();
     }
     $47 = $45 + 12 | 0;
     if ((HEAP32[$47 >> 2] | 0) != ($9 | 0)) {
      _abort();
     }
     $50 = $42 + 8 | 0;
     if ((HEAP32[$50 >> 2] | 0) == ($9 | 0)) {
      HEAP32[$47 >> 2] = $42;
      HEAP32[$50 >> 2] = $45;
      $R$1 = $42;
      break;
     } else {
      _abort();
     }
    }
   } while (0);
   if (($40 | 0) == 0) {
    $$0 = $9;
    $$02 = $10;
   } else {
    $68 = HEAP32[$p + (28 - $5) >> 2] | 0;
    $69 = 400 + ($68 << 2) | 0;
    if (($9 | 0) == (HEAP32[$69 >> 2] | 0)) {
     HEAP32[$69 >> 2] = $R$1;
     if (($R$1 | 0) == 0) {
      HEAP32[100 >> 2] = HEAP32[100 >> 2] & ~(1 << $68);
      $$0 = $9;
      $$02 = $10;
      break;
     }
    } else {
     if ($40 >>> 0 < (HEAP32[112 >> 2] | 0) >>> 0) {
      _abort();
     }
     $78 = $40 + 16 | 0;
     if ((HEAP32[$78 >> 2] | 0) == ($9 | 0)) {
      HEAP32[$78 >> 2] = $R$1;
     } else {
      HEAP32[$40 + 20 >> 2] = $R$1;
     }
     if (($R$1 | 0) == 0) {
      $$0 = $9;
      $$02 = $10;
      break;
     }
    }
    if ($R$1 >>> 0 < (HEAP32[112 >> 2] | 0) >>> 0) {
     _abort();
    }
    HEAP32[$R$1 + 24 >> 2] = $40;
    $$sum27 = 16 - $5 | 0;
    $87 = HEAP32[$p + $$sum27 >> 2] | 0;
    do {
     if (($87 | 0) != 0) {
      if ($87 >>> 0 < (HEAP32[112 >> 2] | 0) >>> 0) {
       _abort();
      } else {
       HEAP32[$R$1 + 16 >> 2] = $87;
       HEAP32[$87 + 24 >> 2] = $R$1;
       break;
      }
     }
    } while (0);
    $94 = HEAP32[$p + ($$sum27 + 4) >> 2] | 0;
    if (($94 | 0) == 0) {
     $$0 = $9;
     $$02 = $10;
    } else {
     if ($94 >>> 0 < (HEAP32[112 >> 2] | 0) >>> 0) {
      _abort();
     } else {
      HEAP32[$R$1 + 20 >> 2] = $94;
      HEAP32[$94 + 24 >> 2] = $R$1;
      $$0 = $9;
      $$02 = $10;
      break;
     }
    }
   }
  } else {
   $$0 = $p;
   $$02 = $psize;
  }
 } while (0);
 $108 = HEAP32[112 >> 2] | 0;
 if ($0 >>> 0 < $108 >>> 0) {
  _abort();
 }
 $110 = $p + ($psize + 4) | 0;
 $111 = HEAP32[$110 >> 2] | 0;
 if (($111 & 2 | 0) == 0) {
  if (($0 | 0) == (HEAP32[120 >> 2] | 0)) {
   $117 = (HEAP32[108 >> 2] | 0) + $$02 | 0;
   HEAP32[108 >> 2] = $117;
   HEAP32[120 >> 2] = $$0;
   HEAP32[$$0 + 4 >> 2] = $117 | 1;
   if (($$0 | 0) != (HEAP32[116 >> 2] | 0)) {
    STACKTOP = sp;
    return;
   }
   HEAP32[116 >> 2] = 0;
   HEAP32[104 >> 2] = 0;
   STACKTOP = sp;
   return;
  }
  if (($0 | 0) == (HEAP32[116 >> 2] | 0)) {
   $125 = (HEAP32[104 >> 2] | 0) + $$02 | 0;
   HEAP32[104 >> 2] = $125;
   HEAP32[116 >> 2] = $$0;
   HEAP32[$$0 + 4 >> 2] = $125 | 1;
   HEAP32[$$0 + $125 >> 2] = $125;
   STACKTOP = sp;
   return;
  }
  $130 = ($111 & -8) + $$02 | 0;
  $131 = $111 >>> 3;
  do {
   if ($111 >>> 0 < 256) {
    $134 = HEAP32[$p + ($psize + 8) >> 2] | 0;
    $136 = HEAP32[$p + ($psize + 12) >> 2] | 0;
    $138 = 136 + ($131 << 1 << 2) | 0;
    if (($134 | 0) != ($138 | 0)) {
     if ($134 >>> 0 < $108 >>> 0) {
      _abort();
     }
     if ((HEAP32[$134 + 12 >> 2] | 0) != ($0 | 0)) {
      _abort();
     }
    }
    if (($136 | 0) == ($134 | 0)) {
     HEAP32[24] = HEAP32[24] & ~(1 << $131);
     break;
    }
    if (($136 | 0) == ($138 | 0)) {
     $$pre$phi63Z2D = $136 + 8 | 0;
    } else {
     if ($136 >>> 0 < $108 >>> 0) {
      _abort();
     }
     $151 = $136 + 8 | 0;
     if ((HEAP32[$151 >> 2] | 0) == ($0 | 0)) {
      $$pre$phi63Z2D = $151;
     } else {
      _abort();
     }
    }
    HEAP32[$134 + 12 >> 2] = $136;
    HEAP32[$$pre$phi63Z2D >> 2] = $134;
   } else {
    $156 = HEAP32[$p + ($psize + 24) >> 2] | 0;
    $158 = HEAP32[$p + ($psize + 12) >> 2] | 0;
    do {
     if (($158 | 0) == ($0 | 0)) {
      $169 = $p + ($psize + 20) | 0;
      $170 = HEAP32[$169 >> 2] | 0;
      if (($170 | 0) == 0) {
       $172 = $p + ($psize + 16) | 0;
       $173 = HEAP32[$172 >> 2] | 0;
       if (($173 | 0) == 0) {
        $R7$1 = 0;
        break;
       } else {
        $R7$0 = $173;
        $RP9$0 = $172;
       }
      } else {
       $R7$0 = $170;
       $RP9$0 = $169;
      }
      while (1) {
       $175 = $R7$0 + 20 | 0;
       $176 = HEAP32[$175 >> 2] | 0;
       if (($176 | 0) != 0) {
        $R7$0 = $176;
        $RP9$0 = $175;
        continue;
       }
       $178 = $R7$0 + 16 | 0;
       $179 = HEAP32[$178 >> 2] | 0;
       if (($179 | 0) == 0) {
        break;
       } else {
        $R7$0 = $179;
        $RP9$0 = $178;
       }
      }
      if ($RP9$0 >>> 0 < $108 >>> 0) {
       _abort();
      } else {
       HEAP32[$RP9$0 >> 2] = 0;
       $R7$1 = $R7$0;
       break;
      }
     } else {
      $161 = HEAP32[$p + ($psize + 8) >> 2] | 0;
      if ($161 >>> 0 < $108 >>> 0) {
       _abort();
      }
      $163 = $161 + 12 | 0;
      if ((HEAP32[$163 >> 2] | 0) != ($0 | 0)) {
       _abort();
      }
      $166 = $158 + 8 | 0;
      if ((HEAP32[$166 >> 2] | 0) == ($0 | 0)) {
       HEAP32[$163 >> 2] = $158;
       HEAP32[$166 >> 2] = $161;
       $R7$1 = $158;
       break;
      } else {
       _abort();
      }
     }
    } while (0);
    if (($156 | 0) != 0) {
     $184 = HEAP32[$p + ($psize + 28) >> 2] | 0;
     $185 = 400 + ($184 << 2) | 0;
     if (($0 | 0) == (HEAP32[$185 >> 2] | 0)) {
      HEAP32[$185 >> 2] = $R7$1;
      if (($R7$1 | 0) == 0) {
       HEAP32[100 >> 2] = HEAP32[100 >> 2] & ~(1 << $184);
       break;
      }
     } else {
      if ($156 >>> 0 < (HEAP32[112 >> 2] | 0) >>> 0) {
       _abort();
      }
      $194 = $156 + 16 | 0;
      if ((HEAP32[$194 >> 2] | 0) == ($0 | 0)) {
       HEAP32[$194 >> 2] = $R7$1;
      } else {
       HEAP32[$156 + 20 >> 2] = $R7$1;
      }
      if (($R7$1 | 0) == 0) {
       break;
      }
     }
     if ($R7$1 >>> 0 < (HEAP32[112 >> 2] | 0) >>> 0) {
      _abort();
     }
     HEAP32[$R7$1 + 24 >> 2] = $156;
     $203 = HEAP32[$p + ($psize + 16) >> 2] | 0;
     do {
      if (($203 | 0) != 0) {
       if ($203 >>> 0 < (HEAP32[112 >> 2] | 0) >>> 0) {
        _abort();
       } else {
        HEAP32[$R7$1 + 16 >> 2] = $203;
        HEAP32[$203 + 24 >> 2] = $R7$1;
        break;
       }
      }
     } while (0);
     $210 = HEAP32[$p + ($psize + 20) >> 2] | 0;
     if (($210 | 0) != 0) {
      if ($210 >>> 0 < (HEAP32[112 >> 2] | 0) >>> 0) {
       _abort();
      } else {
       HEAP32[$R7$1 + 20 >> 2] = $210;
       HEAP32[$210 + 24 >> 2] = $R7$1;
       break;
      }
     }
    }
   }
  } while (0);
  HEAP32[$$0 + 4 >> 2] = $130 | 1;
  HEAP32[$$0 + $130 >> 2] = $130;
  if (($$0 | 0) == (HEAP32[116 >> 2] | 0)) {
   HEAP32[104 >> 2] = $130;
   STACKTOP = sp;
   return;
  } else {
   $$1 = $130;
  }
 } else {
  HEAP32[$110 >> 2] = $111 & -2;
  HEAP32[$$0 + 4 >> 2] = $$02 | 1;
  HEAP32[$$0 + $$02 >> 2] = $$02;
  $$1 = $$02;
 }
 $225 = $$1 >>> 3;
 if ($$1 >>> 0 < 256) {
  $227 = $225 << 1;
  $228 = 136 + ($227 << 2) | 0;
  $229 = HEAP32[24] | 0;
  $230 = 1 << $225;
  if (($229 & $230 | 0) == 0) {
   HEAP32[24] = $229 | $230;
   $$pre$phiZ2D = 136 + ($227 + 2 << 2) | 0;
   $F16$0 = $228;
  } else {
   $234 = 136 + ($227 + 2 << 2) | 0;
   $235 = HEAP32[$234 >> 2] | 0;
   if ($235 >>> 0 < (HEAP32[112 >> 2] | 0) >>> 0) {
    _abort();
   } else {
    $$pre$phiZ2D = $234;
    $F16$0 = $235;
   }
  }
  HEAP32[$$pre$phiZ2D >> 2] = $$0;
  HEAP32[$F16$0 + 12 >> 2] = $$0;
  HEAP32[$$0 + 8 >> 2] = $F16$0;
  HEAP32[$$0 + 12 >> 2] = $228;
  STACKTOP = sp;
  return;
 }
 $241 = $$1 >>> 8;
 if (($241 | 0) == 0) {
  $I19$0 = 0;
 } else {
  if ($$1 >>> 0 > 16777215) {
   $I19$0 = 31;
  } else {
   $246 = ($241 + 1048320 | 0) >>> 16 & 8;
   $247 = $241 << $246;
   $250 = ($247 + 520192 | 0) >>> 16 & 4;
   $252 = $247 << $250;
   $255 = ($252 + 245760 | 0) >>> 16 & 2;
   $260 = 14 - ($250 | $246 | $255) + ($252 << $255 >>> 15) | 0;
   $I19$0 = $$1 >>> ($260 + 7 | 0) & 1 | $260 << 1;
  }
 }
 $266 = 400 + ($I19$0 << 2) | 0;
 HEAP32[$$0 + 28 >> 2] = $I19$0;
 HEAP32[$$0 + 20 >> 2] = 0;
 HEAP32[$$0 + 16 >> 2] = 0;
 $270 = HEAP32[100 >> 2] | 0;
 $271 = 1 << $I19$0;
 if (($270 & $271 | 0) == 0) {
  HEAP32[100 >> 2] = $270 | $271;
  HEAP32[$266 >> 2] = $$0;
  HEAP32[$$0 + 24 >> 2] = $266;
  HEAP32[$$0 + 12 >> 2] = $$0;
  HEAP32[$$0 + 8 >> 2] = $$0;
  STACKTOP = sp;
  return;
 }
 $278 = HEAP32[$266 >> 2] | 0;
 if (($I19$0 | 0) == 31) {
  $287 = 0;
 } else {
  $287 = 25 - ($I19$0 >>> 1) | 0;
 }
 L194 : do {
  if ((HEAP32[$278 + 4 >> 2] & -8 | 0) == ($$1 | 0)) {
   $T$0$lcssa = $278;
  } else {
   $K20$049 = $$1 << $287;
   $T$048 = $278;
   while (1) {
    $295 = $T$048 + ($K20$049 >>> 31 << 2) + 16 | 0;
    $290 = HEAP32[$295 >> 2] | 0;
    if (($290 | 0) == 0) {
     break;
    }
    if ((HEAP32[$290 + 4 >> 2] & -8 | 0) == ($$1 | 0)) {
     $T$0$lcssa = $290;
     break L194;
    } else {
     $K20$049 = $K20$049 << 1;
     $T$048 = $290;
    }
   }
   if ($295 >>> 0 < (HEAP32[112 >> 2] | 0) >>> 0) {
    _abort();
   }
   HEAP32[$295 >> 2] = $$0;
   HEAP32[$$0 + 24 >> 2] = $T$048;
   HEAP32[$$0 + 12 >> 2] = $$0;
   HEAP32[$$0 + 8 >> 2] = $$0;
   STACKTOP = sp;
   return;
  }
 } while (0);
 $302 = $T$0$lcssa + 8 | 0;
 $303 = HEAP32[$302 >> 2] | 0;
 $304 = HEAP32[112 >> 2] | 0;
 if ($T$0$lcssa >>> 0 < $304 >>> 0) {
  _abort();
 }
 if ($303 >>> 0 < $304 >>> 0) {
  _abort();
 }
 HEAP32[$303 + 12 >> 2] = $$0;
 HEAP32[$302 >> 2] = $$0;
 HEAP32[$$0 + 8 >> 2] = $303;
 HEAP32[$$0 + 12 >> 2] = $T$0$lcssa;
 HEAP32[$$0 + 24 >> 2] = 0;
 STACKTOP = sp;
 return;
}
function _main() {
 var $$01$i = 0, $0 = 0, $13 = 0.0, $15 = 0, $16 = 0, $3 = 0, $32 = 0.0, $4 = 0, $i$01$i = 0, $i$02$i = 0, $i$03$i = 0, $i$06 = 0, $i1$04 = 0, $src = 0, $sum$01$i = 0.0, $sumx4$02$i = 0, $vararg_buffer6 = 0, $vararg_ptr1 = 0, $vararg_ptr5 = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 32 | 0;
 $vararg_buffer6 = sp;
 $src = sp + 16 | 0;
 HEAP32[$src >> 2] = 0;
 _posix_memalign($src, 16, 4e4) | 0;
 $0 = HEAP32[$src >> 2] | 0;
 $i$01$i = 0;
 do {
  HEAPF32[$0 + ($i$01$i << 2) >> 2] = .10000000149011612;
  $i$01$i = $i$01$i + 1 | 0;
 } while (($i$01$i | 0) != 1e4);
 _puts(80) | 0;
 $3 = _clock() | 0;
 $4 = HEAP32[$src >> 2] | 0;
 $i$06 = 0;
 do {
  $i$02$i = 0;
  $sum$01$i = 0.0;
  do {
   $sum$01$i = $sum$01$i + +HEAPF32[$4 + ($i$02$i << 2) >> 2];
   $i$02$i = $i$02$i + 1 | 0;
  } while (($i$02$i | 0) != 1e4);
  $i$06 = $i$06 + 1 | 0;
 } while (($i$06 | 0) != 1e6);
 $13 = +((_clock() | 0) - $3 | 0);
 HEAPF64[tempDoublePtr >> 3] = $sum$01$i / 1.0e4;
 HEAP32[$vararg_buffer6 >> 2] = HEAP32[tempDoublePtr >> 2];
 HEAP32[$vararg_buffer6 + 4 >> 2] = HEAP32[tempDoublePtr + 4 >> 2];
 $vararg_ptr1 = $vararg_buffer6 + 8 | 0;
 HEAPF64[tempDoublePtr >> 3] = $13;
 HEAP32[$vararg_ptr1 >> 2] = HEAP32[tempDoublePtr >> 2];
 HEAP32[$vararg_ptr1 + 4 >> 2] = HEAP32[tempDoublePtr + 4 >> 2];
 _printf(8, $vararg_buffer6 | 0) | 0;
 var HEAP32x4 = new Float32x4Array(HEAP32.buffer);
 $15 = _clock() | 0;
 $16 = HEAP32[$src >> 2] | 0;
 $i1$04 = 0;
 do {
  $$01$i = $16;
  $i$03$i = 0;
  $sumx4$02$i = SIMD.float32x4.splat(0);
  while (1) {
   $sumx4$02$i = SIMD.float32x4.add($sumx4$02$i, HEAP32x4[$$01$i >> 4]);
   $i$03$i = $i$03$i + 1 | 0;
   if (($i$03$i | 0) == 2500) {
    break;
   } else {
    $$01$i = $$01$i + 16 | 0;
   }
  }
  $i1$04 = $i1$04 + 1 | 0;
 } while (($i1$04 | 0) != 1e6);
 $32 = +((_clock() | 0) - $15 | 0);
 HEAPF64[tempDoublePtr >> 3] = ($sumx4$02$i.w + ($sumx4$02$i.z + ($sumx4$02$i.x + $sumx4$02$i.y))) / 1.0e4;
 HEAP32[$vararg_buffer6 >> 2] = HEAP32[tempDoublePtr >> 2];
 HEAP32[$vararg_buffer6 + 4 >> 2] = HEAP32[tempDoublePtr + 4 >> 2];
 $vararg_ptr5 = $vararg_buffer6 + 8 | 0;
 HEAPF64[tempDoublePtr >> 3] = $32;
 HEAP32[$vararg_ptr5 >> 2] = HEAP32[tempDoublePtr >> 2];
 HEAP32[$vararg_ptr5 + 4 >> 2] = HEAP32[tempDoublePtr + 4 >> 2];
 _printf(32, $vararg_buffer6 | 0) | 0;
 HEAPF64[tempDoublePtr >> 3] = $13 / $32;
 HEAP32[$vararg_buffer6 >> 2] = HEAP32[tempDoublePtr >> 2];
 HEAP32[$vararg_buffer6 + 4 >> 2] = HEAP32[tempDoublePtr + 4 >> 2];
 _printf(64, $vararg_buffer6 | 0) | 0;
 _free(HEAP32[$src >> 2] | 0);
 STACKTOP = sp;
 return 0;
}
function _internal_memalign($alignment, $bytes) {
 $alignment = $alignment | 0;
 $bytes = $bytes | 0;
 var $$1 = 0, $$alignment = 0, $14 = 0, $15 = 0, $17 = 0, $19 = 0, $26 = 0, $27 = 0, $29 = 0, $33 = 0, $35 = 0, $36 = 0, $37 = 0, $39 = 0, $45 = 0, $50 = 0, $57 = 0, $60 = 0, $61 = 0, $64 = 0, $67 = 0, $74 = 0, $a$0 = 0, $mem$0 = 0, $p$0 = 0, sp = 0;
 sp = STACKTOP;
 $$alignment = $alignment >>> 0 < 16 ? 16 : $alignment;
 if (($$alignment + -1 & $$alignment | 0) == 0) {
  $$1 = $$alignment;
 } else {
  $a$0 = 16;
  while (1) {
   if ($a$0 >>> 0 < $$alignment >>> 0) {
    $a$0 = $a$0 << 1;
   } else {
    $$1 = $a$0;
    break;
   }
  }
 }
 if (!((-64 - $$1 | 0) >>> 0 > $bytes >>> 0)) {
  HEAP32[(___errno_location() | 0) >> 2] = 12;
  $mem$0 = 0;
  STACKTOP = sp;
  return $mem$0 | 0;
 }
 if ($bytes >>> 0 < 11) {
  $14 = 16;
 } else {
  $14 = $bytes + 11 & -8;
 }
 $15 = _malloc($$1 + 12 + $14 | 0) | 0;
 if (($15 | 0) == 0) {
  $mem$0 = 0;
  STACKTOP = sp;
  return $mem$0 | 0;
 }
 $17 = $15 + -8 | 0;
 $19 = $$1 + -1 | 0;
 do {
  if (($15 & $19 | 0) == 0) {
   $p$0 = $17;
  } else {
   $26 = $15 + $19 & 0 - $$1;
   $27 = $26 + -8 | 0;
   $29 = $17;
   if (($27 - $29 | 0) >>> 0 > 15) {
    $33 = $27;
   } else {
    $33 = $26 + ($$1 + -8) | 0;
   }
   $35 = $33 - $29 | 0;
   $36 = $15 + -4 | 0;
   $37 = HEAP32[$36 >> 2] | 0;
   $39 = ($37 & -8) - $35 | 0;
   if (($37 & 3 | 0) == 0) {
    HEAP32[$33 >> 2] = (HEAP32[$17 >> 2] | 0) + $35;
    HEAP32[$33 + 4 >> 2] = $39;
    $p$0 = $33;
    break;
   } else {
    $45 = $33 + 4 | 0;
    HEAP32[$45 >> 2] = $39 | HEAP32[$45 >> 2] & 1 | 2;
    $50 = $33 + ($39 + 4) | 0;
    HEAP32[$50 >> 2] = HEAP32[$50 >> 2] | 1;
    HEAP32[$36 >> 2] = $35 | HEAP32[$36 >> 2] & 1 | 2;
    $57 = $15 + ($35 + -4) | 0;
    HEAP32[$57 >> 2] = HEAP32[$57 >> 2] | 1;
    _dispose_chunk($17, $35);
    $p$0 = $33;
    break;
   }
  }
 } while (0);
 $60 = $p$0 + 4 | 0;
 $61 = HEAP32[$60 >> 2] | 0;
 if (($61 & 3 | 0) != 0) {
  $64 = $61 & -8;
  if ($64 >>> 0 > ($14 + 16 | 0) >>> 0) {
   $67 = $64 - $14 | 0;
   HEAP32[$60 >> 2] = $14 | $61 & 1 | 2;
   HEAP32[$p$0 + ($14 | 4) >> 2] = $67 | 3;
   $74 = $p$0 + ($64 | 4) | 0;
   HEAP32[$74 >> 2] = HEAP32[$74 >> 2] | 1;
   _dispose_chunk($p$0 + $14 | 0, $67);
  }
 }
 $mem$0 = $p$0 + 8 | 0;
 STACKTOP = sp;
 return $mem$0 | 0;
}
function _posix_memalign($pp, $alignment, $bytes) {
 $pp = $pp | 0;
 $alignment = $alignment | 0;
 $bytes = $bytes | 0;
 var $$0 = 0, $2 = 0, $mem$0 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 if (($alignment | 0) == 8) {
  $mem$0 = _malloc($bytes) | 0;
  label = 7;
 } else {
  $2 = $alignment >>> 2;
  if (($alignment & 3 | 0) != 0 | ($2 | 0) == 0) {
   $$0 = 22;
  } else {
   if (($2 + 1073741823 & $2 | 0) == 0) {
    if ((-64 - $alignment | 0) >>> 0 < $bytes >>> 0) {
     $$0 = 12;
    } else {
     $mem$0 = _internal_memalign($alignment >>> 0 < 16 ? 16 : $alignment, $bytes) | 0;
     label = 7;
    }
   } else {
    $$0 = 22;
   }
  }
 }
 if ((label | 0) == 7) {
  if (($mem$0 | 0) == 0) {
   $$0 = 12;
  } else {
   HEAP32[$pp >> 2] = $mem$0;
   $$0 = 0;
  }
 }
 STACKTOP = sp;
 return $$0 | 0;
}
function _memcpy(dest, src, num) {
 dest = dest | 0;
 src = src | 0;
 num = num | 0;
 var ret = 0;
 if ((num | 0) >= 4096) return _emscripten_memcpy_big(dest | 0, src | 0, num | 0) | 0;
 ret = dest | 0;
 if ((dest & 3) == (src & 3)) {
  while (dest & 3) {
   if ((num | 0) == 0) return ret | 0;
   HEAP8[dest >> 0] = HEAP8[src >> 0] | 0;
   dest = dest + 1 | 0;
   src = src + 1 | 0;
   num = num - 1 | 0;
  }
  while ((num | 0) >= 4) {
   HEAP32[dest >> 2] = HEAP32[src >> 2];
   dest = dest + 4 | 0;
   src = src + 4 | 0;
   num = num - 4 | 0;
  }
 }
 while ((num | 0) > 0) {
  HEAP8[dest >> 0] = HEAP8[src >> 0] | 0;
  dest = dest + 1 | 0;
  src = src + 1 | 0;
  num = num - 1 | 0;
 }
 return ret | 0;
}
function _memset(ptr, value, num) {
 ptr = ptr | 0;
 value = value | 0;
 num = num | 0;
 var stop = 0, value4 = 0, stop4 = 0, unaligned = 0;
 stop = ptr + num | 0;
 if ((num | 0) >= 20) {
  value = value & 255;
  unaligned = ptr & 3;
  value4 = value | value << 8 | value << 16 | value << 24;
  stop4 = stop & ~3;
  if (unaligned) {
   unaligned = ptr + 4 - unaligned | 0;
   while ((ptr | 0) < (unaligned | 0)) {
    HEAP8[ptr >> 0] = value;
    ptr = ptr + 1 | 0;
   }
  }
  while ((ptr | 0) < (stop4 | 0)) {
   HEAP32[ptr >> 2] = value4;
   ptr = ptr + 4 | 0;
  }
 }
 while ((ptr | 0) < (stop | 0)) {
  HEAP8[ptr >> 0] = value;
  ptr = ptr + 1 | 0;
 }
 return ptr - num | 0;
}
function copyTempDouble(ptr) {
 ptr = ptr | 0;
 HEAP8[tempDoublePtr >> 0] = HEAP8[ptr >> 0];
 HEAP8[tempDoublePtr + 1 >> 0] = HEAP8[ptr + 1 >> 0];
 HEAP8[tempDoublePtr + 2 >> 0] = HEAP8[ptr + 2 >> 0];
 HEAP8[tempDoublePtr + 3 >> 0] = HEAP8[ptr + 3 >> 0];
 HEAP8[tempDoublePtr + 4 >> 0] = HEAP8[ptr + 4 >> 0];
 HEAP8[tempDoublePtr + 5 >> 0] = HEAP8[ptr + 5 >> 0];
 HEAP8[tempDoublePtr + 6 >> 0] = HEAP8[ptr + 6 >> 0];
 HEAP8[tempDoublePtr + 7 >> 0] = HEAP8[ptr + 7 >> 0];
}
function copyTempFloat(ptr) {
 ptr = ptr | 0;
 HEAP8[tempDoublePtr >> 0] = HEAP8[ptr >> 0];
 HEAP8[tempDoublePtr + 1 >> 0] = HEAP8[ptr + 1 >> 0];
 HEAP8[tempDoublePtr + 2 >> 0] = HEAP8[ptr + 2 >> 0];
 HEAP8[tempDoublePtr + 3 >> 0] = HEAP8[ptr + 3 >> 0];
}
function runPostSets() {}
function _strlen(ptr) {
 ptr = ptr | 0;
 var curr = 0;
 curr = ptr;
 while (HEAP8[curr >> 0] | 0) {
  curr = curr + 1 | 0;
 }
 return curr - ptr | 0;
}
function stackAlloc(size) {
 size = size | 0;
 var ret = 0;
 ret = STACKTOP;
 STACKTOP = STACKTOP + size | 0;
 STACKTOP = STACKTOP + 7 & -8;
 return ret | 0;
}
function setThrew(threw, value) {
 threw = threw | 0;
 value = value | 0;
 if ((__THREW__ | 0) == 0) {
  __THREW__ = threw;
  threwValue = value;
 }
}
function setTempRet0(value) {
 value = value | 0;
 tempRet0 = value;
}
function stackRestore(top) {
 top = top | 0;
 STACKTOP = top;
}
function getTempRet0() {
 return tempRet0 | 0;
}
function stackSave() {
 return STACKTOP | 0;
}

// EMSCRIPTEN_END_FUNCS
  

    return { _strlen: _strlen, _free: _free, _main: _main, _memset: _memset, _malloc: _malloc, _memcpy: _memcpy, runPostSets: runPostSets, stackAlloc: stackAlloc, stackSave: stackSave, stackRestore: stackRestore, setThrew: setThrew, setTempRet0: setTempRet0, getTempRet0: getTempRet0 };
  })
  // EMSCRIPTEN_END_ASM
  ({ "Math": Math, "Int8Array": Int8Array, "Int16Array": Int16Array, "Int32Array": Int32Array, "Uint8Array": Uint8Array, "Uint16Array": Uint16Array, "Uint32Array": Uint32Array, "Float32Array": Float32Array, "Float64Array": Float64Array }, { "abort": abort, "assert": assert, "asmPrintInt": asmPrintInt, "asmPrintFloat": asmPrintFloat, "min": Math_min, "_send": _send, "___setErrNo": ___setErrNo, "_fflush": _fflush, "_pwrite": _pwrite, "_fprintf": _fprintf, "__reallyNegative": __reallyNegative, "_sbrk": _sbrk, "_emscripten_memcpy_big": _emscripten_memcpy_big, "_fileno": _fileno, "_sysconf": _sysconf, "_clock": _clock, "_puts": _puts, "_printf": _printf, "_write": _write, "___errno_location": ___errno_location, "_fputc": _fputc, "_abort": _abort, "_fwrite": _fwrite, "_time": _time, "_mkport": _mkport, "__formatString": __formatString, "_fputs": _fputs, "STACKTOP": STACKTOP, "STACK_MAX": STACK_MAX, "tempDoublePtr": tempDoublePtr, "ABORT": ABORT, "NaN": NaN, "Infinity": Infinity }, buffer);
  var _strlen = Module["_strlen"] = asm["_strlen"];
var _free = Module["_free"] = asm["_free"];
var _main = Module["_main"] = asm["_main"];
var _memset = Module["_memset"] = asm["_memset"];
var _malloc = Module["_malloc"] = asm["_malloc"];
var _memcpy = Module["_memcpy"] = asm["_memcpy"];
var runPostSets = Module["runPostSets"] = asm["runPostSets"];
  
  Runtime.stackAlloc = asm['stackAlloc'];
  Runtime.stackSave = asm['stackSave'];
  Runtime.stackRestore = asm['stackRestore'];
  Runtime.setTempRet0 = asm['setTempRet0'];
  Runtime.getTempRet0 = asm['getTempRet0'];
  

// Warning: printing of i64 values may be slightly rounded! No deep i64 math used, so precise i64 code not included
var i64Math = null;
/*
  Copyright (C) 2013

  This software is provided 'as-is', without any express or implied
  warranty.  In no event will the authors be held liable for any damages
  arising from the use of this software.

  Permission is granted to anyone to use this software for any purpose,
  including commercial applications, and to alter it and redistribute it
  freely, subject to the following restrictions:

  1. The origin of this software must not be misrepresented; you must not
     claim that you wrote the original software. If you use this software
     in a product, an acknowledgment in the product documentation would be
     appreciated but is not required.
  2. Altered source versions must be plainly marked as such, and must not be
     misrepresented as being the original software.
  3. This notice may not be removed or altered from any source distribution.

  https://github.com/johnmccutchan/ecmascript_simd/blob/master/src/ecmascript_simd.js
*/



// === Auto-generated postamble setup entry stuff ===

if (memoryInitializer) {
  if (ENVIRONMENT_IS_NODE || ENVIRONMENT_IS_SHELL) {
    var data = Module['readBinary'](memoryInitializer);
    HEAPU8.set(data, STATIC_BASE);
  } else {
    addRunDependency('memory initializer');
    Browser.asyncLoad(memoryInitializer, function(data) {
      HEAPU8.set(data, STATIC_BASE);
      removeRunDependency('memory initializer');
    }, function(data) {
      throw 'could not load memory initializer ' + memoryInitializer;
    });
  }
}

function ExitStatus(status) {
  this.name = "ExitStatus";
  this.message = "Program terminated with exit(" + status + ")";
  this.status = status;
};
ExitStatus.prototype = new Error();
ExitStatus.prototype.constructor = ExitStatus;

var initialStackTop;
var preloadStartTime = null;
var calledMain = false;

dependenciesFulfilled = function runCaller() {
  // If run has never been called, and we should call run (INVOKE_RUN is true, and Module.noInitialRun is not false)
  if (!Module['calledRun'] && shouldRunNow) run();
  if (!Module['calledRun']) dependenciesFulfilled = runCaller; // try this again later, after new deps are fulfilled
}

Module['callMain'] = Module.callMain = function callMain(args) {
  assert(runDependencies == 0, 'cannot call main when async dependencies remain! (listen on __ATMAIN__)');
  assert(__ATPRERUN__.length == 0, 'cannot call main when preRun functions remain to be called');

  args = args || [];

  ensureInitRuntime();

  var argc = args.length+1;
  function pad() {
    for (var i = 0; i < 4-1; i++) {
      argv.push(0);
    }
  }
  var argv = [allocate(intArrayFromString(Module['thisProgram'] || '/bin/this.program'), 'i8', ALLOC_NORMAL) ];
  pad();
  for (var i = 0; i < argc-1; i = i + 1) {
    argv.push(allocate(intArrayFromString(args[i]), 'i8', ALLOC_NORMAL));
    pad();
  }
  argv.push(0);
  argv = allocate(argv, 'i32', ALLOC_NORMAL);

  initialStackTop = STACKTOP;

  try {

    var ret = Module['_main'](argc, argv, 0);


    // if we're not running an evented main loop, it's time to exit
    if (!Module['noExitRuntime']) {
      exit(ret);
    }
  }
  catch(e) {
    if (e instanceof ExitStatus) {
      // exit() throws this once it's done to make sure execution
      // has been stopped completely
      return;
    } else if (e == 'SimulateInfiniteLoop') {
      // running an evented main loop, don't immediately exit
      Module['noExitRuntime'] = true;
      return;
    } else {
      if (e && typeof e === 'object' && e.stack) Module.printErr('exception thrown: ' + [e, e.stack]);
      throw e;
    }
  } finally {
    calledMain = true;
  }
}




function run(args) {
  args = args || Module['arguments'];

  if (preloadStartTime === null) preloadStartTime = Date.now();

  if (runDependencies > 0) {
    Module.printErr('run() called, but dependencies remain, so not running');
    return;
  }

  preRun();

  if (runDependencies > 0) return; // a preRun added a dependency, run will be called later
  if (Module['calledRun']) return; // run may have just been called through dependencies being fulfilled just in this very frame

  function doRun() {
    if (Module['calledRun']) return; // run may have just been called while the async setStatus time below was happening
    Module['calledRun'] = true;

    ensureInitRuntime();

    preMain();

    if (ENVIRONMENT_IS_WEB && preloadStartTime !== null) {
      Module.printErr('pre-main prep time: ' + (Date.now() - preloadStartTime) + ' ms');
    }

    if (Module['_main'] && shouldRunNow) {
      Module['callMain'](args);
    }

    postRun();
  }

  if (Module['setStatus']) {
    Module['setStatus']('Running...');
    setTimeout(function() {
      setTimeout(function() {
        Module['setStatus']('');
      }, 1);
      if (!ABORT) doRun();
    }, 1);
  } else {
    doRun();
  }
}
Module['run'] = Module.run = run;

function exit(status) {
  ABORT = true;
  EXITSTATUS = status;
  STACKTOP = initialStackTop;

  // exit the runtime
  exitRuntime();

  // TODO We should handle this differently based on environment.
  // In the browser, the best we can do is throw an exception
  // to halt execution, but in node we could process.exit and
  // I'd imagine SM shell would have something equivalent.
  // This would let us set a proper exit status (which
  // would be great for checking test exit statuses).
  // https://github.com/kripken/emscripten/issues/1371

  // throw an exception to halt the current execution
  throw new ExitStatus(status);
}
Module['exit'] = Module.exit = exit;

function abort(text) {
  if (text) {
    Module.print(text);
    Module.printErr(text);
  }

  ABORT = true;
  EXITSTATUS = 1;

  var extra = '\nIf this abort() is unexpected, build with -s ASSERTIONS=1 which can give more information.';

  throw 'abort() at ' + stackTrace() + extra;
}
Module['abort'] = Module.abort = abort;

// {{PRE_RUN_ADDITIONS}}

if (Module['preInit']) {
  if (typeof Module['preInit'] == 'function') Module['preInit'] = [Module['preInit']];
  while (Module['preInit'].length > 0) {
    Module['preInit'].pop()();
  }
}

// shouldRunNow refers to calling main(), not run().
var shouldRunNow = true;
if (Module['noInitialRun']) {
  shouldRunNow = false;
}


run();

// {{POST_RUN_ADDITIONS}}






// {{MODULE_ADDITIONS}}






