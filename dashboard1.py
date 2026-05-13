from flask import Flask, request, jsonify, render_template
import joblib
import numpy as np
import pandas as pd

app = Flask(__name__)

# LOAD MODELS
print("Loading models...", flush=True)
model_1 = joblib.load("volatility_model_1.pkl")
model_2 = joblib.load("volatility_model_2.pkl")
model_3 = joblib.load("volatility_model_3.pkl")  # Added Model 3

print("Loading features...", flush=True)
features_1 = joblib.load("features_1.pkl")
features_2 = joblib.load("features_2.pkl")
features_3 = joblib.load("features_3.pkl")  # Added Features 3

print("All three models loaded successfully!", flush=True)

# R² Scores for each model (from training evaluation)
r2_scores = {
    '1': 0.7223,  # Random Forest R² score
    '2': 0.794,   # CatBoost R² score
    '3': 0.809,   # XGBoost R² score
    'average': 0.7751  # Average R² score
}

def create_features(data):
    df = pd.DataFrame([data])

    df['price_range'] = (df['high'] - df['low']) / (df['open'] + 1e-6)
    df['return'] = (df['close'] - df['open']) / (df['open'] + 1e-6)
    df['liquidity'] = df['volume'] / (df['marketCap'] + 1e-6)
    df['liquidity_log'] = np.log1p(df['liquidity'])

    df['prev_close'] = df['close'].shift(1)

    df['true_range'] = np.maximum(df['high'] - df['low'], np.maximum(np.abs(df['high'] - df['prev_close']), np.abs(df['low'] - df['prev_close'])))

    df['bb_width_7'] = 4 * df['close'].rolling(7).std() / df['close'].rolling(7).mean()

    df['bb_position_14'] = (df['close'] - (df['close'].rolling(14).mean() - 2 * df['close'].rolling(14).std())) / (4 * df['close'].rolling(14).std())

    df['atr_14'] = df['true_range'].rolling(14).mean()

    df['atrp_7'] = df['true_range'].rolling(7).mean() / df['close'] * 100

    df['atrp_14'] = df['atr_14'] / df['close'] * 100

    df['rolling_std_14'] = df['close'].rolling(14).std()

    df['ema_12'] = df['close'].ewm(span=12).mean()

    df['ema_26'] = df['close'].ewm(span=26).mean()

    df['ema_diff'] = df['ema_12'] - df['ema_26']

    df['momentum_14'] = df['close'] / df['close'].shift(14) - 1

    df['lag_1'] = df['close'].shift(1)

    df['lag_2'] = df['close'].shift(2)

    df['lag_3'] = df['close'].shift(3)

    # For a single prediction row, many rolling features are undefined.
    # Fill missing values with sensible defaults so the model receives valid input.
    return df.fillna(0)

def classify_volatility(v):
    # Use realistic crypto volatility bands. Crypto volatility is often much
    # higher than traditional asset returns, so low/moderate thresholds are
    # raised to reflect the model's real output range.
    if v < 0.10:
        return "Low"
    elif v < 0.20:
        return "Moderate"
    else:
        return "High"

@app.route('/')
def home():
    return render_template("index.html")

@app.route('/predict', methods=['POST'])
def predict():
    data = request.json
    
    # --- ADDED: Get the model choice from the popup (defaults to 'average') ---
    model_choice = data.pop("model_choice", "average")
    
    data.pop("crypto", None)

    # Validate incoming numeric fields so blank or invalid inputs don't default to zero.
    required_fields = ["open", "high", "low", "close", "volume", "marketCap"]
    for field in required_fields:
        if field not in data or not isinstance(data[field], (int, float)):
            return jsonify({"error": f"Invalid or missing value for {field}. Please enter a valid number."}), 400
        if data[field] <= 0:
            return jsonify({"error": f"{field} must be greater than zero."}), 400

    df = create_features(data)

    # Predict using Model 1
    X_input_1 = df[features_1]
    pred_1 = model_1.predict(X_input_1)[0]

    # Predict using Model 2
    X_input_2 = df[features_2]
    pred_2 = model_2.predict(X_input_2)[0]

    # Predict using Model 3
    X_input_3 = df[features_3]
    pred_3 = model_3.predict(X_input_3)[0]

    # --- ADDED: Check which model the user clicked in the popup ---
    if model_choice == '1':
        final_pred = pred_1
        model_used = "Model 1 (Random Forest)"
    elif model_choice == '2':
        final_pred = pred_2
        model_used = "Model 2 (CatBoost)"
    elif model_choice == '3':
        final_pred = pred_3
        model_used = "Model 3 (XGBoost)"
    else:
        # Ensemble method: Combine all three predictions using arithmetic mean
        final_pred = (pred_1 + pred_2 + pred_3) / 3
        model_used = "Ensemble Average (All Models)"

    label = classify_volatility(final_pred)

    return jsonify({
        "volatility": float(final_pred),
        "label": label,
        "model_used": model_used,  # --- ADDED: Send the model name back to the frontend ---
        "r2_score": r2_scores.get(model_choice, 0.88)  # --- ADDED: Send the R² score ---
    })

# RUN APP
if __name__ == "__main__":
    print("Starting Flask app...", flush=True)
    app.run(debug=True, port=5001)