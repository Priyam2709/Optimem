OptiMem - Virtual Memory Simulator

📌 Overview
OptiMem is an interactive educational tool designed to visualize and simulate virtual memory management concepts in operating systems. It provides real-time demonstrations of:

Page replacement algorithms (FIFO, LRU, OPT)

Address translation (Page tables, TLB)

Memory fragmentation (Internal/External)

Performance metrics (Page faults, TLB hits/misses)

Built for students, educators, and developers to understand memory management visually.

✨ Features
✅ Interactive Simulations

Real-time visualization of memory allocation

Step-by-step execution control

✅ Multiple Algorithms

Compare FIFO, LRU, OPT

✅ Comprehensive Metrics

Page fault tracking

TLB hit/miss analysis

Memory fragmentation calculation

✅ Educational Tutorials

Built-in guides on virtual memory concepts

Real-world OS examples (Linux, Windows)

✅ Export & Share

Save simulation results as JSON

Fullscreen mode for presentations

🛠️ Technologies Used
Frontend: HTML5, CSS3 (Tailwind CSS), JavaScript

Visualization: Chart.js

Icons: Font Awesome

Responsive Design: Mobile-friendly layout

🚀 Getting Started
1. Run Locally
bash
Copy
git clone https://github.com/Priyam2709/optimem.git
cd optimem

🎮 How to Use
Configure Simulation

Set memory size, page size, and algorithm

Enter page access sequence (e.g., 1, 2, 3, 4, 1, 2)

Run Simulation

Click Start to run automatically

Use Step to advance manually

Analyze Results

View memory maps, page tables, and charts

Export data for further analysis

📚 Tutorial Sections
Introduction to Virtual Memory

Paging Concepts

Page Replacement Algorithms

TLB (Translation Lookaside Buffer)

Memory Fragmentation

Real-world OS Implementations

📊 Example Simulation
plaintext
Copy
Memory Size: 64KB  
Page Size: 4KB  
Algorithm: LRU  
Access Sequence: 1, 2, 3, 4, 1, 2, 5, 1, 2, 3, 4, 5  

Results:  
- Page Faults: 7  
- TLB Hits: 5  
- Hit Ratio: 41.67%  
📜 License
MIT License - Free for educational and personal use.

📬 Contact
Developer: Paras Bajaj, Priyam Saxena

Contributions Welcome!

🌟 Happy Learning! Explore virtual memory like never before with OptiMem.
