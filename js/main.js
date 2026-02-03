// main.js - Modified to support new test modules

let selectedQueue = null;
let selectedRandomMethod = null;
let selectedPRNGMethod1 = null;
let selectedPRNGMethod2 = null;
let generatedRandomNumbers = [];
let generatedRandomNumbers2 = [];

// Enable/disable sections
function enableSection(sectionId) {
    const section = document.getElementById(sectionId);
    section.classList.remove('section-disabled');
    section.classList.add('section-enabled');
    section.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function disableSection(sectionId) {
    const section = document.getElementById(sectionId);
    section.classList.add('section-disabled');
    section.classList.remove('section-enabled');
}

function resetFromStep(stepNumber) {
    for (let i = stepNumber; i <= 5; i++) {
        disableSection(`step${i}`);
    }
    disableSection('simulationArea');
}

document.addEventListener('DOMContentLoaded', function () {
    // Queue selection
    document.querySelectorAll('[data-queue]').forEach(card => {
        card.addEventListener('click', function () {
            selectQueueType(this.dataset.queue, this);
        });
    });

    // Random method selection
    document.querySelectorAll('[data-random]').forEach(card => {
        card.addEventListener('click', function () {
            selectRandomMethod(this.dataset.random, this);
        });
    });

    // Single-set PRNG selectors (no longer used)
    document.querySelectorAll('[data-prng]').forEach(card => {
        card.addEventListener('click', function () {
            selectPRNGMethod(this.dataset.prng, this);
        });
    });

    // Dual-set PRNG selectors
    document.querySelectorAll('[data-prng-set1]').forEach(card => {
        card.addEventListener('click', function () {
            selectPRNGMethodSet(1, this.dataset.prngSet1, this);
        });
    });

    document.querySelectorAll('[data-prng-set2]').forEach(card => {
        card.addEventListener('click', function () {
            selectPRNGMethodSet(2, this.dataset.prngSet2, this);
        });
    });

    // Generate buttons
    document.getElementById('generateMS1Btn')?.addEventListener('click', () => generateMiddleSquare(1));
    document.getElementById('generateMS2Btn')?.addEventListener('click', () => generateMiddleSquare(2));
    document.getElementById('generateLCG1Btn')?.addEventListener('click', () => generateLCG(1));
    document.getElementById('generateLCG2Btn')?.addEventListener('click', () => generateLCG(2));

    document.getElementById('startSimBtn')?.addEventListener('click', startSimulation);
});

function selectQueueType(type, el) {
    selectedQueue = type;
    document.querySelectorAll('[data-queue]').forEach(card => card.classList.remove('selected'));
    el.classList.add('selected');

    // Reset subsequent steps
    selectedRandomMethod = null;
    selectedPRNGMethod1 = null;
    selectedPRNGMethod2 = null;
    generatedRandomNumbers = [];
    generatedRandomNumbers2 = [];

    document.querySelectorAll('[data-random]').forEach(c => c.classList.remove('selected'));
    document.querySelectorAll('[data-prng]').forEach(c => c.classList.remove('selected'));
    document.querySelectorAll('[data-prng-set1]').forEach(c => c.classList.remove('selected'));
    document.querySelectorAll('[data-prng-set2]').forEach(c => c.classList.remove('selected'));

    // Clear PRNG results
    document.getElementById('msResults1')?.classList.add('hidden');
    document.getElementById('msResults2')?.classList.add('hidden');
    document.getElementById('lcgResults1')?.classList.add('hidden');
    document.getElementById('lcgResults2')?.classList.add('hidden');

    // Clear input fields
    clearPRNGInputs();

    // Mathematical queue, uniformity test, and independence test skip random number selection
    if (type === 'mathematical' || type === 'uniformity' || type === 'independence') {
        resetFromStep(2);
        enableSection('step5');
    } else {
        resetFromStep(3);
        enableSection('step2');
    }
}

function selectRandomMethod(method, el) {
    selectedRandomMethod = method;
    document.querySelectorAll('[data-random]').forEach(card => card.classList.remove('selected'));
    el.classList.add('selected');

    // ALL simulation types now need two sets when using PRNG
    const needsTwoSets = (selectedQueue === 'multi' || selectedQueue === 'inventory' || selectedQueue === 'single');

    // Reset PRNG selections and generated numbers
    selectedPRNGMethod1 = null;
    selectedPRNGMethod2 = null;
    generatedRandomNumbers = [];
    generatedRandomNumbers2 = [];

    // Clear PRNG results
    document.getElementById('msResults1')?.classList.add('hidden');
    document.getElementById('msResults2')?.classList.add('hidden');
    document.getElementById('lcgResults1')?.classList.add('hidden');
    document.getElementById('lcgResults2')?.classList.add('hidden');

    clearPRNGInputs();

    if (method === 'prng') {
        // Always show dual method selection for PRNG
        document.getElementById('singleMethodSelection').classList.add('hidden');
        document.getElementById('dualMethodSelection').classList.remove('hidden');
        
        // Update the note based on queue type
        const noteEl = document.getElementById('dualConfigNote');
        if (selectedQueue === 'single') {
            noteEl.innerHTML = '<strong>Note:</strong> Single-Server simulation requires 2 sets of random numbers: one for interarrival times and one for service times. You can choose different methods for each set.';
        } else {
            noteEl.innerHTML = '<strong>Note:</strong> Multi-Server and Inventory simulations require 2 sets of random numbers. You can choose different methods for each set.';
        }
        noteEl.classList.remove('hidden');

        resetFromStep(4);
        enableSection('step3');
    } else {
        // Manual mode - skip to simulation
        resetFromStep(3);
        enableSection('step5');
    }
}

function selectPRNGMethod(method, el) {
    // This function is no longer used but kept for compatibility
    selectedPRNGMethod1 = method;
    document.querySelectorAll('[data-prng]').forEach(card => card.classList.remove('selected'));
    el.classList.add('selected');
    showConfigSection();
}

function selectPRNGMethodSet(setNum, method, el) {
    if (setNum === 1) {
        selectedPRNGMethod1 = method;
        document.querySelectorAll('[data-prng-set1]').forEach(c => c.classList.remove('selected'));
    } else {
        selectedPRNGMethod2 = method;
        document.querySelectorAll('[data-prng-set2]').forEach(c => c.classList.remove('selected'));
    }

    el.classList.add('selected');
    showConfigSection();
}

function showConfigSection() {
    // All queue types now need both methods selected
    if (!selectedPRNGMethod1 || !selectedPRNGMethod2) return;

    const set1MS = document.getElementById('set1MSConfig');
    const set1LCG = document.getElementById('set1LCGConfig');
    const set2MS = document.getElementById('set2MSConfig');
    const set2LCG = document.getElementById('set2LCGConfig');

    if (set1MS) set1MS.classList.add('hidden');
    if (set1LCG) set1LCG.classList.add('hidden');
    if (set2MS) set2MS.classList.add('hidden');
    if (set2LCG) set2LCG.classList.add('hidden');

    // Show config for Set 1 (Interarrival/Demand)
    if (selectedPRNGMethod1 === 'middlesquare') {
        if (set1MS) set1MS.classList.remove('hidden');
    } else if (selectedPRNGMethod1 === 'lcg') {
        if (set1LCG) set1LCG.classList.remove('hidden');
    }

    // Show config for Set 2 (Service/Lead Time)
    if (selectedPRNGMethod2 === 'middlesquare') {
        if (set2MS) set2MS.classList.remove('hidden');
    } else if (selectedPRNGMethod2 === 'lcg') {
        if (set2LCG) set2LCG.classList.remove('hidden');
    }

    enableSection('step4');
    disableSection('step5');
}

function generateMiddleSquare(setNum) {
    const seedEl = document.getElementById(`msSeed${setNum}`);
    const countEl = document.getElementById(`msCount${setNum}`);
    const scaleEl = document.getElementById(`msScale${setNum}`);
    
    if (!seedEl || !countEl || !scaleEl) {
        alert('Missing MS inputs for set ' + setNum);
        return;
    }

    const seed = parseInt(seedEl.value);
    const count = parseInt(countEl.value);
    const scale = parseInt(scaleEl.value);

    try {
        const result = PRNG.middleSquare(seed, count, scale);
        const numbers = result.numbers;
        const steps = result.steps;
        
        if (setNum === 1) {
            generatedRandomNumbers = numbers;
            displayMiddleSquareTable(1, seed, scale, steps, numbers);
        } else {
            generatedRandomNumbers2 = numbers;
            displayMiddleSquareTable(2, seed, scale, steps, numbers);
        }

        checkIfReady();
    } catch (error) {
        alert(error.message);
    }
}

function displayMiddleSquareTable(setNum, seed, scale, steps, numbers) {
    const res = document.getElementById(`msResults${setNum}`);
    if (!res) return;
    
    res.classList.remove('hidden');
    
    const maxRN = scale - 1;
    
    let html = `
        <div style="margin-top: 15px;">
            <strong>Middle-Square Method with seed = ${seed}</strong>
            <div class="table-wrapper" style="margin-top: 15px;">
                <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr style="background: #667eea; color: white;">
                            <th style="padding: 10px; border: 1px solid #ddd;">i</th>
                            <th style="padding: 10px; border: 1px solid #ddd;">Z<sub>i</sub></th>
                            <th style="padding: 10px; border: 1px solid #ddd;">U<sub>i</sub></th>
                            <th style="padding: 10px; border: 1px solid #ddd;">RN</th>
                            <th style="padding: 10px; border: 1px solid #ddd;">Z<sub>i</sub><sup>2</sup></th>
                        </tr>
                    </thead>
                    <tbody>
    `;
    
    steps.forEach((step, idx) => {
        html += `
            <tr style="background: ${idx % 2 === 0 ? '#f9f9f9' : 'white'};">
                <td style="padding: 10px; border: 1px solid #ddd; text-align: center;">${step.i}</td>
                <td style="padding: 10px; border: 1px solid #ddd; text-align: center; ${step.i === 0 ? 'background: #e8f5e9; font-weight: bold;' : ''}">${step.zi}</td>
                <td style="padding: 10px; border: 1px solid #ddd; text-align: center;">${step.ui}</td>
                <td style="padding: 10px; border: 1px solid #ddd; text-align: center; font-weight: bold; color: #667eea;">${step.rn}</td>
                <td style="padding: 10px; border: 1px solid #ddd; text-align: center; font-family: monospace;">${step.squared.toLocaleString()}</td>
            </tr>
        `;
    });
    
    html += `
                    </tbody>
                </table>
            </div>
        </div>
    `;
    
    res.innerHTML = html;
}

function generateLCG(setNum) {
    const seedEl = document.getElementById(`lcgSeed${setNum}`);
    const aEl = document.getElementById(`lcgA${setNum}`);
    const cEl = document.getElementById(`lcgC${setNum}`);
    const mEl = document.getElementById(`lcgM${setNum}`);
    const countEl = document.getElementById(`lcgCount${setNum}`);
    const scaleEl = document.getElementById(`lcgScale${setNum}`);

    if (!seedEl || !aEl || !cEl || !mEl || !countEl || !scaleEl) {
        alert('Missing LCG inputs for set ' + setNum);
        return;
    }

    const seed = parseInt(seedEl.value);
    const a = parseInt(aEl.value);
    const c = parseInt(cEl.value);
    const m = parseInt(mEl.value);
    const count = parseInt(countEl.value);
    const scale = parseInt(scaleEl.value);

    try {
        const result = PRNG.lcg(seed, a, c, m, count, scale);
        const numbers = result.numbers;
        const steps = result.steps;
        
        if (setNum === 1) {
            generatedRandomNumbers = numbers;
            displayLCGTable(1, seed, a, c, m, scale, steps, numbers);
        } else {
            generatedRandomNumbers2 = numbers;
            displayLCGTable(2, seed, a, c, m, scale, steps, numbers);
        }

        checkIfReady();
    } catch (error) {
        alert(error.message);
    }
}

function displayLCGTable(setNum, seed, a, c, m, scale, steps, numbers) {
    const res = document.getElementById(`lcgResults${setNum}`);
    if (!res) return;
    
    res.classList.remove('hidden');
    
    const maxRN = scale - 1;
    
    let html = `
        <div style="margin-top: 15px;">
            <strong>LCG: Z<sub>i</sub> = (${a}Z<sub>i-1</sub> + ${c})(mod ${m}) with Z<sub>0</sub> = ${seed}</strong>
            <div class="table-wrapper" style="margin-top: 15px;">
                <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr style="background: #667eea; color: white;">
                            <th style="padding: 10px; border: 1px solid #ddd;">i</th>
                            <th style="padding: 10px; border: 1px solid #ddd;">Z<sub>i</sub></th>
                            <th style="padding: 10px; border: 1px solid #ddd;">U<sub>i</sub></th>
                            <th style="padding: 10px; border: 1px solid #ddd;">RN</th>
                        </tr>
                    </thead>
                    <tbody>
    `;
    
    steps.forEach((step, idx) => {
        html += `
            <tr style="background: ${idx % 2 === 0 ? '#f9f9f9' : 'white'};">
                <td style="padding: 10px; border: 1px solid #ddd; text-align: center;">${step.i}</td>
                <td style="padding: 10px; border: 1px solid #ddd; text-align: center; ${step.i === 0 ? 'background: #e8f5e9; font-weight: bold;' : ''}">${step.zi}</td>
                <td style="padding: 10px; border: 1px solid #ddd; text-align: center;">${step.ui}</td>
                <td style="padding: 10px; border: 1px solid #ddd; text-align: center; font-weight: bold; color: #667eea;">${step.rn}</td>
            </tr>
        `;
    });
    
    html += `
                    </tbody>
                </table>
            </div>
            <div style="margin-top: 15px; padding: 12px; background: #f0f4ff; border-radius: 8px; border-left: 4px solid #667eea;">
                <strong>Example calculation:</strong><br>
                Z<sub>1</sub> = (${a}Z<sub>0</sub> + ${c}) mod ${m}<br>
                Z<sub>1</sub> = (${a} × ${seed} + ${c}) mod ${m} = ${a * seed + c} mod ${m} = ${steps[1].zi}<br>
                U<sub>1</sub> = Z<sub>1</sub> / ${m} = ${steps[1].zi} / ${m} = ${steps[1].ui}<br>
                RN<sub>1</sub> = ⌊U<sub>1</sub> × ${scale}⌋ = ⌊${steps[1].ui} × ${scale}⌋ = ${steps[1].rn}
            </div>
        </div>
    `;
    
    res.innerHTML = html;
}

function checkIfReady() {
    // All queue types using PRNG now need both sets
    if (generatedRandomNumbers.length && generatedRandomNumbers2.length) {
        enableSection('step5');
    }
}

function clearPRNGInputs() {
    const inputs = ['msSeed1', 'msCount1', 'msSeed2', 'msCount2', 
                    'lcgSeed1', 'lcgA1', 'lcgC1', 'lcgM1', 'lcgCount1', 
                    'lcgSeed2', 'lcgA2', 'lcgC2', 'lcgM2', 'lcgCount2'];
    inputs.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });
}

