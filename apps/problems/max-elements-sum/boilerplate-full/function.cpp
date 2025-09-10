#include <iostream>
#include <vector>
#include <string>
#include <algorithm>
#include <iterator>

##USER_CODE_HERE##

int main() {
	int size_nums;
		std::cin >> size_nums;
		vector<int> nums(size_nums);
		for(int i = 0; i < size_nums; i++) {
			std::cin >> nums[i];
		}

	int result = maxElementSum(nums);
	std::cout << result << std::endl;
	return 0;
}