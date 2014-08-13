EMCC=$(EMSCRIPTEN)/emcc -DNDEBUG=1 -I./
HEAP=16777216

OBJECTS = \
average.bc

all: average.js

%.bc: %.cc
	$(EMCC) -O2 -g -s ASM_JS=1 $< -o $@

average.js.bc: $(OBJECTS)
	$(LLVM)/llvm-link -o $@ $(OBJECTS)

average.js: average.js.bc
	$(EMCC) -O2 -g -s ASM_JS=1 -s TOTAL_MEMORY=$(HEAP) $< -o $@

clean:
	rm average.js average.js.bc $(OBJECTS)
