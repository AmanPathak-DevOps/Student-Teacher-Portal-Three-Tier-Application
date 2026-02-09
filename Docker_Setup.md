
## 🐳 Install Docker & Docker Compose

Update your system and install Docker:

```bash
sudo apt update
sudo apt install docker.io -y
sudo apt install docker-compose-v2 -y
```

Verify Docker installation:

```bash
docker ps
```

Fix Docker permission issue (so you don’t need `sudo` every time):

```bash
sudo chown $USER /var/run/docker.sock
```

---

## 🚀 Run the Application

### 1️⃣ Clone the repository

```bash
git clone <REPOSITORY_URL>
cd <PROJECT_DIRECTORY>
```

---

### 2️⃣ Setup environment files

Copy the sample environment files:

```bash
cp frontend/.env.example frontend/.env  # if .env file not there
```

---

### 3️⃣ Update Frontend `.env`

Edit the frontend environment file:

```bash
vim frontend/.env
```

Update the API URL:

```env
REACT_APP_API_BASE_URL=http://<your_public_ip_or_domain>
```

👉 Example:

```env
REACT_APP_API_BASE_URL=http://192.168.1.100
```

---

### 4️⃣ Build and start containers

Run the application using Docker Compose:

```bash
docker compose up -d --build
```

---

## ✅ Done!

Your application is now running using Docker containers 🎉
Check running containers:

```bash
docker ps
```

---
4. **Access the Application:**

   Open your favorite browser and visit [http://your_ip_address or domain_name). Enjoy exploring the MERN stack application!

   <img width="1064" height="517" alt="image" src="https://github.com/user-attachments/assets/fdb0710f-0a27-4ee0-a352-dc61f3aabacc" />

