---
title: Installation
description: Run Hue Browser on your own computer using Docker.
---

Hue Browser runs as a Docker container, which is a small self-contained package that includes everything the app needs. You do not need to install anything else.

## Install Docker

If you do not already have Docker, download Docker Desktop from the [Docker website](https://www.docker.com/products/docker-desktop/) and follow the installer for your system. Start Docker and wait until it reports that it is running.

## Start Hue Browser

Open a terminal window and run the command below. The first run downloads the app, which takes a moment. Later runs start immediately.

```bash
docker run --rm -p 3000:3000 ghcr.io/seesharprun/hue-browser:latest
```

Leave that window open while you use the app. Closing it, or pressing Control and C together, stops Hue Browser.

## Open the app

Visit [localhost:3000](http://localhost:3000) in your browser. You should see the Hue Browser welcome screen.

If the page does not load, confirm that the terminal window is still running and that no other app is using port 3000. To use a different port, replace the first number, for example `-p 3100:3000`, and then visit [localhost:3100](http://localhost:3100).

## Keep it running

To keep Hue Browser running in the background, even after you close the terminal or restart your computer, start it with the command below instead.

```bash
docker run -d --restart unless-stopped -p 3000:3000 --name hue-browser ghcr.io/seesharprun/hue-browser:latest
```

You can stop it later with `docker stop hue-browser` and start it again with `docker start hue-browser`.

## Update to the newest version

Pull the newest image and start it again to update.

```bash
docker pull ghcr.io/seesharprun/hue-browser:latest
```
