def solve():
    valid_words = ALL_WORDS
    while True:
        guess = make_guess(valid_words)
        print("Guess Word:" + guess.upper())
        result = collect_result()
        if result == CORRECT:
            print("I won!")
            break
        valid_words = update_valid_words(valid_words, guess, result)