function startSimulation() {
    // Skip PRNG validation for mathematical queue and tests
    if (selectedQueue !== 'mathematical' && selectedQueue !== 'uniformity' && selectedQueue !== 'independence' && selectedRandomMethod === 'prng') {
        // All simulation types now require both PRNG methods
        if (!selectedPRNGMethod1 || !selectedPRNGMethod2) {
            alert('Please select PRNG methods for both sets!');
            return;
        }
        if (generatedRandomNumbers.length === 0 || generatedRandomNumbers2.length === 0) {
            alert('Please generate both sets of random numbers!');
            return;
        }
    }

    const simContent = document.getElementById('simulationContent');
    enableSection('simulationArea');

    // Create fresh copies of random numbers to avoid index issues
    const randomNumbersCopy = [...generatedRandomNumbers];
    const randomNumbers2Copy = [...generatedRandomNumbers2];

    if (selectedQueue === 'multi') {
        MultiServerQueue.init(simContent, selectedRandomMethod, randomNumbersCopy, randomNumbers2Copy);
    } else if (selectedQueue === 'inventory') {
        InventorySimulation.init(simContent, selectedRandomMethod, randomNumbersCopy, randomNumbers2Copy);
    } else if (selectedQueue === 'single') {
        SingleServerQueue.init(simContent, selectedRandomMethod, randomNumbersCopy, randomNumbers2Copy);
    } else if (selectedQueue === 'mathematical') {
        MathematicalQueue.init(simContent, 'manual', []);
    } else if (selectedQueue === 'uniformity') {
        UniformityTest.init(simContent, 'manual', []);
    } else if (selectedQueue === 'independence') {
        IndependenceTest.init(simContent, 'manual', []);
    }
}

// Helper function to get max customers based on PRNG counts
function getMaxCustomers() {
    if (selectedRandomMethod !== 'prng') {
        return 100; // No restriction for manual mode
    }
    
    // For PRNG mode, limit is the minimum of both sets
    // Set 1 is for interarrival (customers - 1 needed since first customer doesn't use one)
    // Set 2 is for service (customers needed)
    const maxFromSet1 = generatedRandomNumbers.length + 1; // +1 because first customer doesn't need interarrival RN
    const maxFromSet2 = generatedRandomNumbers2.length;
    
    return Math.min(maxFromSet1, maxFromSet2);
}