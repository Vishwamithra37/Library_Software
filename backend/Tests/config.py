from pymongo import MongoClient
DBLINK = "mongodb://localhost:27017/"  # connecting to the local Mongodb
DBPORT = 3000
DATABASE = "Library_Software"
DBOPSENCODINGSTRING = "I am a scary random string"
SERVERTIMEOUT=2000
BASEURL="http://localhost:80"
DB=MongoClient(DBLINK,port=DBPORT,serverSelectionTimeoutMS=SERVERTIMEOUT)
