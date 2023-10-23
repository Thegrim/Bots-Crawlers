import requests
from bs4 import BeautifulSoup
import re

def scrape_and_clean_text(url):
  # Make a request to the URL
  page = requests.get(url)

  # Create a BeautifulSoup object
  soup = BeautifulSoup(page.text, 'html.parser')

  # Find all the text in the div with the class 'article-body'
  text = soup.find().get_text()

  # Remove all the special characters and extra spaces
  cleaned_text = re.sub(r'[^a-zA-Z0-9\s]', '', text)
  cleaned_text = re.sub(r'\s+', ' ', cleaned_text)

  return cleaned_text


cleaned_text = scrape_and_clean_text('https://news.google.com/home?hl=en-US&gl=US&ceid=US:en')

print('Cleaned Text: ' + cleaned_text + '\n')


def scrape_and_print_links(url):
  # Make a request to the URL
  page = requests.get(url)

  # Create a BeautifulSoup object
  soup = BeautifulSoup(page.text, 'html.parser')

  # Find all the 'a' elements
  links = soup.find_all('a')

  # Extract the 'href' attribute of each element
  hrefs = [link.get('href') for link in links]

  # Print the links
  for href in hrefs:
    print('\n')
    print(href)

scrape_and_print_links('https://news.google.com/home?hl=en-US&gl=US&ceid=US:en')
