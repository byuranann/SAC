let calculations = [];
let currentTab = 'tsw';

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

    // Additional validation for very small weights
    if (weight < 0.001) {
        showError('Weight must be at least 0.001 grams for accurate calculation.');
        return;
    }

    if (count > 10000) {
        showError('Number of seeds seems unusually high. Please verify your input.');
        return;
    }

    // Calculate TSW
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

    // Keep only last 5 calculations
    if (calculations.length > 5) {
        calculations = calculations.slice(0, 5);
    }

    updateHistoryDisplay();

    // Provide interpretation
    setTimeout(() => {
        showInterpretation(tsw);
    }, 1000);
}

function calculateSSS() {
    const tsw = parseFloat(document.getElementById('tswInput').value);
    const totalWeight = parseFloat(document.getElementById('totalWeight').value);
    const seedCount = parseInt(document.getElementById('seedCount').value);
    const errorDiv = document.getElementById('error');
    const resultDiv = document.getElementById('sssResult');

    // Clear previous error
    errorDiv.style.display = 'none';

    // Validation
    if (isNaN(tsw) || isNaN(totalWeight) || isNaN(seedCount) || tsw <= 0 || totalWeight <= 0 || seedCount <= 0) {
        showError('Please enter valid positive numbers for TSW, total weight, and seed count.');
        return;
    }

    if (seedCount > 50000) {
        showError('Number of seeds seems unusually high. Please verify your input.');
        return;
    }

    // Calculate SSS using the formula: SSS = (TSW / 1000) * number of seeds
    const subsampleWeight = (tsw / 1000) * seedCount;
    
    // Calculate total number of subsamples and leftover
    const totalSubsamples = Math.floor(totalWeight / subsampleWeight);
    const usedWeight = totalSubsamples * subsampleWeight;
    const leftoverWeight = totalWeight - usedWeight;
    const leftoverSeeds = Math.round((leftoverWeight / tsw) * 1000);

    // Display results
    document.getElementById('sssValue').textContent = subsampleWeight.toFixed(3);
    document.getElementById('totalSubsamples').textContent = totalSubsamples;
    document.getElementById('leftoverWeight').textContent = leftoverWeight.toFixed(3);
    document.getElementById('leftoverSeeds').textContent = leftoverSeeds;
    
    // Show/hide leftover info based on whether there's any leftover
    const leftoverDiv = document.getElementById('leftoverInfo');
    if (leftoverWeight > 0.001) {
        leftoverDiv.style.display = 'block';
    } else {
        leftoverDiv.style.display = 'none';
    }
    
    resultDiv.classList.add('show');

    // Add to history
    const calculation = {
        type: 'SSS',
        tsw: tsw,
        totalWeight: totalWeight,
        seedCount: seedCount,
        subsampleWeight: subsampleWeight,
        totalSubsamples: totalSubsamples,
        leftoverWeight: leftoverWeight,
        leftoverSeeds: leftoverSeeds,
        result: `${subsampleWeight.toFixed(3)}g per subsample, ${totalSubsamples} complete + ${leftoverWeight.toFixed(3)}g leftover`,
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
        showSSSAdvice(subsampleWeight, seedCount, totalSubsamples, leftoverWeight);
    }, 1000);
}

function showError(message) {
    const errorDiv = document.getElementById('error');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    document.getElementById('result').classList.remove('show');
    document.getElementById('sssResult').classList.remove('show');
}

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

function showSSSAdvice(subsampleWeight, seedCount, totalSubsamples, leftoverWeight) {
    let advice = '';
    if (totalSubsamples === 0) {
        advice = 'Insufficient total weight - need more seeds to create even one subsample of this size';
    } else if (totalSubsamples === 1) {
        advice = 'Only one subsample possible - consider reducing subsample size for multiple tests';
    } else if (totalSubsamples < 5) {
        advice = 'Limited subsamples available - good for basic testing';
    } else if (totalSubsamples < 20) {
        advice = 'Good number of subsamples - suitable for comprehensive testing';
    } else {
        advice = 'Many subsamples possible - excellent for extensive research or quality control';
    }
    
    // Add leftover advice
    if (leftoverWeight > subsampleWeight * 0.5) {
        advice += '. Significant leftover - consider adjusting subsample size to minimize waste.';
    } else if (leftoverWeight > 0.001) {
        advice += '. Small leftover can be used for additional partial tests.';
    }
    
    // Add advice to SSS result display
    const resultDiv = document.getElementById('sssResult');
    let adviceDiv = resultDiv.querySelector('.advice');
    if (!adviceDiv) {
        adviceDiv = document.createElement('div');
        adviceDiv.className = 'advice';
        adviceDiv.style.fontSize = '0.9em';
        adviceDiv.style.marginTop = '15px';
        adviceDiv.style.opacity = '0.9';
        adviceDiv.style.textAlign = 'center';
        adviceDiv.style.fontStyle = 'italic';
        adviceDiv.style.padding = '10px';
        adviceDiv.style.background = 'rgba(102, 126, 234, 0.1)';
        adviceDiv.style.borderRadius = '8px';
        resultDiv.appendChild(adviceDiv);
    }
    adviceDiv.textContent = advice;
}

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
                        <strong>${calc.totalSubsamples} subsamples</strong> of ${calc.subsampleWeight.toFixed(3)}g each
                        ${calc.leftoverWeight > 0.001 ? `<span style="opacity: 0.7;"> + ${calc.leftoverWeight.toFixed(3)}g leftover</span>` : ''}
                    </div>
                    <div style="font-size: 0.8em; opacity: 0.6;">${calc.timestamp}</div>
                </div>
            `;
        }
    }).join('');
}

// Initialize history display
updateHistoryDisplay();

// Add some sample data on first load for demonstration
if (calculations.length === 0) {
    // This would normally be empty, but adding for demo purposes
}