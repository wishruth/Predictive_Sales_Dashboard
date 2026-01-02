import os
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from supabase import create_client
import pandas as pd 
from sklearn.linear_model import LinearRegression
from datetime import timedelta
import numpy as np
import random

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

URL = os.getenv("SUPABASE_URL")
KEY = os.getenv("SUPABASE_KEY")
supabase = create_client(URL, KEY)

@app.get("/api/v1/analytics/stats")
async def get_stats():
    res = supabase.table("sales").select("amount").execute()
    df = pd.DataFrame(res.data)

    if df.empty:
        return {"total_revenue": 0, "total_orders": 0, "avg_order_value": 0}

    return {
        "total_revenue": round(df['amount'].sum(), 2), 
        "total_orders": len(df),
        "avg_order_value": round(df['amount'].mean(), 2) 
    }

@app.get("/api/v1/analytics/trends")
async def get_trends():
    res = supabase.table("sales").select("timestamp, amount").execute()
    df = pd.DataFrame(res.data)

    if df.empty:
        return []

    df['timestamp'] = pd.to_datetime(df['timestamp'])

    trend_df = df.groupby(df['timestamp'].dt.date)['amount'].sum().reset_index()
    trend_df.columns = ['date', 'amount']

    trend_df = trend_df.sort_values('date')

    return trend_df.to_dict(orient="records")

@app.get("/api/v1/analytics/forecast")
async def get_forecast():
    try: 
        res = supabase.table("sales").select("timestamp, amount").execute()
        df = pd.DataFrame(res.data)
        
        if df.empty: 
            return []

        df['timestamp'] = pd.to_datetime(df['timestamp'])
        daily = df.groupby(df['timestamp'].dt.date)['amount'].sum().reset_index()
        daily.columns = ['date', 'amount']

        if len(daily) >= 14:
            recent_performance = daily['amount'].tail(14).mean()
        else:
            recent_performance = daily['amount'].mean()

        last_date = pd.to_datetime(daily['date'].max())
        forecast = []
    

        for i in range(1, 8):
            variation = random.uniform(0.85, 1.15)
            predicted_value = round(recent_performance * variation, 2)
            forecast.append({
                "date": (last_date + timedelta(days=i+1)).strftime('%Y-%m-%d'), 
                "forecast": predicted_value
            })
    
        return forecast
    except Exception as e:
        print(f"CRITICAL FORECASTING ERROR: {e}") 
        return []

    
    
    
   
   

