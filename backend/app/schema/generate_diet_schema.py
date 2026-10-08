from pydantic import BaseModel
from typing import List
from enum import Enum

class PlanType(str, Enum):
    Daily = "daily"
    weekly  = "weekly"
    

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
    plan_type: PlanType
    
    
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
    

class DailyDietPlan(BaseModel):
    daily_calories :  int
    daily_protein :  float
    meals : List[Meal]
    guidelines : List[str]
    
    
class WeeklyDietPlan(BaseModel):
    profile: RequestData
    days : List[DailyDietPlan]
    weekly_guidelines : List[str]
    