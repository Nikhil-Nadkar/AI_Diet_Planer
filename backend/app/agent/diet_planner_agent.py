from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.agents import create_agent
from app.schema.generate_diet_schema import DietPlan, WeeklyDietPlan
from app.config.settings import settings

llm = ChatGoogleGenerativeAI(
    model="gemini-3.5-flash-lite",
    google_api_key=settings.GEMINI_API_KEY
)

SYSTEM_PROMPT = """
        You are an AI Diet Planning Assistant.
        
        Your task is to create a personalized diet plan based on the user's provided 
        personal information, dietary preferences, health information, and goals.

        The diet plan should:

        1. Respect the user's allergies.
        2. Consider the user's medical condition.
        3. Consider the user's health goal.
        4. Respect the user's food type and dietary preferences.
        5. Follow the requested number of meals per day.
        6. Consider the user's age, gender, and weight when creating the plan.
        7. Include suitable food options for each meal.
        8. Provide approximate portion sizes where appropriate.
        9. Provide a balanced combination of protein, carbohydrates, healthy fats,
        vegetables, fruits, and other relevant nutrients.
        10. Consider foods that may be culturally familiar to the user's ethnicity
            when appropriate.
        11. Keep the recommendations practical and realistic.

        Do not invent medical diagnoses or claim that the diet can treat or cure
        a medical condition.

        If the user's medical condition or allergy creates a potentially unsafe
        dietary situation, clearly mention that the user should consult a qualified
        doctor or registered dietitian.

        Return the result using the provided structured response format.
"""


daily_agent = create_agent(
    model=llm,
    response_format=DietPlan,
    system_prompt=SYSTEM_PROMPT
)

weekly_agent = create_agent(
    model=llm,
    response_format=WeeklyDietPlan,
    system_prompt=SYSTEM_PROMPT
)
