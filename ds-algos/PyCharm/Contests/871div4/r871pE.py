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

def solve(grid, visited, i, j):
    #solve in this case will represent Depth First Search implementation
    #DFS is recursive
    if i < 0 or i >= len(grid) or j < 0 or j >= len(grid[0]) or visited[i][j] or grid[i][j] == 0:
        return 0
    visited[i][j] = True
    volume = grid[i][j]
    volume += solve(grid, visited, i+1, j)
    volume += solve(grid, visited, i-1, j)
    volume += solve(grid, visited, i, j+1)
    volume += solve(grid, visited, i, j-1)
    return volume

def main():
    # pass
    num, depth = map(int, input().split())
    grid = []
    for _ in range(num):
        row = list(map(int, input().split()))
        grid.append(row)
    max_volume = 0
    visited = [[False for _ in range(depth)] for _ in range(num)]
    for i in range(num):
        for j in range(depth):
            if not visited[i][j] and grid[i][j] > 0:
                volume = solve(grid, visited, i, j)
                max_volume = max(max_volume, volume)
    print(max_volume)

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