# 🧠 Online Judge Coding Platform (MERN Stack)

An interactive web-based coding platform that allows users to solve coding problems in **C++** and **Python**, get **immediate verdicts**, and track their progress — all in a full-stack environment built with the **MERN stack (MongoDB, Express, React, Node.js)**.

---

## 🚀 Features

- ✅ **Problem Listing**  
  Browse coding problems categorized by difficulty (**Easy**, **Medium**, **Hard**).

- ✅ **Code Editor & Language Selection**  
  Submit solutions in **C++** or **Python** with a live, responsive code editor.

- ✅ **Code Execution Engine (no Docker)**  
  Executes user-submitted code securely using `execSync`, compiles C++, runs Python, and matches outputs with test cases.

- ✅ **Test Case Feedback**  
  Users get detailed feedback — input, expected output, actual output, and pass/fail status.

- ✅ **Solved Problem Tracking**  
  Problems are visually marked when solved.

- ✅ **Sorting Functionality**  
  Sort problems by:
  - Difficulty (Easy → Hard / Hard → Easy)
  - Solved Status (Solved First / Unsolved First)

- ✅ **Execution Logging**  
  Submissions are saved to **MongoDB Atlas** with timestamp, code, language, and verdict.

- ✅ **Rate Limiting**  
  Uses `express-rate-limit` to block excessive API usage.

- ✅ **Clean & Responsive UI**  
  Built with **React + Bootstrap** for a modern look.

---

## 🛠️ Tech Stack

| Layer       | Tech                                       |
|-------------|--------------------------------------------|
| Frontend    | React.js, React Router, Bootstrap          |
| Backend     | Node.js, Express.js                        |
| Database    | MongoDB (MongoDB Atlas for cloud storage)  |
| Code Runner | Native C++ (GCC), Python via `execSync()`  |
| Security    | `express-rate-limit`, input sanitization   |
| Versioning  | Git + GitHub                               |

---

## 🧩 How It Works
1. Users select a problem from the list.
2. They write and submit code in C++/Python.
3. The backend:
   - Writes the code to a temp file
   - Compiles/runs it securely
   - Feeds it test inputs
   - Compares actual vs. expected output
4. Verdict is sent back and shown to the user.
5. Submission is logged in MongoDB.

---
## 📸 Screenshots
<img width="923" alt="ProblemList" src="https://github.com/user-attachments/assets/6be78889-b651-4574-bbea-62ae70339c3a" />
<img width="931" alt="ProblemDetails_Verdict" src="https://github.com/user-attachments/assets/8a8fff23-3915-47d5-aa40-16d07050876b" />
---

## 🌱 Future Improvements (Planned)

- [ ] Docker-based execution sandbox (isolation for security)
- [ ] Queue-based task execution (for scaling concurrent runs)
- [ ] User authentication (track user history)
- [ ] Admin dashboard for submissions
- [ ] Deployment on Vercel + Render

---

📝 License
This project is open-source and available under the MIT License.

