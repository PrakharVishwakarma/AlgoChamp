#include <iostream>
#include <vector>
#include <string>
#include <algorithm>
#include <iterator>
#include <climits>

using namespace std;

##USER_CODE_HERE##

int main() {
	int size_nums;
		cin >> size_nums;
		vector<int> nums(size_nums);
		for(int i = 0; i < size_nums; i++) {
			cin >> nums[i];
		}

	int result = maxElementSum(nums);
	cout << result << endl;
	return 0;
}