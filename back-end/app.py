import bottle
from bottle import route, static_file, run


@route('/')
def index():
    return static_file(root='../front-end/public', filename="index.html")

@route('/js/<filename>')
def static(filename):
    return static_file(root='../front-end/public', filename=filename)

run(host="localhost", port=5000)