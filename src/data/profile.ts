export const profile = {
  firstName: "Hari",
  fullName: "Sarvajana Hari",
  handle: "my-usernamee",
  location: "Singapore",
  email: "hari007@e.ntu.edu.sg",
  links: {
    github: "https://github.com/my-usernamee",
    linkedin: "https://www.linkedin.com/in/hari-%E2%80%8E-%E2%80%8E-244b3724b",
    resume: "/resume.pdf",
    team: "https://ntudeepspeed.github.io",
    mecatron: "https://mecatron.sg",
    medium: "https://medium.com/@thisisnotmygoooglemailid",
  },
};

// route tags in the nav, colours are gym tape colours
export const pages = [
  { href: "/writing", label: "writing", color: "#e2b53c" },
  { href: "/interests", label: "interests", color: "#d9643a" },
];

// the bio under the name, in Hari's words
export const bio = [
  "I'm into robotics, machine learning, and building random things that seem interesting. Usually learning by doing, tinkering with ideas, and turning half-baked concepts into actual projects.",
  "Still exploring what I really like, and always down to try something new.",
];

// three short rows, inferred from what's actually in the repos and the resume
export const now: { label: string; text: string; href?: string }[] = [
  {
    label: "now",
    text: "Teaching a 1:10 race car to pick a line from a LiDAR scan with NTU DeepSpeed, an AUV to see with Mecatron, and a physics tutor bot to ask before it answers (URECA). Days go to RPA at Singapore Prison Service.",
  },
  {
    label: "lately",
    text: "Solved Wordle with entropy, wrote up RAG so it makes sense, and built a Chrome extension about which side of the bus to sit on. Small problems, properly finished.",
    href: "/writing",
  },
  {
    label: "usually",
    text: "Python, ROS 2, PyTorch, Docker, and whatever the problem actually needs. Sim first, then the track. LiDAR over cameras, at least on the car.",
  },
];

export type Team = {
  slug: string;
  name: string;
  what: string;
  role: string;
  since: string;
  lines: string[];
  tags: string[];
  link: string;
};

export const teams: Team[] = [
  {
    slug: "deepspeed",
    name: "NTU DeepSpeed",
    what: "F1TENTH / RoboRacer autonomous racing",
    role: "Navigation & control",
    since: "Mar 2026",
    lines: [
      "1:10 scale cars that race head-to-head with a LiDAR and no cameras. I work on the navigation stack: reactive methods, global planning, PID, SLAM, and a lot of iterative testing on obstacle avoidance and stability.",
      "Raced at IEEE ICRA 2026 in Vienna, then in Korea, and placed well in the sim-racing rounds along the way.",
    ],
    tags: ["ROS 2", "LiDAR", "SLAM", "PID", "Docker", "Linux"],
    link: "https://ntudeepspeed.github.io",
  },
  {
    slug: "mecatron",
    name: "NTU Mecatron",
    what: "Autonomous underwater vehicles",
    role: "Robotics software · navigation & perception",
    since: "2026",
    lines: [
      "Student-built AUVs for SAUVC and RoboSub. The team won SAUVC 2025 and is taking two vehicles, Hydra and Kraken, to RoboSub 2026.",
      "I'm on the software side, working on navigation and perception for now.",
    ],
    tags: ["ROS 2", "Computer Vision", "Navigation"],
    link: "https://mecatron.sg",
  },
];

export const skills = ["Python", "C/C++", "Java", "TypeScript", "SQL", "R", "Swift", "ROS 2", "Docker", "Linux", "TensorFlow", "PyTorch", "React", "Flask", "Power Automate"];

export type Project = {
  slug: string;
  name: string;
  year: string;
  kind: "project" | "research" | "extension";
  blurb: string;
  tags: string[];
  link?: string;
  linkLabel?: string;
  image?: string; // /images/projects/<slug>.png
};

// only what's on the resume
export const projects: Project[] = [
  {
    slug: "deblur",
    name: "Image Deblurring",
    year: "2025",
    kind: "project",
    blurb: "End-to-end deblurring on the GoPro dataset. U-Net encoder-decoder with skip connections, plus cross-stage feature fusion and a supervised attention module to refine multi-scale features for sharper reconstructions.",
    tags: ["Python", "PyTorch", "OpenCV"],
    link: "https://github.com/my-usernamee/imagedeblur",
  },
  {
    slug: "shady",
    name: "Shady",
    year: "2026",
    kind: "extension",
    blurb: "Chrome extension for Google Maps that combines the Routes API with real-time solar position to recommend which side of the vehicle to sit on, so the sun isn't in your face.",
    tags: ["TypeScript", "JavaScript", "Google Routes API"],
    link: "https://github.com/my-usernamee/shady",
  },
  {
    slug: "ureca",
    name: "Socratic Physics Bot",
    year: "2026",
    kind: "research",
    blurb: "URECA undergraduate research at NTU. A physics tutor that answers a question with a better question, so students reason their way to the result instead of copying it.",
    tags: ["LLM", "Tutoring", "URECA"],
  },
];

export type Stint = { period: string; org: string; role: string; note: string };

export const stints: Stint[] = [
  {
    period: "May 2026 – now",
    org: "Singapore Prison Service",
    role: "RPA Intern, Prison Visit Management",
    note: "End-to-end RPA with UiPath and Power Automate, integrating enterprise systems to automate high-volume admin workflows. Worked with stakeholders to find what to automate, redesign the workflow, and ship something that cuts manual steps and turnaround time.",
  },
  {
    period: "Feb – Apr 2026",
    org: "OCBC Bank",
    role: "Intranet Revamp Intern, Group Legal & Compliance",
    note: "Redesigned the SharePoint intranet for five departments, ran testing and phased rollout, wrote the docs and training so it outlives the intern.",
  },
  {
    period: "2026 – now",
    org: "NTU URECA",
    role: "Undergraduate researcher",
    note: "Building a Socratic physics tutor bot. TODO(hari): add supervisor / lab.",
  },
];

export const honors = [
  { title: "Dean's List, AY2025/26", year: "2026" },
  { title: "NTU Honours College", year: "2025" },
  { title: "Nanyang Global Merit Scholar", year: "2025" },
  { title: "JEE Advanced, All India Rank 2170", year: "2022" },
  { title: "cGPA 4.76 / 5.00, Computer Engineering", year: "now" },
];

// the small "otherwise" line at the bottom of the home page
export const interests = [
  { label: "bouldering", note: "greens at Boulder+, about V4", href: "/climbing" },
  { label: "f1 trips", note: "Marina Bay, Albert Park, Sepang", href: "/f1" },
  { label: "travel photos", note: "treks and race weekends", href: "/photos" },
  { label: "writing", note: "on Medium, occasionally", href: "/writing" },
];
