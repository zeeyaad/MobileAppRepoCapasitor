"""
Postman Collection Generator for Helwan Club API
Generates a complete Postman collection from backend route files
"""

import json
import re
from pathlib import Path

# Base collection structure
collection = {
    "info": {
        "_postman_id": "helwan-club-complete-api-2026",
        "name": "Helwan Club Complete API",
        "description": "Complete API collection - All 95+ endpoints",
        "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
    },
    "auth": {
        "type": "bearer",
        "bearer": [{"key": "token", "value": "{{authToken}}", "type": "string"}]
    },
    "item": [],
    "variable": [
        {"key": "baseUrl", "value": "http://localhost:3000/api", "type": "string"},
        {"key": "authToken", "value": "", "type": "string"}
    ]
}

# Route definitions by category
routes = {
    "Authentication": [
        {"method": "POST", "path": "/auth/login", "name": "Login", "auth": False,
         "body": '{"email": "admin@helwan-club.local", "password": "password"}'},
        {"method": "POST", "path": "/auth/change-credentials", "name": "Change Credentials",
         "body": '{"new_email": "new@email.com", "new_password": "newpass"}'}
    ],
    "Staff Management - Core": [
        {"method": "GET", "path": "/staff/types", "name": "Get Staff Types", "auth": False},
        {"method": "POST", "path": "/staff/register", "name": "Register Staff",
         "body": '{"first_name_en":"John","last_name_en":"Doe","national_id":"12345678901234","phone":"+201234567890","staff_type_id":8,"employment_start_date":"2024-01-15"}'},
        {"method": "GET", "path": "/staff", "name": "Get All Staff", "params": {"page": "1", "limit": "20"}},
        {"method": "GET", "path": "/staff/:id", "name": "Get Staff by ID", "vars": {"id": "5"}},
        {"method": "PUT", "path": "/staff/:id", "name": "Update Staff", "vars": {"id": "5"},
         "body": '{"phone":"+201987654321"}'},
        {"method": "PATCH", "path": "/staff/:id/deactivate", "name": "Deactivate Staff", "vars": {"id": "5"}}
    ],
    "Staff Management - Privileges": [
        {"method": "GET", "path": "/staff/privileges", "name": "Get All Privileges"},
        {"method": "GET", "path": "/staff/packages", "name": "Get Privilege Packages"},
        {"method": "GET", "path": "/staff/packages/:packageId/privileges", "name": "Get Package Privileges", "vars": {"packageId": "1"}},
        {"method": "POST", "path": "/staff/:id/assign-packages", "name": "Assign Packages", "vars": {"id": "5"},
         "body": '{"package_ids":[1,3,5]}'},
        {"method": "GET", "path": "/staff/:id/privileges", "name": "Get Staff Privileges", "vars": {"id": "5"}},
        {"method": "GET", "path": "/staff/:id/final-privileges", "name": "Get Final Privileges", "vars": {"id": "5"}},
        {"method": "GET", "path": "/staff/:id/privilege-codes", "name": "Get Privilege Codes", "vars": {"id": "5"}},
        {"method": "POST", "path": "/staff/:id/grant-privilege", "name": "Grant Privilege", "vars": {"id": "5"},
         "body": '{"privilege_id":15}'},
        {"method": "POST", "path": "/staff/:id/revoke-privilege", "name": "Revoke Privilege", "vars": {"id": "5"},
         "body": '{"privilege_id":15}'},
        {"method": "POST", "path": "/staff/:id/check-privilege/:privilegeCode", "name": "Check Privilege", 
         "vars": {"id": "5", "privilegeCode": "VIEW_MEMBERS"}},
        {"method": "GET", "path": "/staff/:id/activity-logs", "name": "Get Activity Logs", "vars": {"id": "5"}, "params": {"limit": "50"}}
    ],
    "Sports": [
        {"method": "POST", "path": "/sports", "name": "Create Sport",
         "body": '{"name_en":"Football","name_ar":"كرة القدم","price":100}'},
        {"method": "GET", "path": "/sports", "name": "Get All Sports", "params": {"status": "active"}},
        {"method": "GET", "path": "/sports/:id", "name": "Get Sport by ID", "vars": {"id": "1"}},
        {"method": "PUT", "path": "/sports/:id", "name": "Update Sport", "vars": {"id": "1"},
         "body": '{"name_en":"Football Updated"}'},
        {"method": "POST", "path": "/sports/:id/approve", "name": "Approve Sport", "vars": {"id": "1"},
         "body": '{"approved":true}'},
        {"method": "DELETE", "path": "/sports/:id", "name": "Delete Sport", "vars": {"id": "1"}},
        {"method": "PATCH", "path": "/sports/:id/toggle-status", "name": "Toggle Sport Status", "vars": {"id": "1"}}
    ],
    "Membership Plans": [
        {"method": "GET", "path": "/membership", "name": "Get All Plans", "auth": False},
        {"method": "GET", "path": "/membership/:id", "name": "Get Plan by ID", "auth": False, "vars": {"id": "1"}}
    ],
    "Registration - Basic": [
        {"method": "POST", "path": "/register/basic", "name": "Register Basic", "auth": False,
         "body": '{"email":"member@example.com","password":"pass123","first_name_en":"Ahmed","last_name_en":"Hassan","gender":"male","nationality":"Egyptian","date_of_birth":"1990-05-15"}'},
        {"method": "POST", "path": "/register/choose-role", "name": "Choose Role", "auth": False,
         "body": '{"member_id":150,"role":"working"}'},
        {"method": "POST", "path": "/register/determine-membership", "name": "Determine Membership", "auth": False,
         "body": '{"member_id":150,"answers":{}}'},
        {"method": "POST", "path": "/register/complete", "name": "Complete Registration", "auth": False,
         "body": '{"member_id":150}'}
    ],
    "Registration - Working Members": [
        {"method": "POST", "path": "/register/register-working-member", "name": "Register Complete Working", "auth": False,
         "body": '{"email":"working@example.com","password":"pass123","first_name_en":"Mohamed","last_name_en":"Ali","national_id":"28503201234567","phone":"+201234567890","profession_id":5,"monthly_salary":5000}'},
        {"method": "GET", "path": "/register/professions", "name": "Get Professions", "auth": False},
        {"method": "GET", "path": "/register/salary-brackets", "name": "Get Salary Brackets", "auth": False},
        {"method": "GET", "path": "/register/relationship-types", "name": "Get Relationship Types", "auth": False},
        {"method": "GET", "path": "/register/active-working-members", "name": "Get Active Working Members", "auth": False},
        {"method": "POST", "path": "/register/calculate-working-membership-price", "name": "Calculate Price", "auth": False,
         "body": '{"monthly_salary":5000,"has_dependents":true,"dependent_count":2}'},
        {"method": "POST", "path": "/register/details/working-member", "name": "Submit Working Details", "auth": False,
         "body": '{"member_id":150,"national_id":"28503201234567","phone":"+201234567890","profession_id":5,"monthly_salary":5000}'},
        {"method": "POST", "path": "/register/working-membership", "name": "Create Working Membership", "auth": False,
         "body": '{"member_id":150}'},
        {"method": "GET", "path": "/register/working-status/:member_id", "name": "Get Working Status", "auth": False, "vars": {"member_id": "150"}}
    ],
    "Registration - Retired Members": [
        {"method": "POST", "path": "/register/register-retired-member", "name": "Register Complete Retired", "auth": False},
        {"method": "GET", "path": "/register/retired/professions", "name": "Get Professions", "auth": False},
        {"method": "GET", "path": "/register/retired/relationship-types", "name": "Get Relationship Types", "auth": False},
        {"method": "GET", "path": "/register/retired/active-working-members", "name": "Get Active Members", "auth": False},
        {"method": "POST", "path": "/register/calculate-retired-membership-price", "name": "Calculate Price", "auth": False},
        {"method": "POST", "path": "/register/details/retired-member", "name": "Submit Details", "auth": False},
        {"method": "POST", "path": "/register/retired-membership", "name": "Create Membership", "auth": False},
        {"method": "POST", "path": "/register/retired-relationship", "name": "Create Relationship", "auth": False},
        {"method": "GET", "path": "/register/retired-status/:member_id", "name": "Get Status", "auth": False, "vars": {"member_id": "150"}}
    ],
    "Registration - Student Members": [
        {"method": "POST", "path": "/register/register-student-member", "name": "Register Complete Student", "auth": False},
        {"method": "GET", "path": "/register/student/statuses", "name": "Get Student Statuses", "auth": False},
        {"method": "GET", "path": "/register/student/relationship-types", "name": "Get Relationship Types", "auth": False},
        {"method": "GET", "path": "/register/student/active-members", "name": "Get Active Members", "auth": False},
        {"method": "POST", "path": "/register/student-details", "name": "Submit Details", "auth": False},
        {"method": "POST", "path": "/register/calculate-student-membership-price", "name": "Calculate Price", "auth": False},
        {"method": "POST", "path": "/register/student-membership", "name": "Create Membership", "auth": False},
        {"method": "POST", "path": "/register/calculate-student-dependent-price", "name": "Calculate Dependent Price", "auth": False},
        {"method": "POST", "path": "/register/student-dependent-membership", "name": "Create Dependent Membership", "auth": False},
        {"method": "GET", "path": "/register/student-status/:member_id", "name": "Get Status", "auth": False, "vars": {"member_id": "150"}}
    ],
    "Registration - Dependent Members": [
        {"method": "GET", "path": "/register/dependent/subtypes", "name": "Get Subtypes", "auth": False},
        {"method": "GET", "path": "/register/dependent/relationship-types", "name": "Get Relationship Types", "auth": False},
        {"method": "GET", "path": "/register/dependent/active-working-members", "name": "Get Active Working", "auth": False},
        {"method": "GET", "path": "/register/dependent/active-visitor-members", "name": "Get Active Visitors", "auth": False},
        {"method": "GET", "path": "/register/dependent/active-members", "name": "Get Active Members", "auth": False},
        {"method": "GET", "path": "/register/dependent-tiers", "name": "Get Dependent Tiers", "auth": False},
        {"method": "POST", "path": "/register/calculate-dependent-membership-price", "name": "Calculate Price", "auth": False},
        {"method": "POST", "path": "/register/dependent-membership", "name": "Create Membership", "auth": False},
        {"method": "GET", "path": "/register/dependent-status/:member_id", "name": "Get Status", "auth": False, "vars": {"member_id": "150"}}
    ],
    "Registration - Team Members": [
        {"method": "POST", "path": "/register/details/team-member", "name": "Submit Details", "auth": False},
        {"method": "POST", "path": "/register/team-member/select-teams", "name": "Select Teams", "auth": False,
         "body": '{"member_id":150,"sport_ids":[1,3,5]}'},
        {"method": "GET", "path": "/register/team-member/status/:member_id", "name": "Get Status", "auth": False, "vars": {"member_id": "150"}},
        {"method": "GET", "path": "/register/team-member/review-all", "name": "Review All (Sport Staff)"}
    ],
    "Members - Core": [
        {"method": "GET", "path": "/members", "name": "Get All Members", "params": {"page": "1", "limit": "20"}},
        {"method": "GET", "path": "/members/:id", "name": "Get Member by ID", "vars": {"id": "150"}},
        {"method": "POST", "path": "/members", "name": "Create Member",
         "body": '{"email":"new@example.com","password":"pass123","first_name_en":"Sara","last_name_en":"Ahmed","member_type_id":2,"phone":"+201234567890","national_id":"29012345678901"}'},
        {"method": "PUT", "path": "/members/:id", "name": "Update Member", "vars": {"id": "150"},
         "body": '{"phone":"+201987654321"}'},
        {"method": "GET", "path": "/members/:id/review", "name": "Review Member", "vars": {"id": "150"}},
        {"method": "PATCH", "path": "/members/:id/status", "name": "Change Status", "vars": {"id": "150"},
         "body": '{"status":"suspended","reason":"Payment overdue"}'},
        {"method": "PATCH", "path": "/members/:id/block", "name": "Block/Unblock", "vars": {"id": "150"},
         "body": '{"blocked":true}'},
        {"method": "POST", "path": "/members/:id/reset-password", "name": "Reset Password", "vars": {"id": "150"}},
        {"method": "GET", "path": "/members/:id/history", "name": "Get History", "vars": {"id": "150"}},
        {"method": "POST", "path": "/members/:id/membership-request", "name": "Manage Request", "vars": {"id": "150"},
         "body": '{"action":"approve"}'}
    ],
    "Members - Documents": [
        {"method": "POST", "path": "/members/:id/documents", "name": "Upload Document", "vars": {"id": "150"}},
        {"method": "DELETE", "path": "/members/:id/documents/:document_type", "name": "Delete Document", 
         "vars": {"id": "150", "document_type": "national_id"}},
        {"method": "GET", "path": "/members/:id/documents/:document_type/print", "name": "Print Document",
         "vars": {"id": "150", "document_type": "national_id"}},
        {"method": "GET", "path": "/members/:id/card", "name": "Print Member Card", "vars": {"id": "150"}}
    ],
    "Membership Plans - Admin": [
        {"method": "GET", "path": "/membership-plans", "name": "Get All Plans"},
        {"method": "GET", "path": "/membership-plans/:id", "name": "Get Plan by ID", "vars": {"id": "1"}},
        {"method": "POST", "path": "/membership-plans", "name": "Create Plan",
         "body": '{"name_en":"Premium","name_ar":"المميزة","price":1500,"duration_months":12}'},
        {"method": "PUT", "path": "/membership-plans/:id", "name": "Update Plan", "vars": {"id": "1"}},
        {"method": "DELETE", "path": "/membership-plans/:id", "name": "Delete Plan", "vars": {"id": "1"}},
        {"method": "PATCH", "path": "/membership-plans/:id/status", "name": "Change Status", "vars": {"id": "1"}},
        {"method": "POST", "path": "/members/:member_id/membership-plan", "name": "Assign to Member", "vars": {"member_id": "150"},
         "body": '{"plan_id":1,"start_date":"2024-02-13","payment_method":"cash","payment_amount":500}'},
        {"method": "PUT", "path": "/members/:member_id/membership-plan", "name": "Change Member Plan", "vars": {"member_id": "150"}}
    ],
    "Member Types": [
        {"method": "GET", "path": "/member-types", "name": "Get All Types"},
        {"method": "GET", "path": "/member-types/:id", "name": "Get Type by ID", "vars": {"id": "1"}},
        {"method": "POST", "path": "/member-types", "name": "Create Type",
         "body": '{"name_en":"Premium","name_ar":"مميز"}'},
        {"method": "PUT", "path": "/member-types/:id", "name": "Update Type", "vars": {"id": "1"}},
        {"method": "DELETE", "path": "/member-types/:id", "name": "Delete Type", "vars": {"id": "1"}},
        {"method": "POST", "path": "/members/:member_id/member-type", "name": "Assign to Member", "vars": {"member_id": "150"}}
    ],
    "Faculties": [
        {"method": "GET", "path": "/faculties", "name": "Get All Faculties"},
        {"method": "GET", "path": "/faculties/:id", "name": "Get Faculty by ID", "vars": {"id": "1"}},
        {"method": "POST", "path": "/faculties", "name": "Create Faculty",
         "body": '{"name_en":"Engineering","name_ar":"الهندسة"}'},
        {"method": "PUT", "path": "/faculties/:id", "name": "Update Faculty", "vars": {"id": "1"}},
        {"method": "DELETE", "path": "/faculties/:id", "name": "Delete Faculty", "vars": {"id": "1"}},
        {"method": "POST", "path": "/faculties/:facultyId/assign-to-member/:memberId", "name": "Assign to Member",
         "vars": {"facultyId": "1", "memberId": "150"}}
    ],
    "Professions": [
        {"method": "GET", "path": "/professions", "name": "Get All Professions"},
        {"method": "GET", "path": "/professions/:id", "name": "Get Profession by ID", "vars": {"id": "1"}},
        {"method": "POST", "path": "/professions", "name": "Create Profession",
         "body": '{"name_en":"Engineer","name_ar":"مهندس"}'},
        {"method": "PUT", "path": "/professions/:id", "name": "Update Profession", "vars": {"id": "1"}},
        {"method": "DELETE", "path": "/professions/:id", "name": "Delete Profession", "vars": {"id": "1"}},
        {"method": "POST", "path": "/professions/:professionId/assign-to-member/:memberId", "name": "Assign to Member",
         "vars": {"professionId": "1", "memberId": "150"}}
    ]
}

