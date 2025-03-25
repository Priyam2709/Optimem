
# OptiMem - Virtual Memory Simulator

## Overview
OptiMem is an interactive simulator that demonstrates virtual memory management through real-time visualization of:

- Page replacement algorithms (FIFO, LRU, OPT, Clock)
- Address translation via page tables and TLB
- Memory fragmentation analysis
- Performance metric tracking

Designed for computer science education and professional development.

## Key Features
- **Interactive Simulations**: Step-through execution with visual feedback
- **Algorithm Comparison**: FIFO, LRU, OPT with side-by-side metrics
- **Comprehensive Analytics**: Page faults, hit ratios, TLB performance
- **Educational Resources**: Integrated tutorials and real-world examples
- **Data Export**: JSON results for further analysis

## Technical Stack
| Component | Technology |
|-----------|------------|
| Frontend  | HTML5, CSS3 (Tailwind), JavaScript |
| Charts    | Chart.js 3.5+ |
| Icons     | Font Awesome 6 |
| Responsive| Mobile-optimized design |

## Quick Start
```bash
git clone https://github.com/Priyam2709/optimem.git
cd optimem
open index.html
```

## Usage Guide
1. **Configure**:
   - Set memory parameters (64KB-1024KB)
   - Select algorithm (FIFO/LRU/OPT)
   - Input access sequence (e.g., "1,2,3,4,1,2")

2. **Execute**:
   - Real-time or step-by-step simulation
   - Adjust speed with slider control

3. **Analyze**:
   - Visual memory maps
   - Page table/TLB status
   - Performance charts

## Sample Simulation
```yaml
Configuration:
  Memory: 64KB
  Page Size: 4KB 
  Algorithm: LRU
  Sequence: 1,2,3,4,1,2,5,1,2,3,4,5

Results:
  Page Faults: 7
  TLB Hit Rate: 41.67%
  Memory Utilization: 87.5%
```

## Documentation
Explore our interactive tutorial covering:
- Paging fundamentals
- Algorithm tradeoffs
- Performance optimization
- Real-world OS implementations

## Contributors
- Paras Bajaj (System Architecture)
- Priyam Saxena (UI/UX Design)

 [Live Demo](https://priyam2709.github.io/Optimem/)
