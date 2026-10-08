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
  { href: "/wordle", label: "wordle", color: "#3f9a5a" },
];

// the bio under the name, in Hari's words
export const bio =
  "I'm into robotics, machine learning, and building random things that seem interesting. Usually learning by doing, tinkering with ideas, and turning half-baked concepts into actual projects.";

// three pointers, none of them the internships or the teams
export const pointers: { text: string; href?: string }[] = [
  { text: "Ran 300 million calculations to find the best Wordle opener, then wrote it up", href: "https://medium.com/@thisisnotmygoooglemailid/solving-wordle-with-entropy-4f4b20fb710e" },
  { text: "Built a Chrome extension that tells you which side of the bus to sit on", href: "https://github.com/my-usernamee/shady" },
];

export const photo = { src: "/images/hari.jpg", alt: "Hari in a beanie by the sea", caption: "computer engineering @ ntu" };

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
    role: "Assembly, planning & testing",
    since: "Mar 2026",
    lines: [
      "1:10 scale cars that race head-to-head on LiDAR alone, no cameras. I helped assemble the car and work on the software stack, mostly the ==spliner and planning== side, plus a lot of time testing it on track in practice.",
      "Raced at ICRA 2026 in Vienna, ==P16 at IFAC in Korea==, and ==P2 in the IROS sim racing==.",
    ],
    tags: ["ROS 2", "LiDAR", "SLAM", "PID", "Docker", "Linux"],
    link: "https://ntudeepspeed.github.io",
  },
  {
    slug: "mecatron",
    name: "NTU Mecatron",
    what: "Autonomous surface & underwater vehicles",
    role: "Navigation software",
    since: "Aug 2026",
    lines: [
      "Student-built autonomous boats and subs. I own the ==navigation task== for the USV, writing ==behaviour trees== in ROS 2 that sequence the mission and handle failures, then testing them in sim and in the pool.",
      "Next up: competing at ==RobotX== at the end of the year.",
    ],
    tags: ["ROS 2", "Behaviour Trees", "Navigation", "Simulation"],
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
    blurb: "End-to-end deblurring on the GoPro dataset. ==U-Net encoder-decoder== with skip connections, plus cross-stage feature fusion and a supervised attention module to refine multi-scale features for sharper reconstructions.",
    tags: ["Python", "PyTorch", "OpenCV"],
    link: "https://github.com/my-usernamee/imagedeblur",
  },
  {
    slug: "shady",
    name: "Shady",
    year: "2026",
    kind: "extension",
    blurb: "Chrome extension for Google Maps that combines the Routes API with ==real-time solar position== to recommend which side of the vehicle to sit on, so the sun isn't in your face.",
    tags: ["TypeScript", "JavaScript", "Google Routes API"],
    link: "https://github.com/my-usernamee/shady",
  },
  {
    slug: "ureca",
    name: "Socratic Physics Bot",
    year: "2026",
    kind: "research",
    blurb: "URECA undergraduate research at NTU. A locally-run tutor that reads a photo of a physics problem and ==answers with a better question==, so students reason their way to the result. RAG over course material with Qdrant, on a self-hosted Qwen 2.5-VL.",
    tags: ["Qwen 2.5-VL", "RAG", "Qdrant", "LM Studio"],
  },
];

export type Stint = { period: string; org: string; role: string; note: string };

export const stints: Stint[] = [
  {
    period: "Aug 2026 – now",
    org: "NTU URECA",
    role: "Undergraduate researcher",
    note: "Building a ==Socratic physics tutor== that reads a photo of the problem and guides students with questions, grounded in course material through RAG on a self-hosted model.",
  },
  {
    period: "May – Aug 2026",
    org: "Singapore Prison Service",
    role: "RPA Intern, Prison Visit Management",
    note: "Mapped the manual visit-management process and automated it with ==UiPath and Power Automate==, saving ==~2 hours of manual work a day==. Worked with stakeholders to find what to automate and redesign the workflow.",
  },
  {
    period: "Feb – Apr 2026",
    org: "OCBC Bank",
    role: "Intranet Revamp Intern, Group Legal & Compliance",
    note: "Rebuilt the ==SharePoint intranet==, consolidating five departments into one site. Ran testing and phased rollout, and wrote the docs and training so it outlives the intern.",
  },
];

export const honors = [
  { title: "Dean's List, AY2025/26", year: "2026" },
  { title: "NTU Honours College", year: "2025" },
  { title: "Nanyang Global Merit Scholar", year: "2025" },
  { title: "JEE Advanced, All India Rank 2170", year: "2022" },
];

// the small "otherwise" line at the bottom of the home page
export const interests = [
  { label: "bouldering", note: "badly, for fun", href: "/climbing" },
  { label: "f1 trips", note: "Marina Bay, Albert Park, Sepang", href: "/f1" },
  { label: "travel photos", note: "a trek, a few cities, a lot of food", href: "/photos" },
];
