
##USER_CODE_HERE##

const input = require("fs").readFileSync('/dev/stdin', 'utf8').trim().split("\n").join(" ").split(" ");
        
const size_nums = parseInt(input.shift());
const nums = input.splice(0, size_nums).map(Number);
const result = maxElementSum(nums);
console.log(result);
