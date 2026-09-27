# Security policy

This document explains which versions of Hue Browser receive security fixes and how to report a problem privately. Please read it before opening an issue about a vulnerability.

## Supported versions

Hue Browser is developed on the default branch, and fixes are released from there. Only the most recent release receives security updates.

| Version | Supported |
| --- | --- |
| `latest` | Yes |
| Older tags | No |

If you run the container, pull `ghcr.io/seesharprun/hue-browser:latest` to pick up fixes.

## Reporting a vulnerability

Report vulnerabilities privately rather than in a public issue, so the problem can be fixed before it is widely known.

1. Open a [private vulnerability report](https://github.com/seesharprun/hue-browser/security/advisories/new) through GitHub Security Advisories.
2. Describe what an attacker can do, the steps that reproduce it, and the version or commit you tested.
3. Leave out bridge application keys, IP addresses, and anything else you would not want published.

You can expect an acknowledgement within a week. If the report is accepted, you will be credited in the advisory unless you ask not to be.

Please do not open a public issue, post the details in a discussion, or share them on social media until a fix is released.

## Scope

Hue Browser runs on your own network and talks to your own bridges, so some risks belong to the surrounding setup rather than to this project.

In scope:

- Exposure or mishandling of bridge application keys by the application
- Flaws in the server-side API layer, including request forgery and injection
- Cross-site scripting, clickjacking, and similar flaws in the interface
- Vulnerabilities introduced by the container image or by project dependencies

Out of scope:

- Vulnerabilities in the Philips Hue bridge itself or in its firmware, which belong to [Signify](https://www.signify.com/global/vulnerability-disclosure)
- Consequences of exposing Hue Browser or a bridge directly to the internet
- Missing hardening on a network you control, such as an unencrypted local connection
- Reports produced only by an automated scanner, without a demonstrated impact

## Handling your bridge credentials

Hue Browser stores each bridge application key in your browser so it can reconnect without pairing again. That key grants full control of a bridge to anyone who holds it.

Treat it the way you would treat a password. Remove a bridge from the app when you no longer use it, avoid pairing from a shared or public computer, and never paste a key into an issue, a pull request, or a log excerpt.
