from flask import Flask, abort, request, jsonify, Response
from tempfile import NamedTemporaryFile
import whisper
import torch
from bs4 import BeautifulSoup
import requests
from tqdm import tqdm
import pandas as pd
import re
import cohere
import numpy as np
import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity
# from annoy import AnnoyIndex
from dotenv import load_dotenv
import os
from annoy import AnnoyIndex
from flask_cors import CORS

load_dotenv()

# Check if NVIDIA GPU is available
torch.cuda.is_available()
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"

# Load the Whisper model:
model = whisper.load_model("base", device=DEVICE)

app = Flask(__name__)
CORS(app, origins=['*'])


@app.route("/")
def hello():
    return "Whisper Hello World!"


@app.route('/whisper', methods=['POST'])
def handler():
    if not request.files:
        # If the user didn't submit any files, return a 400 (Bad Request) error.
        abort(400)

    # For each file, let's store the results in a list of dictionaries.
    results = []

    # Loop over every file that the user submitted.
    for filename, handle in request.files.items():
        # Create a temporary file.
        # The location of the temporary file is available in `temp.name`.
        temp = NamedTemporaryFile()
        # Write the user's uploaded file to the temporary file.
        # The file will get deleted when it drops out of scope.
        handle.save(temp)
        # Let's get the transcript of the temporary file.
        result = model.transcribe(temp.name)
        # Now we can store the result object for this file.
        results.append({
            'filename': filename,
            'transcript': result['text'],
        })

    # This will be automatically converted to JSON.
    return {'results': results}


def get_page_html(url):
    """Get page's HTML from URL."""
    page = requests.get(url)
    soup = BeautifulSoup(page.content, "html.parser")
    return soup

def get_all_titles(base_url, home_url):
    """Get podcast titles & URLs."""
    
    soup = get_page_html(home_url)
    titles = soup.find_all('h3', class_='headline -arrow')
    s = soup.find('h2', string=lambda t: 'recent mckinsey podcast episodes' in t.lower()).parent
    ts = s.find_all('a', class_="item-title-link")

    episodes = {}
    for i, t in enumerate(ts): 
        episodes[i] = {'title': t.text.strip().replace('\n', ''), 'url': f"{base_url}{t['href']}"}
    
    return episodes 

def get_page_text(episodes):
    """Get all podcast transcripts."""
    total = len(episodes)

    for i, episode in tqdm(enumerate(episodes)):
        # TMP
        # if i in [1, 2]:
        e = episodes[i]
        s2 = get_page_html(e['url'])
        # print(f"Title: {e['title']} ({i}/{total})")
        # print(f"URL: {e['url']}")

        # Get article intro
        intro = s2.find_all('div', class_='deck-content-wrapper')
        assert len(intro) == 1, 'More than one intro!'
        intro = intro[0].text.strip()

        # Get article paragraphs
        article = s2.find_all('div', class_='article-body-wrapper')
        assert len(article) == 1, 'Check number of tag matches!'

        ps = article[0].find_all('p')

        paragraphs = []
        paragraphs.append(intro.strip())
        for p in ps:
            # print(p.text + '\n')
            paragraphs.append(p.text.strip())

        # Put it all together
        episodes.update({i: 
                         {
                             'title': e['title'], 
                             'url': e['url'],
                             'intro': intro, 
                             'paragraphs': paragraphs, 
                         }
                        }
                       )

    return episodes

embed_dim='';
texts='';
api_key = os.getenv('COHERE_API_KEY')
co = cohere.Client(api_key)

@app.route('/scrape', methods=['POST'])
def scrape():
    data = request.get_json()
    base_url = data['base_url']
    home_url = data['home_url']

    episodes = get_all_titles(base_url, home_url)
    episodes = get_page_text(episodes)

    # Save transcripts to CSV
    df = pd.DataFrame(episodes).T
    # Clean up escape sequences
    df['paragraphs'] = df.paragraphs.apply(lambda p: [re.sub(r'(\n|\xa0)', ' ', x) for x in p])
    df.to_csv('./mckinsey_podcasts.csv')

    return "CSV saved!"

@app.route('/Embed', methods=['GET'])
def embed():

    # Create and retrieve a Cohere API key from os.cohere.ai
    df = pd.read_csv('./mckinsey_podcasts.csv', index_col=0, converters={'paragraphs': lambda x: x[2:-2].split("', '")})
    df['embeds'] = None  # initialize embeddings
    for i, row in tqdm(df.iterrows()):
        # Embed intros
        embeds = co.embed(texts=[row.intro],
                      model="large",
                      truncate="LEFT").embeddings
        # Embed paragraphs
        # embeds = co.embed(texts=row.paragraphs,
        #                   model="large",
        #                   truncate="LEFT").embeddings
        df.at[i, 'embeds'] = np.array(embeds)
    df.to_csv('./mckinsey_podcasts_embeds.csv')
    embeds = df.embeds.to_list()
    texts = df.intro.to_numpy()
    embed_dim = embeds[0].shape[1]
    
    # Index the embeddings
    search_index = AnnoyIndex(embed_dim, 'angular')
    for i in range(len(embeds)):
        search_index.add_item(i, embeds[i][0])
    
    search_index.build(10) # 10 trees
    search_index.save('./podcasts.ann')

    return "ANN save"

def load_index(embed_dim=4096):
    # Load index
    search_index = AnnoyIndex(embed_dim, 'angular')
    search_index.load('./podcasts.ann')  # super fast, will just mmap the file
    return search_index
df = pd.read_csv('./mckinsey_podcasts_embeds.csv', index_col=0, converters={'paragraphs': lambda x: x[2:-2].split("', '")})
texts = df.intro.to_numpy()

def get_search_results(query, search_index, n_results=5):
    # Get the query's embedding
    query_embed = co.embed(texts=[query],
                           model="large",
                           truncate="LEFT").embeddings

    # Retrieve the nearest neighbors
    similar_item_ids = search_index.get_nns_by_vector(query_embed[0], n_results,
                                                      include_distances=True)
    # Format the results
    results = pd.DataFrame(data={
        'id': similar_item_ids[0],
        'text': texts[similar_item_ids[0]],
        'distance': similar_item_ids[1],
        'url': df.loc[similar_item_ids[0], 'url'],
        'title' : df.loc[similar_item_ids[0], 'title']
    })
    return results
import json

def format_results(df):
    formatted_output = ''
    for i, row in df.reset_index().iterrows():
        formatted_output += f'{i+1}. **[{row.title}]({row.url})**\n*{row.text}*\n\n'
    print(formatted_output)

    json_format = json.loads(formatted_output)
    print(json_format)
    return json_format


@app.route('/query', methods=['POST'])
def queryPodcast():
    
    data = request.get_json()
    query = data['query']

    #query = 'tips on how to accomplish more in my work'
    search_index = load_index()
    results = get_search_results(query, search_index)
    json_data = results.to_json(orient="records")
    return (json_data)


if __name__ == '__main__':
    app.run()
