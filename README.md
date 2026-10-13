# KubeScope — Kubernetes Flow Visualizer

KubeScope is a self-contained, interactive learning app for understanding Kubernetes architecture, resource relationships, traffic flow, recovery, configuration, and autoscaling. It does not connect to or change a real cluster.

The learning path is progressive so readers can choose the amount of technical detail that fits them:

1. **First look** — a shipping-port metaphor with no assumed technical background
2. **App builder** — desired state and the essential workload objects
3. **System explorer** — control plane, worker nodes, and component interactions
4. **Deep dive** — authentication, reconciliation, scheduling, execution, and endpoint readiness

## What learners can explore

- Control plane, worker node, edge, storage, and add-on components
- A remembered four-level explanation selector with plain-language terminology bridges
- Guided flows for deployment, external traffic, Pod recovery, HPA, and configuration changes
- Relationships between Deployment, ReplicaSet, Pod, Service, and Gateway/Ingress
- Common `kubectl` inspection commands and misconceptions
- Direct links to the official Kubernetes documentation

The browser application uses plain HTML, CSS, and JavaScript. It has no runtime API, database, or external asset dependency. A small dependency-free Node.js server is included so Nixpacks and Node buildpacks can detect and run the same source. The existing Nginx Dockerfile remains the deterministic container option.

## Run locally

Open `index.html` directly in a browser, or use the portable Node.js runtime:

```bash
npm ci
npm test
npm start
```

Then open <http://localhost:8080>. The server reads `PORT` when a platform provides it and otherwise uses `8080`.

To build the Nginx production container instead:

```bash
docker build -t kube-visualizer .
docker run --rm -p 8080:8080 kube-visualizer
```

Then open <http://localhost:8080>. The health endpoint is <http://localhost:8080/healthz>.

## Choose one build method

This repository intentionally contains markers for three build methods. Select the method explicitly in the platform instead of relying on precedence when more than one is detected.

| Method | Detection/configuration | Runtime | Recommended use |
|---|---|---|---|
| Dockerfile | `Dockerfile` | Nginx on port `8080` | Current deterministic NEO App fallback |
| Nixpacks | `package.json`, `package-lock.json`, `nixpacks.toml` | `npm start` | Platforms that expose Nixpacks |
| Cloud Native Buildpacks | `package.json`, `package-lock.json`, optional `project.toml` | Default `web` process from `npm start` | Platforms that expose a compatible Node builder |

`Procfile` also declares `web: npm start` for platforms/builders that support the standard Procfile convention. It does not replace `package.json`, because Procfile support differs between builders.

All three choices expose:

- Application: `/`
- Health check: `/healthz`
- Default port: `8080`
- Required managed resources: none
- Required secrets: none

### Nixpacks local check

Nixpacks detects Node from `package.json`, installs from `package-lock.json`, and uses the explicit start command in `nixpacks.toml`:

```bash
nixpacks plan .
nixpacks build . --name kube-visualizer-nixpacks
docker run --rm -e PORT=8080 -p 8080:8080 kube-visualizer-nixpacks
```

### Cloud Native Buildpacks local check

The exact builder is a platform choice. For a local Paketo example:

```bash
pack build kube-visualizer-buildpack \
  --builder paketobuildpacks/builder-jammy-base \
  --path .
docker run --rm -e PORT=8080 -p 8080:8080 kube-visualizer-buildpack
```

Use the builder supported and maintained by the target platform; do not copy a builder identifier into NEO App unless NEO App exposes it as an available option.

## Deploy on NEO App

1. Push this folder's contents to its own Git repository. `Dockerfile` must be at the repository root.
2. In NEO App, open the target project and choose **New service / Web service**.
3. Connect the Git provider and select the repository and branch.
4. Choose **Dockerfile** as the build method. The Dockerfile needs no custom build or start command.
5. Set the service/container port to **8080**. Do not set `PORT` as an environment variable for this image.
6. No database, Queue, S3 storage, secret, or other environment variable is required.
7. Use `/healthz` as the health-check path if the form provides one.
8. Create/approve the service, wait for the deployment to become healthy, and enable the public domain/networking option.
9. Verify both the generated public URL and `<public-url>/healthz`.

If the deployment is healthy but the public URL fails, inspect the platform domain, TLS, and ingress status; the container itself serves HTTP on `0.0.0.0:8080`.

### If NEO App adds Nixpacks or Buildpacks

Only choose one of these methods when it is visible in NEO App's live build-method selector or capability response:

| Field | Nixpacks value | Buildpacks value |
|---|---|---|
| Root directory | Repository root / blank | Repository root / blank |
| Build command | Auto / blank | Auto / blank |
| Start command | `npm start` (normally auto-detected) | `npm start` (normally auto-detected) |
| Service port | `8080` | `8080` |
| Health path | `/healthz` | `/healthz` |
| Environment variable | Optional `PORT=8080` | Optional `PORT=8080` |

If NEO App does not offer either builder, the repository files cannot enable platform support by themselves. Build an OCI image in CI or locally with Nixpacks/`pack`, push it to an accessible registry, and use NEO App's **prebuilt image** deployment method. Prefer an immutable image digest rather than a mutable `latest` tag.

## Generic PaaS settings

| Setting | Value |
|---|---|
| Build method | Dockerfile |
| Dockerfile path | `Dockerfile` |
| Listening port | `8080` |
| Health path | `/healthz` |
| Start command | Image default (`nginx`) |
| Environment variables | None |
| Persistent storage | None |

For Nixpacks/buildpacks, replace the start-command value with `npm start`; the port and health path remain the same.

## Content notes

- **Core**, **optional**, and **add-on** labels follow Kubernetes' component model.
- Ingress and Gateway API resources require compatible controllers; the resource alone does not route traffic.
- A networking implementation can replace kube-proxy and must support NetworkPolicy for policies to take effect.
- Metrics Server is commonly used for resource metrics, but it is not a complete historical monitoring platform.
- The Kubernetes project recommends Gateway API for new capabilities; Ingress remains stable but its API is frozen.

## Primary references

- [Kubernetes components](https://kubernetes.io/docs/concepts/overview/components/)
- [Workloads](https://kubernetes.io/docs/concepts/workloads/)
- [Services, load balancing, and networking](https://kubernetes.io/docs/concepts/services-networking/)
- [Storage](https://kubernetes.io/docs/concepts/storage/)
- [Configuration](https://kubernetes.io/docs/concepts/configuration/)
- [Horizontal Pod Autoscaling](https://kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale/)
- [Kubernetes Basics](https://kubernetes.io/docs/tutorials/kubernetes-basics/)
- [kubectl quick reference](https://kubernetes.io/docs/reference/kubectl/quick-reference/)
