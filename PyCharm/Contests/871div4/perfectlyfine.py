def main():
    t = int(input())
    for _ in range(t):
        n = int(input())
        min_skill1 = float('inf')
        min_skill2 = float('inf')
        min_both = float('inf')
        for _ in range(n):
            m, s = input().split()
            m = int(m)
            if s == '11':
                min_both = min(min_both, m)
            elif s == '10':
                min_skill1 = min(min_skill1, m)
            elif s == '01':
                min_skill2 = min(min_skill2, m)
        result = min(min_both, min_skill1 + min_skill2)
        if result == float('inf'):
            print(-1)
        else:
            print(result)