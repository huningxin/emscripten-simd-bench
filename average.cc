#include <stdio.h>
#include <stdlib.h>
#include <time.h>
#include <xmmintrin.h>

const static int len = 10000;
const static int iterations = 1000000;

float average(float *src, int len) {
  float sum = 0.0;
  for (int i = 0; i < len; ++i) {
    sum = sum + src[i];
  }
  return sum/len;
}

float simdAverage(float *src, int len) {
  __m128 sumx4 = _mm_setzero_ps();
  for (int i = 0; i < len; i+=4) {
    __m128 v = _mm_load_ps(src + i);
    sumx4 = _mm_add_ps(sumx4, v);
  }
  float sumx4_mem[4];
  _mm_store_ps(sumx4_mem, sumx4);
  return (sumx4_mem[0] + sumx4_mem[1] +
          sumx4_mem[2] + sumx4_mem[3])/len;
}

void initArray(float *src, int len) {
	for (int i = 0; i < len; ++i) {
    src[i] = 0.1;
  }
}

int main() {
  float *src = NULL;
  posix_memalign((void **)&src, 16, len * sizeof(float));
  float result = 0.0;
  clock_t start, end;
  double cpu_time_used, cpu_time_used_simd;

  initArray(src, len);
  printf("init done\n");

  start = clock();
  for (int i = 0; i < iterations; ++i)
    result = average(src, len);
  end = clock();
  cpu_time_used = ((double) (end - start));
  printf("average result: %f %f\n", result, cpu_time_used);

  start = clock();
  for (int i = 0; i < iterations; ++i)
    result = simdAverage(src, len);
  end = clock();
  cpu_time_used_simd = ((double) (end - start));
  printf("simdAverage result: %f %f\n", result, cpu_time_used_simd);

  printf("speed up: %f\n", cpu_time_used/cpu_time_used_simd);
  free(src);
  return 0;
}
