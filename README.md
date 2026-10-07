# KubeScope — Kubernetes Flow Visualizer

KubeScope is a self-contained, interactive learning app for understanding Kubernetes architecture, resource relationships, traffic flow, recovery, configuration, and autoscaling. It does not connect to or change a real cluster.

## What learners can explore

- Control plane, worker node, edge, storage, and add-on components
- Guided flows for deployment, external traffic, Pod recovery, HPA, and configuration changes
- Relationships between Deployment, ReplicaSet, Pod, Service, and Gateway/Ingress
- Common `kubectl` inspection commands and misconceptions
- Direct links to the official Kubernetes documentation

The application uses plain HTML, CSS, and JavaScript. It has no runtime API, database, package manager, or external asset dependency.

## Run locally

Open `index.html` directly in a browser, or build the production container:

```bash
docker build -t kube-visualizer .
docker run --rm -p 8080:8080 kube-visualizer
```

Then open <http://localhost:8080>. The health endpoint is <http://localhost:8080/healthz>.

## Deploy on NEO App

1. Push this folder's contents to its own Git repository. `Dockerfile` must be at the repository root.
2. In NEO App, open the target project and choose **New service / Web service**.
3. Connect the Git provider and select the repository and branch.
4. Choose the Dockerfile or container build method. The Dockerfile needs no custom build command.
5. Set the service/container port to **8080**. Do not set `PORT` as an environment variable for this image.
6. No database, Queue, S3 storage, secret, or other environment variable is required.
7. Use `/healthz` as the health-check path if the form provides one.
8. Create/approve the service, wait for the deployment to become healthy, and enable the public domain/networking option.
9. Verify both the generated public URL and `<public-url>/healthz`.

If the deployment is healthy but the public URL fails, inspect the platform domain, TLS, and ingress status; the container itself serves HTTP on `0.0.0.0:8080`.

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
