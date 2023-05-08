import re
def colect_result():
    result = input("Your Result: (_/?/!)")
    match = re.match(r'^[!?_]{5}$', result)
    if not match:
        print("Guess not in database of words")
        return collect_result()
    return result