"use strict";

const levelData={
  1:{
    progress:"Foundation · 1 of 4",audience:"For curious beginners and non-technical teammates",kicker:"A familiar story",title:"Imagine a busy shipping port",lead:"Your application is cargo that must stay available. Kubernetes is the port authority coordinating where it runs and replacing it when something fails.",takeaway:"You describe the result you want; Kubernetes keeps working to maintain it.",deepLink:"#quick-start",deepLabel:"See the core idea",terms:[["Packed cargo","Container"],["Cargo group","Pod"],["Ship","Node"],["Whole harbor","Cluster"]],lesson:`<div class="lesson-flow" aria-label="Shipping port analogy">
      <div class="lesson-node"><span>▣</span><strong>Pack the cargo</strong><small>Your app and its runtime are packaged so they travel together.</small></div><i>→</i>
      <div class="lesson-node"><span>⚓</span><strong>Give the manifest</strong><small>Say how many copies should stay available.</small></div><i>→</i>
      <div class="lesson-node"><span>⎈</span><strong>Keep it running</strong><small>Kubernetes finds space and replaces failed copies.</small></div>
    </div>`
  },
  2:{
    progress:"Concepts · 2 of 4",audience:"For developers and IT learners who know basic cloud concepts",kicker:"The blueprint level",title:"Describe the result, not every step",lead:"Kubernetes uses a declarative model. You provide a configuration describing the desired state; controllers continually compare it with the actual state and correct differences.",takeaway:"Pods run the app, Deployments manage copies, and Services give those changing copies one stable destination.",deepLink:"#objects",deepLabel:"Explore Kubernetes objects",terms:[["Final blueprint","Desired state"],["Running reality","Actual state"],["App copy","Pod"],["Stable address","Service"]],lesson:`<div class="state-board">
      <div class="state-card"><span>You declare</span><strong>3 app copies</strong><p>A Deployment records the desired replica count and Pod template.</p></div>
      <div class="state-arrow"><b>⇄</b><small>reconcile</small></div>
      <div class="state-card"><span>Cluster reports</span><strong>2 app copies</strong><p>A controller detects the gap and creates a replacement Pod.</p></div>
    </div><pre class="mini-yaml"><code>apiVersion: apps/v1
kind: Deployment
spec:
  replicas: 3       # desired state
  template:         # the Pod blueprint</code></pre>`
  },
  3:{
    progress:"Architecture · 3 of 4",audience:"For engineers learning how the cluster is organized",kicker:"The system level",title:"The brain decides; the workers run",lead:"The control plane exposes the API and coordinates cluster state. Worker nodes provide the compute, networking, storage mounts, and container execution for your Pods.",takeaway:"Components coordinate through the API server. etcd is the state store; it is not a general application database.",deepLink:"#explorer",deepLabel:"Open architecture explorer",terms:[["Front desk","API server"],["Memory","etcd"],["Matchmaker","Scheduler"],["Node captain","kubelet"]],lesson:`<div class="architecture-lesson">
      <div class="architecture-side"><span>Control plane</span><h3>Decides and observes</h3><ul><li>API server<small>Validates every API request</small></li><li>etcd<small>Persists API data</small></li><li>Scheduler<small>Selects a node</small></li><li>Controllers<small>Reconcile desired state</small></li></ul></div>
      <div class="architecture-side"><span>Worker nodes</span><h3>Execute and report</h3><ul><li>kubelet<small>Manages assigned Pods</small></li><li>Runtime<small>Runs containers through CRI</small></li><li>Network data plane<small>Routes Service traffic</small></li><li>Pods<small>Host application containers</small></li></ul></div>
    </div>`
  },
  4:{
    progress:"Mechanics · 4 of 4",audience:"For practitioners investigating production behavior",kicker:"The production deep dive",title:"Trace a rollout through every control loop",lead:"A production update passes through authentication, authorization, admission, persistence, reconciliation, scheduling, node execution, and endpoint readiness.",takeaway:"Kubernetes components mostly observe API objects and publish new state; they do not form one long synchronous deployment script.",deepLink:"#journeys",deepLabel:"Run guided flows",terms:[["Identity check","Authentication"],["Permission check","RBAC"],["Placement decision","Binding"],["Ready destination","EndpointSlice"]],lesson:`<div class="deep-timeline" aria-label="Production rollout lifecycle">
      <div class="deep-step"><div><strong>Accept the request</strong><small>API server authenticates, authorizes, runs admission, and validates.</small></div></div>
      <div class="deep-step"><div><strong>Persist desired state</strong><small>The accepted object is committed through the API server to etcd.</small></div></div>
      <div class="deep-step"><div><strong>Reconcile objects</strong><small>Deployment and ReplicaSet controllers create the required Pod objects.</small></div></div>
      <div class="deep-step"><div><strong>Filter and score nodes</strong><small>The scheduler records a binding for each feasible Pod.</small></div></div>
      <div class="deep-step"><div><strong>Prepare the Pod</strong><small>kubelet coordinates CRI, CNI, and storage integrations on the selected node.</small></div></div>
      <div class="deep-step"><div><strong>Publish ready endpoints</strong><small>Only Ready backends should receive Service traffic during the rollout.</small></div></div>
    </div>`
  }
};

