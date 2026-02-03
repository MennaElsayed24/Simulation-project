// prng.js - Pseudo-Random Number Generator Module

const PRNG = {
    /**
     * Middle Square Method
     * Generates random numbers using the middle-square algorithm
     * @param {number} seed - Initial seed value
     * @param {number} count - Number of random numbers to generate
     * @param {number} scale - Scale factor (10, 100, or 1000) for converting Ui to RN
     * @returns {object} Object containing numbers array and detailed steps
     */
    middleSquare: function(seed, count, scale = 100) {
        if (isNaN(seed) || isNaN(count) || count < 1) {
            throw new Error('Invalid parameters for Middle Square method');
        }
        
        let digits = seed.toString().length;
        let current = seed;
        const numbers = [];
        const steps = [];
        
        // First row with seed (no Ui calculation)
        steps.push({
            i: 0,
            zi: seed,
            ui: '—',
            rn: '—',
            squared: seed * seed
        });
        
        for (let i = 0; i < count; i++) {
            let squared = current * current;
            let divisor = Math.pow(10, Math.floor(digits / 2));
            let modulo = Math.pow(10, digits);
            current = Math.floor((squared / divisor) % modulo);
            
            const ui = current / modulo; // Ui = Zi / 10^d
            const rn = Math.floor(ui * scale); // RN = Ui × scale (rounded down)
            
            numbers.push(rn);
            steps.push({
                i: i + 1,
                zi: current,
                ui: ui.toFixed(4),
                rn: rn,
                squared: squared
            });
        }
        
        return { numbers, steps, scale };
    },
    
    /**
     * Linear Congruential Generator (LCG)
     * Generates random numbers using the LCG algorithm: X(n+1) = (a*X(n) + c) mod m
     * @param {number} seed - Initial seed value (X0)
     * @param {number} a - Multiplier
     * @param {number} c - Increment
     * @param {number} m - Modulus
     * @param {number} count - Number of random numbers to generate
     * @param {number} scale - Scale factor (10, 100, or 1000) for converting Ui to RN
     * @returns {object} Object containing numbers array and detailed steps
     */
    lcg: function(seed, a, c, m, count, scale = 100) {
        if (isNaN(seed) || isNaN(a) || isNaN(c) || isNaN(m) || isNaN(count)) {
            throw new Error('Invalid parameters for LCG method');
        }
        
        if (m <= 0 || count < 1) {
            throw new Error('Modulus must be positive and count must be at least 1');
        }
        
        let current = seed;
        const numbers = [];
        const steps = [];
        
        // First row with seed (no Ui calculation)
        steps.push({
            i: 0,
            zi: seed,
            ui: '—',
            rn: '—'
        });
        
        for (let i = 0; i < count; i++) {
            current = (a * current + c) % m;
            const ui = current / m; // Ui = Zi / m
            const rn = Math.floor(ui * scale); // RN = Ui × scale (rounded down)
            
            numbers.push(rn);
            steps.push({
                i: i + 1,
                zi: current,
                ui: ui.toFixed(3),
                rn: rn
            });
        }
        
        return { numbers, steps, scale };
    },
    
    /**
     * Validates PRNG parameters before generation
     * @param {string} method - 'middlesquare' or 'lcg'
     * @param {object} params - Parameters object containing seed, count, and LCG params
     * @returns {object} {valid: boolean, message: string}
     */
    validateParams: function(method, params) {
        if (method === 'middlesquare') {
            if (isNaN(params.seed) || isNaN(params.count)) {
                return {valid: false, message: 'Please enter valid seed and count'};
            }
            if (params.count < 1 || params.count > 10000) {
                return {valid: false, message: 'Count must be between 1 and 10000'};
            }
            return {valid: true};
        }
        
        if (method === 'lcg') {
            const {seed, a, c, m, count} = params;
            if (isNaN(seed) || isNaN(a) || isNaN(c) || isNaN(m) || isNaN(count)) {
                return {valid: false, message: 'Please enter all LCG parameters'};
            }
            if (m <= 0) {
                return {valid: false, message: 'Modulus (m) must be positive'};
            }
            if (count < 1 || count > 10000) {
                return {valid: false, message: 'Count must be between 1 and 10000'};
            }
            return {valid: true};
        }
        
        return {valid: false, message: 'Unknown PRNG method'};
    },
    
    /**
     * Generate random numbers based on method and parameters
     * @param {string} method - 'middlesquare' or 'lcg'
     * @param {object} params - Parameters for the selected method (must include scale)
     * @returns {object} Object containing numbers array and steps for table display
     */
    generate: function(method, params) {
        const validation = this.validateParams(method, params);
        if (!validation.valid) {
            throw new Error(validation.message);
        }
        
        const scale = params.scale || 100;
        
        if (method === 'middlesquare') {
            return this.middleSquare(params.seed, params.count, scale);
        } else if (method === 'lcg') {
            return this.lcg(params.seed, params.a, params.c, params.m, params.count, scale);
        } else {
            throw new Error('Unknown PRNG method: ' + method);
        }
    }
};