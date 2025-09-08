
#include <iostream>
#include <vector>
#include <string>
#include <algorithm>
#include <iterator>

##USER_CODE_HERE##

int main() {
    	int num1;
	std::cin >> num1;

 	int num2;
	std::cin >> num2;

    int result = twoSum(num1, num2);

    std::cout << result << std::endl;

    return 0;
}
        