// Global variables
let calculations = [];
let currentTab = 'tsw';

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the application
    initializeApp();
    
    // Form event listeners
    document.getElementById('tswForm').addEventListener('submit', function(e) {
        e.preventDefault();
        calculateTSW();
    });

    document.getElementById('sssForm').addEventListener('submit', function(e) {
        e.preventDefault();
        calculateSSS();
    });

    document.getElementById('clearHistory').addEventListener('click', function() {
        calculations = [];
        updateHistoryDisplay();
    });
});

// Initialize application
function initializeApp() {
    updateHistoryDisplay();
}

// Tab switching function
function showTab(tabName) {
    currentTab = tabName;
    
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Show selected tab
    document.getElementById(tabName + 'Tab').classList.add('active');
    
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Add active class to clicked button
    document.querySelector(`[onclick="showTab('${tabName}')"]`).classList.add('active');
    
    // Clear errors and hide results
    document.getElementById('error').style.display = 'none';
    document.getElementById('result').classList.remove('show');
    document.getElementById('sssResult').classList.remove('show');
}

// TSW Calculation function
function calculateTSW() {
    const weight = parseFloat(document.getElementById('weight').value);
    const count = parseInt(document.getElementById('count').value);
    const errorDiv = document.getElementById('error');
    const resultDiv = document.getElementById('result');

    // Clear previous error
    errorDiv.style.display = 'none';

    // Validation
    if (isNaN(weight) || isNaN(count) || weight <= 0 || count <= 0) {
        showError('Please enter valid positive numbers for both weight and seed count.');
        return;
    }

    if (count > 10000) {
        showError('Number of seeds seems unusually high. Please verify your input.');
        return;
    }

    // Calculate TSW using formula: TSW = (weight / count) * 1000
    const tsw = (weight / count) * 1000;

    // Display result
    document.getElementById('tswValue').textContent = tsw.toFixed(3);
    resultDiv.classList.add('show');

    // Add to history
    const calculation = {
        type: 'TSW',
        weight: weight,
        count: count,
        tsw: tsw,
        result: tsw.toFixed(3) + 'g per 1000 seeds',
        timestamp: new Date().toLocaleString()
    };
    calculations.unshift(calculation);

    // Keep only last 10 calculations
    if (calculations.length > 10) {
        calculations = calculations.slice(0, 10);
    }

    updateHistoryDisplay();

    // Provide interpretation
    setTimeout(() => {
        showInterpretation(tsw);
    }, 1000);
}

// SSS Calculation function
function calculateSSS() {
    const tsw = parseFloat(document.getElementById('tswInput').value);
    const seedCount = parseInt(document.getElementById('seedCount').value);
    const errorDiv = document.getElementById('error');
    const resultDiv = document.getElementById('sssResult');

    // Clear previous error
    errorDiv.style.display = 'none';

    // Validation
    if (isNaN(tsw) || isNaN(seedCount) || tsw <= 0 || seedCount <= 0) {
        showError('Please enter valid positive numbers for both TSW and seed count.');
        return;
    }

    if (seedCount > 50000) {
        showError('Number of seeds seems unusually high. Please verify your input.');
        return;
    }

    // Calculate SSS using the formula: SSS = (TSW / 1000) * number of seeds
    const sss = (tsw / 1000) * seedCount;

    // Display result
    document.getElementById('sssValue').textContent = sss.toFixed(3);
    resultDiv.classList.add('show');

    // Add to history
    const calculation = {
        type: 'SSS',
        tsw: tsw,
        seedCount: seedCount,
        sss: sss,
        result: sss.toFixed(3) + 'g subsample',
        timestamp: new Date().toLocaleString()
    };
    calculations.unshift(calculation);

    // Keep only last 10 calculations
    if (calculations.length > 10) {
        calculations = calculations.slice(0, 10);
    }

    updateHistoryDisplay();

    // Provide practical advice
    setTimeout(() => {
        showSSSAdvice(sss, seedCount);
    }, 1000);
}

