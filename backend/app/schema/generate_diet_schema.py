from pydantic import BaseModel
from typing import List
from enum import Enum

from enum import Enum
from typing import Annotated

from pydantic import BaseModel, Field, field_validator


class Gender(str, Enum):
    male = "male"
    female = "female"
    other = "other"


class FoodType(str, Enum):
    veg_non_veg = "Veg/Non-veg"
    vegetarian = "Vegetarian"
    vegan = "Vegan"
    non_vegetarian = "Non-vegetarian"
    eggetarian = "Eggetarian"


class Cuisine(str, Enum):
    indian = "Indian"
    mediterranean = "Mediterranean"
    asian = "Asian"
    american = "American"
    middle_eastern = "Middle Eastern"
    other = "Other"


class HealthGoal(str, Enum):
    lose_weight = "Lose weight"
    gain_weight = "Gain weight"
    maintain_weight = "Maintain weight"
    build_muscle = "Build muscle"
    improve_fitness = "Improve fitness and energy"
    improve_health = "Improve overall health"


class PlanType(str, Enum):
    Daily = "daily"
    weekly = "weekly"


class RequestData(BaseModel):
    age: Annotated[int, Field(ge=12, le=100)]
    gender: Gender
    weight: Annotated[float, Field(gt=0, le=150)]
    meals: Annotated[int, Field(ge=2, le=6)]

    medical_condition: Annotated[str, Field(min_length=1, max_length=100)]
    allergy: Annotated[str, Field(min_length=1, max_length=100)]

    health_goal: HealthGoal
    food_type: FoodType
    ethnicity: Cuisine
    plan_type: PlanType

    @field_validator("medical_condition", "allergy", mode="before")
    @classmethod
    def normalize_text(cls, value):
        if isinstance(value, str):
            value = value.strip()

            if not value:
                raise ValueError("This field cannot be empty.")

        return value
    
    
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
    