import { spawn } from 'child_process';




// Controller to handle the recommendation request
export const getRecommendations = async (req, res) => {
  try {
    const { currentCity, currentState, budget, days, travelMonth, interests, importance,previous } = req.body;

    // Format the data for the Python script
    const userData = {
      
      city: currentCity.toLowerCase(),
      state: currentState.toLowerCase(),
      
      total_budget: parseFloat(budget),
      num_days: parseInt(days),
      travel_month: travelMonth,
      adventure_score: interests.adventure,
      relaxation_score: interests.relaxation,
      cultural_significance: interests.culture,
      nature_score: interests.nature,
      nightlife_score: interests.nightlife,
      accessibility_score: importance.accessibility,
      crowd_level: importance.crowd,
      family_friendly: importance.familyFriendly,
      food_scene: importance.food,
      shopping_score: importance.shopping,
      previous_recc:previous
    };
    console.log('Current Working Directory:', process.cwd());

    // Spawn the Python process to get recommendations
    const pythonProcess = spawn('python', ['ML/reccomendations.py'], {
      cwd: process.cwd()
    });
    let dataString = '';

    // Send data to Python script
    pythonProcess.stdin.write(JSON.stringify(userData));

    pythonProcess.stdin.end();

    // Collect data from Python script
    pythonProcess.stdout.on('data', (data) => {
      dataString += data.toString();
    });
    pythonProcess.stderr.on('data', (data) => {
      console.error(`stderr: ${data}`);
    });
    

    // Handle Python process closure
    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        return res.status(500).json({ error: 'Failed to process recommendations' ,status:false});
      }

      try {
        
        const recommendations = JSON.parse(dataString);
        res.json({recommendations,status:true});
      } catch (error) {
        res.status(500).json({ error: 'Failed to parse recommendations' ,status:false});
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message,status:false });
  }
};



