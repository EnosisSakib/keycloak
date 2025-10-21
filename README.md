# Project Setup Guide

This guide will help you set up and run the project using **Docker**, restore the **PostgreSQL** and **WordPress** databases, and launch the main application.

---

## 1. Start the Docker Environment

Run the following command to build and start all containers in the background:

```bash
docker compose -f docker-compose.yml up --build -d
```

---

##  2. Restore PostgreSQL Database (Keycloak)

### Step 1: Copy Backup File
Copy the backup file from your project folder to the pgAdmin storage directory:

```
DB/backup_data_pg  →  data/pgadmin/storage/admin_admin.com/
```

### Step 2: Access pgAdmin
Open your browser and go to: [http://localhost:8070/](http://localhost:8070/)

Login using:
- **Email:** `admin@admin.com`  
- **Password:** `admin`

### Step 3: Register a New Server
In pgAdmin:
1. Right-click on **Add new server**  
2. Under the **General** tab:
   - **Name:** any name (e.g., `Keycloak Server`)
3. Under the **Connection** tab:
   - **Host name/address:** `postgres`  
   - **Maintenance database:** `keycloak`  
   - **Username:** `keycloak`  
   - **Password:** `keycloak`

Click **Save**.

### Step 4: Restore Database
1. Expand your new server → Databases → right-click on **keycloak** → select **Restore**.  
2. Choose the file: `backup_data_pg`.  
3. Before restoring, go to the **Query Options** tab and **enable “Clean before restore.”**  
4. Click **Restore** to begin.

---

##  3. Restore WordPress Database

Open **phpMyAdmin** at: [http://localhost:8180/](http://localhost:8180/)

1. Select the wordpress database.  
2. Go to the **Import** tab.  
3. Choose the file `wordpress.sql`.  
4. Click **Go** to start importing.

---

## 4. Launch the Application

Once both databases are restored, open the main app: [http://localhost:8090/](http://localhost:8090/)

---

## Done!

Your project environment should now be fully set up and running.