const components = {
  api:{icon:"API",kind:"Control plane · core",title:"kube-apiserver",summary:"The front door for the Kubernetes control plane.",role:"Exposes the Kubernetes HTTP API, authenticates and authorizes requests, validates objects, and coordinates persistence.",links:"kubectl and other clients, admission controllers, etcd, controllers, scheduler, and node agents.",analogy:"A guarded reception desk and shared switchboard.",doc:"https://kubernetes.io/docs/concepts/overview/components/#kube-apiserver"},
  etcd:{icon:"DB",kind:"Control plane · core",title:"etcd",summary:"A consistent, highly available key-value store for API server data.",role:"Persists the cluster's desired and observed state. Production clusters need a tested backup and restore plan.",links:"The API server. Other Kubernetes components do not normally access etcd directly.",analogy:"The authoritative ledger, not the decision maker.",doc:"https://kubernetes.io/docs/concepts/overview/components/#etcd"},
  scheduler:{icon:"⌖",kind:"Control plane · core",title:"kube-scheduler",summary:"Assigns newly created, unscheduled Pods to suitable nodes.",role:"Filters and scores nodes using resources, constraints, affinity, topology, and policy, then records a binding.",links:"The API server; it observes pending Pods and available nodes.",analogy:"A dispatcher choosing the best available destination.",doc:"https://kubernetes.io/docs/concepts/scheduling-eviction/kube-scheduler/"},
  controller:{icon:"↻",kind:"Control plane · core",title:"kube-controller-manager",summary:"Runs control loops that move actual state toward desired state.",role:"Hosts controllers for workloads, nodes, endpoints, service accounts, and other built-in resources.",links:"The API server; controllers watch objects and create or update other objects.",analogy:"A building supervisor continuously checking the plan against reality.",doc:"https://kubernetes.io/docs/concepts/architecture/controller/"},
  cloud:{icon:"☁",kind:"Control plane · optional",title:"cloud-controller-manager",summary:"Connects Kubernetes control loops to a cloud provider API.",role:"May manage nodes, routes, and cloud load balancers without embedding provider logic in core components.",links:"The API server and the selected cloud provider.",analogy:"A translator between Kubernetes and the infrastructure vendor.",doc:"https://kubernetes.io/docs/concepts/architecture/cloud-controller/"},
  kubelet:{icon:"⚙",kind:"Node · core",title:"kubelet",summary:"The agent responsible for Pods assigned to its node.",role:"Watches PodSpecs, asks the runtime to run containers, mounts volumes, executes probes, and reports status.",links:"The API server, container runtime, volume and network plugins.",analogy:"The on-site manager executing instructions on one machine.",doc:"https://kubernetes.io/docs/reference/command-line-tools-reference/kubelet/"},
  runtime:{icon:"▣",kind:"Node · core",title:"Container runtime",summary:"Runs containers through the Kubernetes Container Runtime Interface.",role:"Pulls images and creates, starts, and stops containers and Pod sandboxes. Common implementations include containerd and CRI-O.",links:"The kubelet through CRI and the image registry.",analogy:"The engine that does the actual container work.",doc:"https://kubernetes.io/docs/setup/production-environment/container-runtimes/"},
  proxy:{icon:"⇄",kind:"Node · optional",title:"Service proxy",summary:"Implements Service traffic forwarding on nodes.",role:"Watches Services and EndpointSlices and programs the data plane. kube-proxy is the default implementation; some network stacks replace it.",links:"The API server, node networking, Services, and backend Pods.",analogy:"A traffic director using a continuously updated destination list.",doc:"https://kubernetes.io/docs/reference/networking/virtual-ips/"},
  pod:{icon:"⬡",kind:"Workload",title:"Pod",summary:"The smallest deployable unit in Kubernetes.",role:"Groups one or more tightly coupled containers with shared networking and storage context. Pods are replaceable, not permanent pets.",links:"A workload controller, kubelet, container runtime, Services, and volumes.",analogy:"A shared apartment for cooperating processes.",doc:"https://kubernetes.io/docs/concepts/workloads/pods/"},
  volume:{icon:"◫",kind:"Storage",title:"Volume",summary:"Makes data available to containers in a Pod.",role:"Can be ephemeral or persistent. PersistentVolumeClaims request storage independently from a Pod's lifetime.",links:"The kubelet, CSI driver, PersistentVolumeClaim, and storage backend.",analogy:"A mounted disk or shared cabinet attached to a workspace.",doc:"https://kubernetes.io/docs/concepts/storage/volumes/"},
  gateway:{icon:"⇲",kind:"Edge · add-on",title:"Gateway / Ingress controller",summary:"Routes client traffic from outside the cluster to Services.",role:"An API object declares routes, while an installed controller realizes them using a proxy or load balancer. Gateway API is the newer model; Ingress remains widely used.",links:"External load balancer or DNS, Services, TLS Secrets, and the API server.",analogy:"A building entrance that reads the address and directs visitors.",doc:"https://kubernetes.io/docs/concepts/services-networking/gateway/"},
  dns:{icon:"⌁",kind:"Add-on",title:"Cluster DNS",summary:"Provides stable DNS discovery for Services and, where configured, Pods.",role:"Watches Service data and answers names such as api.default.svc.cluster.local inside the cluster.",links:"The API server, kubelet DNS configuration, Pods, and Services.",analogy:"The cluster's internal contact directory.",doc:"https://kubernetes.io/docs/concepts/services-networking/dns-pod-service/"},
  metrics:{icon:"↗",kind:"Add-on",title:"Metrics pipeline",summary:"Supplies resource or custom metrics to observability and autoscaling clients.",role:"A Metrics Server commonly exposes resource metrics. It is an add-on, not a full historical monitoring system.",links:"kubelets, Metrics API, kubectl top, and HorizontalPodAutoscaler.",analogy:"Live gauges that inform operators and automation.",doc:"https://kubernetes.io/docs/tasks/debug/debug-cluster/resource-metrics-pipeline/"}
};

