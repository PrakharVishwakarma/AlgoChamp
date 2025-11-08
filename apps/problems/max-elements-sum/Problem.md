# Max Element Sum

## Problem Statement

Given an array of integers, find the sum of the two largest elements in the array. The array will always contain at least two elements.

## Input Format

- A single line containing an array of integers

## Output Format

- A single integer representing the sum of the two largest elements

## Constraints

- The array contains at least 2 elements
- Array elements can be positive, negative, or zero
- Array length: 2 ≤ n ≤ 10^5
- Element range: -10^9 ≤ arr[i] ≤ 10^9

## Examples

### Example 1

**Input:**
```
[2, 12, 15, 18, 25, 9, 45, 5]
```

**Output:**
```
70
```

**Explanation:**
The two largest elements are `45` and `25`. Their sum is `45 + 25 = 70`.

### Example 2

**Input:**
```
[-1, -5, -10, -2]
```

**Output:**
```
-3
```

**Explanation:**
The two largest elements are `-1` and `-2`. Their sum is `-1 + -2 = -3`.

### Example 3

**Input:**
```
[10, -5, 20, -15, 5]
```

**Output:**
```
30
```

**Explanation:**
The two largest elements are `20` and `10`. Their sum is `20 + 10 = 30`.



## Algorithm Approach

1. **Sort and Pick**: Sort the array in descending order and take the first two elements
2. **Single Pass**: Find the maximum and second maximum in a single iteration
3. **Partial Sort**: Use a partial sorting algorithm to find the two largest elements

## Time Complexity

- **Optimal Solution**: O(n) - Single pass to find two largest elements
- **Sorting Solution**: O(n log n) - Sort entire array

## Space Complexity

- O(1) - Only need variables to track the two largest elements