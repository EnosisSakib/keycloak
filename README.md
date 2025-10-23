# Project Setup Guide

This guide will help you set up and run the project using **Docker**, restore the **PostgreSQL** and **WordPress** databases, and launch the main application.

---

## 1. Start the Docker Environment

Run the following command to build and start all containers in the background:

```bash
docker compose -f docker-compose.yml up --build -d
```
---
[Skip to Fresh Setup](#fresh-setup)
---
---
## 2. Restore PostgreSQL Database (Keycloak)

### Step 1: Copy Backup File
Copy the backup file from your project folder to the pgAdmin storage directory:

```
DB/backup_data_pg → data/pgadmin/storage/admin_admin.com/
```

### Step 2: Access pgAdmin
Open your browser and go to: [http://localhost:8070/](http://localhost:8070/)

Login using:
- **Email:** `admin@admin.com`  
- **Password:** `admin`

### Step 3: Register a New Server
In pgAdmin:
1. Click on **Add new server**  
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

---

# Fresh Setup

If you are setting up from scratch, follow these steps.

> We will be filling only the required fields. There are  two .env files to update. One is in root project folder and the other one is inside next-app folder.

---

### 1. Access Keycloak

Go to [http://localhost:8080/](http://localhost:8080/)  
Login using the credentials defined in `docker-compose.yml` under the **keycloak** service.  
(Default credentials:)

- **Username:** `admin`  
- **Password:** `admin`

---

### 2. Create a New Realm

1. Create a new realm (e.g., `myrealm`).
2. Map the realm name in both `.env` files:
   - One in the **base project directory**
   - One inside the **next-app** folder
3. Go to **Realm Settings → Keys** tab.
4. Copy the **RSA256 Public Key** and update the `RSA_256_KEY` value in your `.env` file. Also update the **NODE_KEYCLOAK_REALM** and **NEXT_PUBLIC_KEYCLOAK_REALM** with the new realm name in the .env file.

---

### 3. Create Clients

#### Client for Next.js App
1. Create a new client under your realm (e.g., `myclient`).
2. Click **Next** twice and fill in:
   - **Root URL:** `http://localhost:8090`
   - **Valid Redirect URIs:** `http://localhost:8090/*`
   - **Valid Post Logout Redirect URIs:** `http://localhost:8090/*`
   - **Web Origins:** `http://localhost:8090`
   >(`8090` is the public port of nginx)
3. Update the `NEXT_PUBLIC_CLIENT_ID` in the `.env` file inside `next-app`.

#### Client for Node.js Server
1. Create another client (e.g., `nodeclient`).
2. Click **Next**, enable **Client authentication** and **Service accounts roles**.
3. Click **Next → Save**.
4. Under the **Credentials** tab, copy the **Client Secret**.
5. Update `NODE_CLIENT_ID` and `NODE_CLIENT_SECRET` in your `.env` file.

---

### 4. Create a Role

1. Go to **Realm Roles** → **Create Role**.  
2. Create a role named **admin**.

---

### 5. Create a User

1. Go to **Users** → **Add User**.  
2. Enter a username and click **Create**.  
3. Go to the **Credentials** tab and set a password.  
4. Go to the **Role Mappings** tab:  
   - Click **Assign Role** → **Filter by Realm Roles** → assign the **admin** role.

---

### 6. Set Up WordPress

1. Go to [http://localhost:8090/wordpress/wp-admin/install.php](http://localhost:8090/wordpress/wp-admin/install.php)
2. Select your language and continue.
3. Fill in the site details and click **Install WordPress**.
4. Log in to the admin console.
5. Go to **Plugins** and activate:
   - **JWT Profile Display**
   - **JWT User List Display**
   - **SAML Single Sign On – SSO Login**
6. Click on **Settings → SAML Single Sign On – SSO Login**:
   - Select **Keycloak** as the IDP.
   - Follow the setup or video guide provided.
7. Go to **Settings → Permalinks → Common Settings**
   - Set to **Custom Structure**
   - Enter: `/index.php/%year%/%monthnum%/%day%/%postname%/`
   - Click **Save**
8. Create two pages:
   - Title: **Profile** → add shortcode `[show_token_result]`
   - Title: **User List** → add shortcode `[show_user_list]`

---

### 7. (Optional) Login with Google

Follow this guide to configure Google login for Keycloak:  
🔗 [https://medium.com/@stefannovak96/signing-in-with-google-with-keycloak-bf5166e93d1e](https://medium.com/@stefannovak96/signing-in-with-google-with-keycloak-bf5166e93d1e)

---

## All Set!

Your full environment — Keycloak, WordPress, and the app — should now be fully configured and ready to use.
