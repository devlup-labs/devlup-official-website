#  FastAPI Backend Setup Guide

This project is built using **FastAPI + MongoDB**. Follow the steps below to set up the backend on your local machine.

---

##  Prerequisites

Make sure you have the following installed:

## Riddhi - Python 3.12.3
* **Python (3.8 or higher)** 
* **pip (Python package manager)**
* **Git**
* **MongoDB (local or cloud via MongoDB Atlas)**

---

##  Clone the Repository

```bash
git clone <your-repo-url>
cd <project-folder>
```

---

##  Create Virtual Environment

Create and activate a virtual environment:

### Windows

```bash
python -m venv myenv 
myenv\Scripts\activate
```

### Linux / Mac

```bash
python3 -m venv myenv
source myenv/bin/activate
```

---

## Backend Dependencies

## Backend Dependencies

This project uses the following technologies:

- FastAPI (Backend Framework)
- MongoDB (Database)
- Motor (Async MongoDB Driver)
- JWT Authentication (python-jose)
- Password Hashing (passlib + bcrypt)
- Environment Variables (python-dotenv)
 
 --- 

##  Install Dependencies

Install all required Python packages:

```bash
pip install fastapi uvicorn pymongo motor python-dotenv python-jose passlib[bcrypt] python-multipart requests "pydantic[email]"
```
extra:(if frontend_admin doesn't work)

```bash
pip uninstall bcrypt passlib -y
pip install bcrypt==4.0.1
pip install passlib==1.7.4
```
---

##  Environment Variables

Create a `.env` file in the root directory and add:

```env
MONGO_URL=your_mongodb_connection_string
DB_NAME=your_database_name
```

---

##  Run MongoDB

### MongoDB Atlas (Cloud)

* Create a cluster
* Get connection string
* Paste it in `.env`

## Riddhi-using Mongodb in vscode
---

##  Run the FastAPI Server

```bash
uvicorn main:app --reload
```

Server will run at:

```
http://127.0.0.1:8000
```

---

##  API Documentation

FastAPI automatically provides docs:

* Swagger UI: http://127.0.0.1:8000/docs
* ReDoc: http://127.0.0.1:8000/redoc

---

##  Project Structure (Example)--update it

```
backend/
│── main.py
│── routers/
│── models/
│── database/
│── .env
│── requirements.txt
│── .gitignore
```

---

## Important Notes

* Do NOT commit `.env` file (contains secrets)
* Do NOT commit `venv/` or `myenv/`

---

## Collaboration Rules (IMPORTANT)

* Do NOT modify files handled by teammates
* Pull latest changes before starting:

  ```bash
  git pull origin <branch-name>
  ```
* Push only your assigned work

---

##  Useful Commands

Run server:

```bash
uvicorn main:app --reload
```

Deactivate virtual environment:

```bash
deactivate
```

---

## You're Ready!


