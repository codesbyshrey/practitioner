"""
Your autonomous controller implementation.
Edit the get_control() method to implement your driving algorithm!
"""
import math

class Controller:
    def __init__(self):
        # PID parameters - tune these!
        self.Kp = 0.015
        self.Ki = 0.0002
        self.Kd = 0.10

        # PID state
        self.previous_error = 0.0
        self.integral = 0.0

    def get_control(self, car, sensor_readings):
        """
        Calculate steering, throttle, and brake.

        Args:
            car: Dictionary with x, y, theta, velocity
            sensor_readings: List of 16 distance values

        Returns:
            [steering, throttle, brake]
        """
        # Calculate error from center
        error = self.calculate_center_error(sensor_readings)

        # PID steering
        steering = self.pid_control(error)

        # Simple speed control (reduced for better control)
        throttle = 0.25
        brake = 0.0

        return [steering, throttle, brake]

    def calculate_center_error(self, sensor_readings):
        """Calculate lateral error from track center."""
        mid = len(sensor_readings) // 2
        left_avg = sum(sensor_readings[:mid]) / mid
        right_avg = sum(sensor_readings[mid:]) / mid
        return right_avg - left_avg

    def pid_control(self, error):
        """PID controller for steering."""
        dt = 1.0 / 60.0

        # P term
        p_term = self.Kp * error

        # I term
        self.integral += error * dt
        self.integral = max(-100, min(100, self.integral))
        i_term = self.Ki * self.integral

        # D term
        d_term = self.Kd * (error - self.previous_error) / dt
        self.previous_error = error

        return p_term + i_term + d_term

    def reset(self):
        """Reset controller state."""
        self.previous_error = 0.0
        self.integral = 0.0
