"""
Database Initialization Script for Library Software
This script initializes the database with necessary configurations and sample users.
It uses the registration API endpoint to properly register users.
"""

import config
import dbops
import requests
from bson.objectid import ObjectId

# Database connection
dab = config.DB[config.DATABASE]

# Base URL for API calls
BASEURL = f"http://localhost:{config.RUNNINGPORT}"

def initialize_configs():
    """Initialize the necessary configuration documents in the database"""
    print("Initializing configurations...")

    dac = dab["CONFIGS"]

    # 1. Setup Permissions Dictionary
    print("  - Setting up permissions dictionary...")
    permissions_config = {
        "Config_Name": "PERMISSIONS_DICTIONARY",
        "Role_Permission_Dictionary": {
            "Admin": [
                "register_book",
                "login",
                "logout_api",
                "get_book_tags",
                "get_book_list",
                "get_user_list",
                "admin_rent_book",
                "get_specific_user_list",
                "get_specific_book_details",
                "dashboard_page",
                "get_unique_book_ids",
                "get_unique_book_ids_returns",
                "admin_return_book",
                "admin_scanner_actions",
                "admin_edit_book",
                "admin_register_api_passwordless",
                "delete_admin_book",
                "admin_add_user_payment",
                "get_rented_book_list",
                "get_book_list_special_filter",
                "simple_meta_data",
                "get_all_status_rented_book_list",
                "admin_update_user"
            ],
            "Staff": [
                "login",
                "get_book_tags",
                "get_book_list",
                "get_user_list",
                "dashboard_page",
                "get_specific_book_details",
                "simple_meta_data"
            ],
            "Student": [
                "login",
                "get_book_tags",
                "get_book_list",
                "dashboard_page"
            ],
            "Other": [
                "login",
                "get_book_tags",
                "get_book_list",
                "dashboard_page"
            ]
        },
        "Roles_List": [
            "Admin",
            "Staff",
            "Student",
            "Other"
        ],
        "organization": "GTSocial"
    }

    # Check if already exists
    existing = dac.find_one({"Config_Name": "PERMISSIONS_DICTIONARY", "organization": "GTSocial"})
    if not existing:
        dac.insert_one(permissions_config)
        print("     Permissions dictionary created")
    else:
        print("     Permissions dictionary already exists")

    # 2. Setup Library Parameters
    print("  - Setting up library parameters...")
    library_params = {
        "Config_Name": "Library_Parameters",
        "GTSocial": {
            "Day_Penality": 10,
            "Month_Penality": 100,
            "Year_Penality": 1000
        }
    }

    existing = dac.find_one({"Config_Name": "Library_Parameters"})
    if not existing:
        dac.insert_one(library_params)
        print("     Library parameters created")
    else:
        print("     Library parameters already exists")

    # 3. Setup Book Tag Options
    print("  - Setting up book tag options...")
    book_tags_config = {
        "Config_Name": "Book_Tag_Options"
    }

    existing = dac.find_one({"Config_Name": "Book_Tag_Options"})
    if not existing:
        dac.insert_one(book_tags_config)
        print("     Book tag options created")
    else:
        print("     Book tag options already exists")

    print(" Configuration initialization complete\n")


