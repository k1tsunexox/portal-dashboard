# After cloning

Setup your database.

**For Windows:**

- [XAMPP](#xampp) (phpMyAdmin)
- [MariaDB](#mariadb) (mysql)
- [SQLite](#windows-setup)

**For Linux:**

- [MariaDB](#mariadb) (mysql)
- [SQLite](#linux-setup)

# SQLite

Create a `.sqlite` file:

# Linux setup
```bash
# for linux users
touch database/database.sqlite
```

# Windows setup
```powershell
# for powershell users
code database/database.sqlite

# if code is not available
New-Item -ItemType File database/database.sqlite -Force
```

Then proceed to [SQLite `.env` setup](#-`.env`-file-setup)

# MariaDB

```sql
sudo mariadb -u root -p
-- enter password, by default i think none?

-- create a new database
MariaDB [(none)]> CREATE DATABASE portal_dashboard;

-- create a new user for database, save password for later
CREATE USER '<any_username>'@'localhost' IDENTIFIED BY 'password';
CREATE USER '<any_username>'@'127.0.0.1' IDENTIFIED BY 'password';

-- grant privileges to new user
GRANT ALL PRIVILEGES ON portal_dashboard.* TO '<username>'@'localhost';
GRANT ALL PRIVILEGES ON portal_dashboard.* TO '<username>'@'127.0.0.1';

-- apply privileges to user
FLUSH PRIVILEGES;
exit;
```

# XAMPP

Open XAMPP amp, and start both Apache and MySQL modules. Once started, click on the `Admin` button for MySQL. Create a new database with the name `portal_dashboard`, and create a new user, and grant needed permissions.

**Create new database**

<img width="810" height="730" alt="image" src="https://github.com/user-attachments/assets/fad22525-a72e-474f-88c6-d68b9b03176b" />

---

**Create new user under `User accoutns` tab**

<img width="1877" height="579" alt="image" src="https://github.com/user-attachments/assets/097bf121-bbe3-43a6-a009-f28d083d356a" />

---

**Add information P1**

<img width="633" height="429" alt="image" src="https://github.com/user-attachments/assets/7ec04adb-8f08-467a-a771-effce9c4c2ed" />

---

**Add information P2**

If you have already created a database, no need to check the boxes.

<img width="419" height="115" alt="image" src="https://github.com/user-attachments/assets/8ea5dc46-9d2f-453f-a0a0-aa3289911d2f" />

---

**Grant privileges**

<img width="1346" height="709" alt="image" src="https://github.com/user-attachments/assets/0707bcd2-7d05-4bfb-8f97-cbb82a0ea995" />

Click `go` once finished.

# `.env` file setup

Initialize `.env` file. Rename `.env.example` to `.env`, and change necessary details:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=portal_dashboard
DB_USERNAME=<your_username>
DB_PASSWORD=<your_password>
```

# For SQLite users

Set your `.env` file to:

```env
DB_CONNECTION=sqlite
DB_DATABASE=/path/to/database/database.sqlite
# DB_HOST=127.0.0.1
# DB_PORT=3306
# DB_DATABASE=portal_dashboard
# DB_USERNAME=<your_username>
# DB_PASSWORD=<your_password>
```

## `composer` setup

Install `vendor/` by executing:

```composer
composer install
```

## `npm` and `php` setup

For npm and php, run the following commands before proceeding:

```bash
# npm commands before running
npm install

# also, check npm audit
npm audit

# if vulnerability is found, try executing:
npm install concurrently@latest

# if no vulnerability, proceed to:
npm run build

# for php commands
php artisan key:generate
php artisan migrate

# seed the tables
php artisan db:seed

# for full local reset
php artisan migrate:fresh --seed
```

Run `npm run dev` and `php artisan serve` on two different terminals, simultaneously.

> [!WARNING]
> **DO NOT FORGET** to open/start your database before running
> `npm run dev` and `php artisan serve`.
