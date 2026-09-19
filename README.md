# 🎓 CampusGig

> **A campus-based gig marketplace where students can post work, find skilled peers, and collaborate directly.**

CampusGig is a platform designed specifically for college students to **post, discover, and complete small gigs or tasks within their campus community**.

Whether someone needs a video edited, a presentation designed, a website built, photos taken, or help with another task, they can post the work with a description, deadline, and offered payment. Other students can browse available gigs and accept work that matches their skills.

Once a gig is accepted, it is **automatically locked** to prevent multiple workers from claiming the same task, and a private conversation channel becomes available between the student who posted the gig and the worker who accepted it.

---

## ✨ Features

### 👨‍🎓 Student

Students can:

* Create an account and log in as a **Student**
* Post new gigs
* Add a detailed work description
* Set a deadline
* Specify the offered payment
* View their posted gigs
* Track gig status
* Communicate with the assigned worker

### 🧑‍💻 Worker

Workers can:

* Create an account and log in as a **Worker**
* Browse available gigs
* View gig descriptions
* Check deadlines and offered payment
* Accept available gigs
* Access conversations with students
* Manage their accepted work

### 🔒 Gig Locking

When a worker accepts a gig:

```text
Available
    ↓
Worker accepts
    ↓
Gig gets locked
    ↓
Other workers cannot accept it
    ↓
Student ↔ Worker conversation opens
```

This prevents two workers from accepting the same gig.

### 💬 Conversation Gateway

After a gig is accepted, CampusGig creates a communication channel between the student and worker.

They can use it to:

* Discuss requirements
* Ask questions
* Share additional information
* Clarify deadlines
* Coordinate the work

---

# 🏗️ Application Flow

```text
                    ┌───────────────┐
                    │    CampusGig  │
                    └───────┬───────┘
                            │
                 ┌──────────┴──────────┐
                 │                     │
            👨‍🎓 Student            🧑‍💻 Worker
                 │                     │
                 ▼                     ▼
             Login /               Login /
             Register              Register
                 │                     │
                 ▼                     ▼
             Dashboard           Browse Gigs
                 │                     │
                 ▼                     ▼
            Create Gig            View Gig
                 │                     │
                 │                 Accept Gig
                 │                     │
                 │                     ▼
                 │                🔒 Gig Locked
                 │                     │
                 └──────────┬──────────┘
                            │
                            ▼
                    💬 Conversation
                            │
                            ▼
                     Student ↔ Worker
```

---

# 🛠️ Tech Stack

| Technology                    | Purpose                                                  |
| ----------------------------- | -------------------------------------------------------- |
| **Supabase**                  | Backend, authentication, database and real-time features |
| **Supabase Auth**             | Student & Worker authentication                          |
| **PostgreSQL**                | Gig, user and conversation data                          |
| **Supabase Realtime**         | Real-time conversations                                  |
| **[Your Frontend Framework]** | User interface                                           |
| **[Your Styling Solution]**   | UI styling                                               |

> Replace the frontend and styling placeholders with the technologies used in the project.

---

# 🗄️ Supabase Backend

CampusGig uses a Supabase project named:

```text
CampusGig
```

Supabase is responsible for the application's backend infrastructure.

### Main backend responsibilities

* User authentication
* Role management
* Gig storage
* Gig status management
* Worker assignment
* Conversation data
* Real-time messaging
* Database security

### Suggested Database Structure

```text
users
├── id
├── name
├── email
├── role
└── created_at

gigs
├── id
├── student_id
├── worker_id
├── title
├── description
├── deadline
├── offered_amount
├── status
└── created_at

conversations
├── id
├── gig_id
├── student_id
├── worker_id
└── created_at

messages
├── id
├── conversation_id
├── sender_id
├── message
└── created_at
```

---

# 🔐 User Roles

CampusGig has two primary user roles.

### Student

A student is someone who **posts work**.

```text
Student
   │
   ├── Create Gig
   ├── Set Deadline
   ├── Set Payment
   ├── View Applicants/Worker
   └── Chat With Worker
```

### Worker

A worker is someone who **takes available work**.

```text
Worker
   │
   ├── Browse Gigs
   ├── View Gig Details
   ├── Accept Gig
   └── Chat With Student
```

