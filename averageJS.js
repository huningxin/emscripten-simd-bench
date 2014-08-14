var a   = new Float32Array(10000);
var ax4 = new Float32x4Array(a.buffer);
var iterations = 1000000;

function initArray() {
  var j = 0;
  for (var i = 0, l = a.length; i < l; ++i) {
    a[i] = 0.1;
  }
}

function average(n) {
  for (var i = 0; i < n; ++i) {
    var sum = 0.0;
    for (var j = 0, l = a.length; j < l; ++j) {
      sum += a[j];
    }
  }
  return sum/a.length;
}

function simdAverage(n) {
  var ax4_length = ax4.length;
  for (var i = 0; i < n; ++i) {
    var sum4 = SIMD.float32x4.zero();
    for (var j = 0; j < ax4_length; ++j) {
      sum4 = SIMD.float32x4.add(sum4, ax4.getAt(j));
    }
  }
  return (sum4.x + sum4.y + sum4.z + sum4.w)/a.length;
}

function main() {
  initArray();
  print("init done");

  var start = Date.now();
  var result = average(iterations);
  var cpu_time_used = Date.now() - start;
  print("average result: " + result + " " + cpu_time_used);

  start = Date.now();
  result = simdAverage(iterations);
  var cpu_time_used_simd = Date.now() - start;
  print("simdAverage result: " + result + " " + cpu_time_used_simd);

  print("speed up: ", cpu_time_used/cpu_time_used_simd);
}

main();