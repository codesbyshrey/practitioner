// FIND THE PREFIX COMMON ARRAY OF TWO ARRAYS
// MEDIUM
// BIWEEKLY MORNING CONTEST 4.29

/*
You are given two 0-indexed integer permutations A and B of length n.

A prefix common array of A and B is an array C such that C[i] is equal to the count of numbers that are present at or before the index i in both A and B.

Return the prefix common array of A and B.

A sequence of n integers is called a permutation if it contains all integers from 1 to n exactly once.
*/

/**
 * @param {number[]} A
 * @param {number[]} B
 * @return {number[]}
 */
var findThePrefixCommonArray = function(A, B) {
    let n = A.length; //would be same with B.length anyways
    // can't initialize with empty array, as ++ doesn't work
    // new Array(n).fill(x) --> creates array of length n and fills all values with value x
    // let C = [];
    let C = new Array(n).fill(0)
    let setA = new Set();
    let setB = new Set();
    for (let i = 0; i < n; i++) {
        setA.add(A[i]);
        setB.add(B[i]);
        // ADD THE VALUES OF ARRAYS INTO THE SETS

        // ITERATE THROUGH PERMUTATION (all integers 1-n exactly once)
        for (let j = 1; j <= n; j++) {
            if (setA.has(j) && setB.has(j)) {
                C[i]++;
                // wouldn't work with an initialized empty array because there would be no value to access to increase by 1 for our counter
                // we're still inside main for loop so we can still access indexes to search for in array
            }
        }
    }
    return C;
};

// if the sequence of both arrays is a permutation containing all numbers between 1-n
// it's likely that the farthest index will be equivalent to the value of m regardless

// SETS in Javascript are a collection of values that may only occur once (permutation)
// add with add(), insertion order is sequential
//.has() will check if that particular value is present, which should match the sequential insertion order