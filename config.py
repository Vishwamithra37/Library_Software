from pymongo import MongoClient
DBLINK = "mongodb://localhost:27017/"  # connecting to the local Mongodb
DBPORT = 3000
DATABASE = "Library_Software"
DBOPSENCODINGSTRING = "I am a scary random string"
SERVERTIMEOUT=2000
DB=MongoClient(DBLINK,port=DBPORT,serverSelectionTimeoutMS=SERVERTIMEOUT)
SESSION_ENCRYPTING_KEY="I am a scary random string22"
PERMISSION_LIST=['register_book','login']
RUNNINGPORT=80