def create_request(route):
    """Create a Postman request object"""
    req = {
        "name": route["name"],
        "request": {
            "method": route["method"],
            "header": [],
            "url": {
                "raw": f"{{{{baseUrl}}}}{route['path']}",
                "host": ["{{baseUrl}}"],
                "path": route["path"].strip("/").split("/")
            }
        },
        "response": []
    }
    
    # Add auth if needed (default is true)
    if route.get("auth", True):
        req["request"]["auth"] = {
            "type": "bearer",
            "bearer": [{"key": "token", "value": "{{authToken}}", "type": "string"}]
        }
    
    # Add body for POST/PUT/PATCH
    if route.get("body") and route["method"] in ["POST", "PUT", "PATCH"]:
        req["request"]["header"].append({"key": "Content-Type", "value": "application/json"})
        req["request"]["body"] = {"mode": "raw", "raw": route["body"]}
    
    # Add query parameters
    if route.get("params"):
        req["request"]["url"]["query"] = [
            {"key": k, "value": v} for k, v in route["params"].items()
        ]
    
    # Add path variables
    if route.get("vars"):
        req["request"]["url"]["variable"] = [
            {"key": k, "value": v} for k, v in route["vars"].items()
        ]
    
    return req

# Build collection
for folder_name, folder_routes in routes.items():
    folder = {
        "name": folder_name,
        "item": [create_request(r) for r in folder_routes]
    }
    collection["item"].append(folder)

# Save collection
output_path = Path(__file__).parent / "Helwan_Club_Complete_API.postman_collection.json"
with open(output_path, "w", encoding="utf-8") as f:
    json.dump(collection, f, indent=2, ensure_ascii=False)

print(f"✅ Generated complete Postman collection with {sum(len(routes[f]) for f in routes)} endpoints")
print(f"📁 Saved to: {output_path}")