const journeys = {
  deploy:{category:"Control plane",steps:[
    ["You + kubectl","Submit desired state","kubectl sends a Deployment manifest to the API server over authenticated HTTPS.","kubectl apply -f deployment.yaml"],
    ["API server","Validate the request","Authentication, authorization, admission, schema, and policy checks run before the object is accepted.","POST /apis/apps/v1/namespaces/demo/deployments"],
    ["etcd","Persist the intent","The API server stores the accepted Deployment so it becomes part of cluster state.","desired replicas: 3"],
    ["Controllers","Create lower-level objects","The Deployment controller creates a ReplicaSet; the ReplicaSet controller creates the required Pods.","Deployment → ReplicaSet → Pods"],
    ["Scheduler","Choose nodes","The scheduler filters and scores nodes for each pending Pod and records a binding.","Pod → suitable worker node"],
    ["kubelet + runtime","Start the workload","The kubelet observes its assigned Pods, prepares networking and volumes, and asks the runtime to start containers.","Pending → Running → Ready"]]},
  request:{category:"Networking",steps:[
    ["Client + DNS","Find the application","Public DNS resolves the application's hostname to the platform edge or load balancer.","GET https://app.example.com"],
    ["Gateway / Ingress","Match a route","The controller's data plane matches hostname and path, may terminate TLS, and selects a backend Service.","app.example.com/api → api-service:8080"],
    ["Service","Choose eligible endpoints","A Service provides a stable virtual endpoint while EndpointSlices track Ready backend Pods.","api-service → EndpointSlice"],
    ["Cluster data plane","Forward the packet","kube-proxy or an alternative implementation forwards traffic to one selected Pod IP.","10.96.0.20:8080 → 10.244.2.8:8080"],
    ["Pod","Handle and respond","The container processes the request. Readiness determines whether it should receive Service traffic.","HTTP 200 OK"]]},
  recover:{category:"Reconciliation",steps:[
    ["Container / Pod","A failure occurs","A process exits, a probe fails, a node disappears, or a Pod is deleted.","kubectl delete pod demo-abc"],
    ["kubelet","Handle local failure","For restartable containers, the kubelet applies the Pod restart policy and reports status.","restartPolicy: Always"],
    ["Controller","Notice a replica gap","If the Pod is gone, the ReplicaSet controller sees actual replicas below desired replicas.","desired: 3 · current: 2"],
    ["API server","Create replacement intent","The controller creates a new Pod object; it does not resurrect the old Pod identity.","demo-newpod · Pending"],
    ["Scheduler + kubelet","Place and start replacement","The normal scheduling and startup flow produces a new Ready Pod.","current: 3 · available: 3"]]},
  scale:{category:"Autoscaling",steps:[
    ["Metrics source","Collect observations","A resource or custom metrics adapter makes recent metrics available through a Kubernetes metrics API.","kubectl top pods"],
    ["HPA controller","Compare current and target","The controller periodically computes the desired replica count from observed metrics and configured targets.","current CPU 82% · target 60%"],
    ["Scale target","Update desired replicas","HPA updates the scale subresource of a Deployment or another supported workload.","replicas: 3 → 5"],
    ["ReplicaSet","Create more Pods","The normal controller loop creates the additional Pod objects.","+2 Pending Pods"],
    ["Scheduler + nodes","Place capacity","Pods start only where requests fit; cluster-level capacity may need separate node autoscaling.","5/5 Pods Ready"]]},
  config:{category:"Configuration",steps:[
    ["Operator","Change configuration","You update a ConfigMap or Secret independently from the application image.","kubectl apply -f configmap.yaml"],
    ["API server + etcd","Store new data","The API server validates and persists the new object version.","resourceVersion increases"],
    ["kubelet","Refresh mounted projection","Mounted ConfigMap or Secret data is eventually updated. Environment variables in existing containers do not refresh.","mounted file changes"],
    ["Workload controller","Roll Pods when required","For startup-only config, trigger a rollout—often with a template annotation or a new manifest revision.","kubectl rollout restart deployment/my-app"],
    ["Application","Adopt the new value","The app reloads mounted data or starts in a replacement Pod, depending on its design.","old Pods → new Ready Pods"]]}
};