// Error display function
function showError(message) {
    const errorDiv = document.getElementById('error');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    document.getElementById('result').classList.remove('show');
    document.getElementById('sssResult').classList.remove('show');
}

// TSW interpretation function
function showInterpretation(tsw) {
    let interpretation = '';
    if (tsw < 10) {
        interpretation = 'Very small seeds (e.g., lettuce, carrot)';
    } else if (tsw < 50) {
        interpretation = 'Small to medium seeds (e.g., tomato, pepper)';
    } else if (tsw < 200) {
        interpretation = 'Medium to large seeds (e.g., cucumber, squash)';
    } else if (tsw < 500) {
        interpretation = 'Large seeds (e.g., sunflower, pumpkin)';
    } else {
        interpretation = 'Very large seeds (e.g., large beans, nuts)';
    }
    
    // Add interpretation to result display
    const resultDiv = document.getElementById('result');
    let interpretationDiv = resultDiv.querySelector('.interpretation');
    if (!interpretationDiv) {
        interpretationDiv = document.createElement('div');
        interpretationDiv.className = 'interpretation';
        interpretationDiv.style.fontSize = '0.9em';
        interpretationDiv.style.marginTop = '10px';
        interpretationDiv.style.opacity = '0.9';
        resultDiv.appendChild(interpretationDiv);
    }
    interpretationDiv.textContent = interpretation;
}

// SSS advice function
function showSSSAdvice(sss, seedCount) {
    let advice = '';
    if (sss < 0.1) {
        advice = 'Very light subsample - use precision scale for accurate weighing';
    } else if (sss < 1) {
        advice = 'Light subsample - suitable for small-scale testing';
    } else if (sss < 10) {
        advice = 'Moderate subsample - good for standard laboratory work';
    } else if (sss < 100) {
        advice = 'Heavy subsample - suitable for field-scale applications';
    } else {
        advice = 'Very heavy subsample - consider reducing seed count for easier handling';
    }
    
    // Add advice to SSS result display
    const resultDiv = document.getElementById('sssResult');
    let adviceDiv = resultDiv.querySelector('.advice');
    if (!adviceDiv) {
        adviceDiv = document.createElement('div');
        adviceDiv.className = 'advice';
        adviceDiv.style.fontSize = '0.9em';
        adviceDiv.style.marginTop = '10px';
        adviceDiv.style.opacity = '0.9';
        resultDiv.appendChild(adviceDiv);
    }
    adviceDiv.textContent = advice;
}

// History display function
function updateHistoryDisplay() {
    const historyList = document.getElementById('historyList');
    
    if (calculations.length === 0) {
        historyList.innerHTML = '<div style="text-align: center; color: #999; padding: 20px;">No calculations yet</div>';
        return;
    }

    historyList.innerHTML = calculations.map(calc => {
        if (calc.type === 'TSW') {
            return `
                <div class="history-item">
                    <div>
                        <span style="background: #667eea; color: white; padding: 2px 8px; border-radius: 4px; font-size: 0.8em; margin-right: 8px;">TSW</span>
                        <strong>${calc.tsw.toFixed(3)}g</strong> 
                        <span style="opacity: 0.7;">(${calc.weight}g ÷ ${calc.count} seeds)</span>
                    </div>
                    <div style="font-size: 0.8em; opacity: 0.6;">${calc.timestamp}</div>
                </div>
            `;
        } else {
            return `
                <div class="history-item">
                    <div>
                        <span style="background: #4facfe; color: white; padding: 2px 8px; border-radius: 4px; font-size: 0.8em; margin-right: 8px;">SSS</span>
                        <strong>${calc.sss.toFixed(3)}g</strong> 
                        <span style="opacity: 0.7;">(${calc.seedCount} seeds × ${calc.tsw}g TSW)</span>
                    </div>
                    <div style="font-size: 0.8em; opacity: 0.6;">${calc.timestamp}</div>
                </div>
            `;
        }
    }).join('');
}