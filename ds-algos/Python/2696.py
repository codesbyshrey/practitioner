# https://leetcode.com/problems/minimum-string-length-after-removing-substrings/description/

# STRING, STACK, SIMULATION

"""
We will use a stack for this problem, and iterate through characters.
First, generate a stack. On first run, it will hit the else statement and append chars to the stack.
Second, during each iteration, we will check if B or D exists
    The next step is to ensure that the last appended value once we get to B or D, is A or C --> the substrings we are aiming to remove. This is achieved with stack[-1]
If such a situation happens, we just immediately pop the character.
Note that the characters B and D will never be appended if they have an A or a C preceding them, hence why we don't have to pop twice.
"""

class Solution:
    def minLength(self, s: str) -> int:
        # place into stack --> if conditional for current and previous match
        # return new concat string back into function
        
        stack = []
        for char in s:
            if char == "B" and stack and stack[-1] == "A":
                # if current character is B and previous corresponding stack is A
                stack.pop()
            elif char == "D" and stack and stack[-1] == "C":
                stack.pop()
            else:
                stack.append(char)
        return len(stack)
    
"""
Example 1:

Input: s = "ABFCACDB"
Output: 2
Explanation: We can do the following operations:
- Remove the substring "ABFCACDB", so s = "FCACDB".
- Remove the substring "FCACDB", so s = "FCAB".
- Remove the substring "FCAB", so s = "FC".
So the resulting length of the string is 2.
It can be shown that it is the minimum length that we can obtain.
""" """
Example 2:

Input: s = "ACBBD"
Output: 5
Explanation: We cannot do any operations on the string so the length remains the same.
"""