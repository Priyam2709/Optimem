
        // Enhanced JavaScript for OptiMem Simulator
        
        // DOM Elements
        const darkModeToggle = document.getElementById('darkModeToggle');
        const mobileMenuButton = document.getElementById('mobileMenuButton');
        const mobileMenu = document.getElementById('mobileMenu');
        const simulationForm = document.getElementById('simulationForm');
        const simulationResults = document.getElementById('simulationResults');
        const tutorialTabs = document.querySelectorAll('.tutorial-tab');
        const tutorialContents = document.querySelectorAll('.tutorial-content');
        const presetButtons = document.querySelectorAll('[id^="preset"]');
        
        // Simulation Variables
        let simulationInterval;
        let memoryFrames = [];
        let currentStep = 0;
        let pageFaults = 0;
        let tlbHits = 0;
        let tlbMisses = 0;
        let pageTable = {};
        let tlb = {};
        let accessSequence = [];
        let memorySize, pageSize, selectedAlgorithm;
        let pageFaultChart, hitRatioChart;
        let pageReplaceCount = {};
        let simulationSpeed = 500;
        
        // Initialize the application
        function init() {
            // Event Listeners
            darkModeToggle.addEventListener('click', toggleDarkMode);
            mobileMenuButton.addEventListener('click', toggleMobileMenu);
            simulationForm.addEventListener('submit', handleFormSubmit);
            
            // Tutorial Tab Switching
            tutorialTabs.forEach(tab => {
                tab.addEventListener('click', () => switchTutorialTab(tab.dataset.tab));
            });
            
            // Preset Buttons
            presetButtons.forEach(button => {
                button.addEventListener('click', () => loadPreset(button.id));
            });
            
            // Simulation Speed Control
            document.getElementById('simulationSpeed').addEventListener('input', (e) => {
                simulationSpeed = 2100 - e.target.value; // Invert for more intuitive control
            });
            
            // Initialize any other components
            checkPreferredColorScheme();
        }
        
        // Dark Mode Toggle
        function toggleDarkMode() {
            document.body.classList.toggle('dark-mode');
            const icon = darkModeToggle.querySelector('i');
            if (document.body.classList.contains('dark-mode')) {
                icon.classList.replace('fa-moon', 'fa-sun');
                localStorage.setItem('darkMode', 'enabled');
            } else {
                icon.classList.replace('fa-sun', 'fa-moon');
                localStorage.setItem('darkMode', 'disabled');
            }
        }
        
        // Check for preferred color scheme
        function checkPreferredColorScheme() {
            if (localStorage.getItem('darkMode') === 'enabled' || 
                (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches && !localStorage.getItem('darkMode'))) {
                document.body.classList.add('dark-mode');
                darkModeToggle.querySelector('i').classList.replace('fa-moon', 'fa-sun');
            }
        }
        
        // Mobile Menu Toggle
        function toggleMobileMenu() {
            mobileMenu.classList.toggle('hidden');
            const icon = mobileMenuButton.querySelector('i');
            if (mobileMenu.classList.contains('hidden')) {
                icon.classList.replace('fa-times', 'fa-bars');
            } else {
                icon.classList.replace('fa-bars', 'fa-times');
            }
        }
        
        // Switch Tutorial Tab
        function switchTutorialTab(tabId) {
            // Hide all content and remove active class from tabs
            tutorialContents.forEach(content => content.classList.add('hidden'));
            tutorialTabs.forEach(tab => tab.classList.remove('active-tab', 'bg-indigo-100', 'text-indigo-700'));
            
            // Show selected content and mark tab as active
            document.getElementById(`tutorial-${tabId}`).classList.remove('hidden');
            document.querySelector(`.tutorial-tab[data-tab="${tabId}"]`).classList.add('active-tab', 'bg-indigo-100', 'text-indigo-700');
        }
        
        // Load Preset Configurations
        function loadPreset(presetId) {
            // Reset any active preset buttons
            presetButtons.forEach(btn => btn.classList.remove('bg-indigo-600', 'text-white'));
            
            // Mark selected preset as active
            document.getElementById(presetId).classList.add('bg-indigo-600', 'text-white');
            
            // Load the selected preset
            switch(presetId) {
                case 'preset1': // Basic Example
                    document.getElementById('memorySize').value = 64;
                    document.getElementById('pageSize').value = 4;
                    document.getElementById('algorithm').value = 'FIFO';
                    document.getElementById('accessSequence').value = '1, 2, 3, 4, 1, 2, 5, 1, 2, 3, 4, 5';
                    break;
                case 'preset2': // Moderate Load
                    document.getElementById('memorySize').value = 128;
                    document.getElementById('pageSize').value = 8;
                    document.getElementById('algorithm').value = 'LRU';
                    document.getElementById('accessSequence').value = '1, 3, 5, 2, 4, 6, 1, 3, 5, 2, 4, 6, 7, 8, 1, 3';
                    break;
                case 'preset3': // Heavy Thrashing
                    document.getElementById('memorySize').value = 64;
                    document.getElementById('pageSize').value = 4;
                    document.getElementById('algorithm').value = 'OPT';
                    document.getElementById('accessSequence').value = '1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4';
                    break;
                case 'preset4': // Custom Settings
                    // Clear all fields
                    document.getElementById('memorySize').value = '';
                    document.getElementById('pageSize').value = '';
                    document.getElementById('algorithm').value = '';
                    document.getElementById('accessSequence').value = '';
                    break;
            }
        }
        
        // Handle Form Submission
        function handleFormSubmit(event) {
            event.preventDefault();
            
            // Get form values
            memorySize = parseInt(document.getElementById('memorySize').value);
            pageSize = parseInt(document.getElementById('pageSize').value);
            selectedAlgorithm = document.getElementById('algorithm').value;
            accessSequence = document.getElementById('accessSequence').value.split(',').map(item => parseInt(item.trim()));
            
            // Validate inputs
            if (!memorySize || !pageSize || !selectedAlgorithm || accessSequence.length === 0 || accessSequence.some(isNaN)) {
                alert('Please fill out all fields with valid values.');
                return;
            }
            
            if (memorySize < pageSize) {
                alert('Memory size must be greater than or equal to page size.');
                return;
            }
            
            // Initialize simulation
            initializeSimulation();
            
            // Show results section
            simulationResults.classList.remove('hidden');
            
            // Scroll to results
            simulationResults.scrollIntoView({ behavior: 'smooth' });
        }
        
        // Initialize Simulation
        function initializeSimulation() {
            // Reset simulation state
            clearInterval(simulationInterval);
            currentStep = 0;
            pageFaults = 0;
            tlbHits = 0;
            tlbMisses = 0;
            pageReplaceCount = {};
            
            // Calculate number of frames
            const numFrames = Math.floor(memorySize / pageSize);
            memoryFrames = new Array(numFrames).fill(null);
            
            // Initialize page table (all pages initially not loaded)
            pageTable = {};
            accessSequence.forEach(page => {
                if (!pageTable[page]) {
                    pageTable[page] = { loaded: false, frame: null };
                }
            });
            
            // Initialize TLB (empty)
            tlb = {};
            
            // Update UI
            updateStats();
            updatePageTableDisplay();
            updateTLBDisplay();
            updateMemoryMap();
            updateCurrentStep();
            updateAlgorithmDisplay();
            
            // Initialize charts
            initializeCharts();
        }
        
        // Initialize Charts
        function initializeCharts() {
            const pageFaultCtx = document.getElementById('pageFaultChart').getContext('2d');
            const hitRatioCtx = document.getElementById('hitRatioChart').getContext('2d');
            
            // Destroy existing charts if they exist
            if (pageFaultChart) pageFaultChart.destroy();
            if (hitRatioChart) hitRatioChart.destroy();
            
            // Page Fault Chart
            pageFaultChart = new Chart(pageFaultCtx, {
                type: 'line',
                data: {
                    labels: [],
                    datasets: [{
                        label: 'Page Faults',
                        data: [],
                        borderColor: 'rgba(79, 70, 229, 1)',
                        backgroundColor: 'rgba(79, 70, 229, 0.1)',
                        borderWidth: 2,
                        tension: 0.1,
                        fill: true
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            display: false
                        }
                    },
                    scales: {
                        x: {
                            title: {
                                display: true,
                                text: 'Step'
                            }
                        },
                        y: {
                            title: {
                                display: true,
                                text: 'Page Faults'
                            },
                            beginAtZero: true
                        }
                    }
                }
            });
            
            // Hit Ratio Chart
            hitRatioChart = new Chart(hitRatioCtx, {
                type: 'doughnut',
                data: {
                    labels: ['Hits', 'Misses'],
                    datasets: [{
                        data: [0, 0],
                        backgroundColor: [
                            'rgba(16, 185, 129, 0.8)',
                            'rgba(239, 68, 68, 0.8)'
                        ],
                        borderColor: [
                            'rgba(16, 185, 129, 1)',
                            'rgba(239, 68, 68, 1)'
                        ],
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            position: 'bottom'
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    const label = context.label || '';
                                    const value = context.raw || 0;
                                    const total = context.dataset.data.reduce((acc, data) => acc + data, 0);
                                    const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
                                    return `${label}: ${value} (${percentage}%)`;
                                }
                            }
                        }
                    }
                }
            });
        }
        
        // Run Simulation Step
        function runSimulationStep() {
            if (currentStep >= accessSequence.length) {
                clearInterval(simulationInterval);
                alert("Simulation complete!");
                return;
            }
            
            const currentPage = accessSequence[currentStep];
            
            // Check TLB first
            if (tlb[currentPage]) {
                tlbHits++;
                // Update last access time for LRU
                tlb[currentPage].lastAccess = currentStep;
            } else {
                tlbMisses++;
                
                // Check page table
                if (pageTable[currentPage].loaded) {
                    // Page is in memory but not in TLB (TLB miss but not page fault)
                    // Update TLB (simulate TLB update)
                    updateTLB(currentPage, pageTable[currentPage].frame);
                } else {
                    // Page fault occurs
                    pageFaults++;
                    handlePageFault(currentPage);
                }
            }
            
            // Move to next step
            currentStep++;
            
            // Update UI
            updateStats();
            updatePageTableDisplay();
            updateTLBDisplay();
            updateMemoryMap();
            updateCurrentStep();
            updateCharts();
            
            // If we've reached the end, stop the simulation
            if (currentStep >= accessSequence.length) {
                clearInterval(simulationInterval);
            }
        }
        
        // Handle Page Fault
        function handlePageFault(page) {
            // Find a free frame
            const freeFrameIndex = memoryFrames.findIndex(frame => frame === null);
            
            if (freeFrameIndex !== -1) {
                // There's a free frame, use it
                memoryFrames[freeFrameIndex] = page;
                pageTable[page] = { loaded: true, frame: freeFrameIndex };
            } else {
                // No free frames, need to replace a page
                const pageToReplace = selectPageToReplace();
                pageReplaceCount[pageToReplace] = (pageReplaceCount[pageToReplace] || 0) + 1;
                
                // Find the frame containing the page to replace
                const frameIndex = memoryFrames.indexOf(pageToReplace);
                
                // Update page tables
                pageTable[pageToReplace].loaded = false;
                pageTable[pageToReplace].frame = null;
                
                // Replace the page
                memoryFrames[frameIndex] = page;
                pageTable[page] = { loaded: true, frame: frameIndex };
                
                // Update TLB if the replaced page was there
                if (tlb[pageToReplace]) {
                    delete tlb[pageToReplace];
                }
            }
            
            // Update TLB with the new page
            updateTLB(page, pageTable[page].frame);
        }
        
        // Select Page to Replace based on algorithm
        function selectPageToReplace() {
            switch(selectedAlgorithm) {
                case 'FIFO':
                    return fifoReplacement();
                case 'LRU':
                    return lruReplacement();
                case 'OPT':
                    return optimalReplacement();
                case 'CLOCK':
                    return clockReplacement();
                case 'SECOND_CHANCE':
                    return secondChanceReplacement();
                default:
                    return fifoReplacement();
            }
        }
        
        // FIFO Replacement Algorithm
        function fifoReplacement() {
            // Simple FIFO - replace the page that's been in memory the longest
            return memoryFrames[0];
        }
        
        // LRU Replacement Algorithm
        function lruReplacement() {
            // Find the page in memory with the least recent access
            let lruPage = null;
            let minAccessTime = Infinity;
            
            for (const page in tlb) {
                if (tlb[page].lastAccess < minAccessTime) {
                    minAccessTime = tlb[page].lastAccess;
                    lruPage = parseInt(page);
                }
            }
            
            return lruPage || memoryFrames[0]; // Fallback to FIFO if no TLB info
        }
        
        // Optimal Replacement Algorithm
        function optimalReplacement() {
            // Find the page that won't be used for the longest time in the future
            let farthestPage = null;
            let farthestUse = -1;
            
            memoryFrames.forEach(page => {
                const nextUse = accessSequence.slice(currentStep).indexOf(page);
                if (nextUse === -1) {
                    // This page won't be used again - perfect candidate
                    farthestPage = page;
                    return;
                }
                if (nextUse > farthestUse) {
                    farthestUse = nextUse;
                    farthestPage = page;
                }
            });
            
            return farthestPage;
        }
        
        // Clock Replacement Algorithm (simplified)
        function clockReplacement() {
            // Simplified clock algorithm (without the actual clock hand)
            // Just pick the first page that hasn't been referenced recently
            // In a real implementation, you'd maintain a reference bit and a clock hand
            
            // For this simulation, we'll just use FIFO as a placeholder
            return memoryFrames[0];
        }
        
        // Second Chance Replacement Algorithm
        function secondChanceReplacement() {
            // Similar to clock but gives pages a "second chance"
            // Again, simplified for this simulation
            
            // For this simulation, we'll just use FIFO as a placeholder
            return memoryFrames[0];
        }
        
        // Update TLB
        function updateTLB(page, frame) {
            // Simulate limited TLB size (e.g., 4 entries)
            const tlbSize = 4;
            const tlbEntries = Object.keys(tlb).length;
            
            if (tlbEntries >= tlbSize) {
                // Need to evict an entry - use LRU
                let lruPage = null;
                let minAccessTime = Infinity;
                
                for (const p in tlb) {
                    if (tlb[p].lastAccess < minAccessTime) {
                        minAccessTime = tlb[p].lastAccess;
                        lruPage = p;
                    }
                }
                
                if (lruPage) {
                    delete tlb[lruPage];
                }
            }
            
            // Add new entry
            tlb[page] = {
                frame: frame,
                lastAccess: currentStep
            };
        }
        
        // Update Statistics Display
        function updateStats() {
            document.getElementById('statPageFaults').textContent = pageFaults;
            document.getElementById('statTLBHits').textContent = tlbHits;
            document.getElementById('statTLBMisses').textContent = tlbMisses;
            
            const totalAccesses = tlbHits + tlbMisses;
            const hitRatio = totalAccesses > 0 ? Math.round((tlbHits / totalAccesses) * 100) : 0;
            document.getElementById('statHitRatio').textContent = `${hitRatio}%`;
        }
        
        // Update Page Table Display
        function updatePageTableDisplay() {
            const tableBody = document.getElementById('pageTableBody');
            tableBody.innerHTML = '';
            
            for (const page in pageTable) {
                const row = document.createElement('tr');
                
                const pageCell = document.createElement('td');
                pageCell.className = 'px-4 py-2';
                pageCell.textContent = page;
                
                const frameCell = document.createElement('td');
                frameCell.className = 'px-4 py-2';
                frameCell.textContent = pageTable[page].loaded ? pageTable[page].frame : 'Disk';
                
                const statusCell = document.createElement('td');
                statusCell.className = 'px-4 py-2';
                const statusBadge = document.createElement('span');
                statusBadge.className = `px-2 py-1 rounded-full text-xs font-medium ${pageTable[page].loaded ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`;
                statusBadge.textContent = pageTable[page].loaded ? 'Loaded' : 'Not Loaded';
                statusCell.appendChild(statusBadge);
                
                row.appendChild(pageCell);
                row.appendChild(frameCell);
                row.appendChild(statusCell);
                tableBody.appendChild(row);
            }
        }
        
        // Update TLB Display
        function updateTLBDisplay() {
            const tableBody = document.getElementById('tlbTableBody');
            tableBody.innerHTML = '';
            
            for (const page in tlb) {
                const row = document.createElement('tr');
                
                const pageCell = document.createElement('td');
                pageCell.className = 'px-4 py-2';
                pageCell.textContent = page;
                
                const frameCell = document.createElement('td');
                frameCell.className = 'px-4 py-2';
                frameCell.textContent = tlb[page].frame;
                
                const accessCell = document.createElement('td');
                accessCell.className = 'px-4 py-2';
                accessCell.textContent = tlb[page].lastAccess;
                
                row.appendChild(pageCell);
                row.appendChild(frameCell);
                row.appendChild(accessCell);
                tableBody.appendChild(row);
            }
        }
        
        // Update Memory Map Display
        function updateMemoryMap() {
            const memoryMap = document.getElementById('memoryMap');
            memoryMap.innerHTML = '';
            
            memoryFrames.forEach((page, index) => {
                const frame = document.createElement('div');
                frame.className = `memory-frame w-16 h-16 rounded-lg border-2 flex items-center justify-center font-medium ${page ? 'bg-indigo-100 border-indigo-300' : 'bg-slate-100 border-slate-300'}`;
                frame.textContent = page || 'Free';
                frame.title = `Frame ${index}: ${page ? `Page ${page}` : 'Empty'}`;
                memoryMap.appendChild(frame);
            });
        }
        
        // Update Current Step Display
        function updateCurrentStep() {
            document.getElementById('currentStep').textContent = `Current step: ${currentStep}/${accessSequence.length}`;
        }
        
        // Update Algorithm Display
        function updateAlgorithmDisplay() {
            let algorithmName = '';
            switch(selectedAlgorithm) {
                case 'FIFO': algorithmName = 'First-In-First-Out'; break;
                case 'LRU': algorithmName = 'Least Recently Used'; break;
                case 'OPT': algorithmName = 'Optimal'; break;
                case 'CLOCK': algorithmName = 'Clock'; break;
                case 'SECOND_CHANCE': algorithmName = 'Second Chance'; break;
                default: algorithmName = selectedAlgorithm;
            }
            document.getElementById('currentAlgorithm').textContent = `Algorithm: ${algorithmName}`;
        }
        
        // Update Charts
        function updateCharts() {
            // Update Page Fault Chart
            pageFaultChart.data.labels.push(currentStep);
            pageFaultChart.data.datasets[0].data.push(pageFaults);
            pageFaultChart.update();
            
            // Update Hit Ratio Chart
            const totalAccesses = tlbHits + tlbMisses;
            hitRatioChart.data.datasets[0].data = [tlbHits, tlbMisses];
            hitRatioChart.update();
        }
        
        // Simulation Controls
        document.getElementById('startBtn').addEventListener('click', function() {
            clearInterval(simulationInterval);
            simulationInterval = setInterval(runSimulationStep, simulationSpeed);
        });
        
        document.getElementById('pauseBtn').addEventListener('click', function() {
            clearInterval(simulationInterval);
        });
        
        document.getElementById('stepBtn').addEventListener('click', function() {
            clearInterval(simulationInterval);
            runSimulationStep();
        });
        
        document.getElementById('resetBtn').addEventListener('click', function() {
            clearInterval(simulationInterval);
            initializeSimulation();
        });
        
        // Export Results
        document.getElementById('exportBtn').addEventListener('click', function() {
            const data = {
                configuration: {
                    memorySize,
                    pageSize,
                    algorithm: selectedAlgorithm,
                    accessSequence
                },
                results: {
                    pageFaults,
                    tlbHits,
                    tlbMisses,
                    hitRatio: (tlbHits + tlbMisses) > 0 ? (tlbHits / (tlbHits + tlbMisses)) * 100 : 0,
                    memoryFrames,
                    pageTable,
                    tlb,
                    pageReplaceCount
                },
                timestamps: {
                    simulationRun: new Date().toISOString()
                }
            };
            
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `optiMem-simulation-${new Date().toISOString().slice(0, 10)}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        });
        
        // Fullscreen Toggle
        document.getElementById('fullscreenBtn').addEventListener('click', function() {
            if (!document.fullscreenElement) {
                simulationResults.requestFullscreen().catch(err => {
                    alert(`Error attempting to enable fullscreen: ${err.message}`);
                });
            } else {
                document.exitFullscreen();
            }
        });
        
        // Initialize the application
        document.addEventListener('DOMContentLoaded', init);