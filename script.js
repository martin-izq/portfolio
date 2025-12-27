const DEFAULT_LANG = "en";
const SUPPORTED_LANGS = ["en", "es"];
const cache = new Map();

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".lang-switcher button").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const lang = e.target.id.replace("btn-", "");
      loadResume(lang);
    });
  });

  loadResume(DEFAULT_LANG);
});

async function loadResume(lang) {
  if (!SUPPORTED_LANGS.includes(lang)) lang = DEFAULT_LANG;

  let data;
  if (cache.has(lang)) {
    data = cache.get(lang);
  } else {
    try {
      const response = await fetch(`data/resume.${lang}.json`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      data = await response.json();
      cache.set(lang, data);
    } catch (error) {
      console.error("Failed to load resume data:", error);
      return;
    }
  }

  document.documentElement.lang = lang;
  
  renderResume(data);
  toggleLangButtons(lang);
}

function renderResume(data) {
  const textUpdates = {
    "header-subtitle": data.header?.subtitle,
    "title-bio": data.profile?.title,
    "text-bio": data.profile?.text,
    "title-exp": data.experience?.title,
    "title-skills": data.skills?.title,
    "title-edu": data.education?.title,
    "footer-text": data.footer
  };

  Object.entries(textUpdates).forEach(([id, value]) => {
    const el = document.getElementById(id);
    if (el) el.textContent = value || "";
  });

  const cv = document.getElementById("cv-download");
  if (cv && data.cv) {
    cv.textContent = data.cv.label;
    cv.href = data.cv.file;
  }

  renderSection("experience-container", data.experience?.jobs, renderJobs);
  renderSection("skills-container", data.skills?.items, renderSkills);
  
  const eduContent = document.getElementById("edu-content");
  if (eduContent) eduContent.innerHTML = data.education?.content || "";
}

function renderSection(containerId, items, renderFn) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = items ? renderFn(items) : "";
}

function renderJobs(jobs) {
  return jobs.map(job => `
    <article class="job">
      <div class="job-header">
        <h3>${job.company}</h3>
        <span class="date">${job.date}</span>
      </div>
      <p class="role">${job.role}</p>
      <ul>
        ${job.tasks.map(task => `<li>${task}</li>`).join("")}
      </ul>
    </article>
  `).join("");
}

function renderSkills(items) {
  return items.map(skill => `
    <div class="skill-item">
      <h3>${skill.title}</h3>
      <p>${skill.content}</p>
    </div>
  `).join("");
}

function toggleLangButtons(lang) {
  document.querySelectorAll(".lang-switcher button").forEach(btn => {
    btn.classList.toggle("active", btn.id === `btn-${lang}`);
  });
}