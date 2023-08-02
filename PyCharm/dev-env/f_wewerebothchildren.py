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

def solve():
    print("Testcases I/O Works")

def main():
    # Inputs / Parameters and basic solution logic
    # don't forget to pass in vars to solve as needed
    # problem D is effectively a find longest subsequence
    n, k = map(int, input().split())
    a = list(map(int, input().split()))

    # since we can rearrange, we might as well sort
    a.sort()
    result = n # subtract from total number of existing problems
    for i in range(n):
        # two pointer approach
        left = i
        right = n-1

        while left < right:
            mid = (left+right)//2
            if a[mid] - a[i] <= k:
                left = mid + 1
            else:
                right = mid - 1
        if a[left] - a[i] <= k:
            result = min(result, n-(left-i+1))
    print(result)
    # solve()

if __name__ == "__main__":
    if os.path.exists("data.in"):
        sys.stdin = open("data.in", "r")
        sys.stdout = open("data.out", "w")

    # takes care of initial line input for # of responses
    testcases = int(input())
    for i in range(testcases):
        main()

    # If it's local - Print this O/P
    if os.path.exists("data.in"):
        print(f"Time Elapsed: {time.time() - start_time} seconds")
        sys.stdout.close()