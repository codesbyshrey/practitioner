// MAXIMUM SUM W/ EXACTLY K ELEMENTS
// EASY
// BIWEEKLY MORNING CONTEST 4.29

// You are given a 0-indexed integer array nums and an integer k. Your task is to perform the following operation exactly k times in order to maximize your score:

// Select an element m from nums.
// Remove the selected element m from the array.
// Add a new element with a value of m + 1 to the array.
// Increase your score by m.
// Return the maximum score you can achieve after performing the operation exactly k times

/**
 * @param {number[]} nums
 * @param {number} k
 * @return {number}
 */
var maximizeSum = function(nums, k) {
    let score = 0;
    for (let i = 0; i < k; i++) {
        // let maxIdx = nums.indexOf(Math.max(nums));
        let mIndex = nums.indexOf(Math.max(...nums)); //mIndex
        let m = nums[mIndex]; //finding m
        nums[mIndex] = m + 1; //assigning m+1 value
        score += m; //adding m to score
    }
    return score;
};

// iterate k times through the aray
// determine the index of the maximum number --> can use Math.max and indexOf functions
// use ... array spread to make a copy of nums without having to iterate through
    // works better because then you're looking for the maximum value after each iteration
// assign the maximum value (selected element m from nums)
// change value to m+1 and add maxValue to score
// return maximum score