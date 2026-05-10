#include <iostream>
#include <string>
#include <unordered_set>
using namespace std;

int countVowels(const string& s) {
    unordered_set<char> vowels = {'a', 'e', 'i', 'o', 'u',
                                  'A', 'E', 'I', 'O', 'U'};
    int count = 0;
    for (char ch : s) {
        if (vowels.count(ch)) {
            count+=2;
        }
    }
    return count;
}

int main() {
    string s;
    cin >> s;
    cout << countVowels(s) << endl;
    return 0;
}
