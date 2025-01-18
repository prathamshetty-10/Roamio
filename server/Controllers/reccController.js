import { spawn } from 'child_process';


const recommendationCache = new Map();

// Controller to handle the recommendation request
export const getRecommendations = async (req, res) => {
  try {
    const { currentCity, currentState, budget, days, travelMonth, interests, importance } = req.body;

    // Format the data for the Python script
    const userData = {
      
      city: currentCity.toLowerCase(),
      state: currentState.toLowerCase(),
      
      total_budget: parseFloat(budget),
      num_days: parseInt(days),
      travel_month: parseInt(travelMonth),
      adventure_score: interests.adventure,
      relaxation_score: interests.relaxation,
      cultural_significance: interests.culture,
      nature_score: interests.nature,
      nightlife_score: interests.nightlife,
      accessibility_score: importance.accessibility,
      crowd_level: importance.crowd,
      family_friendly: importance.familyFriendly,
      food_scene: importance.food,
      shopping_score: importance.shopping
    };

    // Spawn the Python process to get recommendations
    const pythonProcess = spawn('python', ['../ML/recommendations.py']);
    let dataString = '';

    // Send data to Python script
    pythonProcess.stdin.write(JSON.stringify(userData));
    pythonProcess.stdin.end();

    // Collect data from Python script
    pythonProcess.stdout.on('data', (data) => {
      dataString += data.toString();
    });

    // Handle Python process closure
    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        return res.status(500).json({ error: 'Failed to process recommendations' });
      }

      try {
        const recommendations = JSON.parse(dataString);
        // Store recommendations in cache for future use
        recommendationCache.set(userData.location.city, recommendations);
        res.json(recommendations);
      } catch (error) {
        res.status(500).json({ error: 'Failed to parse recommendations' });
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Controller to get more recommendations for a given city
export const getMore = async (req, res) => {
  try {
    const prevRecommendations = recommendationCache.get(req.params.city);
    if (!prevRecommendations) {
      return res.status(404).json({ error: 'No previous recommendations found' });
    }

    // Spawn the Python process to get more recommendations
    const pythonProcess = spawn('python', ['../ML/recommendations.py', '--more']);
    let dataString = '';

    // Send previous recommendations to Python script for further filtering
    pythonProcess.stdin.write(JSON.stringify({ previous: prevRecommendations }));
    pythonProcess.stdin.end();

    pythonProcess.stdout.on('data', (data) => {
      dataString += data.toString();
    });

    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        return res.status(500).json({ error: 'Failed to get more recommendations' });
      }

      try {
        const newRecommendations = JSON.parse(dataString);
        recommendationCache.set(req.params.city, newRecommendations);
        res.json(newRecommendations);
      } catch (error) {
        res.status(500).json({ error: 'Failed to parse recommendations' });
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};