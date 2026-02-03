const InventorySimulation = {
    container: null,
    randomMethod: null,
    randomNumbers: [],
    randomNumbers2: [],
    randomIndex: 0,
    randomIndex2: 0,
    demandScale: 100,
    leadTimeScale: 100,
    demandTable: [],
    leadTimeTable: [],
    simulationData: [],
    
    init: function(container, randomMethod, randomNumbers, randomNumbers2) {
        this.container = container;
        this.randomMethod = randomMethod;
        this.randomNumbers = randomNumbers || [];
        this.randomNumbers2 = randomNumbers2 || [];
        this.randomIndex = 0;
        this.randomIndex2 = 0;
        this.simulationData = [];
        this.demandScale = 100;
        this.leadTimeScale = 100;
        this.demandTable = [];
        this.leadTimeTable = [];
        this.setupUI();
        this.attachEventListeners();
    },
    
    getNextRandom: function(setNum = 1) {
        if (this.randomMethod === 'manual') {
            return '';
        }
        
        if (setNum === 1) {
            if (this.randomIndex >= this.randomNumbers.length) {
                const scale = this.demandScale || 100;
                return Math.floor(Math.random() * scale);
            }
            return this.randomNumbers[this.randomIndex++];
        } else {
            if (this.randomIndex2 >= this.randomNumbers2.length) {
                const scale = this.leadTimeScale || 100;
                return Math.floor(Math.random() * scale);
            }
            return this.randomNumbers2[this.randomIndex2++];
        }
    },
    
    setupUI: function() {
        this.container.innerHTML = `
            <div>
                <h1 class="text-4xl font-bold mb-2" style="color: #667eea;">Inventory Simulation</h1>
                <p class="text-gray-600 mb-6">(M,N) Periodic Review System</p>
                
                <div id="invSetupScreen">
                    <div class="mb-6">
                        <h2 class="text-2xl font-semibold mb-4" style="color: #667eea;">Scale Settings</h2>
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <h3 class="text-sm font-semibold mb-2">Demand Scale:</h3>
                                <select id="invDemandScale" class="prng-input">
                                    <option value="10">10</option>
                                    <option value="100" selected>100</option>
                                    <option value="1000">1000</option>
                                </select>
                            </div>
                            <div>
                                <h3 class="text-sm font-semibold mb-2">Lead Time Scale:</h3>
                                <select id="invLeadTimeScale" class="prng-input">
                                    <option value="10">10</option>
                                    <option value="100" selected>100</option>
                                    <option value="1000">1000</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    
                    <div class="mb-6">
                        <h2 class="text-2xl font-semibold mb-4" style="color: #667eea;">System Parameters</h2>
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <h3 class="text-sm font-semibold mb-2">M (Standard Inventory):</h3>
                                <input type="number" id="invParamM" min="1" class="prng-input">
                            </div>
                            <div>
                                <h3 class="text-sm font-semibold mb-2">N (Review Period):</h3>
                                <input type="number" id="invParamN" min="1" class="prng-input">
                            </div>
                            <div>
                                <h3 class="text-sm font-semibold mb-2">Number of Cycles:</h3>
                                <input type="number" id="invParamCycles" min="1" class="prng-input">
                            </div>
                            <div>
                                <h3 class="text-sm font-semibold mb-2">Initial Inventory:</h3>
                                <input type="number" id="invParamInitialInventory" min="0" class="prng-input">
                            </div>
                            <div>
                                <h3 class="text-sm font-semibold mb-2">Initial Order Quantity:</h3>
                                <input type="number" id="invParamInitialOrderQty" min="0" class="prng-input">
                            </div>
                            <div>
                                <h3 class="text-sm font-semibold mb-2">Initial Order Arrives in (days):</h3>
                                <input type="number" id="invParamInitialOrderDays" min="0" class="prng-input">
                            </div>
                        </div>
                    </div>
                    
                    <div class="mb-6">
                        <h2 class="text-2xl font-semibold mb-3" style="color: #667eea;">Demand Distribution</h2>
                        <div class="mb-4">
                            <h3 class="text-sm font-semibold mb-2">How many demand levels?</h3>
                            <input type="number" id="demandCount" min="1" max="100" class="prng-input">
                        </div>
                        <button id="generateDemandTableBtn" class="btn-primary mb-4">Generate Demand Table</button>
                        
                        <div id="demandTableContainer" class="hidden">
                            <div class="table-wrapper">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Demand</th>
                                            <th>Probability</th>
                                            <th>Cumulative</th>
                                            <th>Random Range</th>
                                        </tr>
                                    </thead>
                                    <tbody id="invDemandTableBody"></tbody>
                                </table>
                            </div>
                            <button id="calcDemandBtn" class="btn-success mt-3">Calculate Cumulative & Random Digits</button>
                        </div>
                    </div>
                    
                    <div class="mb-6">
                        <h2 class="text-2xl font-semibold mb-3" style="color: #667eea;">Lead Time Distribution</h2>
                        <div class="mb-4">
                            <h3 class="text-sm font-semibold mb-2">How many lead time levels?</h3>
                            <input type="number" id="leadTimeCount" min="1" max="100" class="prng-input">
                        </div>
                        <button id="generateLeadTimeTableBtn" class="btn-primary mb-4">Generate Lead Time Table</button>
                        
                        <div id="leadTimeTableContainer" class="hidden">
                            <div class="table-wrapper">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Lead Time (days)</th>
                                            <th>Probability</th>
                                            <th>Cumulative</th>
                                            <th>Random Range</th>
                                        </tr>
                                    </thead>
                                    <tbody id="invLeadTimeTableBody"></tbody>
                                </table>
                            </div>
                            <button id="calcLeadTimeBtn" class="btn-success mt-3">Calculate Cumulative & Random Digits</button>
                        </div>
                    </div>
                    
                    <button id="invStartBtn" class="btn-primary">▶ Start Simulation</button>
                </div>
                
                <div id="invSimulationScreen" class="hidden mt-8">
                    <hr class="my-6 border-t-2 border-gray-300">
                    <div class="table-wrapper">
                        <h2 class="text-2xl font-semibold mb-4" style="color: #667eea;">Simulation Table</h2>
                        <div class="mb-2 text-sm text-green-700">💡 Green rows indicate order arrival days</div>
                        <table>
                            <thead>
                                <tr>
                                    <th>Cycle</th>
                                    <th>Day</th>
                                    <th>Beginning Inv.</th>
                                    <th>Random Digits for Demand</th>
                                    <th>Demand</th>
                                    <th>Ending Inventory</th>
                                    <th>Shortage</th>
                                    <th>Order Quantity</th>
                                    <th>Random Digits for Lead Time</th>
                                    <th>Days until Order Arrives</th>
                                </tr>
                            </thead>
                            <tbody id="invSimulationTableBody"></tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    },
    
    attachEventListeners: function() {
        const self = this;
        
        document.getElementById('generateDemandTableBtn').addEventListener('click', () => self.generateDemandTable());
        document.getElementById('generateLeadTimeTableBtn').addEventListener('click', () => self.generateLeadTimeTable());
        document.getElementById('calcDemandBtn').addEventListener('click', () => self.calculateDemandRanges());
        document.getElementById('calcLeadTimeBtn').addEventListener('click', () => self.calculateLeadTimeRanges());
        document.getElementById('invStartBtn').addEventListener('click', () => self.startSimulation());
    },
    
    calculateRanges: function(table, scale) {
        const maxRN = scale;
        const numDigits = maxRN.toString().length - 1;
        let cum = 0;
        let start = 1;
        
        return table.map((row, idx) => {
            const p = Number(row.probability) || 0;
            cum += p;
            let end = Math.round(cum * maxRN);
            
            // Last row ends at "00" (which represents maxRN)
            if (idx === table.length - 1) {
                end = maxRN;
            }
            
            const startDisplay = start.toString().padStart(numDigits, '0');
            const endDisplay = (end === maxRN) ? '0'.repeat(numDigits) : end.toString().padStart(numDigits, '0');
            
            const rangeObj = {
                ...row,
                probability: p,
                cumulative: cum.toFixed(4),
                randomRange: `${startDisplay} - ${endDisplay}`,
                rangeStart: start,
                rangeEnd: end
            };
            
            // Next row starts at end + 1
            start = end + 1;
            
            return rangeObj;
        });
    },
    
    mapRandomToValue: function(randomDigit, tableWithRanges) {
        const rn = Number(randomDigit);
        if (isNaN(rn)) return null;
        
        // Handle "00" as maxRN (e.g., 100 for scale 100)
        const normalizedRN = (rn === 0 && tableWithRanges.length > 0) 
            ? tableWithRanges[tableWithRanges.length - 1].rangeEnd 
            : rn;
        
        for (const row of tableWithRanges) {
            if (normalizedRN >= row.rangeStart && normalizedRN <= row.rangeEnd) {
                return row;
            }
        }
        return null;
    },
    
    generateDemandTable: function() {
        const count = parseInt(document.getElementById('demandCount').value);
        if (!count || count < 1 || count > 100) {
            alert('Please enter a valid count between 1 and 100');
            return;
        }
        
        this.demandTable = [];
        const tbody = document.getElementById('invDemandTableBody');
        tbody.innerHTML = '';
        
        for (let i = 0; i < count; i++) {
            this.demandTable.push({ demand: '', probability: '' });
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><input type="number" class="table-input" data-demand-value="${i}"></td>
                <td><input type="number" step="0.01" class="table-input" data-demand-prob="${i}"></td>
                <td class="text-center readonly-cell"></td>
                <td class="text-center readonly-cell" style="font-family: monospace;"></td>
            `;
            tbody.appendChild(row);
        }
        
        document.getElementById('demandTableContainer').classList.remove('hidden');
        this.attachDemandListeners();
    },
    
    generateLeadTimeTable: function() {
        const count = parseInt(document.getElementById('leadTimeCount').value);
        if (!count || count < 1 || count > 100) {
            alert('Please enter a valid count between 1 and 100');
            return;
        }
        
        this.leadTimeTable = [];
        const tbody = document.getElementById('invLeadTimeTableBody');
        tbody.innerHTML = '';
        
        for (let i = 0; i < count; i++) {
            this.leadTimeTable.push({ leadTime: '', probability: '' });
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><input type="number" class="table-input" data-leadtime-value="${i}"></td>
                <td><input type="number" step="0.01" class="table-input" data-leadtime-prob="${i}"></td>
                <td class="text-center readonly-cell"></td>
                <td class="text-center readonly-cell" style="font-family: monospace;"></td>
            `;
            tbody.appendChild(row);
        }
        
        document.getElementById('leadTimeTableContainer').classList.remove('hidden');
        this.attachLeadTimeListeners();
    },
    
    attachDemandListeners: function() {
        document.querySelectorAll('[data-demand-value]').forEach(input => {
            input.addEventListener('change', (e) => {
                const idx = parseInt(e.target.dataset.demandValue);
                this.demandTable[idx].demand = parseInt(e.target.value, 10) || 0;
            });
        });
        
        document.querySelectorAll('[data-demand-prob]').forEach(input => {
            input.addEventListener('change', (e) => {
                const idx = parseInt(e.target.dataset.demandProb);
                this.demandTable[idx].probability = parseFloat(e.target.value) || 0;
            });
        });
    },
    
    attachLeadTimeListeners: function() {
        document.querySelectorAll('[data-leadtime-value]').forEach(input => {
            input.addEventListener('change', (e) => {
                const idx = parseInt(e.target.dataset.leadtimeValue);
                this.leadTimeTable[idx].leadTime = parseInt(e.target.value, 10) || 0;
            });
        });
        
        document.querySelectorAll('[data-leadtime-prob]').forEach(input => {
            input.addEventListener('change', (e) => {
                const idx = parseInt(e.target.dataset.leadtimeProb);
                this.leadTimeTable[idx].probability = parseFloat(e.target.value) || 0;
            });
        });
    },
    
calculateDemandRanges: function() {
        this.randomIndex = 0;
        this.demandScale = Number(document.getElementById('invDemandScale').value) || 100;
        
        // Validate probabilities sum to 1.0
        let totalProb = 0;
        for (let row of this.demandTable) {
            totalProb += Number(row.probability) || 0;
        }
        
        const EPS = 0.001;
        if (Math.abs(totalProb - 1) > EPS) {
            alert(`Demand probabilities sum to ${totalProb.toFixed(4)} (must be 1.0).`);
            return;
        }
        
        const withRanges = this.calculateRanges(this.demandTable, this.demandScale);
        const tbody = document.getElementById('invDemandTableBody');
        const rows = tbody.querySelectorAll('tr');
        
        withRanges.forEach((row, idx) => {
            if (rows[idx]) {
                const cells = rows[idx].querySelectorAll('td');
                cells[2].textContent = row.cumulative;
                cells[3].textContent = row.randomRange;
            }
        });
        
        this.demandTable = withRanges;
    },
    
    calculateLeadTimeRanges: function() {
        this.randomIndex2 = 0;
        this.leadTimeScale = Number(document.getElementById('invLeadTimeScale').value) || 100;
        
        // Validate probabilities sum to 1.0
        let totalProb = 0;
        for (let row of this.leadTimeTable) {
            totalProb += Number(row.probability) || 0;
        }
        
        const EPS = 0.001;
        if (Math.abs(totalProb - 1) > EPS) {
            alert(`Lead time probabilities sum to ${totalProb.toFixed(4)} (must be 1.0).`);
            return;
        }
        
        const withRanges = this.calculateRanges(this.leadTimeTable, this.leadTimeScale);
        const tbody = document.getElementById('invLeadTimeTableBody');
        const rows = tbody.querySelectorAll('tr');
        
        withRanges.forEach((row, idx) => {
            if (rows[idx]) {
                const cells = rows[idx].querySelectorAll('td');
                cells[2].textContent = row.cumulative;
                cells[3].textContent = row.randomRange;
            }
        });
        
        this.leadTimeTable = withRanges;
    },
    
    startSimulation: function() {
        const M = parseInt(document.getElementById('invParamM').value, 10) || 0;
        const N = parseInt(document.getElementById('invParamN').value, 10) || 0;
        const cycles = parseInt(document.getElementById('invParamCycles').value, 10) || 0;
        const initialInventory = parseInt(document.getElementById('invParamInitialInventory').value, 10) || 0;
        const initialOrderQty = parseInt(document.getElementById('invParamInitialOrderQty').value, 10) || 0;
        const initialOrderDays = parseInt(document.getElementById('invParamInitialOrderDays').value, 10) || 0;
        
        if (M <= 0 || N <= 0 || cycles <= 0) {
            alert('M, N, and Number of Cycles must be positive');
            return;
        }
        
        this.randomIndex = 0;
        this.randomIndex2 = 0;
        
        const totalDays = cycles * N;
        this.simulationData = [];
        
        for (let dayIndex = 0; dayIndex < totalDays; dayIndex++) {
            const cycle = Math.floor(dayIndex / N) + 1;
            const dayInCycle = (dayIndex % N) + 1;
            this.simulationData.push({
                cycle,
                day: dayInCycle,
                beginningInventory: dayIndex === 0 ? initialInventory : null,
                randomDemand: this.getNextRandom(1),
                demand: null,
                endingInventory: null,
                dailyShortage: 0,
                cumulativeShortage: 0,
                shortage: 0,
                orderQuantity: null,
                randomLeadTime: '',
                daysUntilOrder: '',
                pendingOrderQty: 0,
                orderArrivalDay: false,
                M, N
            });
        }
        
        if (initialOrderQty > 0 && initialOrderDays > 0) {
            const arrivalIdx = initialOrderDays;
            for (let i = 0; i < this.simulationData.length; i++) {
                if (i < arrivalIdx) {
                    this.simulationData[i].daysUntilOrder = (arrivalIdx - i - 1);
                }
            }
            if (arrivalIdx < this.simulationData.length) {
                this.simulationData[arrivalIdx].orderArrivalDay = true;
                this.simulationData[arrivalIdx].pendingOrderQty = initialOrderQty;
            }
        }
        
        this.processAllDemands();
        
        document.getElementById('invSimulationScreen').classList.remove('hidden');
        this.renderSimulationTable();
        
        setTimeout(() => {
            document.getElementById('invSimulationScreen').scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
    },
    
    processAllDemands: function() {
        for (let i = 0; i < this.simulationData.length; i++) {
            const rd = this.simulationData[i].randomDemand;
            if (rd === '' || rd === null) continue;
            
            const matched = this.mapRandomToValue(rd, this.demandTable);
            if (!matched) continue;
            
            this.simulationData[i].demand = matched.demand;
            
            let beginInv = (i === 0) ? this.simulationData[0].beginningInventory : 
                                       (this.simulationData[i - 1].endingInventory || 0);
            
            const prevCumul = (i === 0) ? 0 : (this.simulationData[i - 1].cumulativeShortage || 0);
            this.simulationData[i].cumulativeShortage = prevCumul;
            
            if (this.simulationData[i].orderArrivalDay && this.simulationData[i].pendingOrderQty) {
                let pending = this.simulationData[i].pendingOrderQty;
                if (this.simulationData[i].cumulativeShortage > 0) {
                    const needed = this.simulationData[i].cumulativeShortage;
                    if (pending >= needed) {
                        pending -= needed;
                        this.simulationData[i].cumulativeShortage = 0;
                    } else {
                        this.simulationData[i].cumulativeShortage -= pending;
                        pending = 0;
                    }
                }
                if (pending > 0) beginInv += pending;
                this.simulationData[i].pendingOrderQty = 0;
                this.simulationData[i].orderArrivalDay = false;
            }
            
            let endInv = beginInv - this.simulationData[i].demand;
            let dailyShortage = 0;
            if (endInv < 0) {
                dailyShortage = Math.abs(endInv);
                endInv = 0;
            }
            
            const cumul = (this.simulationData[i].cumulativeShortage || 0) + dailyShortage;
            
            this.simulationData[i].beginningInventory = beginInv;
            this.simulationData[i].endingInventory = endInv;
            this.simulationData[i].dailyShortage = dailyShortage;
            this.simulationData[i].cumulativeShortage = cumul;
            // Display cumulative shortage in shortage column
            this.simulationData[i].shortage = cumul;
            
            if (this.simulationData[i].day === this.simulationData[i].N) {
                this.simulationData[i].orderQuantity = this.simulationData[i].M - endInv + cumul;
                this.simulationData[i].randomLeadTime = this.getNextRandom(2);
                
                if (this.simulationData[i].randomLeadTime !== '') {
                    const matchedLead = this.mapRandomToValue(this.simulationData[i].randomLeadTime, this.leadTimeTable);
                    if (matchedLead) {
                        const leadDays = Number(matchedLead.leadTime) || 0;
                        
                        // Set the lead time for the current row (where order was placed)
                        this.simulationData[i].daysUntilOrder = leadDays;
                        
                        let countdown = leadDays - 1;
                        let j = i + 1;
                        
                        while (j < this.simulationData.length && countdown >= 0) {
                            this.simulationData[j].daysUntilOrder = countdown;
                            if (countdown === 0) {
                                const arrivalIdx = j + 1;
                                if (arrivalIdx < this.simulationData.length) {
                                    this.simulationData[arrivalIdx].orderArrivalDay = true;
                                    this.simulationData[arrivalIdx].pendingOrderQty = this.simulationData[i].orderQuantity || 0;
                                }
                            }
                            j++;
                            countdown--;
                        }
                    }
                }
            }
            
            if (i + 1 < this.simulationData.length) {
                this.simulationData[i + 1].beginningInventory = this.simulationData[i].endingInventory;
                this.simulationData[i + 1].cumulativeShortage = this.simulationData[i].cumulativeShortage;
            }
        }
    },
    
    renderSimulationTable: function() {
        const tbody = document.getElementById('invSimulationTableBody');
        tbody.innerHTML = this.simulationData.map((row, idx) => {
            const leadInput = (row.orderQuantity !== null && this.randomMethod === 'manual')
                ? `<input maxlength="4" value="${row.randomLeadTime}" class="table-input" data-inv-leadtime="${idx}">`
                : (row.randomLeadTime || '-');
            
            const demandInput = (this.randomMethod === 'manual')
                ? `<input maxlength="4" value="${row.randomDemand}" class="table-input" data-inv-demand="${idx}">`
                : row.randomDemand;
            
            return `
                <tr class="${row.orderArrivalDay ? 'order-arrival' : ''}">
                    <td>${row.cycle}</td>
                    <td>${row.day}</td>
                    <td>${row.beginningInventory ?? ''}</td>
                    <td>${demandInput}</td>
                    <td>${row.demand ?? ''}</td>
                    <td>${row.endingInventory ?? ''}</td>
                    <td>${row.shortage || ''}</td>
                    <td>${row.orderQuantity ?? ''}</td>
                    <td>${leadInput}</td>
                    <td>${(typeof row.daysUntilOrder === 'number') ? row.daysUntilOrder : (row.daysUntilOrder ?? '')}</td>
                </tr>
            `;
        }).join('');
        
        // Attach event listeners for manual mode
        if (this.randomMethod === 'manual') {
            document.querySelectorAll('[data-inv-demand]').forEach(input => {
                input.addEventListener('change', (e) => {
                    const idx = parseInt(e.target.dataset.invDemand);
                    this.onRandomDemand(idx, e.target.value);
                });
            });
            
            document.querySelectorAll('[data-inv-leadtime]').forEach(input => {
                input.addEventListener('change', (e) => {
                    const idx = parseInt(e.target.dataset.invLeadtime);
                    this.onRandomLeadTime(idx, e.target.value);
                });
            });
        }
        
        // Calculate statistics
        this.displayStatistics();
    },
    
    onRandomDemand: function(index, value) {
        const numStr = String(value).padStart(this.demandScale.toString().length - 1, '0');
        if (value === '') {
            this.simulationData[index].randomDemand = '';
            this.simulationData[index].demand = null;
            this.renderSimulationTable();
            return;
        }
        
        const rn = Number(value);
        if (isNaN(rn) || rn < 0 || rn >= this.demandScale) {
            alert(`Enter a valid random number (0-${this.demandScale - 1}) for Random Demand`);
            this.renderSimulationTable();
            return;
        }
        
        this.simulationData[index].randomDemand = value;
        const matched = this.mapRandomToValue(rn, this.demandTable);
        if (!matched) {
            this.simulationData[index].demand = null;
            this.renderSimulationTable();
            return;
        }
        this.simulationData[index].demand = matched.demand;
        
        let beginInv = (this.simulationData[index].beginningInventory !== null) ? 
                       this.simulationData[index].beginningInventory :
                       (index === 0 ? 0 : (this.simulationData[index - 1].endingInventory || 0));
        
        if (this.simulationData[index].orderArrivalDay && this.simulationData[index].pendingOrderQty) {
            let pending = this.simulationData[index].pendingOrderQty;
            
            if (this.simulationData[index].cumulativeShortage > 0) {
                const needed = this.simulationData[index].cumulativeShortage;
                if (pending >= needed) {
                    pending -= needed;
                    this.simulationData[index].cumulativeShortage = 0;
                } else {
                    this.simulationData[index].cumulativeShortage -= pending;
                    pending = 0;
                }
            }
            
            if (pending > 0) {
                beginInv += pending;
            }
            
            this.simulationData[index].pendingOrderQty = 0;
            this.simulationData[index].orderArrivalDay = false;
        }
        
        let endInv = beginInv - this.simulationData[index].demand;
        let dailyShortage = 0;
        if (endInv < 0) {
            dailyShortage = Math.abs(endInv);
            endInv = 0;
        }
        
        const prevBacklog = this.simulationData[index].cumulativeShortage || 0;
        const newCumul = prevBacklog + dailyShortage;
        
        this.simulationData[index].beginningInventory = beginInv;
        this.simulationData[index].endingInventory = endInv;
        this.simulationData[index].dailyShortage = dailyShortage;
        this.simulationData[index].cumulativeShortage = newCumul;
        // Display cumulative shortage in shortage column
        this.simulationData[index].shortage = newCumul;
        
        if (this.simulationData[index].day === this.simulationData[index].N) {
            const orderQty = this.simulationData[index].M - endInv + this.simulationData[index].cumulativeShortage;
            this.simulationData[index].orderQuantity = orderQty;
        }
        
        if (index + 1 < this.simulationData.length) {
            this.simulationData[index + 1].beginningInventory = this.simulationData[index].endingInventory;
            this.simulationData[index + 1].cumulativeShortage = this.simulationData[index].cumulativeShortage;
            this.simulationData[index + 1].shortage = this.simulationData[index + 1].dailyShortage || 0;
        }
        
        this.renderSimulationTable();
    },
    
    onRandomLeadTime: function(index, value) {
        if (value === '') {
            this.simulationData[index].randomLeadTime = '';
            this.renderSimulationTable();
            return;
        }
        
        const rn = Number(value);
        if (isNaN(rn) || rn < 0 || rn >= this.leadTimeScale) {
            alert(`Enter a valid random number (0-${this.leadTimeScale - 1}) for Random Lead Time`);
            this.renderSimulationTable();
            return;
        }
        
        this.simulationData[index].randomLeadTime = value;
        const matched = this.mapRandomToValue(rn, this.leadTimeTable);
        if (!matched) {
            this.renderSimulationTable();
            return;
        }
        const leadDays = Number(matched.leadTime) || 0;
        
        // Set the lead time for the current row (where order was placed)
        this.simulationData[index].daysUntilOrder = leadDays;
        
        let countdown = leadDays - 1;
        let j = index + 1;
        
        while (j < this.simulationData.length && countdown >= 0) {
            this.simulationData[j].daysUntilOrder = countdown;
            
            if (countdown === 0) {
                const arrivalIdx = j + 1;
                if (arrivalIdx < this.simulationData.length) {
                    this.simulationData[arrivalIdx].orderArrivalDay = true;
                    this.simulationData[arrivalIdx].pendingOrderQty = this.simulationData[index].orderQuantity || 0;
                }
            }
            
            j++;
            countdown--;
        }
        
        const recalcStart = index + 1;
        this.recalculateFromDay(recalcStart);
        
        this.renderSimulationTable();
    },
    
    recalculateFromDay: function(startIndex) {
        for (let i = startIndex; i < this.simulationData.length; i++) {
            const rd = this.simulationData[i].randomDemand;
            if (!rd) {
                if (i === 0) continue;
                this.simulationData[i].beginningInventory = this.simulationData[i - 1].endingInventory ?? this.simulationData[i].beginningInventory;
                this.simulationData[i].cumulativeShortage = this.simulationData[i - 1].cumulativeShortage ?? this.simulationData[i].cumulativeShortage;
                this.simulationData[i].shortage = this.simulationData[i].dailyShortage || 0;
                continue;
            }
            
            const rn = Number(rd);
            const matched = this.mapRandomToValue(rn, this.demandTable);
            if (!matched) continue;
            
            let beginInv = (i === 0) ? (this.simulationData[0].beginningInventory ?? 0) : (this.simulationData[i - 1].endingInventory ?? 0);
            
            const prevCumul = (i === 0) ? 0 : (this.simulationData[i - 1].cumulativeShortage || 0);
            this.simulationData[i].cumulativeShortage = prevCumul;
            this.simulationData[i].shortage = this.simulationData[i].dailyShortage || 0;
            
            if (this.simulationData[i].orderArrivalDay && this.simulationData[i].pendingOrderQty) {
                let pending = this.simulationData[i].pendingOrderQty;
                if (this.simulationData[i].cumulativeShortage > 0) {
                    const needed = this.simulationData[i].cumulativeShortage;
                    if (pending >= needed) {
                        pending -= needed;
                        this.simulationData[i].cumulativeShortage = 0;
                    } else {
                        this.simulationData[i].cumulativeShortage -= pending;
                        pending = 0;
                    }
                }
                if (pending > 0) {
                    beginInv += pending;
                }
                this.simulationData[i].pendingOrderQty = 0;
                this.simulationData[i].orderArrivalDay = false;
            }
            
            let endInv = beginInv - matched.demand;
            let dailyShortage = 0;
            if (endInv < 0) {
                dailyShortage = Math.abs(endInv);
                endInv = 0;
            }
            
            const cumul = (this.simulationData[i].cumulativeShortage || 0) + dailyShortage;
            
            this.simulationData[i].beginningInventory = beginInv;
            this.simulationData[i].demand = matched.demand;
            this.simulationData[i].endingInventory = endInv;
            this.simulationData[i].dailyShortage = dailyShortage;
            this.simulationData[i].cumulativeShortage = cumul;
            // Display cumulative shortage in shortage column
            this.simulationData[i].shortage = cumul;
            
            if (this.simulationData[i].day === this.simulationData[i].N) {
                this.simulationData[i].orderQuantity = this.simulationData[i].M - endInv + this.simulationData[i].cumulativeShortage;
            }
            
            if (i + 1 < this.simulationData.length) {
                this.simulationData[i + 1].beginningInventory = this.simulationData[i].endingInventory;
                this.simulationData[i + 1].cumulativeShortage = this.simulationData[i].cumulativeShortage;
                this.simulationData[i + 1].shortage = this.simulationData[i + 1].dailyShortage || 0;
            }
        }
    },
    
    displayStatistics: function() {
        const totalDays = this.simulationData.length;
        const cycles = this.simulationData[this.simulationData.length - 1]?.cycle || 0;
        
        // Calculate sum of ending inventory
        let sumEndingInventory = 0;
        let shortageCount = 0;
        
        this.simulationData.forEach(row => {
            if (row.endingInventory !== null && row.endingInventory !== undefined) {
                sumEndingInventory += row.endingInventory;
            }
            if (row.shortage > 0) {
                shortageCount++;
            }
        });
        
        const avgEndingInventory = totalDays > 0 ? (sumEndingInventory / totalDays).toFixed(2) : 0;
        
        // Create statistics display
        const statsDiv = document.createElement('div');
        statsDiv.className = 'mt-6 p-6 bg-blue-50 border border-blue-200 rounded-lg';
        statsDiv.innerHTML = `
            <h3 class="text-xl font-semibold mb-4" style="color: #667eea;">Simulation Statistics</h3>
            <div class="space-y-3">
                <p class="text-gray-800">
                    <strong>Based on ${cycles} cycles of simulation:</strong>
                </p>
                <p class="text-gray-800 ml-4">
                    • The average ending inventory is approximately <strong class="text-blue-700">${avgEndingInventory}</strong> units 
                    <span class="text-sm text-gray-600">(${sumEndingInventory} / ${totalDays})</span>
                </p>
                <p class="text-gray-800 ml-4">
                    • Shortage condition existed on <strong class="text-red-700">${shortageCount}</strong> of ${totalDays} days
                </p>
            </div>
        `;
        
        // Remove existing statistics if present
        const existingStats = document.querySelector('.mt-6.p-6.bg-blue-50');
        if (existingStats) {
            existingStats.remove();
        }
        
        // Append statistics after the table
        document.getElementById('invSimulationScreen').appendChild(statsDiv);
    }
};