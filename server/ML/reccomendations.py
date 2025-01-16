import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans
from sklearn.metrics.pairwise import cosine_similarity
import tensorflow.keras as keras
from tensorflow.keras import layers, Model
from datetime import datetime

class TravelRecommendationSystem:
    def __init__(self, destinations_df):
        self.df = destinations_df.copy()
        self.previously_recommended = set()  # Track previous recommendations
        # ... [Previous __init__ code remains the same until state_neighbors]
        self.df = destinations_df.copy()
        self.feature_columns = [
            'budget_category', 'accessibility_score', 'crowd_level',
            'cultural_significance', 'adventure_score', 'relaxation_score',
            'nature_score', 'nightlife_score', 'family_friendly',
            'food_scene', 'shopping_score'
        ]
        self.scaler = StandardScaler()
        self.initialize_models()
        
        # Define state neighbors with approximate travel costs and travel time
        self.state_neighbors = {
            'karnataka': {
                'kerala': {'cost': 2000, 'time': 8},  # hours by train/bus
                'tamil nadu': {'cost': 2000, 'time': 8},
                'andhra pradesh': {'cost': 2500, 'time': 12},
                'telangana': {'cost': 2500, 'time': 14},
                'goa': {'cost': 1500, 'time': 6},
                'maharashtra': {'cost': 3000, 'time': 16}
            },
            'kerala': {
                'karnataka': {'cost': 2000, 'time': 8},
                'tamil nadu': {'cost': 1500, 'time': 6}
            },
            'tamil nadu': {
                'karnataka': {'cost': 2000, 'time': 8},
                'kerala': {'cost': 1500, 'time': 6},
                'andhra pradesh': {'cost': 2500, 'time': 12}
            }
            # Add more states as needed
        }
        self.month_to_season = {
            1: 'winter',   # January
            2: 'winter',   # February
            3: 'spring',   # March
            4: 'spring',   # April
            5: 'summer',   # May
            6: 'summer',   # June
            7: 'monsoon',  # July
            8: 'monsoon',  # August
            9: 'monsoon',  # September
            10: 'autumn',  # October
            11: 'autumn',  # November
            12: 'winter'   # December
        }
        self.seasonal_recommendations = {
            'winter': ['rajasthan', 'gujarat', 'madhya pradesh', 'maharashtra'],
            'summer': ['himachal pradesh', 'uttarakhand', 'sikkim', 'kerala'],
            'monsoon': ['kerala', 'goa', 'meghalaya', 'karnataka'],
            'spring': ['west bengal', 'odisha', 'kerala', 'karnataka'],
            'autumn': ['karnataka', 'kerala', 'tamil nadu', 'andhra pradesh']
        }

        # Previous seasonal_recommendations and month_to_season code remains the same
        
        # Define region diversity groups
        self.region_groups = {
            'south': ['karnataka', 'kerala', 'tamil nadu', 'andhra pradesh', 'telangana'],
            'west': ['maharashtra', 'gujarat', 'goa'],
            'north': ['delhi', 'punjab', 'haryana', 'rajasthan', 'uttarakhand', 'himachal pradesh'],
            'central': ['madhya pradesh', 'chhattisgarh'],
            'east': ['west bengal', 'odisha', 'bihar', 'jharkhand']
        }
    def initialize_models(self):
        """Initialize machine learning models or other components."""
        self.kmeans = KMeans(n_clusters=5, random_state=42)
        input_layer = layers.Input(shape=(len(self.feature_columns),))
        x = layers.Dense(64, activation='relu')(input_layer)
        x = layers.Dense(32, activation='relu')(x)
        output_layer = layers.Dense(5, activation='softmax')(x)
        self.recommendation_model = Model(inputs=input_layer, outputs=output_layer)
        self.recommendation_model.compile(optimizer='adam', loss='categorical_crossentropy')
        print("Models initialized successfully.")

    def calculate_travel_cost(self, user_state, destination_state):
        """Calculate approximate travel cost between states"""
        user_state = user_state.lower()
        destination_state = destination_state.lower()
        
        if user_state == destination_state:
            return {'cost': 1000, 'time': 4}  # Base cost and time for intra-state travel
        
        # Get cost from state_neighbors if available
        state_costs = self.state_neighbors.get(user_state, {})
        if destination_state in state_costs:
            return state_costs[destination_state]
        
        # Default values for distant states
        return {'cost': 5000, 'time': 24}

    def get_user_details(self):
        """Get comprehensive user travel details"""
        print("\n=== Travel Details ===")

        # Location
        print("\n=== Location Information ===")
        city = input("Enter your current city: ").lower()
        state = input("Enter your current state: ").lower()

        # Budget and duration
        while True:
            try:
                total_budget = float(
                    input("\nEnter your total budget (in ₹): "))
                num_days = int(
                    input("Enter number of days you want to travel: "))
                if total_budget <= 0 or num_days <= 0:
                    print("Please enter valid positive numbers.")
                    continue
                break
            except ValueError:
                print("Please enter valid numbers.")

        # Travel month
        while True:
            try:
                travel_month = int(
                    input("\nEnter the month you want to travel (1-12): "))
                if 1 <= travel_month <= 12:
                    break
                print("Please enter a valid month (1-12).")
            except ValueError:
                print("Please enter a valid month number.")

        # Calculate daily budget after travel costs
        daily_budget = total_budget / num_days

        return {
            'location': {'city': city, 'state': state},
            'total_budget': total_budget,
            'num_days': num_days,
            'daily_budget': daily_budget,
            'travel_month': travel_month
        }

    def get_user_preferences(self):
        """Collect user preferences through interactive input"""
        print("\n=== Travel Preference Questionnaire ===")
        preferences = self.get_user_details()

        # Travel style preferences
        print("\nRate your interest in the following (1-5, where 5 is highest):")
        preferences['adventure_score'] = int(input("Adventure activities: "))
        preferences['relaxation_score'] = int(input("Relaxation and peace: "))
        preferences['cultural_significance'] = int(
            input("Cultural experiences: "))
        preferences['nature_score'] = int(input("Nature and outdoors: "))
        preferences['nightlife_score'] = int(
            input("Nightlife and entertainment: "))

        # Additional preferences
        print("\nHow important are these factors? (1-5, where 5 is highest):")
        preferences['accessibility_score'] = int(input("Easy accessibility: "))
        preferences['crowd_level'] = int(
            input("Crowd levels (5 for busy, 1 for peaceful): "))
        preferences['family_friendly'] = int(
            input("Family-friendly amenities: "))
        preferences['food_scene'] = int(input("Food and dining options: "))
        preferences['shopping_score'] = int(input("Shopping opportunities: "))

        return preferences

    def get_region_for_state(self, state):
        """Get the region group for a given state"""
        state = state.lower()
        for region, states in self.region_groups.items():
            if state in states:
                return region
        return 'other'

    def filter_destinations(self, preferences):
        """Filter destinations based on comprehensive criteria"""
        filtered_df = self.df.copy()
        user_location = preferences['location']
        
        # Calculate total costs including travel
        travel_costs = []
        travel_times = []
        for _, row in filtered_df.iterrows():
            travel_info = self.calculate_travel_cost(user_location['state'], row['state'])
            travel_costs.append(travel_info['cost'])
            travel_times.append(travel_info['time'])
        
        filtered_df['travel_cost'] = travel_costs
        filtered_df['travel_time'] = travel_times
        
        # Calculate actual daily budget available after travel costs
        filtered_df['available_daily_budget'] = (
            preferences['total_budget'] - filtered_df['travel_cost']
        ) / preferences['num_days']
        
        # Filter by available budget with some flexibility
        filtered_df = filtered_df[
            filtered_df['avg_daily_cost'] <= (filtered_df['available_daily_budget'] * 1.1)
        ]
        
        # Season-based filtering with flexibility
        current_season = self.month_to_season[preferences['travel_month']]
        seasonal_states = self.seasonal_recommendations[current_season]
        filtered_df['season_score'] = filtered_df['state'].apply(
            lambda x: 1.0 if x.lower() in seasonal_states else 0.7  # Less strict seasonal penalty
        )
        
        # Calculate location scores with more flexibility
        location_scores = []
        for idx, row in filtered_df.iterrows():
            if row['state'].lower() == user_location['state'].lower():
                score = 1.0
            elif row['state'].lower() in self.state_neighbors.get(user_location['state'].lower(), {}):
                score = 0.8  # Increased score for neighboring states
            else:
                score = 0.6  # Increased score for distant states
            location_scores.append(score)
        
        filtered_df['location_score'] = location_scores
        
        # Add region information
        filtered_df['region'] = filtered_df['state'].apply(self.get_region_for_state)
        
        return filtered_df

    def get_initial_recommendations(self, preferences, n_recommendations=5):
        """Get initial recommendations with diversity"""
        filtered_df = self.filter_destinations(preferences)
        
        if len(filtered_df) < n_recommendations:
            print("\nNote: Few destinations match your exact criteria. Showing best possible matches...")
            return filtered_df
        
        # Remove previously recommended destinations
        filtered_df = filtered_df[~filtered_df['name'].isin(self.previously_recommended)]
        
        if len(filtered_df) == 0:
            print("\nNote: Showing new set of recommendations...")
            self.previously_recommended.clear()
            filtered_df = self.filter_destinations(preferences)
        
        # Convert preferences to feature vector
        pref_dict = {col: preferences.get(col, 3) for col in self.feature_columns}
        pref_vector = np.array([[pref_dict[col] for col in self.feature_columns]])
        
        # Scale features
        scaled_preferences = self.scaler.fit_transform(pref_vector)
        scaled_features = self.scaler.transform(filtered_df[self.feature_columns])
        
        # Calculate similarity scores
        similarities = cosine_similarity(scaled_preferences, scaled_features)[0]
        
        # Adjust similarities based on multiple factors
        adjusted_similarities = (
            similarities * 
            filtered_df['location_score'].values * 
            filtered_df['season_score'].values * 
            (1 - filtered_df['avg_daily_cost'] / filtered_df['available_daily_budget'].values)
        )
        
        recommendations = []
        regions_used = set()
        
        while len(recommendations) < n_recommendations and len(filtered_df) > 0:
            # Get top recommendation
            idx = np.argmax(adjusted_similarities)
            recommended_place = filtered_df.iloc[idx]
            
            # Check if we already have 2 places from this region
            region_count = sum(1 for r in recommendations if r['region'] == recommended_place['region'])
            
            if region_count < 2:  # Allow maximum 2 places from same region
                recommendations.append(recommended_place)
                regions_used.add(recommended_place['region'])
                self.previously_recommended.add(recommended_place['name'])
            
            # Remove this place from consideration
            filtered_df = filtered_df.drop(filtered_df.index[idx])
            adjusted_similarities = np.delete(adjusted_similarities, idx)
            
            if len(adjusted_similarities) == 0:
                break
        
        return pd.DataFrame(recommendations)

    # ... [Rest of the code including print_recommendations remains the same]
    def print_recommendations(self, recommendations, preferences):
        """Print recommendations with detailed information"""
        user_location = preferences['location']
        print(
            f"\n=== Recommended Destinations from {user_location['city'].title()}, {user_location['state'].title()} ===")
        print(
            f"Budget: ₹{preferences['total_budget']:.2f} for {preferences['num_days']} days")
        print(
            f"Travel Month: {datetime.strptime(str(preferences['travel_month']), '%m').strftime('%B')}")

        for idx, row in recommendations.iterrows():
            print(f"\n{row['name']}, {row['state'].title()}")
            print(f"Type: {row['type']}")
            print(f"Best Season: {row['best_season']}")

            # Budget breakdown
            travel_cost = row['travel_cost']
            daily_cost = row['avg_daily_cost']
            total_cost = travel_cost + (daily_cost * preferences['num_days'])

            print(f"Cost Breakdown:")
            print(f"- Travel Cost: ₹{travel_cost:.2f}")
            print(f"- Daily Expenses: ₹{daily_cost:.2f}")
            print(f"- Total Estimated Cost: ₹{total_cost:.2f}")

            if row['location_score'] == 1.0:
                location_type = "Same state"
            elif row['location_score'] == 0.7:
                location_type = "Neighboring state"
            else:
                location_type = "Other region"
            print(f"Location: {location_type}")

            if 'features' in row.index and pd.notna(row['features']):
                print(f"Features: {row['features']}")
            print("-" * 50)

def main():
    print("Loading destination database...")
    df = pd.read_csv(
        r"C:\Users\Shashank\OneDrive - Manipal Academy of Higher Education\Desktop\Codes\Projects\Roamio\Final\india_destinations_cleaned.csv")
    
    rec_system = TravelRecommendationSystem(df)
    preferences = rec_system.get_user_preferences()
    recommendations = rec_system.get_initial_recommendations(preferences)
    rec_system.print_recommendations(recommendations, preferences)
    
    while True:
        more = input("\nWould you like to see more recommendations? (yes/no): ").lower()
        if more != 'yes':
            break
        recommendations = rec_system.get_initial_recommendations(preferences, n_recommendations=5)
        rec_system.print_recommendations(recommendations, preferences)

if __name__ == "__main__":
    main()