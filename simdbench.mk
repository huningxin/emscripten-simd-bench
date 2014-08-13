CC = $(LLVM)/clang++
CFLAGS = -O2 -I./ -DNDEBUG=1
LFLAGS = -lstdc++

OBJECTS = \
average.o

all: average

%.o: %.cc
	$(CC) $(CFLAGS) -o $@ -c $<

average: $(OBJECTS)
	$(CC) $(LFLAGS) -o $@ $(OBJECTS)

clean:
	rm $(OBJECTS) average