import requests
from app.config import config

class KeboliClient:
    def __init__(self, base_url: str = config.KEBOLI_BACKEND_URL):
        self.base_url = base_url

    def get_assessment(self, assessment_id: str):
        response = requests.get(f"{self.base_url}/api/assessment/{assessment_id}")
        response.raise_for_status()
        return response.json()

    def update_assessment_skills(self, assessment_id: str, skill_graph: dict):
        payload = {"skill_graph": skill_graph}
        response = requests.patch(f"{self.base_url}/api/assessment/{assessment_id}/skills", json=payload)
        response.raise_for_status()
        return response.json()

keboli_client = KeboliClient()
