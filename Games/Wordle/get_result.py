def get_result(guess, answer):
    result = ""
    for pos, ch_guess, ch_answer in zip(range(5), guess, answer):
        if ch_guess == ch_answer:
            result += "!"
        elif ch_guess not in answer:
            result += "_"
        else: 
            result += "?"
    return result

def update_valid_words(valid_words, guess, result):
    return [word for word in valid_words if get_result(guess, word) == result]