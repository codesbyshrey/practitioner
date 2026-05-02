def main():
    t = int(input())
    for _ in range(t):
        n = int(input())
        a = list(map(int, input().split()))
        max_length = 0
        current_length = 0
        for i in range(n):
            if a[i] == 0:
                current_length += 1
            else:
                max_length = max(max_length, current_length)
                current_length = 0
        max_length = max(max_length, current_length)
        return (max_length)