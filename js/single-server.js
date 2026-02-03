const SingleServerQueue = {
    container: null,
    randomMethod: null,
    randomNumbers: [],
    randomNumbers2: [],
    randomIndex: 0,
    randomIndex2: 0,
    
    interIntervals: null,
    servIntervals: null,
    interMappedTimes: [],
    servMappedTimes: [],
    interRNValues: [],
    servRNValues: [],
    interScale: 100,
    servScale: 100,
    customersCount: 0,
    
    init: function(container, randomMethod, randomNumbers, randomNumbers2) {
        this.container = container;
        this.randomMethod = randomMethod;
        this.randomNumbers = randomNumbers || [];
        this.randomNumbers2 = randomNumbers2 || [];
        this.randomIndex = 0;
        this.randomIndex2 = 0;
        
        this.interIntervals = null;
        this.servIntervals = null;
        this.interMappedTimes = [];
        this.servMappedTimes = [];
        this.interRNValues = [];
        this.servRNValues = [];
        this.interScale = 100;
        this.servScale = 100;
        this.customersCount = 0;
        
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
    
    getNextRandom: function(setNum = 1) {
        if (this.randomMethod === 'manual') {
            return '';
        }
        
        if (setNum === 1) {
            if (this.randomIndex >= this.randomNumbers.length) {
                return Math.floor(Math.random() * 99) + 1;
            }
            return this.randomNumbers[this.randomIndex++];
        } else {
            if (this.randomIndex2 >= this.randomNumbers2.length) {
                return Math.floor(Math.random() * 99) + 1;
            }
            return this.randomNumbers2[this.randomIndex2++];
        }
    },
    
    setupUI: function() {
        const maxCustomers = this.getMaxCustomers();
        const customerInputHtml = this.randomMethod === 'prng' 
            ? `<input type="number" id="singleCustomers" min="1" max="${maxCustomers}" class="prng-input">
               <p class="text-sm text-gray-600 mt-1">Maximum ${maxCustomers} customers (limited by generated random numbers)</p>`
            : `<input type="number" id="singleCustomers" min="1" max="100" class="prng-input">`;
        
        this.container.innerHTML = `
            <div>
                <h2 class="text-3xl font-bold mb-4" style="color: #667eea;">Single Server Queue Simulation</h2>
                
                <div id="singleStep1">
                    <div class="mb-4">
                        <h3 class="text-sm font-semibold mb-2">Number of Customers:</h3>
                        ${customerInputHtml}
                    </div>
                    
                    <div class="grid grid-cols-2 gap-4 mb-6">
                        <div>
                            <h3 class="text-sm font-semibold mb-2">Interarrival Scale:</h3>
                            <select id="intervalScaleInter" class="prng-input">
                                <option value="1">1</option>
                                <option value="10">10</option>
                                <option value="100" selected>100</option>
                                <option value="1000">1000</option>
                            </select>
                        </div>
                        <div>
                            <h3 class="text-sm font-semibold mb-2">Service Scale:</h3>
                            <select id="intervalScaleServ" class="prng-input">
                                <option value="1">1</option>
                                <option value="10">10</option>
                                <option value="100" selected>100</option>
                                <option value="1000">1000</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="mb-6">
                        <h3 class="text-xl font-semibold mb-3" style="color: #667eea;">Interarrival Time Distribution</h3>
                        <div class="mb-4">
                            <h3 class="text-sm font-semibold mb-2">How many interarrival intervals?</h3>
                            <input type="number" id="interCount" min="1" max="100" class="prng-input">
                        </div>
                        <button id="generateInterTableBtn" class="btn-primary mb-4">Generate Interarrival Table</button>
                        
                        <div id="interTableContainer" class="hidden">
                            <div class="table-wrapper">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Interarrival Time</th>
                                            <th>Probability</th>
                                            <th>Cumulative Probability</th>
                                            <th>Random Digits</th>
                                        </tr>
                                    </thead>
                                    <tbody id="interTableBody"></tbody>
                                </table>
                            </div>
                            <button id="computeInterBtn" class="btn-success mt-3">Calculate Cumulative & Random Digits</button>
                            <div id="interRandoms" class="mt-4"></div>
                        </div>
                    </div>
                    
                    <div class="mb-6">
                        <h3 class="text-xl font-semibold mb-3" style="color: #667eea;">Service Time Distribution</h3>
                        <div class="mb-4">
                            <h3 class="text-sm font-semibold mb-2">How many service times?</h3>
                            <input type="number" id="servCount" min="1" max="100" class="prng-input">
                        </div>
                        <button id="generateServTableBtn" class="btn-primary mb-4">Generate Service Table</button>
                        
                        <div id="servTableContainer" class="hidden">
                            <div class="table-wrapper">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Service Time</th>
                                            <th>Probability</th>
                                            <th>Cumulative Probability</th>
                                            <th>Random Digits</th>
                                        </tr>
                                    </thead>
                                    <tbody id="servTableBody"></tbody>
                                </table>
                            </div>
                            <button id="computeServBtn" class="btn-success mt-3">Calculate Cumulative & Random Digits</button>
                            <div id="servRandoms" class="mt-4"></div>
                        </div>
                    </div>
                    
                    <button id="singleRunSimBtn" class="btn-primary">▶ Run Simulation</button>
                </div>
                
                <div id="singleStep2" class="hidden mt-6">
                    <div id="outputArea" class="table-wrapper"></div>
                </div>
            </div>
        `;
    },
    
    attachEventListeners: function() {
        const self = this;
        
        document.getElementById('generateInterTableBtn').addEventListener('click', () => self.generateInterTable());
        document.getElementById('generateServTableBtn').addEventListener('click', () => self.generateServTable());
        document.getElementById('computeInterBtn').addEventListener('click', () => self.computeIntervals('inter'));
        document.getElementById('computeServBtn').addEventListener('click', () => self.computeIntervals('serv'));
        document.getElementById('singleRunSimBtn').addEventListener('click', () => self.runSimulation());
    },
    
    generateInterTable: function() {
        const count = parseInt(document.getElementById('interCount').value);
        if (!count || count < 1 || count > 100) {
            alert('Please enter a valid count between 1 and 100');
            return;
        }
        
        const tbody = document.getElementById('interTableBody');
        tbody.innerHTML = '';
        
        for (let i = 1; i <= count; i++) {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><input type="number" class="table-input inter-time"></td>
                <td><input type="number" step="0.01" class="table-input inter-prob"></td>
                <td><input type="text" class="table-input readonly" readonly></td>
                <td><input type="text" class="table-input readonly" readonly></td>
            `;
            tbody.appendChild(row);
        }
        
        document.getElementById('interTableContainer').classList.remove('hidden');
    },
    
    generateServTable: function() {
        const count = parseInt(document.getElementById('servCount').value);
        if (!count || count < 1 || count > 100) {
            alert('Please enter a valid count between 1 and 100');
            return;
        }
        
        const tbody = document.getElementById('servTableBody');
        tbody.innerHTML = '';
        
        for (let i = 1; i <= count; i++) {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><input type="number" class="table-input serv-time"></td>
                <td><input type="number" step="0.01" class="table-input serv-prob"></td>
                <td><input type="text" class="table-input readonly" readonly></td>
                <td><input type="text" class="table-input readonly" readonly></td>
            `;
            tbody.appendChild(row);
        }
        
        document.getElementById('servTableContainer').classList.remove('hidden');
    },
    
    readDistribution: function(timeClass, probClass) {
        const times = document.getElementsByClassName(timeClass);
        const probs = document.getElementsByClassName(probClass);
        const dist = [];
        
        for (let i = 0; i < times.length; i++) {
            const t = Number(times[i].value);
            const p = Number(probs[i].value);
            if (!isNaN(t) && !isNaN(p) && p > 0) {
                dist.push({ value: t, p: p });
            }
        }
        
        return dist;
    },
    
    buildCumulativeIntervalsLecture: function(dist, scale) {
    const sum = dist.reduce((s, d) => s + d.p, 0);
    const EPS = 0.001;
    
    if (Math.abs(sum - 1) > EPS) {
        return { ok: false, message: `Probabilities sum to ${sum.toFixed(4)} (must be 1.0).` };
    }
    
    const maxRN = scale;
    const intervals = [];
    let cum = 0;
    
    for (let i = 0; i < dist.length; i++) {
        const prevCum = cum;
        cum += dist[i].p;
        
        // Use Math.floor for both to avoid overlaps
        const intLow = Math.floor(prevCum * maxRN) + 1;
        const intHigh = Math.floor(cum * maxRN);
        
        intervals.push({
            value: dist[i].value,
            p: dist[i].p,
            cumulative: Number(cum.toFixed(4)),
            intLow: intLow,
            intHigh: intHigh
        });
    }
    
    // Ensure last interval goes to maxRN
    if (intervals.length > 0) {
        intervals[intervals.length - 1].intHigh = maxRN;
    }
    
    return { ok: true, intervals: intervals };
},
    
    computeIntervals: function(which) {
        this.interScale = Number(document.getElementById("intervalScaleInter").value) || 100;
        this.servScale = Number(document.getElementById("intervalScaleServ").value) || 100;
        this.customersCount = Number(document.getElementById("singleCustomers").value) || 0;
        
        const maxCustomers = this.getMaxCustomers();
        
        if (this.customersCount <= 0) {
            alert("Enter valid number of customers.");
            return;
        }
        
        if (this.customersCount > maxCustomers) {
            alert(`Number of customers cannot exceed ${maxCustomers}. This is limited by the number of random numbers generated (Set 1: ${this.randomNumbers.length}, Set 2: ${this.randomNumbers2.length}).`);
            return;
        }
        
        // Reset random number indices when computing intervals
        if (which === "inter") {
            this.randomIndex = 0;
        } else if (which === "serv") {
            this.randomIndex2 = 0;
        }
        
        if (which === "inter") {
            const dist = this.readDistribution("inter-time", "inter-prob");
            if (dist.length === 0) {
                alert("Enter interarrival distribution.");
                return;
            }
            
            const res = this.buildCumulativeIntervalsLecture(dist, this.interScale);
            if (!res.ok) {
                alert("Interarrival distribution error: " + res.message);
                return;
            }
            
            this.interIntervals = res.intervals;
            this.updateTableWithRanges('inter', this.interIntervals);
            this.createRNInputTable('inter');
        } else if (which === "serv") {
            const dist = this.readDistribution("serv-time", "serv-prob");
            if (dist.length === 0) {
                alert("Enter service distribution.");
                return;
            }
            
            const res = this.buildCumulativeIntervalsLecture(dist, this.servScale);
            if (!res.ok) {
                alert("Service distribution error: " + res.message);
                return;
            }
            
            this.servIntervals = res.intervals;
            this.updateTableWithRanges('serv', this.servIntervals);
            this.createRNInputTable('serv');
        }
    },
    
    updateTableWithRanges: function(which, intervals) {
        const tbody = which === 'inter' ? document.getElementById('interTableBody') : document.getElementById('servTableBody');
        const rows = tbody.querySelectorAll('tr');
        const scale = which === 'inter' ? this.interScale : this.servScale;
        const maxRN = scale;
        const numDigits = maxRN.toString().length;
        
        intervals.forEach((it, i) => {
            if (rows[i]) {
                const cells = rows[i].querySelectorAll('td');
                
                const paddingDigits = numDigits;
                const startDisplay = it.intLow.toString().padStart(paddingDigits, '0');
                
                let endDisplay;
                if (i === intervals.length - 1 && it.intHigh === maxRN) {
                    endDisplay = "0".repeat(paddingDigits);
                } else {
                    endDisplay = it.intHigh.toString().padStart(paddingDigits, '0');
                }
                
                cells[2].querySelector('input').value = it.cumulative.toFixed(4);
                cells[3].querySelector('input').value = `${startDisplay} - ${endDisplay}`;
            }
        });
    },
    
    createRNInputTable: function(which) {
        const scale = which === 'inter' ? this.interScale : this.servScale;
        const maxRN = scale;
        
        if (this.randomMethod === 'prng') {
            const intervals = (which === 'inter') ? this.interIntervals : this.servIntervals;
            const mapped = [];
            const rnValues = [];
            
            for (let i = 0; i < this.customersCount; i++) {
                if (which === 'inter' && i === 0) {
                    mapped.push('—');
                    rnValues.push('—');
                } else {
                    const rn = this.getNextRandom(which === 'inter' ? 1 : 2);
                    const clampedRN = Math.min(Math.max(rn, 0), maxRN);
                    rnValues.push(clampedRN);
                    mapped.push(this.mapRNToValueLecture(clampedRN, intervals));
                }
            }
            
            if (which === 'inter') {
                this.interMappedTimes = mapped;
                this.interRNValues = rnValues;
            } else {
                this.servMappedTimes = mapped;
                this.servRNValues = rnValues;
            }
            
            let html = `<h4 style="color: #667eea; margin-top: 20px;">${which === 'inter' ? 'Interarrival' : 'Service'} Times from RN Mapping</h4>`;
            html += `<table border="1" style="width:100%; text-align:center; margin-top: 10px;">
                     <tr><th>Customer</th><th>RN</th><th>Mapped Time</th></tr>`;
            
            for (let i = 0; i < this.customersCount; i++) {
                html += `<tr>
                    <td>${i + 1}</td>
                    <td>${rnValues[i]}</td>
                    <td>${mapped[i]}</td>
                </tr>`;
            }
            
            html += `</table>`;
            
            if (which === 'inter') {
                document.getElementById("interRandoms").innerHTML = html;
            } else {
                document.getElementById("servRandoms").innerHTML = html;
            }
        } else {
            let html = `<h4 style="color: #667eea; margin-top: 20px;">Enter Random Numbers for ${which === 'inter' ? 'Interarrival' : 'Service'} (1-${maxRN}):</h4>`;
            html += `<table border="1" style="width:100%; text-align:center; margin-top: 10px;">
                     <tr><th>Customer</th><th>RN</th></tr>`;
            
            for (let i = 0; i < this.customersCount; i++) {
                let value = '';
                let disabled = '';
                
                if (which === 'inter' && i === 0) {
                    value = '—';
                    disabled = 'disabled';
                }
                
                html += `<tr>
                    <td>${i + 1}</td>
                    <td><input type="number" class="${which}-rn table-input" ${disabled} value="${value}" min="1" max="${maxRN}"></td>
                </tr>`;
            }
            
            html += `</table>`;
            html += `<button class="btn-success mt-3" onclick="SingleServerQueue.mapRNToTime('${which}')">Map RN to ${which === 'inter' ? 'Interarrival' : 'Service'} Time</button>`;
            html += `<div id="${which}MappedTable"></div>`;
            
            if (which === 'inter') {
                document.getElementById("interRandoms").innerHTML = html;
            } else {
                document.getElementById("servRandoms").innerHTML = html;
            }
        }
    },
    
    mapRNToTime: function(which) {
        const inputs = document.getElementsByClassName(`${which}-rn`);
        const intervals = (which === 'inter') ? this.interIntervals : this.servIntervals;
        const scale = which === 'inter' ? this.interScale : this.servScale;
        const maxRN = scale;
        const mapped = [];
        
        for (let i = 0; i < inputs.length; i++) {
            const val = inputs[i].value;
            if (which === 'inter' && i === 0) {
                mapped.push('—');
                continue;
            }
            
            const rn = Number(val);
            if (isNaN(rn) || rn < 1 || rn > maxRN) {
                alert(`Enter valid RN for customer ${i + 1} (must be between 1 and ${maxRN})`);
                return;
            }
            
            mapped.push(this.mapRNToValueLecture(rn, intervals));
        }
        
        if (which === 'inter') {
            this.interMappedTimes = mapped;
        } else {
            this.servMappedTimes = mapped;
        }
        
        let html = `<h4 style="color: #667eea; margin-top: 20px;">${which === 'inter' ? 'Interarrival' : 'Service'} Times from RN Mapping</h4>`;
        html += `<table border="1" style="width:100%; text-align:center; margin-top: 10px;">
                 <tr><th>Customer</th><th>RN</th><th>Mapped Time</th></tr>`;
        
        for (let i = 0; i < this.customersCount; i++) {
            html += `<tr>
                <td>${i + 1}</td>
                <td>${inputs[i].value}</td>
                <td>${mapped[i]}</td>
            </tr>`;
        }
        
        html += `</table>`;
        document.getElementById(`${which}MappedTable`).innerHTML = html;
    },
    
    mapRNToValueLecture: function(rnInt, intervals) {
    // Handle RN=0 as mapping to the last interval (wraps around)
    if (rnInt === 0) {
        return intervals[intervals.length - 1].value;
    }
    
    for (let it of intervals) {
        if (rnInt >= it.intLow && rnInt <= it.intHigh) {
            return it.value;
        }
    }
    return intervals[intervals.length - 1].value;
},
    
    runSimulation: function() {
        this.customersCount = Number(document.getElementById("singleCustomers").value) || 0;
        const maxCustomers = this.getMaxCustomers();
        
        if (this.customersCount <= 0) {
            alert("Enter a valid number of customers.");
            return;
        }
        
        if (this.customersCount > maxCustomers) {
            alert(`Number of customers cannot exceed ${maxCustomers}.`);
            return;
        }
        
        if (!this.interMappedTimes || this.interMappedTimes.length !== this.customersCount) {
            alert("Please map interarrival random numbers first.");
            return;
        }
        
        if (!this.servMappedTimes || this.servMappedTimes.length !== this.customersCount) {
            alert("Please map service random numbers first.");
            return;
        }
        
        const rows = [];
        let serverFree = 0;
        let arrivalClock = 0;
        let previousServiceEnd = 0;
        
        for (let i = 0; i < this.customersCount; i++) {
            const cust = i + 1;
            const interarrival = this.interMappedTimes[i];
            
            if (i === 0) {
                arrivalClock = 0;
            } else {
                arrivalClock += interarrival;
            }
            
            const serviceTime = this.servMappedTimes[i];
            const serviceBegin = (i === 0) ? 0 : Math.max(arrivalClock, serverFree);
            const serviceEnd = serviceBegin + serviceTime;
            const waiting = serviceBegin - arrivalClock;
            const idle = (i === 0) ? 0 : Math.max(0, serviceBegin - previousServiceEnd);
            const timeInSystem = waiting + serviceTime;
            
            previousServiceEnd = serviceEnd;
            serverFree = serviceEnd;
            
            let rnArr, rnServ;
            if (this.randomMethod === 'prng') {
                rnArr = this.interRNValues[i];
                rnServ = this.servRNValues[i];
            } else {
                rnArr = (i === 0) ? '—' : document.getElementsByClassName('inter-rn')[i].value;
                rnServ = document.getElementsByClassName('serv-rn')[i].value;
            }
            
            rows.push({
                customer: cust,
                rnArr: rnArr,
                interarrival: interarrival,
                arrivalClock: arrivalClock,
                rnServ: rnServ,
                serviceTime: serviceTime,
                serviceBegin: serviceBegin,
                serviceEnd: serviceEnd,
                waiting: waiting,
                idle: idle,
                timeInSystem: timeInSystem
            });
        }
        
        this.renderSimulationTableLecture(rows);
        
        document.getElementById('singleStep2').classList.remove('hidden');
    },
    
    renderSimulationTableLecture: function(rows) {
        let totalInterarrival = 0;
        let totalServiceTime = 0;
        let totalWaiting = 0;
        let totalIdle = 0;
        let totalTimeInSystem = 0;
        let customersWhoWaited = 0;
        let totalWaitingForThoseWhoWait = 0;
        
        rows.forEach(r => {
            if (r.interarrival !== '—') {
                totalInterarrival += r.interarrival;
            }
            totalServiceTime += r.serviceTime;
            totalWaiting += r.waiting;
            totalIdle += r.idle;
            totalTimeInSystem += r.timeInSystem;
            
            if (r.waiting > 0) {
                customersWhoWaited++;
                totalWaitingForThoseWhoWait += r.waiting;
            }
        });
        
        const lastServiceEnd = rows[rows.length - 1].serviceEnd;
        const avgInterarrivalTime = totalInterarrival / (rows.length - 1);
        const avgServiceTime = totalServiceTime / rows.length;
        const avgWaitingTime = totalWaiting / rows.length;
        const avgTimeInSystem = totalTimeInSystem / rows.length;
        const serverUtilization = (totalServiceTime / lastServiceEnd) * 100;
        const probServerIdle = 100 - serverUtilization;
        const probWait = (customersWhoWaited / rows.length) * 100;
        const avgWaitingTimeForThoseWhoWait = customersWhoWaited > 0 ? totalWaitingForThoseWhoWait / customersWhoWaited : 0;
        
        let html = `<table border="1" style="width:100%; text-align:center;">
            <tr>
                <th>Customer</th>
                <th>RN (Arrival)</th>
                <th>Interarrival</th>
                <th>Arrival Clock</th>
                <th>RN (Service)</th>
                <th>Service Time</th>
                <th>Service Begin</th>
                <th>Service End</th>
                <th>Waiting</th>
                <th>Idle</th>
                <th>Time in System</th>
            </tr>`;
        
        rows.forEach(r => {
            html += `<tr>
                <td>${r.customer}</td>
                <td>${r.rnArr}</td>
                <td>${r.interarrival}</td>
                <td>${r.arrivalClock}</td>
                <td>${r.rnServ}</td>
                <td>${r.serviceTime}</td>
                <td>${r.serviceBegin}</td>
                <td>${r.serviceEnd}</td>
                <td>${r.waiting}</td>
                <td>${r.idle}</td>
                <td>${r.timeInSystem}</td>
            </tr>`;
        });
        
        html += `<tr style="background-color: #f0f4ff; font-weight: bold;">
                <td>Total</td>
                <td colspan="1"></td>
                <td>${totalInterarrival}</td>
                <td colspan="2"></td>
                <td>${totalServiceTime}</td>
                <td colspan="2"></td>
                <td>${totalWaiting}</td>
                <td>${totalIdle}</td>
                <td>${totalTimeInSystem}</td>
            </tr>`;
        
        html += `</table>`;
        
        html += `<div style="margin-top: 30px; padding: 20px; background: #f9f9f9; border-radius: 8px;">
            <h3 style="color: #667eea; margin-bottom: 15px;">Performance Measures</h3>
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px;">
                <div style="padding: 15px; background: white; border-radius: 8px; border-left: 4px solid #667eea;">
                    <strong>Average Time Between Arrivals:</strong> ${avgInterarrivalTime.toFixed(3)}
                </div>
                <div style="padding: 15px; background: white; border-radius: 8px; border-left: 4px solid #667eea;">
                    <strong>Average Service Time:</strong> ${avgServiceTime.toFixed(3)}
                </div>
                <div style="padding: 15px; background: white; border-radius: 8px; border-left: 4px solid #667eea;">
                    <strong>Average Waiting Time (Wq):</strong> ${avgWaitingTime.toFixed(3)}
                </div>
                <div style="padding: 15px; background: white; border-radius: 8px; border-left: 4px solid #667eea;">
                    <strong>Average Time in System (Ws):</strong> ${avgTimeInSystem.toFixed(3)}
                </div>
                <div style="padding: 15px; background: white; border-radius: 8px; border-left: 4px solid #667eea;">
                    <strong>Average Waiting Time of Those Who Wait:</strong> ${avgWaitingTimeForThoseWhoWait.toFixed(3)}
                </div>
                <div style="padding: 15px; background: white; border-radius: 8px; border-left: 4px solid #667eea;">
                    <strong>Probability (Wait):</strong> ${(probWait / 100).toFixed(3)}
                </div>
                <div style="padding: 15px; background: white; border-radius: 8px; border-left: 4px solid #667eea;">
                    <strong>Server Utilization:</strong> ${(serverUtilization / 100).toFixed(3)}
                </div>
                <div style="padding: 15px; background: white; border-radius: 8px; border-left: 4px solid #667eea;">
                    <strong>Probability Server Idle (P0):</strong> ${(probServerIdle / 100).toFixed(3)}
                </div>
            </div>
        </div>`;
        
        document.getElementById("outputArea").innerHTML = html;
    }
};