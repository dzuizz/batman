import json
import random
from faker import Faker

STATUS_CHOICES = ["Abandoned", "Maintenance", "Development", "Proposal"]
PROJECT_TYPE_CHOICES = ["infrastructure", "education", "healthcare", "housing", "other"]

fake = Faker()


# Generate random coordinates within Indonesia's geographic bounds
def generate_coordinates():
    ret = []
    for i in range(1):
        lat = random.uniform(-10.0, 6.0)  # Approximate latitudinal bounds of Indonesia
        lng = random.uniform(
            95.0, 141.0
        )  # Approximate longitudinal bounds of Indonesia
        ret.append({"lat": round(lat, 6), "lng": round(lng, 6)})
    return ret


# Generate data entry
def generate(id_prefix, count):
    database = []
    for i in range(1, count + 1):
        data = {
            "id": f"{id_prefix}{str(i).zfill(3)}",
            "name": f"{fake.city()} {fake.word().capitalize()} data",
            "status": random.choice(STATUS_CHOICES),
            "coordinates": generate_coordinates(),
            "startDate": fake.date_between(
                start_date="-5y", end_date="today"
            ).isoformat(),
            "estimatedCompletion": fake.date_between(
                start_date="+5d", end_date="+5y"
            ).isoformat(),
            "progress": random.randint(0, 100),
            "contractor": fake.company(),
            "budget": random.randint(0, 1000000000),
            "type": random.choice(PROJECT_TYPE_CHOICES),
            "description": fake.sentence(),

            # "capacity": random.randint(0, 100),
            # "voltage": random.randint(0, 100),

            # "pressure": random.randint(0, 100),
            # "flow_rate": random.randint(0, 100),

            # "trafficDensity": random.randint(0, 100),
        }
        data = {k: v for k, v in data.items() if v is not None}
        database.append(data)
    return database


big_projects = generate("BP", 1000)
small_projects = generate("SP", 1000)
with open("government.json", "w") as f:
    json.dump(
        {"big_projects": big_projects, "small_projects": small_projects},
        f,
        indent=4,
    )
