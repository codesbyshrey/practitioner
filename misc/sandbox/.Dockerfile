FROM python:3.10

COPY . /app
WORKDIR /app
RUN pip install -r requirements.txt

EXPOSE 5000

CMD ["flask", "run", "--host", "0.0.0.0"]

# Run docker build, then docker run. docker ps provide sinformation. standard linux cmds can let you see what's happening

# Everything is isolated into this container, available whenever you want