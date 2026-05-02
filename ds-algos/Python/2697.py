# https://leetcode.com/problems/lexicographically-smallest-palindrome/

# TWO POINTERS, STRINGS

"""
Basic definition of a palindrome means the letters on opposite ends are the same as we iterate inwards towards the middle of the word.
To find the minimum number of operations to generate a palindrome.
Lexicographically smallest --> we just need to take advantage of ASCII to compare the values of the characters and how the computer interprets chars, to generate a comparison and ensure that the replaced letter is always "lower"
"""

class Solution:
    def makeSmallestPalindrome(self, s: str) -> str:
        n = len(s)
        s = list(s)
        
        for i in range (n//2):
            if s[i] != s[n-i-1]:
            # if currently not palindrome
                if s[i] < s[n-i-1]:
                    s[n-i-1] = s[i] #palindrome magic
                else: s[i] = s[n-i-1]     
        return "".join(s)
    
    # for lexicographical inclusion, we check if list value is decreased
    # would interpret as ASCII --> always replace larger w/ smaller

"""
Example 1:

Input: s = "egcfe"
Output: "efcfe"
Explanation: The minimum number of operations to make "egcfe" a palindrome is 1, and the lexicographically smallest palindrome string we can get by modifying one character is "efcfe", by changing 'g'.
""""""
Example 2:

Input: s = "abcd"
Output: "abba"
Explanation: The minimum number of operations to make "abcd" a palindrome is 2, and the lexicographically smallest palindrome string we can get by modifying two characters is "abba".
""""""
Example 3:

Input: s = "seven"
Output: "neven"
Explanation: The minimum number of operations to make "seven" a palindrome is 1, and the lexicographically smallest palindrome string we can get by modifying one character is "neven".
"""