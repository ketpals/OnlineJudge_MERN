s = input().strip()  # Read input string
count = 0

for c in s.lower():
    if c in 'aeiou':
        count += 1

print(count)

