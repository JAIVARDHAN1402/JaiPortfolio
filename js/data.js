/* ============================================================
   PORTFOLIO DATA — edit this file to update the site content
   ============================================================ */
const DATA = {
  name: "Jaivardhan Singh",
  firstName: "Jaivardhan",
  initials: "JS",
  avatar: null, // e.g. "assets/avatar.jpg" — leave null to use the initials avatar
  role: "Software Developer",
  headline: "CS Undergrad @ VIT Vellore · Full-Stack Developer · Seeking SDE roles",
  location: "Jamshedpur, Jharkhand, India",
  phone: "+91 8709938626",
  email: "jaivardhan.workmail@gmail.com",
  resumeFile: "assets/Resume_Jaivardhan_Singh.pdf",
  socials: {
    github: "https://github.com/JAIVARDHAN1402",
    linkedin: "https://www.linkedin.com/in/jaivardhansingh14",
    leetcode: "https://leetcode.com/u/jaivardhan1402/",
  },
  summary:
    "Computer Science undergraduate at VIT Vellore (CGPA 8.16/10). Built production automation tools in VB.NET and Oracle SQL during software development internships at Timken India and Tata Cummins, deployed on live manufacturing floors. Separately ships full-stack web projects in Next.js and MongoDB, including recent work on transactional concurrency control and atomic booking logic. 200+ DSA problems solved in C++, backed by coursework in DBMS, Operating Systems, OOP, and Computer Networks.",
  taglines: [
    "Full-Stack Developer",
    "Next.js + MongoDB",
    "200+ DSA problems in C++",
    "Open to SDE roles · 2027",
  ],
  stats: [
    { label: "CGPA", value: "8.16", suffix: "/10" },
    { label: "DSA Problems", value: "200", suffix: "+" },
    { label: "Internships", value: "2", suffix: "" },
    { label: "Deployed Projects", value: "3", suffix: "" },
  ],

  education: [
    {
      school: "Vellore Institute of Technology, Vellore",
      degree: "B.Tech, Computer Science Engineering",
      score: "CGPA 8.16 / 10",
      period: "Aug 2023 – May 2027",
      details:
        "Coursework: Data Structures & Algorithms, Operating Systems, Computer Networks, DBMS, Object-Oriented Programming",
    },
    {
      school: "Vidya Bharati Chinmaya Vidyalaya, Jamshedpur",
      degree: "Class XII (CBSE)",
      score: "80.0%",
      period: "2021 – 2023",
      details: "Physics, Chemistry, Mathematics, Computer Science",
    },
    {
      school: "Gulmohur High School, Jamshedpur",
      degree: "Class X",
      score: "81.5%",
      period: "2008 – 2021",
      details: "",
    },
  ],

  experience: [
    {
      company: "Timken India Limited",
      title: "Software Developer Intern",
      period: "May 2025 – Jun 2025",
      stack: ["VB.NET", "Oracle SQL", "Email Automation"],
      points: [
        "Engineered a Network Device Management System in VB.NET and Oracle SQL that centralised IT asset tracking for 200+ network devices across multiple company locations, replacing scattered spreadsheet-based records.",
        "Designed normalised master data entry modules (Company, Location, Asset Type) that standardised and automated asset registration workflows, cutting manual data entry time by ~35%.",
        "Implemented real-time device monitoring with automated email alerting, reducing downtime detection on critical network infrastructure from 15+ minutes to under 1 minute.",
      ],
    },
    {
      company: "Tata Cummins Private Limited",
      title: "Software Developer Intern",
      period: "Dec 2024 – Jan 2025",
      stack: ["VB.NET", "Oracle SQL", "Camera Integration", "QR Codes"],
      points: [
        "Developed end-to-end quality inspection automation software in VB.NET and Oracle SQL, replacing manual paper-based checks across the production line and improving inspection throughput while reducing human error.",
        "Integrated camera-based verification and QR code generation into the inspection flow, strengthening part traceability and cutting manual verification steps by ~50%.",
        "Built a data access and audit module enabling engineers to retrieve historical inspection records for defect analysis and compliance reporting.",
      ],
    },
  ],

  projects: [
    {
      id: "bookify",
      name: "Bookify",
      tagline: "Concurrent Ticket Booking Platform",
      icon: "ticket",
      color: ["#f43f5e", "#f97316"],
      stack: ["Next.js 16", "MongoDB", "Mongoose", "JWT", "Nodemailer", "Vercel"],
      github: "https://github.com/JAIVARDHAN1402/Bookify",
      live: "https://bookify-ticket.vercel.app/",
      points: [
        "Full-stack movie & concert ticket booking platform on Next.js 16 (App Router) with Route Handlers as the backend API, a Mongoose/MongoDB data layer, and JWT httpOnly-cookie auth across three roles (customer, organiser, admin).",
        "Eliminated double-booking by modelling every seat as an independent document acquired through a single atomic conditional write (available → held), so two simultaneous requests for the same seat can never both succeed.",
        "Wrapped multi-seat holds, booking confirmation, cancellation and waitlist acceptance in MongoDB multi-document transactions; enforced TTL-based seat holds lazily on every read/write and via a scheduled cron sweep.",
        "FIFO waitlist that atomically cascades cancelled seats to the next customer as a time-limited emailed offer, QR-coded e-tickets over Nodemailer, and an organiser revenue dashboard.",
      ],
    },
    {
      id: "interviewai",
      name: "InterviewAI",
      tagline: "AI Voice Interview Simulator",
      icon: "mic",
      color: ["#8b5cf6", "#06b6d4"],
      stack: ["Next.js", "Web Speech API", "Google Gemini", "Vercel"],
      github: "https://github.com/JAIVARDHAN1402/InterviewAI",
      live: "https://interviewai-five-brown.vercel.app/",
      points: [
        "Voice-driven mock interview simulator with hold-to-speak capture, live speech-to-text and spoken AI feedback across 6 technical roles (SDE, Frontend, PM, DevOps, Data Analyst, System Design).",
        "Integrated the Google Gemini API with automatic model discovery for real-time answer evaluation, per-question scoring and an end-of-session performance summary.",
        "Engineered retry-with-backoff and model-fallback logic to absorb Gemini rate limits mid-interview, so a session never drops a candidate response.",
      ],
    },
    {
      id: "placement",
      name: "Placement Tracker",
      tagline: "Multi-Role Placement Platform",
      icon: "chart",
      color: ["#22c55e", "#0ea5e9"],
      stack: ["React", "REST APIs", "MongoDB Atlas", "JWT", "Vercel CI/CD"],
      github: "https://github.com/JAIVARDHAN1402/Placement_Tracker",
      live: "https://placement-tracker-azure.vercel.app/",
      points: [
        "Multi-role placement portal with company listings, application tracking, deadline management and real-time statistics dashboards for both students and administrators.",
        "RESTful APIs over MongoDB Atlas with JWT cookie-based authentication and role-specific responsive UI; deployed on Vercel with CI/CD on every push to main.",
        "Handled token expiry and silent refresh through httpOnly cookies, preventing abrupt session drops and unnecessary re-logins during active dashboard use.",
      ],
    },
  ],

  skills: [
    {
      group: "Languages",
      items: [
        ["C++", 90],
        ["JavaScript", 88],
        ["SQL", 85],
        ["Java", 75],
        ["VB.NET", 80],
      ],
    },
    {
      group: "Frontend",
      items: [
        ["React.js", 88],
        ["Next.js (App Router)", 90],
        ["Tailwind CSS", 85],
        ["HTML / CSS", 92],
      ],
    },
    {
      group: "Backend",
      items: [
        ["Next.js Route Handlers", 88],
        ["REST APIs", 90],
        ["JWT Authentication", 85],
        ["Mongoose", 86],
        ["Nodemailer", 78],
      ],
    },
    {
      group: "Databases",
      items: [
        ["MongoDB", 88],
        ["MongoDB Atlas", 85],
        ["Oracle SQL", 82],
      ],
    },
    {
      group: "Core CS",
      items: [
        ["Data Structures & Algorithms", 88],
        ["OOP", 85],
        ["Operating Systems", 80],
        ["DBMS", 85],
        ["Computer Networks", 78],
      ],
    },
    {
      group: "Tools",
      items: [
        ["Git / GitHub", 90],
        ["Docker", 70],
        ["Vercel", 88],
        ["VS Code", 95],
      ],
    },
  ],

  achievements: [
    {
      title: "3rd Place — IEEE SENSE-A-Thon 2026",
      icon: "trophy",
      color: ["#f59e0b", "#ef4444"],
      text: "Built a real-time Vehicle Health Monitoring System with multi-sensor integration, placing 3rd against 50+ engineering college teams.",
    },
    {
      title: "200+ DSA Problems Solved",
      icon: "code",
      color: ["#f97316", "#facc15"],
      text: "Solved 200+ problems in C++ across LeetCode and GeeksforGeeks, covering Arrays, Strings, Graphs, Trees and Dynamic Programming.",
      link: "https://leetcode.com/u/jaivardhan1402/",
    },
    {
      title: "Production Software on Live Factory Floors",
      icon: "factory",
      color: ["#0ea5e9", "#6366f1"],
      text: "Two internship builds (Timken India, Tata Cummins) deployed to real manufacturing environments and used daily by engineers.",
    },
  ],
};
