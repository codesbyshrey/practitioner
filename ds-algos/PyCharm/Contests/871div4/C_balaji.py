import os, sys, math, cmath, time, collections
from collections import deque, Counter, OrderedDict, defaultdict
from heapq import nsmallest, nlargest, heapify, heappop, heappush, heapreplace
from math import ceil, floor, log, log2, sqrt, gcd, factorial, pow, pi
from bisect import bisect, bisect_left, bisect_right, insort, insort_left, insort_right
from itertools import accumulate, permutations,combinations,combinations_with_replacement
from io import BytesIO, IOBase
from functools import reduce
from typing import *


start_time = time.time()

def solve(num, goal):
    pass

def main():
    # pass
    n = int(input())
    A = [float('inf')] * 4
    for _ in range(n):
        M, P = list(map(input().split()))
        #A.append((M, P))
        M = int(M)
        bit1, bit2 = list(map(int, P))
        value = 2*bit1 + bit2
        A[value] = min(A[value],M)
    result = min(A[1] + A[2], A[3])
    print(result)





if __name__ == "__main__":
    if os.path.exists("data.in"):
        sys.stdin = open("data.in", "r")
        sys.stdout = open("data.out", "w")

    testcases = int(input())
    for i in range(testcases):
        main()

    # If it's local - Print this O/P
    if os.path.exists("data.in"):
        print(f"Time Elapsed: {time.time() - start_time} seconds")
        sys.stdout.close()