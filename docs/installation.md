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
docker run --rm -p 80:3000 ghcr.io/seesharprun/hue-browser:latest
```

Leave that window open while you use the app. Closing it, or pressing Control and C together, stops Hue Browser.

## Open the app

Visit [hue-browser.localhost](http://hue-browser.localhost) in your browser. You should see the Hue Browser welcome screen. The plain [localhost](http://localhost) address opens the same app.

Chrome, Edge, and Firefox send any address ending in `.localhost` straight to your own computer, so this friendly name works without any extra setup. Safari on a Mac does not recognize these names, so Safari users should visit [localhost](http://localhost) instead.

If the page does not load, confirm that the terminal window is still running. If Docker reports that the port is already allocated, another app is using port 80. Replace the first number with a free port, for example `-p 3000:3000`, and then visit [hue-browser.localhost:3000](http://hue-browser.localhost:3000).

## Pick one address

Hue Browser remembers your paired bridges separately for each address, so bridges paired at `hue-browser.localhost` do not appear at `localhost:3000`. Choose one address, bookmark it, and keep using it. If you switch addresses later, pair your bridges again at the new one.

## Connect to a bridge

Once the welcome screen loads, follow the [bridge connection guide](/usage/connect-bridges) to find a bridge online or enter its local IP address and authorize pairing with its physical button.

## Keep it running

To keep Hue Browser running in the background, even after you close the terminal or restart your computer, start it with the command below instead.

```bash
docker run -d --restart unless-stopped -p 80:3000 --name hue-browser ghcr.io/seesharprun/hue-browser:latest
```

You can stop it later with `docker stop hue-browser` and start it again with `docker start hue-browser`.

## Update to the newest version

Pull the newest image and start it again to update.

```bash
docker pull ghcr.io/seesharprun/hue-browser:latest
```
