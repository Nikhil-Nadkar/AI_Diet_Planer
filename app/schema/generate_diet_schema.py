from pydantic import BaseModel
from typing import List


class RequestData(BaseModel):
    age: int
    gender: str
    weight: int
    meals: int
    medical_condition: str
    allergy: str
    health_goal: str
    food_type: str
    ethnicity: str
    
    
class FoodItem(BaseModel):
    name : str
    quantity : str
    calories : int
    protein:float
    

class Meal(BaseModel):
    meal_type : str
    title : str
    foods : List[FoodItem]
    

class DietPlan(BaseModel):
    profile : RequestData
    daily_calories :  int
    daily_protein :  float
    meals : List[Meal]
    guidelines : List[str]