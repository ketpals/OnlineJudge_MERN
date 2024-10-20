def reverse_string(s):
    return s[::-1]

if __name__ == "__main__":
    # Read input from stdin
    s = input().strip()
    # Call the function and print the result
    print(reverse_string(s))