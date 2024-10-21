**Online Judge Coding Platform**

A web-based coding platform built using the MERN stack (MongoDB, Express, React, and Node.js). Users can view coding problems, submit solutions in multiple languages (C++ and Python), and get immediate feedback on test cases run inside Docker containers.


**Features**

Problem Listing: Browse through coding problems categorized by difficulty (Easy, Medium, Hard).

Problem Solving: Users can select a coding problem, write and submit solutions in C++ or Python.

Code Execution: The code is compiled and executed inside Docker containers with predefined test cases.

Feedback: After submission, users receive real-time feedback with details on whether their solution passed the test cases.

Solution Tracking: Solved problems are visually marked, and users can see which problems they've already solved.

Sort Functionality: Sort problems by difficulty in ascending or descending order.

User Interface: Clean and responsive UI, enhanced with Bootstrap for modern design.


**Tech Stack**

Frontend: React.js, React Router, Bootstrap

Backend: Node.js, Express.js

Database: MongoDB (with MongoDB Atlas for cloud database)

Code Execution: Docker (GCC for C++, Python Docker images)

Version Control: Git, GitHub


**How it Works**

Users select a coding problem from the list.

They write their solution in the provided code editor and choose the language (C++/Python).

Upon submission, the code is sent to the backend, where it is executed inside a Docker container.

The backend compares the output of the code with predefined test cases and sends back the results.

The frontend displays the result of each test case, along with whether the solution was successful.
