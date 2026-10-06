from app.agent.diet_planner_agent import agent
from app.models.diet_data import DietPlannerData
from fastapi import HTTPException
from app.schema.generate_diet_schema import RequestData
from app.config.redis_connect import client
import json

MEAL_TYPES = {
    2: ["Breakfast", "Dinner"],
    3: ["Breakfast", "Lunch", "Dinner"],
    4: ["Breakfast", "Lunch", "Evening_snack", "Dinner"],
    5: [
        "Breakfast",
        "Morning_snack",
        "Lunch",
        "Evening_snack",
        "Dinner"
    ],
    6: [
        "Breakfast",
        "Morning_snack",
        "Lunch",
        "Afternoon_snack",
        "Evening_snack",
        "Dinner"
    ]
}

def generate_diet_plan(req_data: RequestData, db, cache_key):
    
    try:        
        response = agent.invoke({
            "messages": [
                {
                    "role" : "user",
                    "content" : f"""
                        age:{req_data.age},
                        gender:{req_data.gender},
                        weight:{req_data.weight},
                        meals:{req_data.meals},
                        meal_types = {MEAL_TYPES[req_data.meals]},
                        medical_condition:{req_data.medical_condition},
                        allergy:{req_data.allergy},
                        health_goal:{req_data.health_goal},
                        food_type:{req_data.food_type},
                        ethnicity:{req_data.ethnicity},
                    """
                    
                }
            ]    
        })
        
        structured_response = response["structured_response"]
        output_data = structured_response.model_dump()
        
        new_data = DietPlannerData(
            input_data=req_data.model_dump(),
            output_data=output_data
        )
        
        db.add(new_data)
        db.commit()
        db.refresh(new_data)
        
        client.set(
            cache_key,
            json.dumps(output_data),
            ex=3600    
        )
        
        return {
                "data" : response["structured_response"],
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )