<div align="center">

# ⚡ CodeJudge

### *A robust, secure, and blazing-fast full-stack Online Judge Platform.*

[![MERN Stack](https://img.shields.io/badge/Stack-MERN-blue.svg?style=for-the-badge)](https://react.dev/)
[![Docker](https://img.shields.io/badge/Docker-Enabled-blue?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

<p align="center">
  <a href="#-features">Features</a> •
  <a href="#%EF%B8%8F-tech-stack">Tech Stack</a> •
  <a href="#-system-architecture">Architecture</a> •
  <a href="#%EF%B8%8F-local-setup">Setup</a> •
  <a href="#-api-reference">API</a> •
  <a href="#-security">Security</a>
</p>

---

CodeJudge compiles and executes user code inside **real, isolated Docker containers**. It features real-time verdicts, per-test-case breakdowns, and interactive submission history, supporting **C++, Python, and Java**.

</div>

---

## ✨ Features

*   **🐳 Real Docker Sandboxing:** Every submission executes inside a fresh, isolated Docker container (`gcc:latest`, `python:3.10-alpine`, `eclipse-temurin:11`). Absolutely zero shared state between runs.
*   **🖊️ Rich Code Editor:** Powered by **CodeMirror 6** with full syntax highlighting, auto-closing brackets, and smart auto-indentation.
*   **⚙️ Three-Stage Workflow:** Streamlined pipeline: `Compile` ➡️ `Run with custom input` ➡️ `Submit against test cases`.
*   **🧪 Custom Input Runner:** Test code logic with your own edge cases before committing to an official submission.
*   **📋 Per Test Case Breakdown:** Deep insight into `Input`, `Expected Output`, `Actual Output`, and precise verdicts (✅ Accepted / ❌ Wrong Answer / 🚫 Runtime Error).
*   **📊 Submission History & Replay:** Full persistent history. Click any past submission to instantly reload its exact code state and execution metrics.
*   **📈 Dynamic Progress Tracker:** Visual dashboard featuring difficulty-wise progress bars (Easy / Medium / Hard) with real-time percentage completion.
*   **🔍 Advanced Search & Sort:** Instantly filter problems by title, complexity tier, or status.
*   **🎉 Immersive Micro-interactions:** Built-in `canvas-confetti` bursts on success, shake animations on failure, and fluid page transitions.
*   **🛡️ Multi-Layer Security:** Zero-interpolation execution via file-based `stdin` redirect, robust code-safety blacklists, and aggressive rate limiting.

---

## 🛠️ Tech Stack

### Frontend & UI
| Technology | Purpose |
| :--- | :--- |
| **React 18** | Component-driven UI Architecture |
| **CodeMirror 6** | Extensible web code editor with multi-language packages |
| **Bootstrap 5** | Responsive grid layouts and modern styling |
| **Framer Motion** | Declarative page and state transitions |
| **Axios** | Promised-based HTTP client for API communication |
| **Canvas-Confetti** | High-performance canvas success animations |

### Backend & Database
| Technology | Purpose |
| :--- | :--- |
| **Node.js + Express** | High-concurrency REST API Server |
| **MongoDB + Mongoose** | Document-based persistence for Problems & Submissions |
| **Docker** | Ephemeral, isolated operating system-level virtualization |
| **Express-Rate-Limit** | Basic rate-limiting middleware to prevent DDoS vectors |

### Multi-Language Execution Matrix
| Language | Base Docker Image | Compilation Command | Execution Command |
| :--- | :--- | :--- | :--- |
| **C++** | `gcc:latest` | `g++ -o output_<id> source.cpp` | `./output_<id>` |
| **Python** | `python:3.10-alpine` | `py_compile source.py` | `python source.py` |
| **Java** | `eclipse-temurin:11` | `javac Main.java` | `java Main` |

---

## 🏗️ System Architecture

```
 ┌────────────────────────────────────────────────────────┐
 │                      User Browser                      │
 └──────────────────────────┬─────────────────────────────┘
                            │ HTTP / REST API
                            ▼
 ┌────────────────────────────────────────────────────────┐
 │               React Frontend (Port 3000)               │
 └──────────────────────────┬─────────────────────────────┘
                            │ Axios API Requests
                            ▼
 ┌────────────────────────────────────────────────────────┐
 │               Express Backend (Port 5000)              │
 └──────────────┬──────────────────────────┬──────────────┘
                │                          │
                ▼ Datastore Queries        ▼ Spawns Ephemeral Run
 ┌──────────────────────────────┐  ┌──────────────────────────────┐
 │        MongoDB Atlas         │  │    Docker Sandbox Engine     │
 │  (Problems & Submissions)    │  │ (Isolated Environment Cores) │
 └──────────────────────────────┘  └──────────────┬───────────────┘
                                                  │
                ┌─────────────────────────────────┼─────────────────────────────────┐
                ▼                                 ▼                                 ▼
 ┌──────────────────────────────┐  ┌──────────────────────────────┐  ┌──────────────────────────────┐
 │          gcc:latest          │  │      python:3.10-alpine      │  │      eclipse-temurin:11      │
 │       (C++ Sandbox)          │  │       (Python Sandbox)       │  │        (Java Sandbox)        │
 └──────────────────────────────┘  └──────────────────────────────┘  └──────────────────────────────┘

```
🔒 Architectural Security Decisions
Shell Injection Prevention: User code and dynamic input are explicitly written to separate temporary files. Execution reads data exclusively via a standard input file redirect (< input.txt) instead of shell-string interpolation.

Concurrency Collision Avoidance: Each C++ execution thread creates a isolated, distinct binary name mapped directly to the active runner context (output_<problemId>), eliminating race conditions between overlapping submissions.

Zero Persistent System State: Containers are instantiated utilizing the Docker --rm lifetime flag, ensuring the isolated image engine layer is automatically destroyed, purged, and freed from memory immediately post-verdict.

Instant History Playback: Submissions save an indexable evaluation array (testResults) directly into MongoDB documents, allowing instant user code replay and dashboard rendering without forcing redundant code recompilations.

📁 Project Structure
```

coding-platform/
├── backend/
│   ├── controllers/
│   │   └── problemController.js   # Core engine logic (compile, run, submit steps)
│   ├── models/
│   │   ├── Problem.js             # Problem model structure
│   │   └── Submission.js          # Persistent historical record with metrics
│   ├── routes/
│   │   └── problemRoutes.js       # Express endpoint mappings
│   ├── temp/                      # Dynamic sandbox I/O workspace (Gitignored)
│   ├── seed.js                    # Database mock-data insertion runner
│   └── server.js                  # App startup script
│
└── frontend/
    └── src/
        ├── components/
        │   ├── ProblemList.js     # Challenges layout and progress tracking dashboard
        │   └── ProblemDetails.js  # Main environment view (Editor & Outputs panels)
        ├── App.js                 # Layout engine index
        └── App.css                # Interface styles
```
### 🔌 API Reference
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| **GET** | <code>/api/problems</code> | Retrieves a complete list of all problems. |
| **GET** | <code>/api/problems/:id</code> | Fetches full detailed schema fields for a single problem. |
| **POST** | <code>/api/problems/:id/compile</code> | Validates code payload for structural syntax errors. |
| **POST** | <code>/api/problems/:id/run</code> | Executes source logic against volatile user custom input strings. |
| **POST** | <code>/api/problems/:id/submit</code> | Evaluates target code payload against official grading data blocks. |
| **GET** | <code>/api/submissions/:id</code> | Returns archived code entries and metrics for dashboard replays. |

---
```
🛡️ Sandbox Protection Strategy
Static Threat Mapping: Incoming payloads are filtered against a robust blacklist matrix identifying 30+ problematic hooks, unverified system calls, unauthorized local file access, networking bindings, and runaway loops.

Complete Process Isolation: Sandbox target containers completely lack external network interface routing, maintaining absolute runtime isolation.

API Traffic Safeguards: Standard system rate-limiting guards drop connections when a single host tracking footprint exceeds 100 requests per 15 minutes.

Time-To-Live Watchdogs: Strict process execution thresholds are applied, killing workflows automatically if computations take longer than 5 seconds per test evaluation or 15 seconds inside compiler pipelines.

🗺️ Roadmap
[x] Multilingual Isolation compilation & execution layers (C++, Python, Java)

[x] Injected custom code runner pipeline

[x] Full submission array storage for client historical code replays

[x] Visual user dashboard tracking completion statistics by problem weight

[ ] Secure JWT Session Authentication and Account Management

[ ] Global Leaderboard panels and challenge-specific completion tier matrices

[ ] Advanced profiling metrics detailing microsecond runtime duration and RAM consumption graphs

📄 License
Distributed under the MIT License. See LICENSE for more details.