const objectData={
  deployment:["Workload controller","Deployment","Declares a rollout strategy and desired Pod template for a usually stateless application. It manages ReplicaSets rather than Pods directly."],
  replicaset:["Workload controller","ReplicaSet","Maintains the requested number of matching Pods. In normal use, a Deployment owns and updates it."],
  pod:["Runtime object","Pod","Runs one or more containers together. A replacement Pod gets a new identity and possibly a different IP."],
  service:["Networking object","Service","Selects Ready Pods by labels and gives clients a stable virtual IP and DNS name while endpoints change."],
  gateway:["Traffic routing","Gateway / Ingress","Declares how external traffic reaches Services. A compatible controller must be installed to implement the resource."]
};

const qs=(selector,root=document)=>root.querySelector(selector);
const qsa=(selector,root=document)=>[...root.querySelectorAll(selector)];

let currentLevel=1;
function renderLevel(level,{focus=false}={}){
  currentLevel=Math.min(4,Math.max(1,Number(level)||1));
  const item=levelData[currentLevel];
  qsa("[data-level]").forEach(button=>button.setAttribute("aria-selected",String(Number(button.dataset.level)===currentLevel)));
  qs("#level-progress-label").textContent=item.progress; qs("#level-audience").textContent=item.audience;
  qs("#level-progress").style.width=`${currentLevel*25}%`; qs("#level-kicker").textContent=item.kicker;
  qs("#level-title").textContent=item.title; qs("#level-lead").textContent=item.lead;
  qs("#level-takeaway").textContent=item.takeaway; qs("#level-lesson").innerHTML=item.lesson;
  qs("#term-list").innerHTML=item.terms.map(([plain,term])=>`<span class="term-chip">${plain}<i>→</i><b>${term}</b></span>`).join("");
  qs("#level-deep-link").href=item.deepLink; qs("#level-deep-link").textContent=item.deepLabel;
  qs("#next-level").textContent=currentLevel===4?"Back to Level 1 ↺":`Continue to Level ${currentLevel+1} →`;
  localStorage.setItem("kubescope-level",String(currentLevel));
  if(focus)qs("#level-title").focus({preventScroll:true});
}

