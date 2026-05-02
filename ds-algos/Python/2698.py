# https://leetcode.com/problems/find-the-punishment-number-of-an-integer/description/

"""
We can also hardcode a solution by finding every number between 1 and 1000 that meets our partition conditions, and simply iterate through that list.
In this solution, we have the partition helper function keeping track of the sum to add and the summtotal throughout the recursive call stack.
"""

class Solution:
    def punishmentNumber(self, n: int) -> int:
        # sum all results : where i<n, i*i exists and adding digits = i
        def partition(sumAdd, sumTotal, num, target):
            if not num:
                return target == sumAdd + sumTotal
            n = int(num[0])
            cached = sumTotal
            return partition(sumAdd, cached*10 + n, num[1:], target) or partition(sumAdd + cached, n, num[1:], target)
            
        
        # basic logic, have to understand how to build partitioning
        answer = 0
        for i in range(1, n+1):
            if partition(0, 0, str(i*i), i):
                answer += i*i
        return answer
    
"""
Example 1:

Input: n = 10
Output: 182
Explanation: There are exactly 3 integers i that satisfy the conditions in the statement:
- 1 since 1 * 1 = 1
- 9 since 9 * 9 = 81 and 81 can be partitioned into 8 + 1.
- 10 since 10 * 10 = 100 and 100 can be partitioned into 10 + 0.
Hence, the punishment number of 10 is 1 + 81 + 100 = 182
""""""
Example 2:

Input: n = 37
Output: 1478
Explanation: There are exactly 4 integers i that satisfy the conditions in the statement:
- 1 since 1 * 1 = 1. 
- 9 since 9 * 9 = 81 and 81 can be partitioned into 8 + 1. 
- 10 since 10 * 10 = 100 and 100 can be partitioned into 10 + 0. 
- 36 since 36 * 36 = 1296 and 1296 can be partitioned into 1 + 29 + 6.
Hence, the punishment number of 37 is 1 + 81 + 100 + 1296 = 1478
"""