"""
Models package — import every model so that ``Base.metadata`` discovers them
when ``init_db()`` is called.
"""
from backend.app.models.user import User                       # noqa: F401
from backend.app.models.health_profile import HealthProfile    # noqa: F401
from backend.app.models.food import Food                       # noqa: F401
from backend.app.models.symptom import SymptomRecord           # noqa: F401
from backend.app.models.blood_report import BloodReport        # noqa: F401
from backend.app.models.prediction import Prediction           # noqa: F401
from backend.app.models.meal_plan import MealPlan              # noqa: F401
from backend.app.models.food_diary import FoodDiary            # noqa: F401
from backend.app.models.progress import ProgressLog            # noqa: F401
