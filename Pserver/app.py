from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler
from sklearn.metrics.pairwise import cosine_similarity
import tensorflow.keras as keras
from tensorflow.keras import layers, Model
from datetime import datetime


from sklearn.cluster import KMeans



app = Flask(__name__)
CORS(app)

class TravelRecommendationSystem:
    def __init__(self, destinations_df):
        self.df = destinations_df.copy()
        self.feature_columns = [
            'budget_category', 'accessibility_score', 'crowd_level',
            'cultural_significance', 'adventure_score', 'relaxation_score',
            'nature_score', 'nightlife_score', 'family_friendly',
            'food_scene', 'shopping_score'
        ]
        self.scaler = StandardScaler()
        self.initialize_models()
        self.state_neighbors = {
            'andhra pradesh': {
                'karnataka': {'cost': 2500, 'time': 12},
                'tamil nadu': {'cost': 2500, 'time': 12},
                'telangana': {'cost': 2000, 'time': 8},
                'odisha': {'cost': 3000, 'time': 14},
                'chhattisgarh': {'cost': 3500, 'time': 16}
            },
            'arunachal pradesh': {
                'assam': {'cost': 3000, 'time': 12},
                'nagaland': {'cost': 3500, 'time': 14}
            },
            'assam': {
                'arunachal pradesh': {'cost': 3000, 'time': 12},
                'nagaland': {'cost': 2000, 'time': 8},
                'manipur': {'cost': 2500, 'time': 10},
                'meghalaya': {'cost': 1500, 'time': 6},
                'tripura': {'cost': 3000, 'time': 12},
                'mizoram': {'cost': 3500, 'time': 14},
                'west bengal': {'cost': 4000, 'time': 16}
            },
            'bihar': {
                'jharkhand': {'cost': 2000, 'time': 8},
                'west bengal': {'cost': 2500, 'time': 10},
                'uttar pradesh': {'cost': 3000, 'time': 12}
            },
            'chhattisgarh': {
                'andhra pradesh': {'cost': 3500, 'time': 16},
                'odisha': {'cost': 2000, 'time': 8},
                'jharkhand': {'cost': 2500, 'time': 10},
                'madhya pradesh': {'cost': 3000, 'time': 12},
                'maharashtra': {'cost': 4000, 'time': 16}
            },
            'goa': {
                'karnataka': {'cost': 1500, 'time': 6},
                'maharashtra': {'cost': 2000, 'time': 8}
            },
            'gujarat': {
                'rajasthan': {'cost': 3000, 'time': 12},
                'maharashtra': {'cost': 2500, 'time': 10},
                'madhya pradesh': {'cost': 4000, 'time': 16}
            },
            'haryana': {
                'punjab': {'cost': 2000, 'time': 8},
                'rajasthan': {'cost': 2500, 'time': 10},
                'uttar pradesh': {'cost': 3000, 'time': 12},
                'delhi': {'cost': 1000, 'time': 4}
            },
            'himachal pradesh': {
                'punjab': {'cost': 1500, 'time': 6},
                'uttarakhand': {'cost': 2000, 'time': 8},
                'jammu and kashmir': {'cost': 3000, 'time': 12}
            },
            'jharkhand': {
                'bihar': {'cost': 2000, 'time': 8},
                'odisha': {'cost': 2500, 'time': 10},
                'chhattisgarh': {'cost': 3000, 'time': 12},
                'west bengal': {'cost': 3500, 'time': 14}
            },
            'karnataka': {
                'kerala': {'cost': 2000, 'time': 8},
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
            'madhya pradesh': {
                'rajasthan': {'cost': 2500, 'time': 10},
                'uttar pradesh': {'cost': 3000, 'time': 12},
                'chhattisgarh': {'cost': 3000, 'time': 12},
                'maharashtra': {'cost': 3500, 'time': 14},
                'gujarat': {'cost': 4000, 'time': 16}
            },
            'maharashtra': {
                'goa': {'cost': 2000, 'time': 8},
                'karnataka': {'cost': 3000, 'time': 16},
                'madhya pradesh': {'cost': 3500, 'time': 14},
                'gujarat': {'cost': 2500, 'time': 10},
                'chhattisgarh': {'cost': 4000, 'time': 16}
            },
            'manipur': {
                'assam': {'cost': 2500, 'time': 10},
                'mizoram': {'cost': 3000, 'time': 12},
                'nagaland': {'cost': 2000, 'time': 8}
            },
            'meghalaya': {
                'assam': {'cost': 1500, 'time': 6}
            },
            'mizoram': {
                'assam': {'cost': 3500, 'time': 14},
                'manipur': {'cost': 3000, 'time': 12},
                'tripura': {'cost': 2500, 'time': 10}
            },
            'nagaland': {
                'assam': {'cost': 2000, 'time': 8},
                'arunachal pradesh': {'cost': 3500, 'time': 14},
                'manipur': {'cost': 2000, 'time': 8}
            },
            'odisha': {
                'chhattisgarh': {'cost': 2000, 'time': 8},
                'jharkhand': {'cost': 2500, 'time': 10},
                'west bengal': {'cost': 3000, 'time': 12},
                'andhra pradesh': {'cost': 3000, 'time': 14}
            },
            'punjab': {
                'haryana': {'cost': 2000, 'time': 8},
                'himachal pradesh': {'cost': 1500, 'time': 6},
                'jammu and kashmir': {'cost': 3000, 'time': 12}
            },
            'rajasthan': {
                'haryana': {'cost': 2500, 'time': 10},
                'uttar pradesh': {'cost': 3000, 'time': 12},
                'madhya pradesh': {'cost': 2500, 'time': 10},
                'gujarat': {'cost': 3000, 'time': 12}
            },
            'sikkim': {
                'west bengal': {'cost': 2500, 'time': 10}
            },
            'tamil nadu': {
                'karnataka': {'cost': 2000, 'time': 8},
                'kerala': {'cost': 1500, 'time': 6},
                'andhra pradesh': {'cost': 2500, 'time': 12}
            },
            'telangana': {
                'andhra pradesh': {'cost': 2000, 'time': 8},
                'karnataka': {'cost': 2500, 'time': 14},
                'maharashtra': {'cost': 3000, 'time': 12}
            },
            'tripura': {
                'assam': {'cost': 3000, 'time': 12},
                'mizoram': {'cost': 2500, 'time': 10}
            },
            'uttar pradesh': {
                'rajasthan': {'cost': 3000, 'time': 12},
                'madhya pradesh': {'cost': 3000, 'time': 12},
                'bihar': {'cost': 3000, 'time': 12},
                'uttarakhand': {'cost': 1500, 'time': 6},
                'haryana': {'cost': 3000, 'time': 12}
            },
            'uttarakhand': {
                'uttar pradesh': {'cost': 1500, 'time': 6},
                'himachal pradesh': {'cost': 2000, 'time': 8}
            },
            'west bengal': {
                'bihar': {'cost': 2500, 'time': 10},
                'jharkhand': {'cost': 3500, 'time': 14},
                'odisha': {'cost': 3000, 'time': 12},
                'sikkim': {'cost': 2500, 'time': 10},
                'assam': {'cost': 4000, 'time': 16}
            },
            # Union Territories
            'andaman and nicobar islands': {
                'tamil nadu': {'cost': 6000, 'time': 48}  # by ferry or flight
            },
            'chandigarh': {
                'punjab': {'cost': 1000, 'time': 4},
                'haryana': {'cost': 1000, 'time': 4}
            },
            'daman and diu': {
                'gujarat': {'cost': 1500, 'time': 6},
                'maharashtra': {'cost': 2000, 'time': 8}
            },
            'delhi': {
                'haryana': {'cost': 1000, 'time': 4},
                'uttar pradesh': {'cost': 1500, 'time': 6}
            },
            'jammu and kashmir': {
                'punjab': {'cost': 3000, 'time': 12},
                'himachal pradesh': {'cost': 3000, 'time': 12}
            },
            'ladakh': {
                'jammu and kashmir': {'cost': 4000, 'time': 16}
            },
            'lakshadweep': {
                'kerala': {'cost': 5000, 'time': 24}  # by ferry or flight
            },
            'puducherry': {
                'tamil nadu': {'cost': 1000, 'time': 4}
            }
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

        # [Previous dictionary definitions copied from your code]

    def initialize_models(self):
        """Initialize machine learning models."""
        self.kmeans = KMeans(n_clusters=5, random_state=42)
        input_layer = layers.Input(shape=(len(self.feature_columns),))
        x = layers.Dense(64, activation='relu')(input_layer)
        x = layers.Dense(32, activation='relu')(x)
        output_layer = layers.Dense(5, activation='softmax')(x)
        self.recommendation_model = Model(inputs=input_layer, outputs=output_layer)
        self.recommendation_model.compile(optimizer='adam', loss='categorical_crossentropy')
    def calculate_travel_cost(self, user_state, destination_state):
        """Calculate approximate travel cost between states"""
        user_state = user_state.lower()
        destination_state = destination_state.lower()

        if user_state == destination_state:
            # Base cost and time for intra-state travel
            return {'cost': 1000, 'time': 4}

        # Get cost from state_neighbors if available
        state_costs = self.state_neighbors.get(user_state, {})
        if destination_state in state_costs:
            return state_costs[destination_state]

        # Default values for distant states
        return {'cost': 5000, 'time': 24}
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
            travel_info = self.calculate_travel_cost(
                user_location['state'], row['state'])
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
            filtered_df['avg_daily_cost'] <= (
                filtered_df['available_daily_budget'] * 1.1)
        ]

        # Season-based filtering with flexibility
        current_season = self.month_to_season[preferences['travel_month']]
        seasonal_states = self.seasonal_recommendations[current_season]
        filtered_df['season_score'] = filtered_df['state'].apply(
            # Less strict seasonal penalty
            lambda x: 1.0 if x.lower() in seasonal_states else 0.7
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
        filtered_df['region'] = filtered_df['state'].apply(
            self.get_region_for_state)

        return filtered_df

    def get_initial_recommendations(self, preferences, n_recommendations=5):
        """Get initial recommendations with diversity"""
        filtered_df = self.filter_destinations(preferences)
        previously_recommended = preferences.get('previously_recommended', set())

        if len(filtered_df) < n_recommendations:
            print("\nNote: Few destinations match your exact criteria. Showing best possible matches...")
            return filtered_df
        # Remove previously recommended destinations
        filtered_df = filtered_df[~filtered_df['name'].str.lower().isin([name.lower() for name in previously_recommended])]


        if len(filtered_df) == 0:
            print("\nNote: Showing new set of recommendations...")
            filtered_df = self.filter_destinations(preferences)

        pref_dict = {col: preferences.get(col, 3)
                     for col in self.feature_columns}
        pref_vector = np.array([[pref_dict[col]
                               for col in self.feature_columns]])

        # Scale features
        scaled_preferences = self.scaler.fit_transform(pref_vector)
        scaled_features = self.scaler.transform(
            filtered_df[self.feature_columns])

        # Calculate similarity scores
        similarities = cosine_similarity(
            scaled_preferences, scaled_features)[0]

        # Adjust similarities based on multiple factors
        adjusted_similarities = (
            similarities *
            filtered_df['location_score'].values *
            filtered_df['season_score'].values *
            (1 - filtered_df['avg_daily_cost'] /
             filtered_df['available_daily_budget'].values)
        )

        recommendations = []
        regions_used = set()

        while len(recommendations) < n_recommendations and len(filtered_df) > 0:
            # Get top recommendation
            idx = np.argmax(adjusted_similarities)
            recommended_place = filtered_df.iloc[idx]

            # Check if we already have 2 places from this region
            region_count = sum(
                1 for r in recommendations if r['region'] == recommended_place['region'])

            if region_count < 2:  # Allow maximum 2 places from same region
                recommendations.append(recommended_place)
                regions_used.add(recommended_place['region'])

            # Remove this place from consideration
            filtered_df = filtered_df.drop(filtered_df.index[idx])
            adjusted_similarities = np.delete(adjusted_similarities, idx)

            if len(adjusted_similarities) == 0:
                break

        return pd.DataFrame(recommendations)
    def process_frontend_data(self, data):
        """Convert frontend JSON data to the format needed by the recommendation system."""
        return {
            'location': {
                'city': data['currentCity'].lower(),
                'state': data['currentState'].lower()
            },
            'total_budget': float(data['budget']),
            'num_days': int(data['days']),
            'daily_budget': float(data['budget']) / int(data['days']),
            'travel_month': int(data['travelMonth']),
            'previously_recommended': set(data['previous']),
            'adventure_score': int(data['interests']['adventure']),
            'relaxation_score': int(data['interests']['relaxation']),
            'cultural_significance': int(data['interests']['culture']),
            'nature_score': int(data['interests']['nature']),
            'nightlife_score': int(data['interests']['nightlife']),
            'accessibility_score': int(data['importance']['accessibility']),
            'crowd_level': int(data['importance']['crowd']),
            'family_friendly': int(data['importance']['familyFriendly']),
            'food_scene': int(data['importance']['food']),
            'shopping_score': int(data['importance']['shopping'])
        }

    def format_recommendations(self, recommendations, preferences):
        """Format recommendations as JSON for frontend."""
        result = []
        for _, row in recommendations.iterrows():
            travel_cost = row['travel_cost']
            daily_cost = row['avg_daily_cost']
            total_cost = travel_cost + (daily_cost * preferences['num_days'])
            
            recommendation = {
                'name': row['name'],
                'state': row['state'].title(),
                'type': row['type'],
                'bestSeason': row['best_season'],
                'costs': {
                    'travel': float(travel_cost),
                    'daily': float(daily_cost),
                    'total': float(total_cost)
                },
                'location': {
                    'type': 'Same state' if row['location_score'] == 1.0 else 
                           'Neighboring state' if row['location_score'] == 0.8 else 
                           'Other region'
                },
                'features': row['features'] if 'features' in row.index and pd.notna(row['features']) else None
            }
            result.append(recommendation)
        return result

# Initialize the recommendation system
df = pd.read_csv("india_destinations_cleaned.csv")
rec_system = TravelRecommendationSystem(df)

@app.route('/api/recommendations', methods=['POST'])
def get_recommendations():
    try:
        data = request.get_json()
        if not data:
            return jsonify({
                'status': 'error',
                'message': 'No JSON data received'
            }), 400
            
        preferences = rec_system.process_frontend_data(data)
        recommendations = rec_system.get_initial_recommendations(preferences)
        formatted_recommendations = rec_system.format_recommendations(recommendations, preferences)
        
        if not formatted_recommendations:
            return jsonify({
                'status': 'false',
                'message': 'No recommendations found matching criteria'
            }), 404
            
        return jsonify({
            'status': 'true',
            'recommendations': formatted_recommendations
        })
    
    except ValueError as ve:
        return jsonify({
            'status': 'false',
            'message': f'Invalid input data: {str(ve)}'
        }), 400
    except Exception as e:
        return jsonify({
            'status': 'false',
            'message': f'Server error: {str(e)}'
        }), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)