---

# 🔄 Gig Lifecycle

Each gig follows a defined lifecycle:

```text
┌───────────┐
│ Available │
└─────┬─────┘
      │
      │ Worker accepts
      ▼
┌───────────┐
│  Assigned │
└─────┬─────┘
      │
      │ Conversation opens
      ▼
┌────────────┐
│ In Progress│
└─────┬──────┘
      │
      │ Work completed
      ▼
┌───────────┐
│ Completed │
└───────────┘
```

The important rule is that an **Available** gig can only be accepted once.

---

# 📁 Project Structure

A typical project structure can look like:

```text
CampusGig/
│
├── public/
│
├── src/
│   ├── components/
│   ├── pages/
│   ├── layouts/
│   ├── hooks/
│   ├── lib/
│   │   └── supabase/
│   ├── services/
│   └── App.*
│
├── supabase/
│   ├── migrations/
│   └── seed.*
│
├── .env
├── .gitignore
├── package.json
└── README.md
```

---

# ⚙️ Getting Started

## 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/CampusGig.git
cd CampusGig
```

## 2. Install dependencies

```bash
npm install
```

## 3. Configure Supabase

Create a `.env` file in the project root.

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

> **Never commit your Supabase keys or `.env` file to GitHub.**

Make sure `.env` is included in `.gitignore`.

## 4. Start the development server

```bash
npm run dev
```

The application should now be available locally.

---

# 🔒 Security

CampusGig should use Supabase **Row Level Security (RLS)** to ensure users can only access data they are authorized to see.

For example:

* Students can manage their own gigs.
* Workers can accept available gigs.
* Only the assigned worker and gig owner can access their conversation.
* Users cannot modify another user's gig or profile.
* Messages can only be accessed by conversation participants.

---

# 🚧 Current Status

**Development**

CampusGig is currently being developed and the feature set may change as the project evolves.

### Planned development

* [ ] Student authentication
* [ ] Worker authentication
* [ ] Student dashboard
* [ ] Worker dashboard
* [ ] Create gig
* [ ] Browse gigs
* [ ] Gig acceptance
* [ ] Gig locking
* [ ] Conversation system
* [ ] Real-time messaging
* [ ] Gig completion
* [ ] Ratings & reviews
* [ ] Notifications
* [ ] Admin dashboard
* [ ] Payment integration

---

# 🔮 Future Improvements

Some features planned for future versions:

### ⭐ Ratings & Reviews

Students and workers could rate each other after completing a gig.

### 🔔 Notifications

Users could receive notifications when:

* A gig is accepted
* A new message arrives
* A deadline is approaching
* A gig is completed

### 💳 Payments

A future version could integrate a payment system to handle gig payments securely.

### 🏫 College Verification

CampusGig could support college email verification to ensure the marketplace remains limited to verified students.

### 🔎 Search & Filtering

Workers could filter gigs based on:

* Skills
* Payment
* Deadline
* Category
* Difficulty

---

# 🎯 Example Gigs

CampusGig can be used for many types of student work:

| Gig               | Example                       |
| ----------------- | ----------------------------- |
| 🎬 Video Editing  | Edit a college event video    |
| 🎨 Graphic Design | Design a club poster          |
| 💻 Development    | Build a simple website        |
| 📸 Photography    | Cover a college event         |
| 📱 Social Media   | Manage an event's Instagram   |
| 📊 Presentation   | Create a professional PPT     |
| 📝 Documentation  | Format project documentation  |
| 🎤 Event Work     | Help organize a college event |

---

# 🤝 Contributing

Contributions are welcome.

If you want to contribute:

```bash
# Fork the repository

# Clone your fork
git clone https://github.com/YOUR_USERNAME/CampusGig.git

# Create a branch
git checkout -b feature/your-feature

# Make your changes

# Commit
git commit -m "Add your feature"

# Push
git push origin feature/your-feature
```

Then open a Pull Request.

---

# 📜 License

This project is currently intended for educational and development purposes.

Add a specific license here if you decide to open-source the project.

---

# 👨‍💻 Project

**CampusGig**

> A student-to-student marketplace for campus gigs, skills, and opportunities.

Built with ❤️ for the college community.
