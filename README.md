# Cryptocurrency Volatility Prediction Dashboard

An AI-powered web dashboard for predicting cryptocurrency volatility using machine learning models.

## Features

- **Multiple ML Models**: Choose from Random Forest, CatBoost, XGBoost, or Ensemble Average
- **Real-time Predictions**: Input market data to get instant volatility predictions
- **Interactive Visualization**: Chart showing volatility levels with risk indicators
- **Model Performance**: R² scores displayed for each model
- **Responsive Design**: Clean, professional interface

## Models & Performance

- **Random Forest**: R² = 0.7223
- **CatBoost**: R² = 0.794
- **XGBoost**: R² = 0.809
- **Ensemble Average**: R² = 0.7751

## Tech Stack

- **Backend**: Flask (Python)
- **Frontend**: HTML, CSS, JavaScript
- **ML Libraries**: scikit-learn, CatBoost, XGBoost
- **Visualization**: Chart.js

## Installation & Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/kriishna9/Cryptocurrency-volatility-prediction.git
   cd Cryptocurrency-volatility-prediction
   ```

2. **Install dependencies**

   ```bash
   pip install flask scikit-learn catboost xgboost pandas numpy joblib
   ```

3. **Note**: Model files (`volatility_model_*.pkl` and `features_*.pkl`) are not included in this repository due to size limitations. You will need to train your own models or obtain them separately.

4. **Run the application**

   ```bash
   python dashboard1.py
   ```

5. **Open in browser**
   ```
   http://127.0.0.1:5001
   ```

## Usage

1. Select a cryptocurrency from the dropdown
2. Enter market data (Open, High, Low, Close prices, Volume, Market Cap)
3. Click "Predict" to choose your preferred ML model
4. View the volatility prediction, risk level, and performance metrics

## Project Structure

```
├── dashboard1.py          # Flask backend with ML models
├── templates/
│   └── index.html         # Main dashboard interface
├── static/
│   ├── script.js          # Frontend JavaScript
│   └── style.css          # Dashboard styling
├── .gitignore            # Excluded files
└── README.md             # This file
```

## Model Training

The models were trained on historical cryptocurrency market data with features including:

- Price movements (open, high, low, close)
- Trading volume
- Market capitalization
- Technical indicators (moving averages, RSI, Bollinger Bands, etc.)

## Contributing

Feel free to fork this repository and submit pull requests for improvements.

## License

This project is open source and available under the MIT License.
