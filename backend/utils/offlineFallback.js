/**
 * Offline Fallback Responses
 * Static responses for each module when the LLM API is unreachable.
 * These provide actual helpful content — not just emergency messages.
 */

const FALLBACK_RESPONSES = {
    symptom: {
        concernCategory: 'General Health Guidance',
        urgencyLevel: 'MODERATE',
        whatToDoNow: [
            'Monitor your symptoms carefully and note any changes in severity or new symptoms.',
            'Stay hydrated by drinking plenty of water and resting in a comfortable position.',
            'For pain, consider over-the-counter relief like acetaminophen if safe for you.',
            'Avoid strenuous activity until symptoms improve.',
            'Keep a symptom diary noting time, severity (1-10), and any triggers.',
        ],
        homeRemedies: [
            'Warm compress for muscle pain or cold compress for inflammation/swelling.',
            'Ginger tea or peppermint tea can help with nausea and digestive discomfort.',
            'Honey and warm water with lemon for sore throat relief.',
        ],
        lifestyleAdvice: [
            'Ensure 7-8 hours of quality sleep to support your immune system.',
            'Eat light, easy-to-digest foods like soups, fruits, and whole grains.',
            'Practice deep breathing exercises to reduce stress-related symptoms.',
        ],
        whenToSeeDoctor: 'Seek medical attention if symptoms persist beyond 48 hours, worsen significantly, include high fever (above 103°F/39.4°C), difficulty breathing, severe pain, or any symptoms that concern you.',
        followUpQuestions: [
            'How long have you been experiencing these symptoms?',
            'Have you taken any medication recently?',
        ],
    },

    firstaid: {
        concernCategory: 'First Aid Guidance',
        urgencyLevel: 'HIGH',
        whatToDoNow: [
            'STAY CALM — panicking reduces your ability to help effectively.',
            'Ensure the scene is safe for both you and the injured person before approaching.',
            'Call emergency services (911, 112, or your local number) if the situation is serious.',
            'Check the person\'s airway, breathing, and circulation (ABCs).',
            'Apply direct pressure with a clean cloth to any bleeding wounds.',
            'Do not move someone with a suspected spinal injury unless they are in immediate danger.',
            'Keep the injured person warm with a blanket and reassure them help is coming.',
        ],
        doNot: [
            'Do not attempt to move someone with a suspected neck or back injury.',
            'Do not apply a tourniquet unless trained and bleeding is life-threatening.',
            'Do not give food or water to someone who is unconscious or semi-conscious.',
            'Do not remove embedded objects from a wound.',
        ],
        aftercare: [
            'Document what happened and what first aid was provided for medical responders.',
            'Stay with the person until emergency services arrive.',
            'Monitor their breathing and consciousness level continuously.',
        ],
        whenToSeeDoctor: 'Always seek professional medical evaluation after providing first aid, even if the person appears to recover. Some injuries have delayed symptoms.',
    },

    medicine: {
        medicineName: 'General Medication Guidance',
        generalPurpose: 'Here is general medication safety guidance to help you use medications safely and effectively.',
        howItWorks: 'Different medications work through various mechanisms. Always read the patient information leaflet that comes with your medication for specific details.',
        commonUses: [
            'Follow the dosage instructions on the label or as prescribed by your doctor.',
            'Take medications at the same time each day for consistent blood levels.',
            'Complete the full course of antibiotics even if you feel better.',
            'Store medications as directed — some require refrigeration.',
        ],
        generalPrecautions: [
            'Never take more than the recommended dose.',
            'Check for allergies before taking any new medication.',
            'Inform your doctor about all medications you\'re taking, including supplements.',
            'Avoid alcohol with most medications unless your doctor says otherwise.',
            'Do not share prescription medications with others.',
        ],
        sideEffectCategories: {
            common: ['Nausea', 'Drowsiness', 'Headache', 'Dizziness'],
            lessCommon: ['Rash', 'Changes in appetite', 'Digestive issues'],
            seekHelp: ['Difficulty breathing', 'Severe allergic reaction', 'Chest pain', 'Persistent vomiting'],
        },
        interactions: 'Always check for drug interactions before combining medications. Common interactions include blood thinners with NSAIDs, and certain antibiotics with dairy products.',
        importantNote: 'Always consult your pharmacist or doctor for specific medication information. This is general guidance only.',
    },

    wellness: {
        topic: 'General Wellness Guidance',
        guidance: [
            'Aim for 150 minutes of moderate aerobic activity per week (walking, swimming, cycling).',
            'Eat a balanced diet rich in fruits, vegetables, lean proteins, and whole grains.',
            'Stay hydrated — aim for 8 glasses (2 liters) of water daily, more if active.',
            'Prioritize 7-9 hours of quality sleep each night.',
            'Practice stress management through meditation, deep breathing, or yoga.',
            'Maintain social connections — strong relationships benefit mental and physical health.',
            'Limit screen time, especially before bed, to improve sleep quality.',
            'Get regular health checkups and stay up-to-date on vaccinations.',
        ],
        scienceBehind: 'Research consistently shows that lifestyle factors — diet, exercise, sleep, and stress management — account for up to 80% of chronic disease prevention.',
        weeklyPlan: [
            'Monday: 30-min brisk walk + meal prep for the week',
            'Tuesday: Strength training + mindfulness meditation',
            'Wednesday: Yoga or stretching + healthy cooking',
            'Thursday: Cardio exercise + journaling',
            'Friday: Active hobby + social connection',
            'Weekend: Rest, outdoor activity, and self-care',
        ],
        actionSteps: [
            'Start with one small habit change this week.',
            'Track your progress with a simple journal or app.',
            'Set realistic, achievable goals rather than dramatic changes.',
        ],
    },

    mentalhealth: {
        topic: 'Mental Health Support',
        validation: 'Your feelings are valid, and reaching out for support shows incredible strength. Everyone goes through challenging times.',
        copingStrategies: [
            'Practice the 5-4-3-2-1 grounding technique: name 5 things you see, 4 you touch, 3 you hear, 2 you smell, 1 you taste.',
            'Try box breathing: inhale for 4 counts, hold for 4, exhale for 4, hold for 4. Repeat 4 times.',
            'Write down your thoughts and feelings in a journal without judgment.',
            'Engage in physical activity — even a 10-minute walk can improve mood.',
            'Connect with someone you trust — sharing your feelings can lighten the burden.',
        ],
        breathingExercise: 'Try 4-7-8 breathing: Breathe in through your nose for 4 seconds, hold for 7 seconds, exhale slowly through your mouth for 8 seconds. This activates your parasympathetic nervous system and promotes calm.',
        groundingTechnique: 'Place your feet firmly on the ground. Press your hands together. Focus on the physical sensations — the warmth, the pressure. This anchors you to the present moment.',
        dailyPractices: [
            'Start each morning with 5 minutes of mindful breathing.',
            'Practice gratitude by writing three things you\'re thankful for.',
            'Set boundaries — it\'s okay to say no.',
            'Limit news and social media consumption if it causes anxiety.',
            'Create a calming bedtime routine.',
        ],
        resources: 'Crisis helplines: 988 Suicide & Crisis Lifeline (US), Samaritans 116 123 (UK), iCall 9152987821 (India), Lifeline 13 11 14 (Australia).',
        whenToSeekHelp: 'Consider professional help if feelings of sadness, anxiety, or emptiness persist for more than two weeks, interfere with daily functioning, or if you have thoughts of self-harm.',
    },

    nutrition: {
        topic: 'General Nutrition Guidance',
        keyNutrients: [
            'Protein: Essential for muscle repair. Sources: chicken, fish, beans, tofu, eggs.',
            'Fiber: Aids digestion and satiety. Sources: whole grains, vegetables, fruits, legumes.',
            'Omega-3: Supports heart and brain health. Sources: salmon, walnuts, flaxseed.',
            'Iron: Crucial for oxygen transport. Sources: spinach, red meat, lentils, fortified cereals.',
            'Calcium: Bone health. Sources: dairy, leafy greens, fortified plant milks.',
            'Vitamin D: Immune function. Sources: sunlight, fatty fish, fortified foods.',
        ],
        sampleMealPlan: {
            breakfast: 'Oatmeal with berries, nuts, and a drizzle of honey + green tea',
            lunch: 'Grilled chicken salad with mixed greens, quinoa, avocado, and olive oil dressing',
            dinner: 'Baked salmon with roasted vegetables (broccoli, sweet potato) and brown rice',
            snacks: 'Greek yogurt with almonds, apple slices with peanut butter, or hummus with carrots',
        },
        foodsToInclude: [
            'Colorful fruits and vegetables (aim for 5+ servings daily).',
            'Whole grains (brown rice, oats, whole wheat bread).',
            'Lean proteins (poultry, fish, legumes, tofu).',
            'Healthy fats (olive oil, avocado, nuts, seeds).',
        ],
        foodsToLimit: [
            'Processed and ultra-processed foods.',
            'Added sugars — check labels (aim under 25g/day).',
            'Excessive sodium — aim for under 2,300mg daily.',
            'Trans fats and deep-fried foods.',
        ],
        hydration: 'Aim for 8 glasses (2 liters) of water daily. Increase intake during exercise, hot weather, or illness. Herbal teas and water-rich fruits also count toward hydration.',
    },

    chat: {
        message: 'I\'m currently operating in offline mode, but I can still help! Here are some health tips based on your query:\n\n• **Stay hydrated** — Drink at least 8 glasses of water daily. Water supports digestion, circulation, and temperature regulation.\n\n• **Sleep well** — Aim for 7-9 hours of quality sleep. Good sleep boosts immunity, mood, and cognitive function.\n\n• **Eat balanced meals** — Include fruits, vegetables, lean proteins, and whole grains in every meal.\n\n• **Move your body** — Even a 20-minute walk can reduce stress, improve heart health, and boost energy.\n\n• **Manage stress** — Try deep breathing exercises: inhale for 4 seconds, hold for 4, exhale for 4.\n\n• **Check specific modules** — Use MediGuide\'s dedicated modules (Symptoms, First Aid, Nutrition, etc.) for detailed offline guidance on specific topics.\n\nI\'ll be back to full capacity soon. For urgent medical concerns, please contact your healthcare provider.',
        suggestions: ['Check my symptoms', 'First aid basics', 'Nutrition advice', 'Mental health tips'],
    },

    consultation: {
        message: 'I\'m currently in offline mode, but I can still provide some guidance based on general medical knowledge.\n\nHere are some things I can help with right now:\n\n• **Symptom assessment** — Describe your symptoms using the Symptom Checker module for detailed offline triage guidance.\n\n• **General health tips** — I can share evidence-based wellness advice, nutrition guidance, and preventive health strategies.\n\n• **First aid** — If you need immediate first aid instructions, check the First Aid module for step-by-step emergency guidance.\n\n• **Mental health support** — For coping strategies, breathing exercises, and grounding techniques, visit the Mental Health module.\n\nPlease share your concern and I\'ll do my best to help with the information available offline. For specific medical advice, please consult a qualified healthcare provider.',
        suggestions: ['What are common cold remedies?', 'How to manage headaches?', 'Tips for better sleep', 'How to reduce anxiety?'],
    },

    druginteraction: {
        topic: 'Drug Interaction Check',
        whatToDoNow: [
            'Always inform your doctor and pharmacist about ALL medications you take, including over-the-counter drugs and supplements.',
            'Use one pharmacy for all prescriptions so they can track potential interactions.',
            'Read medication guides and patient information leaflets carefully.',
            'Never start or stop a medication without consulting your healthcare provider.',
            'Be especially cautious with blood thinners, heart medications, and seizure drugs.',
        ],
        commonMistakes: [
            'Mixing NSAIDs (ibuprofen, aspirin) with blood thinners — increases bleeding risk.',
            'Combining multiple acetaminophen-containing products — risk of liver damage.',
            'Taking calcium or iron supplements with certain antibiotics — reduces absorption.',
            'Mixing sedating medications (antihistamines + sleep aids) — excessive drowsiness.',
        ],
    },
}

function getOfflineFallback(module) {
    return FALLBACK_RESPONSES[module] || FALLBACK_RESPONSES.chat
}

module.exports = { getOfflineFallback }
