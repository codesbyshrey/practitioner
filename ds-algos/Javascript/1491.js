// You are given an array of unique integers salary where salary[i] is the salary of the ith employee.

// Return the average salary of employees excluding the minimum and maximum salary.
// Answers within 10-5 of the actual answer will be accepted.

// Constraints:

// 3 <= salary.length <= 100
// 1000 <= salary[i] <= 106
// All the integers of salary are unique.

/**
 * @param {number[]} salary
 * @return {number}
 */
var average = function(salary) {
    let min = salary[0];
    let max = salary[0];
    let total = 0;

    for (let i = 0; i < salary.length; i++) {
        min = Math.min(min, salary[i]);
        max = Math.max(max, salary[i]);
        total += salary[i];
    }
    // total is now total of all salary values

    let sum = total - min - max;
    // calculate average after reducing
    return (sum)/(salary.length-2);
};

// unique integers - salary
// average salary w/out min and max

// refactor?