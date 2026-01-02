import pandas as pd 
import numpy as np 
from faker import Faker
from datetime import datetime, timedelta

fake = Faker()

def generate_business_data(rows=500):
    data = []
    start_date = datetime.now() - timedelta(days = 180)

    for i in range(rows):
        days_passed = i / (rows / 180)
        #create upwards trend for falsified data
        trend = 1 + (days_passed / 200)

        date = start_date + timedelta(days=np.random.randint(0, 180))
        
        #weekend increased boost in sales falsified logic for trendmaking
        is_weekend = date.weekday() >= 5
        multiplier = 1.5 if is_weekend else 1.0 

        amount = round(np.random.uniform(20,500) * trend * multiplier, 2)
        
        data.append({
            "id": i,
            "timestamp": date,
            "amount": amount,
            "category": np.random.choice(["Software", "Consulting", "Hardware", "Subscription"]),
            "customer_name": fake.company(),
            "region": np.random.choice(["North America", "Europe", "Asia", "LATAM"]),
            "status": np.random.choice(["completed", "pending", "refunded"], p = [0.9, 0.07, 0.03])
        })

    df = pd.DataFrame(data).sort_values("timestamp")
    df.to_csv("mock_sales.csv", index = False)
    print("✅ mock_sales.csv generated with 500 records!")

if __name__ == "__main__":
    generate_business_data()
