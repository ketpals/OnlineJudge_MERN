#include <iostream>
#include <algorithm>
using namespace std;

int main() {
    string s = "hello";
    
    reverse(s.begin(), s.end());  // Reverses the string
    
    cout << s;  // Outputs the reversed string, like "olleh"
    
    return 0;
}
