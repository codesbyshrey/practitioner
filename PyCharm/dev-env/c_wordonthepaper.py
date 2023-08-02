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

def solve(chessboard):
    # print("Testcases I/O Works")
    for i in range(8):
        words = ""
        for j in range(8):
            if chessboard[i][j] != ".":
                words += chessboard[i][j]
                words = words.strip()
        if len(words) > 0:
            print(words)
            break

def main():
    # Inputs / Parameters and basic solution logic
    # don't forget to pass in vars to solve as needed
    chessboard = []
    # create our chessboard
    for board in range(8):
        row = input().strip()
        chessboard.append(row)
    solve(chessboard)

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