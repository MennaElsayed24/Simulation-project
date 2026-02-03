const UniformityTest = {
    container: null,
    randomMethod: null,
    randomNumbers: [],
    randomIndex: 0,
    
    // Random Number Table (20 rows x 10 columns)
    randomNumberTable: [
        [0.182207, 0.708968, 0.658639, 0.342984, 0.373906, 0.27229, 0.188887, 0.737194, 0.553154, 0.433596],
        [0.667031, 0.280544, 0.783227, 0.451438, 0.807274, 0.744486, 0.434633, 0.650262, 0.026824, 0.643398],
        [0.194711, 0.928768, 0.295562, 0.73732, 0.727475, 0.35745, 0.961933, 0.97159, 0.991015, 0.327134],
        [0.517247, 0.815204, 0.644701, 0.003302, 0.257183, 0.992877, 0.700314, 0.801496, 0.608348, 0.981305],
        [0.209989, 0.952222, 0.219503, 0.894513, 0.039475, 0.268692, 0.329809, 0.084219, 0.446785, 0.440203],
        [0.654719, 0.191653, 0.03533, 0.430488, 0.092579, 0.712848, 0.663018, 0.622284, 0.029878, 0.780045],
        [0.212243, 0.708845, 0.565166, 0.861965, 0.297897, 0.362803, 0.784762, 0.636894, 0.657105, 0.517915],
        [0.086549, 0.86134, 0.778093, 0.638995, 0.37582, 0.981689, 0.75213, 0.749165, 0.824127, 0.714367],
        [0.997747, 0.129162, 0.051005, 0.542495, 0.111326, 0.940627, 0.430173, 0.309258, 0.735475, 0.290859],
        [0.301984, 0.674583, 0.658127, 0.199414, 0.326646, 0.946453, 0.317354, 0.433266, 0.868468, 0.561822],
        [0.71959, 0.867463, 0.830939, 0.76862, 0.386372, 0.021095, 0.702353, 0.557223, 0.369753, 0.487034],
        [0.67483, 0.027317, 0.53903, 0.623188, 0.085369, 0.840329, 0.834195, 0.405827, 0.012849, 0.937868],
        [0.587258, 0.956494, 0.917803, 0.000276, 0.95874, 0.413272, 0.283902, 0.767139, 0.700902, 0.534619],
        [0.831013, 0.228116, 0.698890, 0.701801, 0.795488, 0.713938, 0.682366, 0.263463, 0.901007, 0.223164],
        [0.625661, 0.305469, 0.884645, 0.356244, 0.14165, 0.769263, 0.629524, 0.297161, 0.33195, 0.138084],
        [0.265086, 0.94847, 0.934603, 0.227851, 0.61501, 0.038937, 0.502986, 0.34307, 0.135845, 0.643919],
        [0.378582, 0.702417, 0.598563, 0.6058, 0.324549, 0.624286, 0.015417, 0.460829, 0.556079, 0.048197],
        [0.120779, 0.619858, 0.580329, 0.080681, 0.247823, 0.538544, 0.484709, 0.608418, 0.909011, 0.805419],
        [0.181924, 0.347314, 0.471656, 0.306207, 0.055605, 0.933698, 0.833884, 0.96815, 0.596454, 0.277099]
    ],
    
    init: function(container, randomMethod, randomNumbers) {
        this.container = container;
        this.randomMethod = randomMethod;
        this.randomNumbers = randomNumbers || [];
        this.randomIndex = 0;
        this.setupUI();
        this.attachEventListeners();
    },
    
    setupUI: function() {
        this.container.innerHTML = `
            <div>
                <h2 class="text-3xl font-bold mb-4" style="color: #667eea;">Uniformity Test - Chi-Square (χ²) Test</h2>
                <p class="text-gray-600 mb-6">Test if random numbers are uniformly distributed on [0, 1]</p>
                
                <div id="uniformityStep1">
                    <div class="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <h3 class="text-lg font-semibold mb-2" style="color: #667eea;">Hypothesis</h3>
                        <p class="mb-2"><strong>H₀:</strong> Rᵢ ~ Uniform[0, 1] (numbers are uniformly distributed)</p>
                        <p><strong>H₁:</strong> Rᵢ ≠ Uniform[0, 1] (numbers are not uniformly distributed)</p>
                    </div>
                    
                    <div class="grid grid-cols-2 gap-4 mb-6">
                        <div>
                            <h3 class="text-sm font-semibold mb-2">Significance Level (α):</h3>
                            <input type="number" id="alphaLevel" class="prng-input" step="0.001" min="0" max="1" placeholder="e.g., 0.05">
                            <p class="text-xs text-gray-600">Common values: 0.10, 0.05, 0.025, 0.01, 0.005</p>
                        </div>
                        <div>
                            <h3 class="text-sm font-semibold mb-2">Number of Classes (k):</h3>
                            <input type="number" id="classCount" min="2" max="50" class="prng-input" placeholder="e.g., 10">
                            <p class="text-xs text-gray-600">Recommended: k ≥ 100/N, typically 10</p>
                        </div>
                    </div>
                    
                    <div class="mb-6">
                        <h3 class="text-xl font-semibold mb-3" style="color: #667eea;">Select Input Method</h3>
                        <div class="grid grid-cols-2 gap-4 mb-4">
                            <button id="selectManualInput" class="btn-primary">Manual Input</button>
                            <button id="selectTableInput" class="btn-primary">Choose from Random Number Table</button>
                        </div>
                    </div>
                    
                    <!-- Manual Input Section -->
                    <div id="manualInputSection" class="hidden mb-6">
                        <h3 class="text-xl font-semibold mb-3" style="color: #667eea;">Enter Random Numbers</h3>
                        <p class="text-sm text-gray-600 mb-3">Enter random numbers between 0 and 1, separated by spaces, commas, or newlines</p>
                        <textarea id="randomNumbersInput" class="prng-input" rows="8" 
                            placeholder="Example: 0.44 0.81 0.14 0.05 0.93 0.66 0.28 0.94 ..."></textarea>
                        <p class="text-sm text-gray-600 mt-2">Or paste your numbers here (each number should be between 0 and 1)</p>
                    </div>
                    
                    <!-- Table Input Section -->
                    <div id="tableInputSection" class="hidden mb-6">
                        <h3 class="text-xl font-semibold mb-3" style="color: #667eea;">Select from Random Number Table</h3>
                        <p class="text-sm text-gray-600 mb-4">The table contains 20 rows and 10 columns of random numbers between 0 and 1</p>
                        
                        <!-- Display the full table -->
                        <div class="mb-6 p-4 bg-white border border-gray-300 rounded-lg">
                            <h4 class="font-semibold mb-3" style="color: #667eea;">Random Number Table</h4>
                            <div class="overflow-x-auto">
                                <table style="width: 100%; border-collapse: collapse; font-size: 0.75rem;">
                                    <thead>
                                        <tr style="background: #667eea; color: white;">
                                            <th style="padding: 8px; border: 1px solid #ddd;">Row</th>
                                            <th style="padding: 8px; border: 1px solid #ddd;">Col 1</th>
                                            <th style="padding: 8px; border: 1px solid #ddd;">Col 2</th>
                                            <th style="padding: 8px; border: 1px solid #ddd;">Col 3</th>
                                            <th style="padding: 8px; border: 1px solid #ddd;">Col 4</th>
                                            <th style="padding: 8px; border: 1px solid #ddd;">Col 5</th>
                                            <th style="padding: 8px; border: 1px solid #ddd;">Col 6</th>
                                            <th style="padding: 8px; border: 1px solid #ddd;">Col 7</th>
                                            <th style="padding: 8px; border: 1px solid #ddd;">Col 8</th>
                                            <th style="padding: 8px; border: 1px solid #ddd;">Col 9</th>
                                            <th style="padding: 8px; border: 1px solid #ddd;">Col 10</th>
                                        </tr>
                                    </thead>
                                    <tbody id="randomTableBody">
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        
                        <div class="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <label class="text-sm font-semibold mb-2 block">Select Rows:</label>
                                <div class="grid grid-cols-2 gap-2">
                                    <div>
                                        <label class="text-xs">From Row:</label>
                                        <input type="number" id="startRow" class="prng-input" min="1" max="20" value="1" placeholder="1-20">
                                    </div>
                                    <div>
                                        <label class="text-xs">To Row:</label>
                                        <input type="number" id="endRow" class="prng-input" min="1" max="20" value="20" placeholder="1-20">
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label class="text-sm font-semibold mb-2 block">Select Columns:</label>
                                <div class="grid grid-cols-2 gap-2">
                                    <div>
                                        <label class="text-xs">From Column:</label>
                                        <input type="number" id="startCol" class="prng-input" min="1" max="10" value="1" placeholder="1-10">
                                    </div>
                                    <div>
                                        <label class="text-xs">To Column:</label>
                                        <input type="number" id="endCol" class="prng-input" min="1" max="10" value="10" placeholder="1-10">
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <button id="previewSelection" class="btn-blue mb-4">Preview Selected Numbers</button>
                        
                        <div id="tablePreview" class="hidden">
                            <h4 class="font-semibold mb-2" style="color: #667eea;">Preview:</h4>
                            <div id="previewContent" class="p-4 bg-gray-50 border border-gray-300 rounded-lg max-h-64 overflow-auto"></div>
                            <p id="previewCount" class="text-sm text-gray-600 mt-2"></p>
                        </div>
                    </div>
                    
                    <button id="runUniformityTest" class="btn-primary">Run Chi-Square Test</button>
                </div>
                
                <div id="uniformityResults" class="hidden mt-8">
                    <hr class="my-6 border-t-2 border-gray-300">
                    <h3 class="text-2xl font-semibold mb-4" style="color: #667eea;">Test Results</h3>
                    <div id="uniformityOutput"></div>
                </div>
            </div>
        `;
    },
    
    attachEventListeners: function() {
        const self = this;
        
        document.getElementById('selectManualInput').addEventListener('click', () => {
            document.getElementById('manualInputSection').classList.remove('hidden');
            document.getElementById('tableInputSection').classList.add('hidden');
            document.getElementById('selectManualInput').classList.add('bg-indigo-600');
            document.getElementById('selectTableInput').classList.remove('bg-indigo-600');
        });
        
        document.getElementById('selectTableInput').addEventListener('click', () => {
            document.getElementById('tableInputSection').classList.remove('hidden');
            document.getElementById('manualInputSection').classList.add('hidden');
            document.getElementById('selectTableInput').classList.add('bg-indigo-600');
            document.getElementById('selectManualInput').classList.remove('bg-indigo-600');
            
            // Display the full table when this option is selected
            self.displayFullTable();
        });
        
        document.getElementById('previewSelection').addEventListener('click', () => self.previewTableSelection());
        document.getElementById('runUniformityTest').addEventListener('click', () => self.runTest());
    },
    
    displayFullTable: function() {
        const tbody = document.getElementById('randomTableBody');
        let html = '';
        
        this.randomNumberTable.forEach((row, rowIndex) => {
            html += `<tr style="background: ${rowIndex % 2 === 0 ? '#f9f9f9' : 'white'};">`;
            html += `<td style="padding: 8px; border: 1px solid #ddd; text-align: center; font-weight: bold; background: #e8f5e9;">${rowIndex + 1}</td>`;
            
            row.forEach(num => {
                html += `<td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${num.toFixed(6)}</td>`;
            });
            
            html += `</tr>`;
        });
        
        tbody.innerHTML = html;
    },
    
    previewTableSelection: function() {
        const startRow = parseInt(document.getElementById('startRow').value);
        const endRow = parseInt(document.getElementById('endRow').value);
        const startCol = parseInt(document.getElementById('startCol').value);
        const endCol = parseInt(document.getElementById('endCol').value);
        
        if (!startRow || !endRow || !startCol || !endCol) {
            alert('Please enter all row and column values');
            return;
        }
        
        if (startRow < 1 || startRow > 20 || endRow < 1 || endRow > 20 || startRow > endRow) {
            alert('Invalid row selection. Rows must be between 1-20 and start row ≤ end row');
            return;
        }
        
        if (startCol < 1 || startCol > 10 || endCol < 1 || endCol > 10 || startCol > endCol) {
            alert('Invalid column selection. Columns must be between 1-10 and start column ≤ end column');
            return;
        }
        
        const selectedNumbers = this.extractFromTable(startRow, endRow, startCol, endCol);
        
        let html = '<div class="grid grid-cols-10 gap-1 text-xs">';
        selectedNumbers.forEach((num, idx) => {
            html += `<div class="p-2 bg-white border border-gray-300 text-center">${num.toFixed(6)}</div>`;
        });
        html += '</div>';
        
        document.getElementById('previewContent').innerHTML = html;
        document.getElementById('previewCount').textContent = `Total numbers selected: ${selectedNumbers.length}`;
        document.getElementById('tablePreview').classList.remove('hidden');
    },
    
    extractFromTable: function(startRow, endRow, startCol, endCol) {
        const numbers = [];
        for (let r = startRow - 1; r < endRow; r++) {
            for (let c = startCol - 1; c < endCol; c++) {
                numbers.push(this.randomNumberTable[r][c]);
            }
        }
        return numbers;
    },
    
    parseRandomNumbers: function(input) {
        const numbers = input.trim()
            .split(/[\s,\n]+/)
            .map(n => parseFloat(n))
            .filter(n => !isNaN(n) && n >= 0 && n <= 1);
        return numbers;
    },
    
    getChiSquareCriticalValue: function(alpha, df) {
        const chiSquareTable = {
            0.10: [2.71, 4.61, 6.25, 7.78, 9.2, 10.6, 12.0, 13.4, 14.7, 16.0, 17.3, 18.5, 19.8, 21.1, 22.3, 23.5, 24.8, 26.0, 27.2],
            0.05: [3.84, 5.99, 7.81, 9.49, 11.1, 12.6, 14.1, 15.5, 16.9, 18.3, 19.7, 21.0, 22.4, 23.7, 25.0, 26.3, 27.6, 28.9, 30.1],
            0.025: [5.02, 7.38, 9.35, 11.14, 12.8, 14.4, 16.0, 17.5, 19.0, 20.5, 21.9, 23.3, 24.7, 26.1, 27.5, 28.8, 30.2, 31.5, 32.9],
            0.01: [6.63, 9.21, 11.34, 13.28, 15.1, 16.8, 18.5, 20.1, 21.7, 23.2, 24.7, 26.2, 27.7, 29.1, 30.6, 32.0, 33.4, 34.8, 36.2],
            0.005: [7.88, 10.60, 12.84, 14.96, 16.7, 18.5, 20.3, 22.0, 23.6, 25.2, 26.8, 28.3, 29.8, 31.3, 32.8, 34.3, 35.7, 37.2, 38.6]
        };
        
        const alphaStr = alpha.toString();
        if (chiSquareTable[alphaStr] && df >= 1 && df <= 19) {
            return chiSquareTable[alphaStr][df - 1];
        }
        return null;
    },
    
    getFullChiSquareTable: function() {
        return {
            0.10: [2.71, 4.61, 6.25, 7.78, 9.2, 10.6, 12.0, 13.4, 14.7, 16.0, 17.3, 18.5, 19.8, 21.1, 22.3, 23.5, 24.8, 26.0, 27.2],
            0.05: [3.84, 5.99, 7.81, 9.49, 11.1, 12.6, 14.1, 15.5, 16.9, 18.3, 19.7, 21.0, 22.4, 23.7, 25.0, 26.3, 27.6, 28.9, 30.1],
            0.025: [5.02, 7.38, 9.35, 11.14, 12.8, 14.4, 16.0, 17.5, 19.0, 20.5, 21.9, 23.3, 24.7, 26.1, 27.5, 28.8, 30.2, 31.5, 32.9],
            0.01: [6.63, 9.21, 11.34, 13.28, 15.1, 16.8, 18.5, 20.1, 21.7, 23.2, 24.7, 26.2, 27.7, 29.1, 30.6, 32.0, 33.4, 34.8, 36.2],
            0.005: [7.88, 10.60, 12.84, 14.96, 16.7, 18.5, 20.3, 22.0, 23.6, 25.2, 26.8, 28.3, 29.8, 31.3, 32.8, 34.3, 35.7, 37.2, 38.6]
        };
    },
    runTest: function() {
        const alphaInput = document.getElementById('alphaLevel').value;
        const kInput = document.getElementById('classCount').value;
        
        if (!alphaInput || !kInput) {
            alert('Please enter both Significance Level (α) and Number of Classes (k)');
            return;
        }
        
        const alpha = parseFloat(alphaInput);
        const k = parseInt(kInput);
        
        if (isNaN(alpha) || alpha <= 0 || alpha >= 1) {
            alert('Significance Level (α) must be between 0 and 1 (e.g., 0.05)');
            return;
        }
        
        if (isNaN(k) || k < 2 || k > 50) {
            alert('Number of classes (k) must be between 2 and 50');
            return;
        }
        
        let numbers = [];
        
        // Check which input method is visible
        const manualSection = document.getElementById('manualInputSection');
        const tableSection = document.getElementById('tableInputSection');
        
        if (!manualSection.classList.contains('hidden')) {
            // Manual input
            const input = document.getElementById('randomNumbersInput').value;
            if (!input.trim()) {
                alert('Please enter random numbers to test');
                return;
            }
            numbers = this.parseRandomNumbers(input);
        } else if (!tableSection.classList.contains('hidden')) {
            // Table input
            const startRow = parseInt(document.getElementById('startRow').value);
            const endRow = parseInt(document.getElementById('endRow').value);
            const startCol = parseInt(document.getElementById('startCol').value);
            const endCol = parseInt(document.getElementById('endCol').value);
            
            if (!startRow || !endRow || !startCol || !endCol) {
                alert('Please enter all row and column values');
                return;
            }
            
            if (startRow < 1 || startRow > 20 || endRow < 1 || endRow > 20 || startRow > endRow) {
                alert('Invalid row selection. Rows must be between 1-20 and start row ≤ end row');
                return;
            }
            
            if (startCol < 1 || startCol > 10 || endCol < 1 || endCol > 10 || startCol > endCol) {
                alert('Invalid column selection. Columns must be between 1-10 and start column ≤ end column');
                return;
            }
            
            numbers = this.extractFromTable(startRow, endRow, startCol, endCol);
        } else {
            alert('Please select an input method (Manual Input or Table Input)');
            return;
        }
        
        if (numbers.length === 0) {
            alert('No valid numbers found. Please enter numbers between 0 and 1');
            return;
        }
        
        if (numbers.length < k) {
            alert(`Number of random numbers (${numbers.length}) should be greater than or equal to number of classes (${k})`);
            return;
        }
        
        const N = numbers.length;
        const Ei = N / k;
        
        const intervals = [];
        const observed = new Array(k).fill(0);
        
        for (let i = 0; i < k; i++) {
            const lower = i / k;
            const upper = (i + 1) / k;
            intervals.push({ lower, upper, index: i + 1 });
        }
        
        numbers.forEach(num => {
            let found = false;
            for (let i = 0; i < k; i++) {
                const lower = i / k;
                const upper = (i + 1) / k;
                
                if (num >= lower && num < upper) {
                    observed[i]++;
                    found = true;
                    break;
                }
            }
            
            if (!found && num === 1.0) {
                observed[k - 1]++;
            }
        });
        
        let chiSquare = 0;
        const calculations = [];
        
        for (let i = 0; i < k; i++) {
            const Oi = observed[i];
            const diff = Oi - Ei;
            const diffSquared = diff * diff;
            const term = diffSquared / Ei;
            chiSquare += term;
            
            calculations.push({
                interval: intervals[i],
                Oi: Oi,
                Ei: Ei,
                diff: diff,
                diffSquared: diffSquared,
                term: term
            });
        }
        
        const df = k - 1;
        const criticalValue = this.getChiSquareCriticalValue(alpha, df);
        
        if (criticalValue === null) {
            alert(`Critical value for α=${alpha} and df=${df} not available in table. Try different values.`);
            return;
        }
        
        const reject = chiSquare > criticalValue;
        
        this.displayResults(numbers, k, N, Ei, calculations, chiSquare, alpha, df, criticalValue, reject);
    },
    
    displayChiSquareTable: function(alpha, df) {
        const alphas = [0.10, 0.05, 0.025, 0.01, 0.005];
        const table = this.getFullChiSquareTable();
        
        let html = `
            <div class="mb-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <h4 class="font-semibold mb-3" style="color: #764ba2;">Chi-Square Distribution Table (χ²)</h4>
                <p class="text-sm mb-3">Critical values for different significance levels (α) and degrees of freedom (df)</p>
                <div class="table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th style="background: #764ba2; color: white;">df</th>
        `;
        
        alphas.forEach(a => {
            const isSelected = a === alpha;
            html += `<th style="background: ${isSelected ? '#667eea' : '#764ba2'}; color: white; ${isSelected ? 'font-weight: bold; font-size: 1.1em;' : ''}">α = ${a}</th>`;
        });
        
        html += `
                            </tr>
                        </thead>
                        <tbody>
        `;
        
        for (let i = 1; i <= 19; i++) {
            const isSelectedRow = i === df;
            html += `<tr style="${isSelectedRow ? 'background: #e8f5e9; font-weight: bold;' : ''}">`;
            html += `<td style="text-align: center; ${isSelectedRow ? 'background: #c8e6c9; font-weight: bold;' : ''}">${i}</td>`;
            
            alphas.forEach(a => {
                const value = table[a][i - 1];
                const isSelectedCell = (i === df && a === alpha);
                html += `<td style="text-align: center; ${isSelectedCell ? 'background: #667eea; color: white; font-weight: bold; font-size: 1.1em;' : ''}">${value}</td>`;
            });
            
            html += `</tr>`;
        }
        
        html += `
                        </tbody>
                    </table>
                </div>
                <p class="text-sm mt-3 text-gray-700">
                    <strong>Note:</strong> The highlighted cell (α = ${alpha}, df = ${df}) shows χ²₀.₀${alpha.toString().substring(2)},${df} = ${table[alpha][df - 1]}
                </p>
            </div>
        `;
        
        return html;
    },
    
    displayResults: function(numbers, k, N, Ei, calculations, chiSquare, alpha, df, criticalValue, reject) {
        const output = document.getElementById('uniformityOutput');
        
        let html = `
            <div class="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <h4 class="font-semibold mb-2" style="color: #667eea;">Input Summary</h4>
                <p><strong>Total Random Numbers (N):</strong> ${N}</p>
                <p><strong>Number of Classes (k):</strong> ${k}</p>
                <p><strong>Significance Level (α):</strong> ${alpha}</p>
                <p><strong>Expected Frequency per Class (Eᵢ):</strong> N/k = ${N}/${k} = ${Ei.toFixed(2)}</p>
                <p><strong>Degrees of Freedom (df):</strong> k - 1 = ${k} - 1 = ${df}</p>
            </div>
            
            <div class="mb-6">
                <h4 class="font-semibold mb-3" style="color: #667eea;">Step 1: Interval Classification</h4>
                <p class="mb-3">Dividing [0, 1) into ${k} equal subintervals:</p>
                <div class="table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th>Class (i)</th>
                                <th>Interval</th>
                                <th>Observed (Oᵢ)</th>
                                <th>Expected (Eᵢ)</th>
                                <th>Oᵢ - Eᵢ</th>
                                <th>(Oᵢ - Eᵢ)²</th>
                                <th>(Oᵢ - Eᵢ)²/Eᵢ</th>
                            </tr>
                        </thead>
                        <tbody>
        `;
        
        let sumOi = 0;
        let sumEi = 0;
        
        calculations.forEach(calc => {
            sumOi += calc.Oi;
            sumEi += calc.Ei;
            
            html += `
                <tr>
                    <td>${calc.interval.index}</td>
                    <td>[${calc.interval.lower.toFixed(1)}, ${calc.interval.upper.toFixed(1)})</td>
                    <td>${calc.Oi}</td>
                    <td>${calc.Ei.toFixed(2)}</td>
                    <td>${calc.diff.toFixed(2)}</td>
                    <td>${calc.diffSquared.toFixed(2)}</td>
                    <td>${calc.term.toFixed(4)}</td>
                </tr>
            `;
        });
        
        html += `
                            <tr style="background-color: #f0f4ff; font-weight: bold;">
                                <td colspan="2">Total</td>
                                <td>${sumOi}</td>
                                <td>${sumEi.toFixed(2)}</td>
                                <td colspan="2"></td>
                                <td>${chiSquare.toFixed(4)}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            
            <div class="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 class="font-semibold mb-3" style="color: #667eea;">Step 2: Chi-Square Test Statistic</h4>
                <p class="mb-2">χ² = Σ(Oᵢ - Eᵢ)² / Eᵢ  (summed from i=1 to k=${k})</p>
                <p class="text-xl font-bold" style="color: #667eea;">χ² = ${chiSquare.toFixed(4)}</p>
            </div>
            
            <div class="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 class="font-semibold mb-3" style="color: #667eea;">Step 3: Critical Value</h4>
                <p class="mb-2">From Chi-Square table with α = ${alpha} and df = ${df}:</p>
                <p class="text-xl font-bold" style="color: #667eea;">χ²₀.₀${alpha.toString().substring(2)},${df} = ${criticalValue}</p>
            </div>
            
            ${this.displayChiSquareTable(alpha, df)}
            
            <div class="mb-6 p-4 ${reject ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'} border rounded-lg">
                <h4 class="font-semibold mb-3" style="color: ${reject ? '#dc3545' : '#28a745'};">Step 4: Decision</h4>
                <p class="mb-2"><strong>Decision Rule:</strong> If χ² > χ²₀.₀${alpha.toString().substring(2)},${df}, reject H₀</p>
                <p class="mb-3"><strong>Comparison:</strong> ${chiSquare.toFixed(4)} ${reject ? '>' : '≤'} ${criticalValue}</p>
                <p class="text-lg font-bold" style="color: ${reject ? '#dc3545' : '#28a745'};">
                    ${reject ? 
                        '✖ REJECT H₀: The random numbers are NOT uniformly distributed (at α = ' + alpha + ' significance level)' : 
                        '✓ FAIL TO REJECT H₀: The random numbers are accepted as uniformly distributed (at α = ' + alpha + ' significance level)'}
                </p>
                <p class="mt-2 text-sm" style="color: ${reject ? '#dc3545' : '#28a745'};">
                    ${reject ? 
                        'Evidence of non-uniformity has been detected.' : 
                        'No evidence of non-uniformity has been detected by this test.'}
                </p>
            </div>
            
            <div class="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <h4 class="font-semibold mb-2" style="color: #667eea;">Interpretation</h4>
                <p class="text-sm">The chi-square test compares the observed frequency distribution with the expected uniform distribution. 
                A smaller χ² value indicates better fit to uniform distribution. The critical value χ²₀.₀${alpha.toString().substring(2)},${df} represents the threshold - 
                if our calculated χ² exceeds this threshold, we have evidence that the numbers are not uniformly distributed.</p>
            </div>
        `;
        
        output.innerHTML = html;
        document.getElementById('uniformityResults').classList.remove('hidden');
        
        setTimeout(() => {
            document.getElementById('uniformityResults').scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
    }
};