import bottle
from bottle import route, static_file, request, run
from base64 import b64decode
import imageio
import json

@route('/')
def index():
    return static_file(root='../front-end/public', filename="index.html")

@route('/export', method='POST')
def export():
    # this function takes a set of frames and exports them to a gif
    data = request.json
    frames = []
    for d in data:
        base64string = d[22:] # strip off unnecessary characters
        img_bytes = b64decode(base64string)
        frames.append(imageio.imread(img_bytes))
    
    imageio.mimsave('./test.gif', frames)

    return json.dumps(dict(data=gif_byte_string))

@route('/js/<filename>')
def static(filename):
    return static_file(root='../front-end/public', filename=filename)

@route('/static/<filename>')
def static_filename(filename):
    return static_file(root='../front-end/public', filename=filename)

run(host="localhost", port=5000)