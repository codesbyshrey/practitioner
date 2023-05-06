def lovestory(strings):
    count = 0
    for s in strings:
        for i in range(len(s)):
            if s[i] != "codeforces"[i]:
                count += 1
    return count


def main():
    t = int(input())
    for _ in range(t):
        s = input()
        count = 0
        for i in range(len(s)):
            if s[i] != "codeforces"[i]:
                count += 1
        return count