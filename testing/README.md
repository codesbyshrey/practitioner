# Testing Notes

 - Unit Tests - isolated tests for one specific function
 - Integration Tests - larger tests for user behavior and entire applications
   - Put simply, it combines diff pieces of code functionality to make sure all the parts work together
   - Think of it like the factory line --> units are tested --> units are viable --> units are integrated --> new whole unit is tested
   - Can help catch code regressions
- Overall focus is to see how code handles unexpected results, expected results, and errors

- Unit tests are significantly easier to write and debug, resulting in fewer integration tests
<hr>

### Best Practices
1. If it can break, test it --> models, views, forms, tempaltes, validators, etc.
2. Each test should ideally only focus on a single function
3. Keep it simple, don't outsmart yourself - one test at a time
4. Run tests whenever code is PULL or PUSH and prior to production pushes
5. Upgrade locally, run test suite, fix bugs, push for staging, test before shipping
<hr>

# Language Specific Notes

<details close>
     <br>
     <summary> Django </summary>
     1. Test structures can be modeled inside a single tests.py file <br>
     2. Structure tests folder w/ __init__, and separate files for forms, models views <br>
     3. Create separate test folder that mirrors the entire project structure <br>

```py
class YourTestClass(TestCase):

    # Runs once to set up non-modified data for all class methods
    @classmethod
    def setUpTestData(cls):
        cls.stuff = False

    # Runs once for every test method to setup clean data
    def setUp(self):
        pass

    def test_stuff_is_false(self):
        self.assertFalse(self.stuff)

    def test_false_is_true(self):
        self.assertTrue(False)
        # will return with a FAIL

    def test_one_plus_one_equals_two(self):
        self.assertEqual(1 + 1, 2)
```

</details>
<br>
<details close>
     <br>
     <summary> React Native </summary>
</details>
<br>
<details close>
     <br>
     <summary> misc. </summary>
</details>