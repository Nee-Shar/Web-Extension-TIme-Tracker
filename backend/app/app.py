from fastapi import FastAPI, HTTPException
import mysql.connector
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uuid
import hashlib 
from typing import List
from datetime import datetime


app=FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)



class UserData(BaseModel):
    Email: str
    Pssd:str


class Viewing_Data(BaseModel):
    Site_Name: str
    Time_Spend: int
    user_id:str


class Restricted_Data(BaseModel):
    user_id: str
    Res_Site:str 
    Allowed_Time: int

class Site_Data(BaseModel):
     site_name:str
     total_time:int

Db=mysql.connector.connect(
host="localhost",
user="root",
password="1234",
database="neeraj"
)




# Different Methods to be made :
# 1. Add User (POST REQ )
# 2. Add Data per tab depending on user (POST REQ) 
# 3. See/Add/Delete/Edit restricted site depending on user (GET/POST/PUT REQ)




def generate_truncated_uid():
    # Generate a UUID
    uid = uuid.uuid4()
    
    # Convert the UUID to a hexadecimal string
    uid_hex = uid.hex
    
    # Take the first 20 characters (first 10 bytes) of the hexadecimal string
    truncated_uid = uid_hex[:20]
    
    return truncated_uid






@app.post("/add_user")
def add_user(user_data:UserData):
        cursor=Db.cursor()
        uid=generate_truncated_uid() # Generating Unique ID for User 
        hashed_psswd = hashlib.sha256(user_data.Pssd.encode()).hexdigest()  # Hashing the password using SHA256
        cursor.execute("INSERT INTO USERS (UID,Email,Pssd) VALUES (%s,%s,%s)",(uid,user_data.Email,hashed_psswd))
        Db.commit()
        cursor.close()
        return {"message":"User Added Successfully","UID":uid}

@app.post("/is_user_authentic")
def check_user(user_data: UserData):
    cursor = Db.cursor()
    
    # Hash the password entered by the user
    hashed_psswd = hashlib.sha256(user_data.Pssd.encode()).hexdigest()
    
    # Execute the SELECT query to retrieve user data based on email
    cursor.execute("SELECT Pssd,UID FROM USERS WHERE Email = %s", (user_data.Email,))
    result = cursor.fetchone()
    
    # Check if user exists and if the hashed passwords match
    if result and result[0] == hashed_psswd:
        return {"message": "User authenticated successfully","result":result[1]}
    else:
        raise HTTPException(status_code=401, detail="Authentication failed")
    


@app.post("/add_site_data")
def add_site_data(site_data:Viewing_Data):
        cursor=Db.cursor()
        # id: int Site_Name: str Time_Spend: int datee: str  user_id:str
        cursor.execute("INSERT INTO Viewing_Time_Data (Site_Name,Time_Spend,datee,user_id) VALUES (%s,%s,%s,%s)",(site_data.Site_Name,site_data.Time_Spend,datetime.now().date(),site_data.user_id))
        Db.commit()
        cursor.close()
        return {"message":"Data Added Successfully"}   
@app.post("/add_site_data_batch")
def add_site_data_batch(site_data_list: List[Viewing_Data]):
    cursor = Db.cursor()
    current_date = datetime.now().date()
    current_date = "2024-05-19"
    try:
        for site_data in site_data_list:
            # Delete any existing records for the same site, date, and user ID
            cursor.execute("DELETE FROM Viewing_Time_Data WHERE Site_Name = %s AND datee = %s AND user_id = %s",
                           (site_data.Site_Name, current_date, site_data.user_id))

            # Insert a new record
            cursor.execute("INSERT INTO Viewing_Time_Data (Site_Name, Time_Spend, datee, user_id) VALUES (%s, %s, %s, %s)",
                           (site_data.Site_Name, site_data.Time_Spend, current_date, site_data.user_id))

        Db.commit()
        return {"message": "Data Added/Updated Successfully"}
    except Exception as e:
        Db.rollback()
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")
    finally:
        cursor.close()




@app.post("/add_restricted_site")
def addRestrictedSite(site_data:Restricted_Data):
     cursor=Db.cursor()
     cursor.execute("INSERT INTO Restricted2 (Res_Site,Allowed_Time,user_id) VALUES (%s,%s,%s)",(site_data.Res_Site,site_data.Allowed_Time,site_data.user_id))
     Db.commit()
     cursor.close()
     return{"message":"Restricted Site Added Successfully"}


@app.get("/top3sites/{user_id}")
def top3sites(user_id:str):
     cursor=Db.cursor(dictionary=True)
     current_date = datetime.now().date()
     cursor.execute("SELECT Site_Name, Max(Time_Spend) as total_time , datee FROM Viewing_Time_Data WHERE user_id = %s AND datee = %s GROUP BY Site_Name ORDER BY total_time DESC LIMIT 3",(user_id,current_date))
     result=cursor.fetchall()
     cursor.close()
     return result



@app.get("/get_restricted_sites/{user_id}")
def getRestrictedSites(user_id:str):
     cursor=Db.cursor(dictionary=True)
     cursor.execute("SELECT Res_Site, Allowed_Time FROM Restricted2 WHERE user_id = %s",(user_id,))
     result=cursor.fetchall()
     cursor.close()
     return result



@app.get("/allDataForToday/{user_id}")
def allDataForToday(user_id:str):
     cursor=Db.cursor(dictionary=True)
     current_date = datetime.now().strftime('%Y-%m-%d')
     cursor.execute("SELECT Site_Name, Time_Spend as total_time FROM Viewing_Time_Data WHERE user_id = %s AND datee = %s " ,(user_id,current_date))
     result=cursor.fetchall()
     cursor.close()
     return result

@app.get("/monthlyData/{user_id}")
def monthlyData(user_id:str):
     cursor=Db.cursor(dictionary=True)
     current_month = datetime.now().month
     cursor.execute("SELECT Site_Name, Time_Spend as total_time FROM Viewing_Time_Data WHERE user_id = %s AND MONTH(datee) = %s " ,(user_id,current_month))
     result=cursor.fetchall()
     cursor.close()
     return result