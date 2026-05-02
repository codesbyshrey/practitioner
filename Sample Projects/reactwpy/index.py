# component for creating function that returns HTML-like React components, 
# html for website elements, 
# run for launching your app.
from reactpy import component, html, run 

# Define your component
@component
def HelloWorld():
     return html.h1("Hello, World!")

# Run it with a development server. For testing purposes only.
run(HelloWorld)

# Whenever you want to make a component, create a function returning html and add @component decorator