const MultiServerQueue = {
    container: null,
    randomMethod: null,
    randomNumbers: [],
    randomNumbers2: [],
    randomIndex: 0,
    randomIndex2: 0,
    arrivalData: [],
    serviceData1: [],
    serviceData2: [],
    simulationMode: null,
    
    init: function(container, randomMethod, randomNumbers, randomNumbers2) {
        this.container = container;
        this.randomMethod = randomMethod;
        this.randomNumbers = randomNumbers || [];
        this.randomNumbers2 = randomNumbers2 || [];
        this.randomIndex = 0;
        this.randomIndex2 = 0;
        this.arrivalData = [];
        this.serviceData1 = [];
        this.serviceData2 = [];
        this.simulationMode = null;
        this.setupUI();
        this.attachEventListeners();
    },
    
    getMaxCustomers: function() {
        if (this.randomMethod !== 'prng') {
            return 100;
        }
        
        const maxFromSet1 = this.randomNumbers.length + 1;
        const maxFromSet2 = this.randomNumbers2.length;
        
        return Math.min(maxFromSet1, maxFromSet2);
    },
    
    getNextRandom: function(setNum = 1, isFirstCustomer = false) {
        if (isFirstCustomer && setNum === 1) {
            return '';
        }
        
        if (this.randomMethod === 'manual') {
            return '';
        }
        
        if (setNum === 1) {
            if (this.randomIndex >= this.randomNumbers.length) {
                const scale = this.arrivalScale || 100;
                return Math.floor(Math.random() * scale);
            }
            return this.randomNumbers[this.randomIndex++];
        } else {
            if (this.randomIndex2 >= this.randomNumbers2.length) {
                const scale = this.serviceScale || 100;
                return Math.floor(Math.random() * scale);
            }
            return this.randomNumbers2[this.randomIndex2++];
        }
    },
    
    setupUI: function() {
        this.container.innerHTML = `
            <div>
                <h2 class="text-3xl font-bold mb-4" style="color: #667eea;">Multi-Server Queue Simulation</h2>
                
                <!-- Step 1: Setup Tables -->
                <div id="multiStep1">
                    <div class="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <h3 class="text-sm font-semibold mb-2">Interarrival Scale:</h3>
                            <select id="multiArrivalScale" class="prng-input">
                                <option value="10" selected>10 (0-9)</option>
                                <option value="100">100 (0-99)</option>
                                <option value="1000">1000 (0-999)</option>
                            </select>
                        </div>
                        <div>
                            <h3 class="text-sm font-semibold mb-2">Service Scale:</h3>
                            <select id="multiServiceScale" class="prng-input">
                                <option value="10" selected>10 (0-9)</option>
                                <option value="100">100 (0-99)</option>
                                <option value="1000">1000 (0-999)</option>
                            </select>
                        </div>
                    </div>

                    <div class="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <h3 class="text-sm font-semibold mb-2">How many arrival intervals?</h3>
                            <input type="number" id="multiArrivalCount" min="1" max="100" class="prng-input">
                        </div>
                        <div>
                            <h3 class="text-sm font-semibold mb-2">How many service times?</h3>
                            <input type="number" id="multiServiceCount" min="1" max="100" class="prng-input">
                        </div>
                    </div>
                    
                    <button id="multiGenerateTablesBtn" class="btn-primary">Generate Distribution Tables</button>
                    
                    <div id="multiDistributionTables" class="hidden mt-6">
                        <div class="mb-6">
                            <h3 class="text-xl font-semibold mb-3" style="color: #667eea;">Inter-Arrival Time Table</h3>
                            <div class="table-wrapper">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Interval</th>
                                            <th>Probability</th>
                                            <th>Cumulative Probability</th>
                                            <th>Random Digits</th>
                                        </tr>
                                    </thead>
                                    <tbody id="multiArrivalTableBody"></tbody>
                                </table>
                            </div>
                            <button id="multiCalcArrivalBtn" class="btn-success mt-3">Calculate Cumulative & Random Digits</button>
                        </div>
                        
                        <h3 class="text-xl font-semibold mb-4" style="color: #667eea;">Service Time Tables</h3>
                        <div class="service-tables-grid">
                            <div>
                                <h4 class="mb-3 font-semibold">Server A</h4>
                                <div class="table-wrapper">
                                    <table>
                                        <thead>
                                            <tr>
                                                <th class="server-a">Service Time</th>
                                                <th class="server-a">Probability</th>
                                                <th class="server-a">Cumulative Probability</th>
                                                <th class="server-a">Random Digits</th>
                                            </tr>
                                        </thead>
                                        <tbody id="multiServiceTableBody1"></tbody>
                                    </table>
                                </div>
                                <button id="multiCalcService1Btn" class="btn-success mt-3">Calculate Cumulative & Random Digits</button>
                            </div>
                            
                            <div>
                                <h4 class="mb-3 font-semibold">Server B</h4>
                                <div class="table-wrapper">
                                    <table>
                                        <thead>
                                            <tr>
                                                <th class="server-b">Service Time</th>
                                                <th class="server-b">Probability</th>
                                                <th class="server-b">Cumulative Probability</th>
                                                <th class="server-b">Random Digits</th>
                                            </tr>
                                        </thead>
                                        <tbody id="multiServiceTableBody2"></tbody>
                                    </table>
                                </div>
                                <button id="multiCalcService2Btn" class="btn-success mt-3">Calculate Cumulative & Random Digits</button>
                            </div>
                        </div>
                        
                        <button id="multiGoToStep2Btn" class="btn-primary mt-4">Proceed to Simulation Setup →</button>
                    </div>
                </div>
                
                <!-- Step 2: Simulation Mode Selection -->
                <div id="multiStep2" class="hidden mt-6">
                    <h3 class="text-lg font-semibold mb-4" style="color: #667eea;">Choose Simulation Mode:</h3>
                    <div class="grid grid-cols-2 gap-4 mb-6">
                        <div class="option-card" data-sim-mode="customers">
                            <div class="option-icon">👥</div>
                            <h3 class="font-semibold text-lg">By Number of Customers</h3>
                            <p class="text-sm text-gray-600 mt-2">Simulate a fixed number of customers</p>
                        </div>
                        <div class="option-card" data-sim-mode="time">
                            <div class="option-icon">⏰</div>
                            <h3 class="font-semibold text-lg">By End Time</h3>
                            <p class="text-sm text-gray-600 mt-2">Simulate until a specific time</p>
                        </div>
                    </div>
                    
                    <!-- Customer Count Input -->
                    <div id="customerCountInput" class="hidden mb-4">
                        <h3 class="text-sm font-semibold mb-2">How many customers to simulate?</h3>
                        <input type="number" id="multiCustomerCount" min="1" max="${this.getMaxCustomers()}" class="prng-input">
                        ${this.randomMethod === 'prng' ? `<p class="text-sm text-gray-600 mt-1">Maximum ${this.getMaxCustomers()} customers (limited by generated random numbers)</p>` : ''}
                    </div>
                    
                    <!-- End Time Input -->
                    <div id="endTimeInput" class="hidden mb-4">
                        <h3 class="text-sm font-semibold mb-2">Simulation end time (in time units):</h3>
                        <input type="number" id="multiEndTime" min="1" class="prng-input" placeholder="e.g., 100">
                        <p class="text-sm text-gray-600 mt-1">Simulation will run until the last service that starts before this time completes</p>
                    </div>
                    
                    <div class="mb-4" id="prioritySection" style="display: none;">
                        <h3 class="text-lg font-semibold mb-2">Server Priority:</h3>
                        <div class="grid grid-cols-2 gap-4">
                            <div class="option-card" data-priority="A">
                                <h3 class="font-semibold">Server A (Priority)</h3>
                            </div>
                            <div class="option-card" data-priority="B">
                                <h3 class="font-semibold">Server B (Priority)</h3>
                            </div>
                        </div>
                    </div>
                    
                    <button id="multiGenerateSimBtn" class="btn-primary" style="display: none;">Generate Simulation Table</button>
                </div>
                
                <!-- Step 3: Simulation Table -->
                <div id="multiStep3" class="hidden mt-6">
                    <div class="table-wrapper">
                        <table id="multiSimulationTable">
                            <thead>
                                <tr>
                                    <th rowspan="2">Customer<br>Number</th>
                                    <th colspan="4" style="background: #667eea;">Part 1: Arrival</th>
                                    <th colspan="3" class="server-a">Part 2: Server A</th>
                                    <th colspan="3" class="server-b">Part 3: Server B</th>
                                    <th rowspan="2">Waiting<br>Time</th>
                                </tr>
                                <tr>
                                    <th>Random #<br>Arrival</th>
                                    <th>Inter-arrival<br>Time</th>
                                    <th>Clock Time<br>of Arrival</th>
                                    <th>Random #<br>Service</th>
                                    <th class="server-a">Time Service<br>Begins</th>
                                    <th class="server-a">Service<br>Time</th>
                                    <th class="server-a">Time Service<br>Ends</th>
                                    <th class="server-b">Time Service<br>Begins</th>
                                    <th class="server-b">Service<br>Time</th>
                                    <th class="server-b">Time Service<br>Ends</th>
                                </tr>
                            </thead>
                            <tbody id="multiSimulationTableBody"></tbody>
                        </table>
                    </div>
                    
                    <button id="multiRunSimBtn" class="btn-success mt-4">Run Simulation (Fill Table)</button>
                </div>
            </div>
        `;
    },
    
    attachEventListeners: function() {
        const self = this;
        
        document.getElementById('multiGenerateTablesBtn').addEventListener('click', () => self.generateTables());
        document.getElementById('multiCalcArrivalBtn').addEventListener('click', () => self.calculateArrivalTable());
        document.getElementById('multiCalcService1Btn').addEventListener('click', () => self.calculateServiceTable(1));
        document.getElementById('multiCalcService2Btn').addEventListener('click', () => self.calculateServiceTable(2));
        document.getElementById('multiGoToStep2Btn').addEventListener('click', () => self.goToStep2());
        
        // Simulation mode selection
        document.querySelectorAll('[data-sim-mode]').forEach(card => {
            card.addEventListener('click', function() {
                document.querySelectorAll('[data-sim-mode]').forEach(c => c.classList.remove('selected'));
                this.classList.add('selected');
                self.simulationMode = this.dataset.simMode;
                
                // Show/hide appropriate inputs
                if (self.simulationMode === 'customers') {
                    document.getElementById('customerCountInput').classList.remove('hidden');
                    document.getElementById('endTimeInput').classList.add('hidden');
                } else {
                    document.getElementById('customerCountInput').classList.add('hidden');
                    document.getElementById('endTimeInput').classList.remove('hidden');
                }
                
                document.getElementById('prioritySection').style.display = 'block';
                document.getElementById('multiGenerateSimBtn').style.display = 'block';
            });
        });
        
        document.querySelectorAll('[data-priority]').forEach(card => {
            card.addEventListener('click', function() {
                document.querySelectorAll('[data-priority]').forEach(c => c.classList.remove('selected'));
                this.classList.add('selected');
            });
        });
        
        document.getElementById('multiGenerateSimBtn').addEventListener('click', () => self.generateSimulationTable());
        document.getElementById('multiRunSimBtn').addEventListener('click', () => self.runSimulation());
    },
    
    generateTables: function() {
        const arrivalCount = parseInt(document.getElementById('multiArrivalCount').value);
        const serviceCount = parseInt(document.getElementById('multiServiceCount').value);
        
        if (!arrivalCount || arrivalCount < 1 || arrivalCount > 100) {
            alert('Please enter a valid arrival count between 1 and 100');
            return;
        }
        
        if (!serviceCount || serviceCount < 1 || serviceCount > 100) {
            alert('Please enter a valid service count between 1 and 100');
            return;
        }
        
        this.generateArrivalTable(arrivalCount);
        this.generateServiceTable(1, serviceCount);
        this.generateServiceTable(2, serviceCount);
        
        document.getElementById('multiDistributionTables').classList.remove('hidden');
    },
    
    generateArrivalTable: function(count) {
        const tbody = document.getElementById('multiArrivalTableBody');
        tbody.innerHTML = '';
        
        for (let i = 1; i <= count; i++) {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><input type="text" class="table-input" data-type="arrival-interval" data-index="${i}"></td>
                <td><input type="text" class="table-input" data-type="arrival-prob" data-index="${i}"></td>
                <td><input type="text" class="table-input readonly" data-type="arrival-cumul" data-index="${i}" readonly></td>
                <td><input type="text" class="table-input readonly" data-type="arrival-digits" data-index="${i}" readonly></td>
            `;
            tbody.appendChild(row);
        }
    },
    
    generateServiceTable: function(serverNum, count) {
        const tbody = document.getElementById(`multiServiceTableBody${serverNum}`);
        tbody.innerHTML = '';
        
        for (let i = 1; i <= count; i++) {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><input type="text" class="table-input" data-type="service${serverNum}-time" data-index="${i}"></td>
                <td><input type="text" class="table-input" data-type="service${serverNum}-prob" data-index="${i}"></td>
                <td><input type="text" class="table-input readonly" data-type="service${serverNum}-cumul" data-index="${i}" readonly></td>
                <td><input type="text" class="table-input readonly" data-type="service${serverNum}-digits" data-index="${i}" readonly></td>
            `;
            tbody.appendChild(row);
        }
    },
    
calculateArrivalTable: function() {
        this.arrivalScale = Number(document.getElementById('multiArrivalScale').value) || 10;
        const maxRN = this.arrivalScale;
        const numDigits = maxRN.toString().length - 1;

        const count = document.querySelectorAll('[data-type="arrival-prob"]').length;
        this.arrivalData = [];

        // Validate probabilities sum to 1.0
        let totalProb = 0;
        for (let i = 1; i <= count; i++) {
            const prob = parseFloat(document.querySelector(`[data-type="arrival-prob"][data-index="${i}"]`).value);
            if (!isNaN(prob)) {
                totalProb += prob;
            }
        }
        
        const EPS = 0.001;
        if (Math.abs(totalProb - 1) > EPS) {
            alert(`Arrival probabilities sum to ${totalProb.toFixed(4)} (must be 1.0).`);
            return;
        }

        let cumulative = 0;
        let start = 1;

        for (let i = 1; i <= count; i++) {
            const interval = parseFloat(document.querySelector(`[data-type="arrival-interval"][data-index="${i}"]`).value);
            const prob = parseFloat(document.querySelector(`[data-type="arrival-prob"][data-index="${i}"]`).value);

            cumulative += prob;
            let end = Math.round(cumulative * maxRN);
            if (i === count) end = maxRN;

            document.querySelector(`[data-type="arrival-cumul"][data-index="${i}"]`).value =
                cumulative.toFixed(4);

            const startDisplay = start.toString().padStart(numDigits, '0');
            const endDisplay = (end === maxRN) ? '0'.repeat(numDigits) : end.toString().padStart(numDigits, '0');

            document.querySelector(`[data-type="arrival-digits"][data-index="${i}"]`).value =
                `${startDisplay} - ${endDisplay}`;

            this.arrivalData.push({
                interval,
                rangeStart: start,
                rangeEnd: end
            });

            start = end + 1;
        }
    },
    
    calculateServiceTable: function(serverNum) {
        this.serviceScale = Number(document.getElementById('multiServiceScale').value) || 10;
        const maxRN = this.serviceScale;
        const numDigits = maxRN.toString().length - 1;

        const count = document.querySelectorAll(`[data-type="service${serverNum}-prob"]`).length;
        const serviceData = [];

        // Validate probabilities sum to 1.0
        let totalProb = 0;
        for (let i = 1; i <= count; i++) {
            const prob = parseFloat(document.querySelector(`[data-type="service${serverNum}-prob"][data-index="${i}"]`).value);
            if (!isNaN(prob)) {
                totalProb += prob;
            }
        }
        
        const EPS = 0.001;
        if (Math.abs(totalProb - 1) > EPS) {
            alert(`Server ${serverNum === 1 ? 'A' : 'B'} service probabilities sum to ${totalProb.toFixed(4)} (must be 1.0).`);
            return;
        }

        let cumulative = 0;
        let start = 1;

        for (let i = 1; i <= count; i++) {
            const serviceTime = parseFloat(document.querySelector(`[data-type="service${serverNum}-time"][data-index="${i}"]`).value);
            const prob = parseFloat(document.querySelector(`[data-type="service${serverNum}-prob"][data-index="${i}"]`).value);

            cumulative += prob;
            let end = Math.round(cumulative * maxRN);
            if (i === count) end = maxRN;

            document.querySelector(`[data-type="service${serverNum}-cumul"][data-index="${i}"]`).value =
                cumulative.toFixed(4);

            const startDisplay = start.toString().padStart(numDigits, '0');
            const endDisplay = (end === maxRN) ? '0'.repeat(numDigits) : end.toString().padStart(numDigits, '0');

            document.querySelector(`[data-type="service${serverNum}-digits"][data-index="${i}"]`).value =
                `${startDisplay} - ${endDisplay}`;

            serviceData.push({
                serviceTime,
                rangeStart: start,
                rangeEnd: end
            });

            start = end + 1;
        }

        serverNum === 1 ? this.serviceData1 = serviceData : this.serviceData2 = serviceData;
    },
    goToStep2: function() {
        if (this.arrivalData.length === 0 || this.serviceData1.length === 0 || this.serviceData2.length === 0) {
            alert('Please calculate all tables first!');
            return;
        }
        
        document.getElementById('multiStep2').classList.remove('hidden');
    },
    
    generateSimulationTable: function() {
        if (!this.simulationMode) {
            alert('Please select a simulation mode');
            return;
        }
        
        const priorityCard = document.querySelector('[data-priority].selected');
        if (!priorityCard) {
            alert('Please select a server priority');
            return;
        }
        
        // Reset random number indices to start from beginning
        this.randomIndex = 0;
        this.randomIndex2 = 0;
        
        let customerCount;
        
        if (this.simulationMode === 'customers') {
            customerCount = parseInt(document.getElementById('multiCustomerCount').value);
            const maxCustomers = this.getMaxCustomers();
            
            if (!customerCount || customerCount < 1) {
                alert('Please enter a valid customer count');
                return;
            }
            
            if (customerCount > maxCustomers) {
                alert(`Number of customers cannot exceed ${maxCustomers}. This is limited by the number of random numbers generated (Set 1: ${this.randomNumbers.length}, Set 2: ${this.randomNumbers2.length}).`);
                return;
            }
        } else {
            // Time mode: we'll generate rows dynamically during simulation
            const endTime = parseFloat(document.getElementById('multiEndTime').value);
            if (!endTime || endTime <= 0) {
                alert('Please enter a valid end time');
                return;
            }
            
            // Start with just 1 customer, we'll add more during simulation
            customerCount = 1;
        }
        
        const tbody = document.getElementById('multiSimulationTableBody');
        tbody.innerHTML = '';
        
        for (let i = 1; i <= customerCount; i++) {
            const randomArrival = this.getNextRandom(1, i === 1);
            const randomService = this.getNextRandom(2);
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${i}</td>
                <td><input type="text" class="table-input" data-sim="rand-arrival" data-customer="${i}" value="${randomArrival}" ${i === 1 ? 'disabled' : ''}></td>
                <td><input type="text" class="table-input readonly" data-sim="interarrival" data-customer="${i}" readonly></td>
                <td><input type="text" class="table-input readonly" data-sim="clock-arrival" data-customer="${i}" readonly></td>
                <td><input type="text" class="table-input" data-sim="rand-service" data-customer="${i}" value="${randomService}"></td>
                <td><input type="text" class="table-input readonly" data-sim="service-begin-a" data-customer="${i}" readonly></td>
                <td><input type="text" class="table-input readonly" data-sim="service-time-a" data-customer="${i}" readonly></td>
                <td><input type="text" class="table-input readonly" data-sim="service-end-a" data-customer="${i}" readonly></td>
                <td><input type="text" class="table-input readonly" data-sim="service-begin-b" data-customer="${i}" readonly></td>
                <td><input type="text" class="table-input readonly" data-sim="service-time-b" data-customer="${i}" readonly></td>
                <td><input type="text" class="table-input readonly" data-sim="service-end-b" data-customer="${i}" readonly></td>
                <td><input type="text" class="table-input readonly" data-sim="wait-time" data-customer="${i}" readonly></td>
            `;
            tbody.appendChild(row);
        }
        
        document.getElementById('multiStep3').classList.remove('hidden');
    },
    
    findIntervalValue: function(randomNum, data) {
        const rn = Number(randomNum);
        if (isNaN(rn)) return 0;
        
        // Handle "00" or "000" etc. as maxRN (e.g., 100 for scale 100)
        const normalizedRN = (rn === 0 && data.length > 0) 
            ? data[data.length - 1].rangeEnd 
            : rn;
        
        for (let item of data) {
            if (normalizedRN >= item.rangeStart && normalizedRN <= item.rangeEnd) {
                return item.interval || item.serviceTime;
            }
        }
        return 0;
    },
    calculatePerformanceMeasures: function () {
    const rows = document.querySelectorAll('#multiSimulationTableBody tr');

    let totalServiceTimeA = 0;
    let totalServiceTimeB = 0;
    let totalWaitingTime = 0;
    let arrivals = 0;

    let simulationEndTime = 0;

    rows.forEach(row => {
        arrivals++;

        const serviceTimeA = parseFloat(row.querySelector('[data-sim="service-time-a"]').value);
        const serviceEndA  = parseFloat(row.querySelector('[data-sim="service-end-a"]').value);

        const serviceTimeB = parseFloat(row.querySelector('[data-sim="service-time-b"]').value);
        const serviceEndB  = parseFloat(row.querySelector('[data-sim="service-end-b"]').value);

        const waitTime = parseFloat(row.querySelector('[data-sim="wait-time"]').value);

        if (!isNaN(serviceTimeA)) totalServiceTimeA += serviceTimeA;
        if (!isNaN(serviceTimeB)) totalServiceTimeB += serviceTimeB;
        if (!isNaN(waitTime)) totalWaitingTime += waitTime;

        // determine simulation end time
        if (!isNaN(serviceEndA)) simulationEndTime = Math.max(simulationEndTime, serviceEndA);
        if (!isNaN(serviceEndB)) simulationEndTime = Math.max(simulationEndTime, serviceEndB);
    });

    const utilizationA = totalServiceTimeA / simulationEndTime;
    const utilizationB = totalServiceTimeB / simulationEndTime;
    const avgWaitingTime = totalWaitingTime / arrivals;

    return {
        utilizationA,
        utilizationB,
        avgWaitingTime,
        totalServiceTimeA,
        totalServiceTimeB,
        simulationEndTime,
        arrivals
    };
},

    
    runSimulation: function() {
        const priorityCard = document.querySelector('[data-priority].selected');
        const priority = priorityCard ? priorityCard.dataset.priority : 'A';
        
        let serverAEndTime = 0;
        let serverBEndTime = 0;
        let cumulativeArrival = 0;
        let endTime = null;
        let customerNumber = 1;
        
        if (this.simulationMode === 'time') {
            endTime = parseFloat(document.getElementById('multiEndTime').value);
        }
        
        const tbody = document.getElementById('multiSimulationTableBody');
        
        // Process first customer
        let row = tbody.querySelector(`tr:nth-child(${customerNumber})`);
        if (!row) return;
        
        document.querySelector(`[data-sim="interarrival"][data-customer="${customerNumber}"]`).value = '—';
        document.querySelector(`[data-sim="clock-arrival"][data-customer="${customerNumber}"]`).value = 0;
        
        const randService1 = parseInt(document.querySelector(`[data-sim="rand-service"][data-customer="${customerNumber}"]`).value);
        
        if (priority === 'A') {
            const serviceTime = this.findIntervalValue(randService1, this.serviceData1);
            document.querySelector(`[data-sim="service-begin-a"][data-customer="${customerNumber}"]`).value = 0;
            document.querySelector(`[data-sim="service-time-a"][data-customer="${customerNumber}"]`).value = serviceTime;
            document.querySelector(`[data-sim="service-end-a"][data-customer="${customerNumber}"]`).value = serviceTime;
            document.querySelector(`[data-sim="service-begin-b"][data-customer="${customerNumber}"]`).value = '—';
            document.querySelector(`[data-sim="service-time-b"][data-customer="${customerNumber}"]`).value = '—';
            document.querySelector(`[data-sim="service-end-b"][data-customer="${customerNumber}"]`).value = '—';
            document.querySelector(`[data-sim="wait-time"][data-customer="${customerNumber}"]`).value = 0;
            serverAEndTime = serviceTime;
        } else {
            const serviceTime = this.findIntervalValue(randService1, this.serviceData2);
            document.querySelector(`[data-sim="service-begin-a"][data-customer="${customerNumber}"]`).value = '—';
            document.querySelector(`[data-sim="service-time-a"][data-customer="${customerNumber}"]`).value = '—';
            document.querySelector(`[data-sim="service-end-a"][data-customer="${customerNumber}"]`).value = '—';
            document.querySelector(`[data-sim="service-begin-b"][data-customer="${customerNumber}"]`).value = 0;
            document.querySelector(`[data-sim="service-time-b"][data-customer="${customerNumber}"]`).value = serviceTime;
            document.querySelector(`[data-sim="service-end-b"][data-customer="${customerNumber}"]`).value = serviceTime;
            document.querySelector(`[data-sim="wait-time"][data-customer="${customerNumber}"]`).value = 0;
            serverBEndTime = serviceTime;
        }
        
        customerNumber++;
        
        // Process remaining customers
        while (true) {
            // Check if we need to add a new row (for time mode)
            row = tbody.querySelector(`tr:nth-child(${customerNumber})`);
            if (!row && this.simulationMode === 'time') {
                // Check if we have more random numbers available
                const hasMoreRandoms = this.randomMethod === 'manual' || 
                                      (this.randomIndex < this.randomNumbers.length && 
                                       this.randomIndex2 < this.randomNumbers2.length);
                
                if (!hasMoreRandoms && this.randomMethod === 'prng') {
                    // No more random numbers, stop here
                    break;
                }
                
                // Generate new random numbers
                const randomArrival = this.randomMethod === 'manual' ? '' : this.getNextRandom(1, false);
                const randomService = this.randomMethod === 'manual' ? '' : this.getNextRandom(2);
                
                const newRow = document.createElement('tr');
                newRow.innerHTML = `
                    <td>${customerNumber}</td>
                    <td><input type="text" class="table-input" data-sim="rand-arrival" data-customer="${customerNumber}" value="${randomArrival}"></td>
                    <td><input type="text" class="table-input readonly" data-sim="interarrival" data-customer="${customerNumber}" readonly></td>
                    <td><input type="text" class="table-input readonly" data-sim="clock-arrival" data-customer="${customerNumber}" readonly></td>
                    <td><input type="text" class="table-input" data-sim="rand-service" data-customer="${customerNumber}" value="${randomService}"></td>
                    <td><input type="text" class="table-input readonly" data-sim="service-begin-a" data-customer="${customerNumber}" readonly></td>
                    <td><input type="text" class="table-input readonly" data-sim="service-time-a" data-customer="${customerNumber}" readonly></td>
                    <td><input type="text" class="table-input readonly" data-sim="service-end-a" data-customer="${customerNumber}" readonly></td>
                    <td><input type="text" class="table-input readonly" data-sim="service-begin-b" data-customer="${customerNumber}" readonly></td>
                    <td><input type="text" class="table-input readonly" data-sim="service-time-b" data-customer="${customerNumber}" readonly></td>
                    <td><input type="text" class="table-input readonly" data-sim="service-end-b" data-customer="${customerNumber}" readonly></td>
                    <td><input type="text" class="table-input readonly" data-sim="wait-time" data-customer="${customerNumber}" readonly></td>
                `;
                tbody.appendChild(newRow);
                row = newRow;
            } else if (!row) {
                // No more rows and not in time mode, we're done
                break;
            }
            
            const randArrivalInput = document.querySelector(`[data-sim="rand-arrival"][data-customer="${customerNumber}"]`);
            const randServiceInput = document.querySelector(`[data-sim="rand-service"][data-customer="${customerNumber}"]`);
            
            if (!randArrivalInput || !randServiceInput) break;
            
            const randArrival = parseInt(randArrivalInput.value);
            const randService = parseInt(randServiceInput.value);
            
            if (isNaN(randArrival) || isNaN(randService)) {
                // Stop silently if no random numbers available
                break;
            }
            
            const interarrivalTime = this.findIntervalValue(randArrival, this.arrivalData);
            document.querySelector(`[data-sim="interarrival"][data-customer="${customerNumber}"]`).value = interarrivalTime;
            
            cumulativeArrival += interarrivalTime;
            document.querySelector(`[data-sim="clock-arrival"][data-customer="${customerNumber}"]`).value = cumulativeArrival;
            
            const arrivalTime = cumulativeArrival;
            const serverAFree = arrivalTime >= serverAEndTime;
            const serverBFree = arrivalTime >= serverBEndTime;
            
            let useServerA = false;
            
            if (serverAFree && serverBFree) {
                useServerA = (priority === 'A');
            } else if (serverAFree && !serverBFree) {
                useServerA = true;
            } else if (!serverAFree && serverBFree) {
                useServerA = false;
            } else {
                const waitTimeA = serverAEndTime - arrivalTime;
                const waitTimeB = serverBEndTime - arrivalTime;
                if (waitTimeA < waitTimeB) {
                    useServerA = true;
                } else if (waitTimeB < waitTimeA) {
                    useServerA = false;
                } else {
                    useServerA = (priority === 'A');
                }
            }
            
            if (useServerA) {
                const serviceBegin = Math.max(arrivalTime, serverAEndTime);
                const serviceTime = this.findIntervalValue(randService, this.serviceData1);
                const serviceEnd = serviceBegin + serviceTime;
                
                document.querySelector(`[data-sim="service-begin-a"][data-customer="${customerNumber}"]`).value = serviceBegin;
                document.querySelector(`[data-sim="service-time-a"][data-customer="${customerNumber}"]`).value = serviceTime;
                document.querySelector(`[data-sim="service-end-a"][data-customer="${customerNumber}"]`).value = serviceEnd;
                document.querySelector(`[data-sim="service-begin-b"][data-customer="${customerNumber}"]`).value = '—';
                document.querySelector(`[data-sim="service-time-b"][data-customer="${customerNumber}"]`).value = '—';
                document.querySelector(`[data-sim="service-end-b"][data-customer="${customerNumber}"]`).value = '—';
                document.querySelector(`[data-sim="wait-time"][data-customer="${customerNumber}"]`).value = serviceBegin - arrivalTime;
                
                serverAEndTime = serviceEnd;
            } else {
                const serviceBegin = Math.max(arrivalTime, serverBEndTime);
                const serviceTime = this.findIntervalValue(randService, this.serviceData2);
                const serviceEnd = serviceBegin + serviceTime;
                
                document.querySelector(`[data-sim="service-begin-a"][data-customer="${customerNumber}"]`).value = '—';
                document.querySelector(`[data-sim="service-time-a"][data-customer="${customerNumber}"]`).value = '—';
                document.querySelector(`[data-sim="service-end-a"][data-customer="${customerNumber}"]`).value = '—';
                document.querySelector(`[data-sim="service-begin-b"][data-customer="${customerNumber}"]`).value = serviceBegin;
                document.querySelector(`[data-sim="service-time-b"][data-customer="${customerNumber}"]`).value = serviceTime;
                document.querySelector(`[data-sim="service-end-b"][data-customer="${customerNumber}"]`).value = serviceEnd;
                document.querySelector(`[data-sim="wait-time"][data-customer="${customerNumber}"]`).value = serviceBegin - arrivalTime;
                
                serverBEndTime = serviceEnd;
            }
            
            // Check if we've reached the end time
            if (this.simulationMode === 'time') {
                const maxServiceEnd = Math.max(serverAEndTime, serverBEndTime);
                if (maxServiceEnd >= endTime) {
                    // We've reached or exceeded the end time, stop simulation
                    break;
                }
            }
            
            customerNumber++;
        }
        
        // Display summary for time mode
        if (this.simulationMode === 'time') {
            const summaryDiv = document.createElement('div');
            summaryDiv.className = 'mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg';
            summaryDiv.innerHTML = `
                <h4 class="font-semibold text-blue-900 mb-2">Simulation Summary</h4>
                <p class="text-sm text-blue-800">
                    <strong>Target End Time:</strong> ${endTime} time units<br>
                    <strong>Customers Served:</strong> ${customerNumber - 1} customers<br>
                    <strong>Actual Service Completion Time:</strong> ${Math.max(serverAEndTime, serverBEndTime).toFixed(2)} time units<br>
                    <strong>Last Arrival Time:</strong> ${cumulativeArrival.toFixed(2)} time units
                </p>
            `;
            
            const existingSummary = document.querySelector('.mt-4.p-4.bg-blue-50');
            if (existingSummary) existingSummary.remove();
            
            document.getElementById('multiStep3').appendChild(summaryDiv);
        }
        const stats = this.calculatePerformanceMeasures();

const resultsDiv = document.createElement('div');
resultsDiv.className = 'mt-4 p-4 bg-green-50 border border-green-200 rounded-lg';

resultsDiv.innerHTML = `
    <h4 class="font-semibold text-green-900 mb-2">Performance Measures</h4>
    <p class="text-sm text-green-800">
        <strong>Total Arrivals:</strong> ${stats.arrivals}<br>
        <strong>Simulation End Time:</strong> ${stats.simulationEndTime.toFixed(2)}<br><br>

        <strong>Server A Utilization:</strong> ${stats.utilizationA.toFixed(4)}<br>
        <strong>Server B Utilization:</strong> ${stats.utilizationB.toFixed(4)}<br><br>

        <strong>Average Waiting Time:</strong> ${stats.avgWaitingTime.toFixed(4)}
    </p>
`;

document.getElementById('multiStep3').appendChild(resultsDiv);

    }
};