def register_initial_admin():
    """Register an initial admin user using the registration API"""
    print("Registering initial admin user...")

    # Check if admin already exists
    dac = dab["USERS"]
    existing = dac.find_one({"email": "admin@library.com"})
    if existing:
        print("   Admin user already exists\n")
        return existing

    # Prepare admin user data
    admin_data = {
        "username": "Admin User",
        "email": "admin@library.com",
        "id_number": "ADMIN001",
        "phone_number": "1234567890",
        "description": "System Administrator",
        "organization": "GTSocial",
        "role": "Admin"
    }

    # Hash the default password and insert directly into database
    # Since the passwordless registration requires authentication,
    # we'll insert the first admin directly
    admin_user = {
        "username": admin_data["username"],
        "password": dbops.hash512("admin123"),  # Default password: admin123
        "email": admin_data["email"],
        "id_number": admin_data["id_number"],
        "phone_number": admin_data["phone_number"],
        "description": admin_data["description"],
        "organization": [admin_data["organization"]],
        "Role": admin_data["role"],
        "permissions": [
            "register_book",
            "login",
            "logout_api",
            "get_book_tags",
            "get_book_list",
            "get_user_list",
            "admin_rent_book",
            "get_specific_user_list",
            "get_specific_book_details",
            "dashboard_page",
            "get_unique_book_ids",
            "get_unique_book_ids_returns",
            "admin_return_book",
            "admin_scanner_actions",
            "admin_edit_book",
            "admin_register_api_passwordless",
            "delete_admin_book",
            "admin_add_user_payment",
            "get_rented_book_list",
            "get_book_list_special_filter",
            "simple_meta_data",
            "get_all_status_rented_book_list",
            "admin_update_user"
        ],
        "Library": {
            "Number_of_books_rented_currently": 0,
            "Number_of_books_returned": 0,
            "Number_of_times_overdue": 0,
            "Total_Number_of_books_rented": 0,
            "Total_fine_amount": 0,
            "Total_fine_amount_paid": 0,
            "Total_fine_amount_pending": 0,
            "Total_fine_amount_waived": 0,
            "GTSocial": {
                "Number_of_books_rented_currently": 0,
                "Number_of_books_returned": 0,
                "Number_of_times_overdue": 0,
                "Total_Number_of_books_rented": 0,
                "Total_fine_amount": 0,
                "Total_fine_amount_paid": 0,
                "Total_fine_amount_pending": 0,
                "Total_fine_amount_waived": 0
            }
        }
    }

    result = dac.insert_one(admin_user)
    if result.acknowledged:
        print("   Admin user created successfully")
        print(f"    Email: {admin_data['email']}")
        print(f"    Password: admin123")
        print(f"    Please change the password after first login!\n")
        return admin_user
    else:
        print("   Failed to create admin user\n")
        return None


def register_sample_users_via_api(admin_session):
    """Register sample users using the API endpoint"""
    print("Registering sample users via API...")

    sample_users = [
        {
            "username": "John Doe",
            "email": "john.doe@student.com",
            "id_number": "STU001",
            "phone_number": "9876543210",
            "description": "Computer Science Student",
            "organization": "GTSocial",
            "role": "Student"
        },
        {
            "username": "Jane Smith",
            "email": "jane.smith@staff.com",
            "id_number": "STAFF001",
            "phone_number": "9876543211",
            "description": "Library Staff Member",
            "organization": "GTSocial",
            "role": "Staff"
        },
        {
            "username": "Bob Wilson",
            "email": "bob.wilson@student.com",
            "id_number": "STU002",
            "phone_number": "9876543212",
            "description": "Electronics Student",
            "organization": "GTSocial",
            "role": "Student"
        }
    ]

    for user_data in sample_users:
        # Check if user already exists
        dac = dab["USERS"]
        existing = dac.find_one({"email": user_data["email"]})
        if existing:
            print(f"   User {user_data['email']} already exists")
            continue

        try:
            response = admin_session.post(
                f"{BASEURL}/api/v1/user/register_passwordless",
                json=user_data
            )

            if response.status_code == 200:
                print(f"   Registered: {user_data['username']} ({user_data['email']})")
            else:
                print(f"   Failed to register {user_data['email']}: {response.json()}")
        except Exception as e:
            print(f"   Error registering {user_data['email']}: {str(e)}")

    print(" Sample users registration complete\n")


def main():
    """Main initialization function"""
    print("=" * 60)
    print("Library Software Database Initialization")
    print("=" * 60)
    print()

    try:
        # Step 1: Initialize configurations
        initialize_configs()

        # Step 2: Register initial admin user
        admin_user = register_initial_admin()

        if admin_user:
            # Step 3: Login as admin to get session
            print("Logging in as admin...")
            session = requests.Session()
            try:
                login_response = session.post(
                    f"{BASEURL}/api/v1/user/login",
                    json={
                        "email": "admin@library.com",
                        "password": "admin123"
                    }
                )

                if login_response.status_code == 200:
                    print("   Admin login successful\n")

                    # Step 4: Register sample users via API
                    register_sample_users_via_api(session)
                else:
                    print("   Admin login failed. Sample users not created.")
                    print(f"    Response: {login_response.json()}\n")
            except Exception as e:
                print(f"   Error during login or user registration: {str(e)}")
                print("    This is expected if the Flask server is not running.")
                print("    The admin user has been created in the database.")
                print("    You can manually start the server and create users via the API.\n")

        print("=" * 60)
        print("Database Initialization Complete!")
        print("=" * 60)
        print("\nNext steps:")
        print("1. Start the Flask server: python main.py")
        print("2. Login with admin credentials:")
        print("   Email: admin@library.com")
        print("   Password: admin123")
        print("3. Change the admin password")
        print("4. Register additional users via the dashboard")

    except Exception as e:
        print(f"\n Error during initialization: {str(e)}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    main()
