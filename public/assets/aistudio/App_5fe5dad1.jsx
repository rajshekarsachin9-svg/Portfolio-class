import React, { useMemo, useState } from "react";
import {
  Activity, ArrowDownRight, ArrowUpRight, Bot, Check, CheckCircle2, ChevronRight,
  CircleAlert, Clock3, FileText, LayoutDashboard, ListTodo, Mail, Menu, MoreHorizontal,
  Play, Plus, Search, ShieldCheck, Sparkles, Workflow, X, Zap
} from "lucide-react";

const initialTasks = [
  { id:"T-01", title:"Understand objective and create execution plan", agent:"Orchestrator", status:"completed", deps:"—", detail:"Objective decomposed into four dependent tasks and one verification step." },
  { id:"T-02", title:"Research client background", agent:"Research Agent", status:"completed", deps:"T-01", detail:"Collected company overview, services, recent public updates and source references." },
  { id:"T-03", title:"Prepare meeting brief and discussion points", agent:"Documentation Agent", status:"running", deps:"T-02", detail:"Drafting a structured brief from verified research findings." },
  { id:"T-04", title:"Prepare follow-up email draft", agent:"Communication Agent", status:"queued", deps:"T-03", detail:"Will prepare a draft. Sending is disabled in this MVP." },
  { id:"T-05", title:"Verify deliverables and workflow completeness", agent:"Verification Agent", status:"queued", deps:"T-03, T-04", detail:"Checks completeness, consistency and source traceability." }
];

const agentInfo = [
  { name:"Orchestrator", role:"Planning & delegation", icon:Workflow, status:"Active", color:"violet", desc:"Breaks objectives into executable tasks and coordinates dependencies." },
  { name:"Research Agent", role:"Information gathering", icon:Search, status:"Completed", color:"blue", desc:"Collects relevant information and records source references." },
  { name:"Documentation Agent", role:"Briefs & documents", icon:FileText, status:"Working", color:"cyan", desc:"Turns research findings into structured business documents." },
  { name:"Operations Agent", role:"Task coordination", icon:ListTodo, status:"Standby", color:"amber", desc:"Checks operational steps and prepares action checklists." },
  { name:"Communication Agent", role:"Message drafting", icon:Mail, status:"Standby", color:"green", desc:"Prepares communication drafts for human review." },
  { name:"Verification Agent", role:"Quality control", icon:ShieldCheck, status:"Standby", color:"rose", desc:"Checks outputs against acceptance criteria and flags gaps." }
];

const seedEvents = [
  ["09:41:02","Orchestrator","Workflow objective received.","info"],
  ["09:41:04","Orchestrator","Generated plan with 5 tasks and dependency links.","success"],
  ["09:41:07","Research Agent","Research task completed. 4 source references attached.","success"],
  ["09:41:08","Orchestrator","Documentation Agent assigned T-03.","info"],
  ["09:41:10","Documentation Agent","Generating client meeting brief…","running"]
];

function Status({value}) {
  const map = {completed:["Completed","good"],running:["Running","live"],queued:["Queued","muted"],blocked:["Blocked","bad"],approval:["Needs approval","warn"],failed:["Failed","bad"]};
  const [label,cls] = map[value] || [value,"muted"];
  return <span className={`status ${cls}`}><i />{label}</span>;
}

