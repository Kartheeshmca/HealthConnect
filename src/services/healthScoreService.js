import HealthLog from '../models/HealthLog.js';
import User from '../models/User.js';

export const calculateHealthScore = (log, user) => {
    const medEnabled = user.medicationTrackingEnabled || false;
    let score = 0;
    let breakdown = {};
    let alerts = [];
    let recommendations = [];

    // 1. Steps (30 points for both)
    const steps = log.steps || 0;
    let stepsScore = 0;
    if (steps >= 10000) stepsScore = 30;
    else if (steps >= 5000) stepsScore = 15;
    else stepsScore = 5;
    
    score += stepsScore;
    breakdown.steps = stepsScore;
    if (steps < 5000) {
        alerts.push("Low activity level");
        recommendations.push("Try to walk at least 5,000 steps daily.");
    }

    // 2. Sleep (Med: 20, No-Med: 25)
    const sleep = log.sleepHours || 0;
    const maxSleepScore = medEnabled ? 20 : 25;
    let sleepScore = 0;
    if (sleep >= 7 && sleep <= 9) sleepScore = maxSleepScore;
    else if (sleep >= 6) sleepScore = maxSleepScore * 0.7;
    else if (sleep >= 4) sleepScore = maxSleepScore * 0.4;
    else sleepScore = 0;
    
    score += sleepScore;
    breakdown.sleep = Math.round(sleepScore);
    if (sleep < 6) {
        alerts.push("Insufficient sleep");
        recommendations.push("Aim for 7-9 hours of restful sleep.");
    }

    // 3. Water (Med: 15, No-Med: 20)
    const water = log.waterIntake || 0;
    const maxWaterScore = medEnabled ? 15 : 20;
    let waterScore = 0;
    if (water >= 2000) waterScore = maxWaterScore;
    else if (water >= 1000) waterScore = maxWaterScore * 0.5;
    else waterScore = 0;

    score += waterScore;
    breakdown.water = Math.round(waterScore);
    if (water < 1500) {
        alerts.push("Low hydration");
        recommendations.push("Drink at least 2 liters of water daily.");
    }

    // 4. Meals (Med: 10, No-Med: 15)
    const meals = log.mealsLogged || 0;
    const maxMealsScore = medEnabled ? 10 : 15;
    let mealsScore = 0;
    if (meals >= 3) mealsScore = maxMealsScore;
    else if (meals >= 1) mealsScore = (meals / 3) * maxMealsScore;
    
    score += mealsScore;
    breakdown.meals = Math.round(mealsScore);
    if (meals < 3) recommendations.push("Log all 3 major meals for better tracking.");

    // 5. Medication OR Active Minutes
    if (medEnabled) {
        // Medication (25 points)
        const medTaken = log.medicationTaken || false;
        const medScore = medTaken ? 25 : 0;
        score += medScore;
        breakdown.medication = medScore;
        if (!medTaken) {
            alerts.push("Medication missed");
            recommendations.push("Ensure you take your prescribed medications on time.");
        }
    } else {
        // Active minutes (10 points)
        const activeMins = log.activeMinutes || 0;
        let activeScore = 0;
        if (activeMins >= 30) activeScore = 10;
        else if (activeMins >= 15) activeScore = 5;
        
        score += activeScore;
        breakdown.activeMinutes = activeScore;
        if (activeMins < 30) recommendations.push("Try to get at least 30 minutes of active exercise.");
    }

    // Round final score
    score = Math.round(score);

    // Determine Status
    let status = "Risk";
    if (score >= 80) status = "Healthy";
    else if (score >= 50) status = "Moderate";

    return {
        name: user.name,
        medication_enabled: medEnabled,
        healthScore: score,
        total_score: score, // redundant for JSON compatibility
        status,
        breakdown,
        metrics: {
            steps,
            sleep,
            water,
            meals,
            activeMinutes: log.activeMinutes || 0,
            medicationTaken: log.medicationTaken || false,
            bmi: user.bmi || 0
        },
        alerts,
        recommendations
    };
};
