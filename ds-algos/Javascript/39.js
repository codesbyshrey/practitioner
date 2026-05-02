// https://leetcode.com/problems/combination-sum/

// Given an array of distinct integers candidates and a target integer target, return a list of all unique combinations of candidates where the chosen numbers sum to target.
// You may return the combinations in any order.

// The same number may be chosen from candidates an unlimited number of times.
// Two combinations are unique if the frequency of at least one of the chosen numbers is different.

// The test cases are generated such that the number of unique combinations that sum up to target is less than 150 combinations for the given input.

// Constraints:

// 1 <= candidates.length <= 30
// 2 <= candidates[i] <= 40
// All elements of candidates are distinct.
// 1 <= target <= 40

let candidates1 = [2,3,6,7];
let target1 = 7; // [[2,2,3],[7]]

let candidates2 = [2,3,5];
let target2 = 8; // [[2,2,2,2],[2,3,3],[3,5]]

let candidates3 = [2];
let target3 = 1; // []

/**
 * @param {number[]} candidates
 * @param {number} target
 * @return {number[][]}
 */
var combinationSum = function(candidates, target) {
    let result = []; // final result
    let tempArr = []; // temp array that will be pushed into result array

    let iterate = (idx, sum) => {
        if (sum > target) return;
        if (sum == target) {
            result.push([...tempArr])
            return;
        }
        // recursive function within for loop
        for (let i = idx; i < candidates.length; i++) {
            if (candidates[i] > target) continue
            tempArr.push(candidates[i])
            iterate(i, sum + candidates[i])
            tempArr.pop()
        }
    }
    iterate (0,0) //initialize and call function
    return result;
};

// working w/ CodingDojo boys