let chart;

function getColor(label) {
    if (label === "Low") return "green";
    if (label === "Moderate") return "orange";
    return "red";
}

// 1. Main predict button opens the model selection modal
function predict() {
    document.getElementById("modelModal").style.display = "block";
}

// 2. Close modal function
function closeModal() {
    document.getElementById("modelModal").style.display = "none";
}

function parseNumber(id) {
    const input = document.getElementById(id);
    const value = input.value.trim();
    const number = parseFloat(value);
    return value === "" || isNaN(number) ? null : number;
}

// 3. The actual prediction happens after selecting a model in the modal
function confirmPredict(choice) {
    closeModal(); // Hide the pop-up

    const open = parseNumber("open");
    const high = parseNumber("high");
    const low = parseNumber("low");
    const close = parseNumber("close");
    const volume = parseNumber("volume");
    const marketCap = parseNumber("marketCap");

    if (open === null || high === null || low === null || close === null || volume === null || marketCap === null) {
        alert("Please enter valid numeric values for all input fields before predicting.");
        return;
    }

    if (open <= 0 || high <= 0 || low <= 0 || close <= 0 || volume <= 0 || marketCap <= 0) {
        alert("All values must be greater than zero. Please check your inputs.");
        return;
    }

    let data = {
        model_choice: choice, // Send the chosen model ID
        crypto: document.getElementById("crypto").value,
        open,
        high,
        low,
        close,
        volume,
        marketCap
    };

    fetch('/predict', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(data)
    })
    .then(res => res.json().then(body => ({status: res.status, body})))
    .then(res => {
        if (res.status !== 200) {
            alert(res.body.error || 'Unable to predict. Please check your inputs.');
            return;
        }

        document.getElementById("outputPanel").classList.add("show");

        document.getElementById("resultText").innerText =
            "Predicted Volatility: " + res.body.volatility.toFixed(4);

        // Updated to show the name of the model that was used!
        document.getElementById("riskText").innerText =
            "Risk Level: " + res.body.label + " (via " + res.body.model_used + ", R²: " + res.body.r2_score.toFixed(3) + ")";

        document.getElementById("riskText").style.color =
            getColor(res.body.label);

        // RIGHT SIDE INFO - DETAILS CARD
        // Format market cap with proper units
        let marketCapDisplay = 'N/A';
        if (data.marketCap > 0) {
            if (data.marketCap >= 1e9) {
                marketCapDisplay = `$${(data.marketCap / 1e9).toFixed(2)}B`;
            } else if (data.marketCap >= 1e6) {
                marketCapDisplay = `$${(data.marketCap / 1e6).toFixed(2)}M`;
            } else {
                marketCapDisplay = `$${data.marketCap.toLocaleString()}`;
            }
        }

        const detailsData = [
            { label: 'Open Price', value: `$${data.open.toFixed(2)}`, icon: '' },
            { label: 'High Price', value: `$${data.high.toFixed(2)}`, icon: '' },
            { label: 'Low Price', value: `$${data.low.toFixed(2)}`, icon: '' },
            { label: 'Close Price', value: `$${data.close.toFixed(2)}`, icon: '' },
            { label: 'Volume', value: data.volume.toLocaleString(), icon: '' },
            { label: 'Market Cap', value: marketCapDisplay, icon: '' }
        ];

        const cardHTML = detailsData.map(item => `
            <div class="details-card">
                <span class="card-icon">${item.icon}</span>
                <div class="card-label">${item.label}</div>
                <div class="card-value">${item.value}</div>
            </div>
        `).join('');

        document.getElementById("detailsCardContainer").innerHTML = cardHTML;

        // GRAPH VALUES
        let values = [0.01, 0.03, 0.07];

        if (res.body.label === "Low") values[0] = res.body.volatility;
        if (res.body.label === "Moderate") values[1] = res.body.volatility;
        if (res.body.label === "High") values[2] = res.body.volatility;

        if (chart) chart.destroy();

        chart = new Chart(document.getElementById("chart"), {
            type: 'line',
            data: {
                labels: ["Low", "Moderate", "High"],
                datasets: [{
                    label: "Volatility",
                    data: values,
                    borderColor: "#ff8c00", // Updated to orange to match theme
                    backgroundColor: "rgba(255,140,0,0.1)", // Updated to orange tint
                    pointBackgroundColor: ["green","orange","red"],
                    borderWidth: 3,
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                plugins: {
                    tooltip: {
                        // --- NEW CARD STYLING ---
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        titleColor: '#ff8c00', 
                        bodyColor: '#555555', 
                        borderColor: 'rgba(255, 140, 0, 0.3)', 
                        borderWidth: 1,
                        padding: 15,
                        cornerRadius: 15, 
                        displayColors: false, 
                        titleFont: {
                            family: "'Poppins', sans-serif",
                            size: 16,
                            weight: 'bold'
                        },
                        bodyFont: {
                            family: "'Poppins', sans-serif",
                            size: 13,
                            lineHeight: 1.6
                        },
                        callbacks: {
                            label: function(context) {
                                return "Volatility: " + context.raw.toFixed(4);
                            },
                            afterBody: function() {
                                return [
                                    "────────────────",
                                    "Open: " + data.open,
                                    "High: " + data.high,
                                    "Low: " + data.low,
                                    "Close: " + data.close
                                ];
                            }
                        }
                    }
                },
                scales: {
                    x: { 
                        ticks: { color: "#333" }, // Updated for light theme
                        grid: { color: "rgba(0,0,0,0.05)" }
                    },
                    y: { 
                        ticks: { color: "#333" }, // Updated for light theme
                        grid: { color: "rgba(0,0,0,0.05)" }
                    }
                }
            }
        });

    }).catch(err => {
        alert('Server error: ' + err.message + '. Please make sure the backend is running.');
        console.error(err);
    });
}