function selectComponent(key){
  const item=components[key]; if(!item)return;
  qsa(".component").forEach(el=>el.classList.toggle("active",el.dataset.component===key));
  qs("#detail-icon").textContent=item.icon; qs("#detail-kind").textContent=item.kind;
  qs("#detail-title").textContent=item.title; qs("#detail-summary").textContent=item.summary;
  qs("#detail-role").textContent=item.role; qs("#detail-links").textContent=item.links;
  qs("#detail-analogy").textContent=item.analogy; qs("#detail-doc").href=item.doc;
}

let currentJourney="deploy",currentStep=0;
function renderJourney(){
  const journey=journeys[currentJourney],step=journey.steps[currentStep];
  qs("#journey-counter").textContent=`Step ${currentStep+1} of ${journey.steps.length}`;
  qs("#journey-category").textContent=journey.category; qs("#journey-actor").textContent=step[0];
  qs("#journey-title").textContent=step[1]; qs("#journey-text").textContent=step[2]; qs("#journey-command").textContent=step[3];
  qs("#journey-progress").style.width=`${((currentStep+1)/journey.steps.length)*100}%`;
  qs("#previous-step").disabled=currentStep===0;
  qs("#next-step").textContent=currentStep===journey.steps.length-1?"Restart flow ↺":"Next step →";
  qs("#flow-nodes").innerHTML=journey.steps.map((s,i)=>`<div class="flow-node ${i<=currentStep?"reached":""} ${i===currentStep?"active":""}"><b>${i+1}</b><span>${s[0]}</span></div>`).join("");
}

function selectObject(key){
  const item=objectData[key]; if(!item)return;
  qsa("[data-object]").forEach(el=>el.classList.toggle("active",el.dataset.object===key));
  qs("#object-badge").textContent=item[0]; qs("#object-title").textContent=item[1]; qs("#object-description").textContent=item[2];
}

function toast(message){ const el=qs("#toast"); el.textContent=message; el.classList.add("show"); clearTimeout(toast.timer); toast.timer=setTimeout(()=>el.classList.remove("show"),1800); }

qsa(".component").forEach(el=>el.addEventListener("click",()=>selectComponent(el.dataset.component)));
qsa("[data-level]").forEach(el=>{
  el.addEventListener("click",()=>renderLevel(el.dataset.level));
  el.addEventListener("keydown",event=>{ if(!["ArrowLeft","ArrowRight"].includes(event.key))return; event.preventDefault(); const delta=event.key==="ArrowRight"?1:-1; const target=((currentLevel-1+delta+4)%4)+1; renderLevel(target); qs(`[data-level="${target}"]`).focus(); });
});
qs("#next-level").addEventListener("click",()=>renderLevel(currentLevel===4?1:currentLevel+1,{focus:true}));
qsa("[data-journey]").forEach(el=>el.addEventListener("click",()=>{ currentJourney=el.dataset.journey; currentStep=0; qsa("[data-journey]").forEach(b=>b.setAttribute("aria-selected",String(b===el))); renderJourney(); }));
qs("#previous-step").addEventListener("click",()=>{ if(currentStep>0)currentStep--; renderJourney(); });
qs("#next-step").addEventListener("click",()=>{ const length=journeys[currentJourney].steps.length; currentStep=currentStep===length-1?0:currentStep+1; renderJourney(); });
qs("#reset-flow").addEventListener("click",()=>{ currentStep=0; renderJourney(); });
qsa("[data-object]").forEach(el=>el.addEventListener("click",()=>selectObject(el.dataset.object)));
qsa("[data-copy]").forEach(el=>el.addEventListener("click",async()=>{ try{ await navigator.clipboard.writeText(el.dataset.copy); toast("Command copied"); }catch{ toast("Select the command to copy it"); } }));
qs("#theme-select").addEventListener("change",event=>{ document.documentElement.dataset.theme=event.target.value; localStorage.setItem("kubescope-theme",event.target.value); });

const savedTheme=localStorage.getItem("kubescope-theme"); if(["ocean","emerald","amber"].includes(savedTheme)){ document.documentElement.dataset.theme=savedTheme; qs("#theme-select").value=savedTheme; }
const savedLevel=Number(localStorage.getItem("kubescope-level"));
renderLevel(savedLevel>=1&&savedLevel<=4?savedLevel:1); selectComponent("api"); selectObject("deployment"); renderJourney();
