use std::io::{self, BufRead};
use std::str::FromStr;

##USER_CODE_HERE##

fn main() {
	let stdin = io::stdin();
	let mut input = stdin.lock().lines().map(|l| l.unwrap());
	let size_nums: usize = input.next().unwrap().parse().unwrap();
	let nums: Vec<i32> = input.take(size_nums).map(|s| s.parse().unwrap()).collect();
	let result = maxElementSum(nums);
	println!("{}", result);
}