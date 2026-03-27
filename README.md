# Bastide hub

A personal blog and profile site built with [Eleventy](https://www.11ty.dev/) and [LibDoc](https://eleventy-libdoc.netlify.app/), authored in [org-mode](https://orgmode.org/).

## How it works

Content is written as org-mode files in `content/`, converted to Markdown via Pandoc, then built into static HTML by Eleventy.

```
content/**/*.org  →  [convert-org.js + pandoc]  →  generated/**/*.md  →  [eleventy]  →  _site/
```

## Quick start

```bash
npm install
npm run build    # convert org → md, then build site
npm run dev      # convert then serve with live reload
npm test         # run all tests
```

## Content structure

| Directory | Purpose |
|-----------|---------|
| `content/posts/` | Blog posts (tagged, dated) |
| `content/profile/` | Static profile pages (About, etc.) |
| `content/` root | Navigation pages (sidebar hierarchy) |

## Container build

The site deploys as a container image via [Railpack](https://railpack.com/) with Caddy serving the static files.

```bash
podman machine start
podman run --rm --privileged -d --name buildkit moby/buildkit
export DOCKER_HOST="unix://$(podman machine inspect --format '{{.ConnectionInfo.PodmanSocket.Path}}')"
export BUILDKIT_HOST="docker-container://buildkit"
railpack build .
podman run --rm -p 8080:80 urban-doodle
```

## Links

- [Live site](https://blog.bastidehub.xyz)
- [GitHub](https://github.com/Xavier-Brinon/urban-doodle)
- [Radicle](https://app.radicle.xyz/nodes/garden.bastidehub.xyz/rad:z3t3uRFQJ5FVuCDhXdQTwj1S5m6Rg)
- [LibDoc documentation](https://eleventy-libdoc.netlify.app/)
