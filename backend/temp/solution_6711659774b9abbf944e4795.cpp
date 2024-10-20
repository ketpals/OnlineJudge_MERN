#include <iostream>
#include <algorithm>
using namespace std;

int main() {
    string s;
    cin >> s;  // Reads input from the test case, like "hello"
    
    reverse(s.begin(), s.end());  // Reverses the string
    
    cout << s;  // Outputs the reversed string, like "olleh"
    
    return 0;
}