function App(){
  const [active,setActive] = useState("Overview");
  const [objective,setObjective] = useState("Prepare a complete client meeting package for tomorrow. Research the client, create a meeting brief, identify discussion points and draft a follow-up email.");
  const [workflowTitle,setWorkflowTitle] = useState("Client meeting preparation");
  const [tasks,setTasks] = useState(initialTasks);
  const [events,setEvents] = useState(seedEvents);
  const [running,setRunning] = useState(false);
  const [started,setStarted] = useState(true);
  const [selected,setSelected] = useState("T-03");
  const [showComposer,setShowComposer] = useState(false);
  const [showApproval,setShowApproval] = useState(false);
  const [mobileNav,setMobileNav] = useState(false);
  const [toast,setToast] = useState("");
  const [artifact,setArtifact] = useState("brief");
  const [workflowMode,setWorkflowMode] = useState("Demo mode");

  const completed = tasks.filter(t=>t.status==="completed").length;
  const progress = Math.round(completed/tasks.length*100);
  const selectedTask = tasks.find(t=>t.id===selected) || tasks[0];

  function notify(msg){ setToast(msg); setTimeout(()=>setToast(""),2600); }
  function addEvent(agent,msg,type="info"){
    const now = new Date().toLocaleTimeString("en-GB",{hour12:false});
    setEvents(prev=>[[now,agent,msg,type],...prev]);
  }
  function updateTask(id,status){
    setTasks(prev=>prev.map(t=>t.id===id?{...t,status}:t));
  }
  function runWorkflow(){
    if(!objective.trim()){notify("Enter an objective first.");return;}
    setRunning(true); setStarted(true);
    setTasks(initialTasks.map(t=>({...t,status:t.id==="T-01"||t.id==="T-02"?"completed":t.id==="T-03"?"running":"queued"})));
    setEvents([[new Date().toLocaleTimeString("en-GB",{hour12:false}),"Orchestrator","New workflow started in demo mode.","info"],...seedEvents]);
    notify("Demo workflow started.");
    const sequence = [
      ["T-03","completed","Documentation Agent","Meeting brief generated and saved as an artifact.","success"],
      ["T-04","approval","Communication Agent","Email draft prepared. Human approval is required before sending.","warn"],
      ["T-05","completed","Verification Agent","Brief and email draft passed structural checks. External sending remains disabled.","success"]
    ];
    sequence.forEach((s,i)=>setTimeout(()=>{
      updateTask(s[0],s[1]); addEvent(s[2],s[3],s[4]);
      if(i===sequence.length-1){setRunning(false);setShowApproval(true);}
    },1800*(i+1)));
  }
  function resetDemo(){
    setTasks(initialTasks);setEvents(seedEvents);setRunning(false);setStarted(true);setShowApproval(false);notify("Demo reset.");
  }
  function createWorkflow(){
    setTasks(initialTasks.map(t=>({...t,status:"queued"})));
    setEvents([[new Date().toLocaleTimeString("en-GB",{hour12:false}),"Orchestrator","Workflow created. Ready to execute.","info"]]);
    setWorkflowTitle("New workflow");setObjective("");setShowComposer(false);setActive("Workflows");notify("New workflow created.");
  }

  const navItems = [
    ["Overview",LayoutDashboard],["Workflows",Workflow],["Agents",Bot],["Activity",Activity]
  ];

  return <div className="app-shell">
    <aside className={`sidebar ${mobileNav?"open":""}`}>
      <div className="brand"><div className="brand-mark"><Workflow size={19}/></div><div><b>ORCHESTRA</b><small>AGENTIC WORKSPACE</small></div><button className="mobile-close" onClick={()=>setMobileNav(false)}><X size={18}/></button></div>
      <div className="workspace-switch"><div className="workspace-avatar">O</div><div><b>Operations workspace</b><small>Personal demo</small></div><MoreHorizontal size={17}/></div>
      <div className="nav-label">WORKSPACE</div>
      <nav>{navItems.map(([label,Icon])=><button key={label} className={`nav-item ${active===label?"active":""}`} onClick={()=>{setActive(label);setMobileNav(false)}}><Icon size={17}/>{label}{label==="Workflows"&&<span className="nav-count">1</span>}</button>)}</nav>
      <div className="nav-label agents-label">SPECIALISED AGENTS</div>
      <div className="mini-agents">{agentInfo.slice(1).map((a,i)=><div className="mini-agent" key={a.name}><span className={`mini-dot ${a.color}`}/><span>{a.name}</span><small>{i===1?"●":""}</small></div>)}</div>
      <div className="sidebar-bottom"><div className="plan-card"><div className="plan-icon"><Zap size={16}/></div><b>Demo environment</b><p>Agent actions are simulated. No external messages are sent.</p><span className="demo-pill">SAFE MODE ON</span></div><div className="user-row"><div className="user-avatar">U</div><div><b>Workspace user</b><small>Local prototype</small></div><MoreHorizontal size={17}/></div></div>
    </aside>

    <main className="main">
      <header className="topbar">
        <div className="top-left"><button className="hamburger" onClick={()=>setMobileNav(true)}><Menu/></button><span className="crumb">Workspace</span><ChevronRight size={14}/><b>{active}</b></div>
        <div className="top-right"><span className="environment"><i/> {workflowMode}</span><button className="icon-button"><Search size={17}/></button><div className="user-avatar small">U</div></div>
      </header>

      {active==="Overview" && <div className="page">
        <div className="welcome-row"><div><div className="eyebrow"><Sparkles size={14}/> AUTONOMOUS WORKFLOW COMMAND CENTRE</div><h1>Good afternoon. <span>Let's get work moving.</span></h1><p>Delegate multi-step work to specialised agents and keep every execution accountable.</p></div><button className="primary-btn" onClick={()=>setShowComposer(true)}><Plus size={17}/> New workflow</button></div>
        <div className="metric-grid">
          <Metric icon={Workflow} label="Active workflows" value="1" note="1 currently in progress" tone="violet"/>
          <Metric icon={CheckCircle2} label="Tasks completed" value={`${completed}/${tasks.length}`} note={`${progress}% workflow progress`} tone="green"/>
          <Metric icon={Bot} label="Available agents" value="6" note="5 specialised + orchestrator" tone="blue"/>
          <Metric icon={Clock3} label="Awaiting approval" value={tasks.filter(t=>t.status==="approval").length.toString()} note="Human review required" tone="amber"/>
        </div>

        <section className="section-head"><div><h2>Active workflow</h2><p>Monitor the plan, agents and execution status.</p></div><button className="text-btn" onClick={()=>setActive("Workflows")}>View workflow <ArrowUpRight size={15}/></button></section>
        <div className="workflow-card">
          <div className="workflow-top"><div className="workflow-symbol"><Workflow size={20}/></div><div className="workflow-heading"><h3>{workflowTitle}</h3><p>Created today · WF-2026-001 · {workflowMode}</p></div><Status value={running?"running":tasks.some(t=>t.status==="approval")?"approval":"completed"}/><button className="more-btn"><MoreHorizontal size={19}/></button></div>
          <div className="workflow-objective"><span>OBJECTIVE</span><p>{objective || "No objective entered yet. Create a workflow to get started."}</p></div>
          <div className="progress-line"><div><span>Execution progress</span><b>{progress}%</b></div><div className="bar"><i style={{width:`${progress}%`}}/></div></div>
          <div className="task-preview">{tasks.slice(0,4).map(t=><button key={t.id} onClick={()=>{setSelected(t.id);setActive("Workflows")}} className="task-preview-row"><span className={`task-check ${t.status}`}>{t.status==="completed"?<Check size={13}/>:t.status==="running"?<span className="pulse"/>:<span/>}</span><span className="task-name">{t.title}</span><small>{t.agent}</small><Status value={t.status}/><ChevronRight size={15}/></button>)}</div>
          <div className="workflow-footer"><span><Activity size={15}/> Live execution monitor</span><button className="secondary-btn" onClick={()=>setActive("Workflows")}>Open workflow <ArrowUpRight size={15}/></button></div>
        </div>

        <div className="lower-grid">
          <section className="panel"><div className="panel-head"><div><h3>Agent workforce</h3><p>Specialised agents and their current state</p></div><button className="text-btn" onClick={()=>setActive("Agents")}>All agents <ChevronRight size={14}/></button></div><div className="agent-grid">{agentInfo.slice(0,4).map(a=><AgentCard key={a.name} agent={a}/>)}</div></section>
          <section className="panel activity-panel"><div className="panel-head"><div><h3>Recent activity</h3><p>Latest orchestration events</p></div><button className="icon-button"><MoreHorizontal size={17}/></button></div><div className="activity-list">{events.slice(0,4).map((e,i)=><EventRow key={i} event={e}/>)}</div></section>
        </div>
      </div>}

      {active==="Workflows" && <div className="page">
        <div className="page-title-row"><div><div className="eyebrow">EXECUTION MANAGEMENT</div><h1>Workflows</h1><p>Inspect task plans, dependencies and generated outputs.</p></div><button className="primary-btn" onClick={()=>setShowComposer(true)}><Plus size={17}/> New workflow</button></div>
        <div className="detail-grid">
          <section className="panel tasks-panel"><div className="panel-head"><div><h3>{workflowTitle}</h3><p>{tasks.length} tasks · dependency-aware execution</p></div><button className="secondary-btn compact" onClick={resetDemo}>Reset demo</button></div>
            <div className="task-list">{tasks.map(t=><button className={`task-row ${selected===t.id?"selected":""}`} key={t.id} onClick={()=>setSelected(t.id)}><div className={`task-check ${t.status}`}>{t.status==="completed"?<Check size={13}/>:t.status==="running"?<span className="pulse"/>:<span/>}</div><div className="task-main"><b>{t.title}</b><small>{t.id} · {t.agent} · Depends on {t.deps}</small></div><Status value={t.status}/></button>)}</div>
            <div className="run-row"><div><b>Workflow execution</b><small>{running?"Agents are processing tasks…":"Demo workflow is ready to run or reset."}</small></div><button className="primary-btn" disabled={running} onClick={runWorkflow}><Play size={15}/> {running?"Running…":"Run demo"}</button></div>
          </section>
          <section className="panel task-detail"><div className="panel-head"><div><h3>Task details</h3><p>Selected execution unit</p></div><span className="task-id">{selectedTask.id}</span></div><div className="detail-agent"><div className="agent-avatar"><Bot size={19}/></div><div><b>{selectedTask.agent}</b><small>Assigned agent</small></div></div><h4>{selectedTask.title}</h4><p className="detail-copy">{selectedTask.detail}</p><div className="detail-meta"><div><small>STATUS</small><Status value={selectedTask.status}/></div><div><small>DEPENDENCIES</small><b>{selectedTask.deps}</b></div><div><small>RETRY COUNT</small><b>0 / 1</b></div></div><div className="detail-note"><ShieldCheck size={17}/><span>Agent actions are constrained by the workflow policy. External write actions require approval.</span></div></section>
        </div>
        <section className="panel timeline-panel"><div className="panel-head"><div><h3>Execution timeline</h3><p>Timestamped events from the orchestration engine</p></div><span className="live-label"><i/> EVENT LOG</span></div><div className="activity-list full">{events.map((e,i)=><EventRow key={i} event={e}/>)}</div></section>
        <section className="panel artifacts-panel"><div className="panel-head"><div><h3>Generated artifacts</h3><p>Outputs produced by workflow agents</p></div><span className="artifact-count">2 artifacts</span></div><div className="artifact-tabs"><button className={artifact==="brief"?"selected":""} onClick={()=>setArtifact("brief")}><FileText size={15}/> Meeting brief</button><button className={artifact==="email"?"selected":""} onClick={()=>setArtifact("email")}><Mail size={15}/> Email draft</button></div><ArtifactPreview type={artifact}/></section>
      </div>}

      {active==="Agents" && <div className="page"><div className="page-title-row"><div><div className="eyebrow">WORKFORCE DIRECTORY</div><h1>Specialised agents</h1><p>Each agent has a bounded role, capability set and execution responsibility.</p></div></div><div className="all-agents">{agentInfo.map(a=><AgentCard key={a.name} agent={a} expanded/>)}</div></div>}

      {active==="Activity" && <div className="page"><div className="page-title-row"><div><div className="eyebrow">AUDIT & OBSERVABILITY</div><h1>Activity log</h1><p>Trace what each agent planned, executed and reported.</p></div></div><section className="panel timeline-panel"><div className="panel-head"><div><h3>All events</h3><p>{events.length} recorded events</p></div><span className="live-label"><i/> EVENT LOG</span></div><div className="activity-list full">{events.map((e,i)=><EventRow key={i} event={e}/>)}</div></section></div>}
      <footer className="footer"><span>ORCHESTRA MVP · v0.1</span><span><ShieldCheck size={13}/> Safe demo environment · No external actions executed</span></footer>
    </main>

    {showComposer&&<div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)setShowComposer(false)}}><div className="modal"><div className="modal-head"><div><div className="eyebrow">NEW AUTOMATION</div><h2>What should ORCHESTRA accomplish?</h2><p>Describe an outcome. The Orchestrator will break it into tasks.</p></div><button className="icon-button" onClick={()=>setShowComposer(false)}><X size={18}/></button></div><label>WORKFLOW NAME<input value={workflowTitle} onChange={e=>setWorkflowTitle(e.target.value)} placeholder="e.g. Prepare client meeting"/></label><label>OBJECTIVE<textarea rows="5" value={objective} onChange={e=>setObjective(e.target.value)} placeholder="Describe the outcome you want…"/></label><div className="modal-tip"><Sparkles size={16}/> Tip: describe the outcome, not every individual step.</div><div className="modal-actions"><button className="secondary-btn" onClick={()=>setShowComposer(false)}>Cancel</button><button className="primary-btn" onClick={createWorkflow}>Create workflow <ArrowUpRight size={15}/></button></div></div></div>}
    {showApproval&&<div className="approval-toast"><div className="approval-icon"><ShieldCheck size={19}/></div><div><b>Human review required</b><p>The follow-up email is a draft. Sending is disabled in this MVP.</p></div><button onClick={()=>setShowApproval(false)}><X size={16}/></button></div>}
    {toast&&<div className="toast"><CheckCircle2 size={16}/>{toast}</div>}
  </div>
}

