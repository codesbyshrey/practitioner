# Image Scraper for Static Websites

import requests
from bs4 import BeautifulSoup
import os

# Function to download images
def download_image(url, directory):
    response = requests.get(url)
    if response.status_code == 200:
        # Extract filename from URL
        filename = os.path.join(directory, url.split("/")[-1])
        with open(filename, 'wb') as f:
            f.write(response.content)
            print("Downloaded:", filename)
    else:
        print("Failed to download:", url)

# URL of the website to scrape --> replace website name as needed
url = "https://www.example.com"

# Send a GET request to the website
response = requests.get(url)

if response.status_code == 200:
    # Create a BeautifulSoup object to parse the HTML content
    soup = BeautifulSoup(response.content, 'html.parser')

    # HTML parser will return the page in HTML text, allowing for us 

    # Find all image tags in the HTML
    img_tags = soup.find_all('img')

    # Create a directory to store the downloaded images
    os.makedirs('images', exist_ok=True)

    # Download each image
    for img_tag in img_tags:
        img_url = img_tag['src']
        download_image(img_url, 'images')
else:
    print("Failed to retrieve website:", url)
