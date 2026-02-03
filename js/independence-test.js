const IndependenceTest = {
    container: null,
    randomMethod: null,
    randomNumbers: [],
    randomIndex: 0,
    
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
                <h2 class="text-3xl font-bold mb-4" style="color: #667eea;">Independence (Dependency) Test</h2>
                <p class="text-gray-600 mb-6">Test if random numbers are independent using correlation coefficient</p>
                
                <div id="independenceStep1">
                    <div class="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <h3 class="text-lg font-semibold mb-2" style="color: #667eea;">Hypothesis</h3>
                        <p class="mb-2"><strong>H₀:</strong> Rᵢ ~ independently (numbers are independent)</p>
                        <p><strong>H₁:</strong> Rᵢ ≠ independently (numbers are not independent)</p>
                    </div>
                    
                    <div class="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <h3 class="text-sm font-semibold mb-2" style="color: #f59e0b;">Interpretation Guide</h3>
                        <p class="text-sm">• <strong>Small values (close to 0):</strong> Indicate independence</p>
                        <p class="text-sm">• <strong>Large values (close to ±1):</strong> Indicate dependence</p>
                        <p class="text-sm mt-2">The correlation coefficient rₓₓ(k) measures the relationship between a number and another number k positions away in the sequence.</p>
                    </div>
                    
                    <div class="mb-6">
                        <h3 class="text-xl font-semibold mb-3" style="color: #667eea;">Enter Random Numbers</h3>
                        <p class="text-sm text-gray-600 mb-3">Enter random numbers between 0 and 1, separated by spaces, commas, or newlines</p>
                        <textarea id="randomNumbersInputIndep" class="prng-input" rows="8" 
                            placeholder="Example: 0.44 0.81 0.14 0.05 0.93 ..."></textarea>
                        <p class="text-sm text-gray-600 mt-2">Minimum 3 numbers required for meaningful testing</p>
                    </div>
                    
                    <div class="mb-6">
                        <h3 class="text-sm font-semibold mb-2">Number of Data Points (n):</h3>
                        <input type="number" id="maxLag" min="2" value="5" class="prng-input">
                        <p class="text-xs text-gray-600">Will compute correlation coefficients for k = 1, 2, ..., n-1</p>
                    </div>
                    
                    <button id="runIndependenceTest" class="btn-primary">Run Independence Test</button>
                </div>
                
                <div id="independenceResults" class="hidden mt-8">
                    <hr class="my-6 border-t-2 border-gray-300">
                    <h3 class="text-2xl font-semibold mb-4" style="color: #667eea;">Test Results</h3>
                    <div id="independenceOutput"></div>
                </div>
            </div>
        `;
    },
    
    attachEventListeners: function() {
        const self = this;
        document.getElementById('runIndependenceTest').addEventListener('click', () => self.runTest());
    },
    
    parseRandomNumbers: function(input) {
        const numbers = input.trim()
            .split(/[\s,\n]+/)
            .map(n => parseFloat(n))
            .filter(n => !isNaN(n) && n >= 0 && n <= 1);
        return numbers;
    },
    
    calculateMean: function(numbers) {
        const sum = numbers.reduce((acc, val) => acc + val, 0);
        return sum / numbers.length;
    },
    
    calculateStandardDeviation: function(numbers, mean) {
        const n = numbers.length;
        const sumSquaredDiff = numbers.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0);
        // Using n-1 for sample standard deviation (Bessel's correction)
        return Math.sqrt(sumSquaredDiff / (n - 1));
    },
    
    calculateCorrelation: function(numbers, k, mean, stdDev) {
        const n = numbers.length;
        let sum = 0;
        
        for (let i = 0; i < n - k; i++) {
            sum += (numbers[i] - mean) * (numbers[i + k] - mean);
        }
        
        // rxx(k) = (1/(n-k)) * sum / (Sx * Sx)
        const correlation = (1 / (n - k)) * (sum / (stdDev * stdDev));
        return correlation;
    },
    
    runTest: function() {
        const input = document.getElementById('randomNumbersInputIndep').value;
        const nInput = parseInt(document.getElementById('maxLag').value);
        
        if (!input.trim()) {
            alert('Please enter random numbers to test');
            return;
        }
        
        const numbers = this.parseRandomNumbers(input);
        
        if (numbers.length < 3) {
            alert('Please enter at least 3 random numbers for testing');
            return;
        }
        
        if (nInput < 2) {
            alert('Number of data points (n) must be at least 2');
            return;
        }
        
        const actualDataLength = numbers.length;
        
        if (nInput > actualDataLength) {
            alert(`Number of data points (n = ${nInput}) cannot be greater than the total number of random numbers entered (${actualDataLength})`);
            return;
        }
        
        // Use only the first n numbers
        const selectedNumbers = numbers.slice(0, nInput);
        const n = selectedNumbers.length;
        const maxLag = n - 1;
        
        // Calculate mean
        const mean = this.calculateMean(selectedNumbers);
        
        // Calculate standard deviation
        const stdDev = this.calculateStandardDeviation(selectedNumbers, mean);
        
        // Calculate correlations for different lags
        const correlations = [];
        for (let k = 1; k <= maxLag; k++) {
            const rxx = this.calculateCorrelation(selectedNumbers, k, mean, stdDev);
            correlations.push({ k, rxx });
        }
        
        this.displayResults(selectedNumbers, n, mean, stdDev, correlations, maxLag);
    },
    
    displayResults: function(numbers, n, mean, stdDev, correlations, actualMaxLag) {
        const output = document.getElementById('independenceOutput');
        
        // Calculate sum for mean display
        const sumNumbers = numbers.reduce((a, b) => a + b, 0);
        
        // Create detailed calculation steps
        let html = `
            <div class="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <h4 class="font-semibold mb-2" style="color: #667eea;">Input Summary</h4>
                <p><strong>Total Random Numbers (n):</strong> ${n}</p>
                <p><strong>Maximum Lag Tested:</strong> k = n - 1 = ${n} - 1 = ${actualMaxLag}</p>
            </div>
            
            <div class="mb-6">
                <h4 class="font-semibold mb-3" style="color: #667eea;">Step 1: Input Data</h4>
                <div class="table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th>Index (i)</th>
                                <th>xᵢ</th>
                            </tr>
                        </thead>
                        <tbody>
        `;
        
        numbers.forEach((num, idx) => {
            html += `
                <tr>
                    <td>${idx + 1}</td>
                    <td>${num.toFixed(3)}</td>
                </tr>
            `;
        });
        
        html += `
                        </tbody>
                    </table>
                </div>
            </div>
            
            <div class="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 class="font-semibold mb-3" style="color: #667eea;">Step 2: Calculate Mean (x̄)</h4>
                <p class="mb-2">x̄ = Σxᵢ / n</p>
                <p class="mb-2">x̄ = (${numbers.map(n => n.toFixed(2)).join(' + ')}) / ${n}</p>
                <p class="mb-2">x̄ = ${sumNumbers.toFixed(6)} / ${n}</p>
                <p class="text-xl font-bold" style="color: #667eea;">x̄ = ${mean.toFixed(6)}</p>
            </div>
            
            <div class="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 class="font-semibold mb-3" style="color: #667eea;">Step 3: Calculate Standard Deviation (Sₓ)</h4>
                <div class="table-wrapper mb-3">
                    <table>
                        <thead>
                            <tr>
                                <th>i</th>
                                <th>xᵢ</th>
                                <th>xᵢ - x̄</th>
                                <th>(xᵢ - x̄)²</th>
                            </tr>
                        </thead>
                        <tbody>
        `;
        
        let sumSquaredDiff = 0;
        numbers.forEach((num, idx) => {
            const diff = num - mean;
            const diffSquared = diff * diff;
            sumSquaredDiff += diffSquared;
            
            html += `
                <tr>
                    <td>${idx + 1}</td>
                    <td>${num.toFixed(3)}</td>
                    <td>${diff.toFixed(6)}</td>
                    <td>${diffSquared.toFixed(6)}</td>
                </tr>
            `;
        });
        
        html += `
                            <tr style="background-color: #f0f4ff; font-weight: bold;">
                                <td colspan="3">Sum</td>
                                <td>${sumSquaredDiff.toFixed(6)}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <p class="mb-2">Sₓ = √[Σ(xᵢ - x̄)² / (n - 1)]</p>
                <p class="mb-2">Sₓ = √[${sumSquaredDiff.toFixed(6)} / (${n} - 1)]</p>
                <p class="mb-2">Sₓ = √[${sumSquaredDiff.toFixed(6)} / ${n - 1}]</p>
                <p class="mb-2">Sₓ = √${(sumSquaredDiff / (n - 1)).toFixed(6)}</p>
                <p class="text-xl font-bold" style="color: #667eea;">Sₓ = ${stdDev.toFixed(6)}</p>
                <p class="text-sm mt-2 text-gray-700"><em>Note: Using (n-1) for sample standard deviation (Bessel's correction)</em></p>
            </div>
        `;
        
        // Display correlation calculations for each lag
        correlations.forEach((corr, idx) => {
            const k = corr.k;
            
            html += `
                <div class="mb-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                    <h4 class="font-semibold mb-3" style="color: #764ba2;">Step ${4 + idx}: Calculate Correlation Coefficient rₓₓ(${k})</h4>
                    <p class="mb-3">Formula: rₓₓ(k) = [1/(n-k)] × [Σ(xᵢ - x̄)(xᵢ₊ₖ - x̄)] / (Sₓ × Sₓ)</p>
                    
                    <div class="table-wrapper mb-3">
                        <table>
                            <thead>
                                <tr>
                                    <th>i</th>
                                    <th>xᵢ</th>
                                    <th>xᵢ₊${k}</th>
                                    <th>xᵢ - x̄</th>
                                    <th>xᵢ₊${k} - x̄</th>
                                    <th>(xᵢ - x̄)(xᵢ₊${k} - x̄)</th>
                                </tr>
                            </thead>
                            <tbody>
            `;
            
            let sumProduct = 0;
            for (let i = 0; i < n - k; i++) {
                const xi = numbers[i];
                const xik = numbers[i + k];
                const diffI = xi - mean;
                const diffIk = xik - mean;
                const product = diffI * diffIk;
                sumProduct += product;
                
                html += `
                    <tr>
                        <td>${i + 1}</td>
                        <td>${xi.toFixed(3)}</td>
                        <td>${xik.toFixed(3)}</td>
                        <td>${diffI.toFixed(6)}</td>
                        <td>${diffIk.toFixed(6)}</td>
                        <td>${product.toFixed(6)}</td>
                    </tr>
                `;
            }
            
            const sxSquared = stdDev * stdDev;
            const numerator = sumProduct;
            const denominator = sxSquared;
            const fraction = numerator / denominator;
            const coefficient = (1 / (n - k));
            
            html += `
                                <tr style="background-color: #f0f4ff; font-weight: bold;">
                                    <td colspan="5">Sum</td>
                                    <td>${sumProduct.toFixed(6)}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    
                    <p class="mb-2">rₓₓ(${k}) = [1/(n-k)] × [Σ(xᵢ - x̄)(xᵢ₊${k} - x̄)] / (Sₓ × Sₓ)</p>
                    <p class="mb-2">rₓₓ(${k}) = [1/(${n}-${k})] × [${sumProduct.toFixed(6)}] / (${stdDev.toFixed(6)} × ${stdDev.toFixed(6)})</p>
                    <p class="mb-2">rₓₓ(${k}) = [1/${n - k}] × [${sumProduct.toFixed(6)} / ${sxSquared.toFixed(6)}]</p>
                    <p class="mb-2">rₓₓ(${k}) = ${coefficient.toFixed(6)} × ${fraction.toFixed(6)}</p>
                    <p class="text-xl font-bold" style="color: #764ba2;">rₓₓ(${k}) = ${corr.rxx.toFixed(6)}</p>
                </div>
            `;
        });
        
        // Summary table
        html += `
            <div class="mb-6">
                <h4 class="font-semibold mb-3" style="color: #667eea;">Correlation Coefficient Summary</h4>
                <div class="table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th>Lag (k)</th>
                                <th>rₓₓ(k)</th>
                                <th>|rₓₓ(k)|</th>
                                <th>Assessment</th>
                            </tr>
                        </thead>
                        <tbody>
        `;
        
        let sumAbsCorr = 0;
        correlations.forEach(corr => {
            const absCorr = Math.abs(corr.rxx);
            sumAbsCorr += absCorr;
            let assessment, color;
            
            if (absCorr < 0.1) {
                assessment = 'Very Strong Independence';
                color = '#28a745';
            } else if (absCorr < 0.2) {
                assessment = 'Strong Independence';
                color = '#20c997';
            } else if (absCorr < 0.3) {
                assessment = 'Moderate Independence';
                color = '#ffc107';
            } else if (absCorr < 0.5) {
                assessment = 'Weak Independence';
                color = '#fd7e14';
            } else {
                assessment = 'Strong Dependence';
                color = '#dc3545';
            }
            
            html += `
                <tr>
                    <td>${corr.k}</td>
                    <td>${corr.rxx.toFixed(6)}</td>
                    <td>${absCorr.toFixed(6)}</td>
                    <td style="color: ${color}; font-weight: bold;">${assessment}</td>
                </tr>
            `;
        });
        
        const avgAbsCorr = sumAbsCorr / correlations.length;
        
        html += `
                            <tr style="background-color: #f0f4ff; font-weight: bold;">
                                <td colspan="2">Average</td>
                                <td>${avgAbsCorr.toFixed(6)}</td>
                                <td>-</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        `;
        
        // Add average absolute correlation display
        html += `
            <div class="mb-6 p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
                <h4 class="font-semibold mb-3" style="color: #667eea;">Average Absolute Correlation</h4>
                <p class="mb-2">Avg(|rₓₓ(k)|) = (${correlations.map(c => `|${c.rxx.toFixed(6)}|`).join(' + ')}) / ${correlations.length}</p>
                <p class="mb-2">Avg(|rₓₓ(k)|) = (${correlations.map(c => Math.abs(c.rxx).toFixed(6)).join(' + ')}) / ${correlations.length}</p>
                <p class="mb-2">Avg(|rₓₓ(k)|) = ${sumAbsCorr.toFixed(6)} / ${correlations.length}</p>
                <p class="text-xl font-bold" style="color: #667eea;">Avg(|rₓₓ(k)|) = ${avgAbsCorr.toFixed(6)}</p>
            </div>
        `;
        
        // Overall conclusion
        const maxAbsCorr = Math.max(...correlations.map(c => Math.abs(c.rxx)));
        const isIndependent = avgAbsCorr < 0.3;
        
        html += `
            <div class="mb-6 p-4 ${isIndependent ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'} border rounded-lg">
                <h4 class="font-semibold mb-3" style="color: ${isIndependent ? '#28a745' : '#f59e0b'};">Overall Conclusion</h4>
                <p class="mb-2"><strong>Maximum Absolute Correlation:</strong> ${maxAbsCorr.toFixed(6)}</p>
                <p class="mb-2"><strong>Average Absolute Correlation:</strong> ${avgAbsCorr.toFixed(6)}</p>
                <p class="text-lg font-bold" style="color: ${isIndependent ? '#28a745' : '#f59e0b'};">
                    ${isIndependent ? 
                        '✓ FAIL TO REJECT H₀: The random numbers appear to be INDEPENDENT' : 
                        '⚠ Evidence suggests the numbers may have some DEPENDENCE'}
                </p>
                <p class="mt-2 text-sm">
                    ${isIndependent ? 
                        'The average absolute correlation is small (close to zero), indicating independence.' : 
                        'The average absolute correlation is not close to zero, which may indicate dependence. Further testing is recommended.'}
                </p>
            </div>
            
            <div class="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <h4 class="font-semibold mb-2" style="color: #667eea;">Interpretation Guide</h4>
                <p class="text-sm mb-2">The correlation coefficient rₓₓ(k) measures the linear relationship between values separated by k positions:</p>
                <ul class="text-sm list-disc list-inside space-y-1">
                    <li><strong>|rₓₓ(k)| ≈ 0:</strong> Strong evidence of independence</li>
                    <li><strong>0.1 ≤ |rₓₓ(k)| < 0.3:</strong> Weak to moderate correlation (generally acceptable)</li>
                    <li><strong>|rₓₓ(k)| ≥ 0.3:</strong> Moderate to strong correlation (evidence of dependence)</li>
                    <li><strong>|rₓₓ(k)| → 1:</strong> Strong dependence</li>
                </ul>
                <p class="text-sm mt-2"><strong>Note:</strong> The average absolute correlation Avg(|rₓₓ(k)|) provides an overall measure of independence across all tested lags.</p>
            </div>
        `;
        
        output.innerHTML = html;
        document.getElementById('independenceResults').classList.remove('hidden');
        
        setTimeout(() => {
            document.getElementById('independenceResults').scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
    }
};