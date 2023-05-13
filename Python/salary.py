# Mini Python Salary Calc

# 365 days, 52 weeks, 8h/day --> 40h
# 2080 Hours per year --> 1950 (7.5h)

year = 365
weeks = 52

name = input("Name?")
working_hours = int(input("How many hours worked per day?"))
working_days = int(input("How many days worked per week?"))
annual_salary = float(input("Annual Salary?"))

hourly_salary = annual_salary / 2080

daily_salary = hourly_salary * 8

weekly_salary = annual_salary / 52

monthly_salary = annual_salary / 12

yearly_salary = monthly_salary * 12

print("\n========== SALARY INFORMATION =======================")
print("Name: " + name)
print("Working Hours: " + str(working_hours))
print("Working Days: " + str(working_days))
print("\n =========== SALARY BREAKDOWN ==========")
print("Hourly: ${:,.2f}".format(hourly_salary))
print("Daily: ${:,.2f}".format(daily_salary))
print("Weekly: ${:,.2f}".format(weekly_salary))
print("Monthly: ${:,.2f}".format(monthly_salary))
print("Yearly: ${:,.2f}".format(yearly_salary))