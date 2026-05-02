// https://leetcode.com/problems/palindrome-number/

// Given an integer x, return true if x is a palindrome, and false otherwise.

// Constraints:
// -231 <= x <= 231 - 1

/**
 * @param {number} x
 * @return {boolean}
 */
var isPalindrome = function(x) {
    if (x < 0) return false; // if negative, false

    let forward = x;
    let backward = 0;

    // Pulled from reverse integer
    while (forward > 0) {
        const digit = forward % 10;
        backward = backward * 10 + digit;
        forward = parseInt(forward / 10);
    }

    return x === backward;
};

// get last digit of original number
// put this digit as last one in the reverse number
// remove this digit from the original number and round down

// Could you solve it without converting the integer to a string?