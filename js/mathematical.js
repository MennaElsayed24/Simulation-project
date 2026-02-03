const MathematicalQueue = {
    init: function(container, randomMethod, randomNumbers) {
        this.container = container;
        this.setupUI();
    },
    
    setupUI: function() {
        this.container.innerHTML = `
            <div>
                <h2 class="text-3xl font-bold mb-4" style="color: #667eea;">Queue Math - Analytical M/M/1 Calculator</h2>
                
                <div class="mb-6">
                    <h3 class="text-xl font-semibold mb-4" style="color: #667eea;">Inputs</h3>
                    
                    <div class="mb-4">
                        <h3 class="text-sm font-semibold mb-2">Arrival rate λ:</h3>
                        <input type="number" id="lambda" class="prng-input" step="any" min="0">
                    </div>
                    
                    <div class="mb-4">
                        <h3 class="text-sm font-semibold mb-2">Service rate μ:</h3>
                        <input type="number" id="mu" class="prng-input" step="any" min="0">
                    </div>
                    
                    <div class="mb-4">
                        <h3 class="text-sm font-semibold mb-2">Cost of Server C1 (optional):</h3>
                        <input type="number" id="C1" class="prng-input" step="any">
                    </div>
                    
                    <div class="mb-4">
                        <h3 class="text-sm font-semibold mb-2">Waiting Cost C2 (optional):</h3>
                        <input type="number" id="C2" class="prng-input" step="any">
                    </div>
                    
                    <div class="flex gap-3">
                        <button onclick="MathematicalQueue.compute()" class="btn-primary">Compute</button>
                        <button onclick="MathematicalQueue.reset()" class="btn-secondary">Reset</button>
                    </div>
                    
                    <div id="warnArea"></div>
                </div>
                
                <div class="mb-6">
                    <h3 class="text-xl font-semibold mb-4" style="color: #667eea;">Results</h3>
                    <div id="mathResults" class="grid grid-cols-1 md:grid-cols-2 gap-4"></div>
                </div>
                
                <div>
                    <h3 class="text-xl font-semibold mb-4" style="color: #667eea;">Probability of n Customers (Pn)</h3>
                    <div class="flex gap-3 items-center mb-3">
                        <input type="number" id="pn_n" class="prng-input" style="width: 150px;" min="0" value="0" placeholder="n">
                        <button onclick="MathematicalQueue.computePn()" class="btn-success" style="width: auto; padding: 10px 20px;">Compute Pn</button>
                    </div>
                    <div id="pnResult" style="background: #f0f4ff; padding: 15px; border-radius: 8px; border-left: 4px solid #667eea; white-space: pre-line; font-weight: 600;"></div>
                </div>
            </div>
        `;
    },
    
    num: function(id) {
        const v = Number(document.getElementById(id).value);
        return isFinite(v) ? v : NaN;
    },
    
    fmt2: function(x) {
        if (!isFinite(x)) return "-";
        const r = Number(x.toFixed(2));
        return Math.abs(r) === 0 ? "0.00" : r.toFixed(2);
    },
    
    nice: function(x) {
        if (Math.abs(Math.round(x) - x) < 1e-9) return String(Math.round(x));
        return Number(x).toPrecision(6);
    },
    
    card: function(title, formula) {
        return `
            <div style="background: #fafbff; padding: 16px; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                <div style="font-weight: 600; color: #667eea; margin-bottom: 10px; font-size: 16px;">${title}</div>
                <div style="font-size: 14px; white-space: pre-line; font-family: 'Courier New', monospace; line-height: 1.6;">${formula}</div>
            </div>
        `;
    },
    
    showWarn: function(msg) {
        const warnArea = document.getElementById("warnArea");
        if (msg) {
            warnArea.innerHTML = `<div style="color: #dc3545; font-weight: bold; margin-top: 15px; padding: 12px; background: #fee; border-radius: 8px; border-left: 4px solid #dc3545;">${msg}</div>`;
        } else {
            warnArea.innerHTML = "";
        }
    },
    
    compute: function() {
        this.showWarn("");
        const λ = this.num("lambda");
        const μ = this.num("mu");
        const C1 = this.num("C1");
        const C2 = this.num("C2");
        
        if (isNaN(λ) || isNaN(μ)) {
            this.showWarn("Please enter numeric values for λ and μ.");
            return;
        }
        
        if (λ < 0 || μ <= 0) {
            this.showWarn("An input is missing. Rates must be non-negative and μ > 0.");
            return;
        }
        
        const results = [];
        
        if (λ >= μ) {
            const R = λ / μ;
            results.push(
                this.card(
                    "Utilization R",
                    `R = λ / μ = ${this.nice(λ)} / ${this.nice(μ)} = ${this.fmt2(R)}`
                )
            );
            results.push(
                this.card(
                    "Idle Probability P0",
                    `P0 = 1 - R = 1 - ${this.fmt2(R)} = ${this.fmt2(1 - R)}`
                )
            );
            this.showWarn("⚠️ System unstable (λ ≥ μ). Other measures approach ∞");
            document.getElementById("mathResults").innerHTML = results.join("");
            return;
        }
        
        const R = λ / μ;
        const Ls = λ / (μ - λ);
        const Lq = (λ * λ) / (μ * (μ - λ));
        const Ws = 1 / (μ - λ);
        const Wq = λ / (μ * (μ - λ));
        const Pwait = R;
        const P0 = 1 - R;
        
        results.push(
            this.card(
                "Ls (Expected number in system)",
                `Ls = λ / (μ - λ)
   = ${this.nice(λ)} / (${this.nice(μ)} - ${this.nice(λ)})
   = ${this.nice(λ)} / ${this.nice(μ - λ)}
   = ${this.fmt2(Ls)}`
            )
        );
        
        results.push(
            this.card(
                "Lq (Expected number in queue)",
                `Lq = λ² / (μ(μ - λ))
   = ${this.nice(λ)}² / (${this.nice(μ)} × (${this.nice(μ)} - ${this.nice(λ)}))
   = ${this.nice(λ * λ)} / (${this.nice(μ)} × ${this.nice(μ - λ)})
   = ${this.fmt2(Lq)}`
            )
        );
        
        results.push(
            this.card(
                "Ws (Time in system)",
                `Ws = 1 / (μ - λ)
   = 1 / (${this.nice(μ)} - ${this.nice(λ)})
   = 1 / ${this.nice(μ - λ)}
   = ${this.fmt2(Ws)}`
            )
        );
        
        results.push(
            this.card(
                "Wq (Time in queue)",
                `Wq = λ / (μ(μ - λ))
   = ${this.nice(λ)} / (${this.nice(μ)} × (${this.nice(μ)} - ${this.nice(λ)}))
   = ${this.nice(λ)} / (${this.nice(μ)} × ${this.nice(μ - λ)})
   = ${this.fmt2(Wq)}`
            )
        );
        
        results.push(
            this.card(
                "Probability customer must wait",
                `P(wait) = R = λ / μ = ${this.nice(λ)} / ${this.nice(μ)} = ${this.fmt2(Pwait)}`
            )
        );
        
        results.push(
            this.card(
                "Utilization R (fraction)",
                `R = λ / μ = ${this.nice(λ)} / ${this.nice(μ)} = ${this.fmt2(R)}`
            )
        );
        
        results.push(
            this.card(
                "Idle Probability P0",
                `P0 = 1 - R = 1 - ${this.fmt2(R)} = ${this.fmt2(P0)}`
            )
        );
        
        if (!isNaN(C1) && !isNaN(C2)) {
            const TC = C1 + C2 * Ls;
            results.push(
                this.card(
                    "Total Cost TC",
                    `TC = C1 + C2 × Ls
   = ${this.nice(C1)} + ${this.nice(C2)} × ${this.fmt2(Ls)}
   = ${this.fmt2(TC)}`
                )
            );
        } else {
            results.push(this.card("Total Cost TC", "Enter C1 and C2 to compute TC."));
        }
        
        document.getElementById("mathResults").innerHTML = results.join("");
        document.getElementById("pnResult").innerHTML = "";
    },
    
    computePn: function() {
        this.showWarn("");
        const λ = this.num("lambda");
        const μ = this.num("mu");
        const n = this.num("pn_n");
        
        if (isNaN(λ) || isNaN(μ)) {
            this.showWarn("Enter λ and μ first.");
            return;
        }
        
        if (λ >= μ) {
            this.showWarn("Cannot compute Pn. System is unstable (λ ≥ μ).");
            return;
        }
        
        const R = λ / μ;
        const Pn = Math.pow(R, n) * (1 - R);
        
        document.getElementById("pnResult").innerHTML =
`Pn = R^n × (1 - R)
   = (${this.fmt2(R)})^${n} × (1 - ${this.fmt2(R)})
   = ${this.fmt2(Pn)} (fraction)
   = ${this.fmt2(Pn * 100)} %`;
    },
    
    reset: function() {
        document.getElementById("lambda").value = "";
        document.getElementById("mu").value = "";
        document.getElementById("C1").value = "";
        document.getElementById("C2").value = "";
        document.getElementById("pn_n").value = 0;
        document.getElementById("mathResults").innerHTML = "";
        document.getElementById("pnResult").innerHTML = "";
        this.showWarn("");
    }
};