function Metric({icon:Icon,label,value,note,tone}){return <div className="metric-card"><div className={`metric-icon ${tone}`}><Icon size={18}/></div><div className="metric-label">{label}</div><div className="metric-value">{value}</div><div className="metric-note">{note}</div></div>}
function AgentCard({agent:a,expanded=false}){const Icon=a.icon;return <div className={`agent-card ${expanded?"expanded":""}`}><div className={`agent-avatar ${a.color}`}><Icon size={18}/></div><div className="agent-card-content"><div className="agent-card-top"><b>{a.name}</b><span className={`agent-state ${a.status==="Working"||a.status==="Active"?"active":a.status==="Completed"?"done":""}`}><i/>{a.status}</span></div><small>{a.role}</small>{expanded&&<p>{a.desc}</p>}</div><ChevronRight size={15} className="agent-chevron"/></div>}
function EventRow({event:e}){return <div className="event-row"><div className={`event-mark ${e[3]}`}>{e[3]==="success"?<Check size={12}/>:e[3]==="warn"?<CircleAlert size={12}/>:e[3]==="running"?<span className="pulse"/>:<Activity size={12}/>}</div><time>{e[0]}</time><div className="event-content"><b>{e[1]}</b><span>{e[2]}</span></div></div>}
function ArtifactPreview({type}){return type==="brief"?<div className="artifact-preview"><div className="doc-kicker">CLIENT MEETING · BRIEFING DOCUMENT</div><h3>Client Meeting Brief</h3><p className="doc-sub">Prepared by ORCHESTRA Documentation Agent · Demo content</p><h4>Meeting objective</h4><p>Align on current project progress, clarify outstanding requirements and agree on the next delivery milestones.</p><h4>Suggested discussion points</h4><ul><li>Review current deliverables and progress.</li><li>Confirm priorities and outstanding dependencies.</li><li>Discuss risks, blockers and required decisions.</li><li>Agree on owners and next steps.</li></ul><div className="source-note">Demo artifact: replace sample content with verified research outputs when the backend is connected.</div></div>:<div className="artifact-preview"><div className="doc-kicker">COMMUNICATION · DRAFT ONLY</div><h3>Follow-up email</h3><p><b>Subject:</b> Follow-up and next steps from our meeting</p><p>Hello [Client Name],</p><p>Thank you for your time. It was helpful to discuss the current project status, priorities and upcoming milestones.</p><p>As a follow-up, we will consolidate the agreed action items and share the next steps with the respective owners.</p><p>Best regards,<br/>[Your Name]</p><div className="source-note warning-note">Approval required. This prototype does not send emails or connect to a mail account.</div></div>}

export default App;