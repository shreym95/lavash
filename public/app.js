const app = document.getElementById("app");
const toast = document.getElementById("toast");
const navbar = document.getElementById("navbar");

const COPY_ICON = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>`;
const CHECK_ICON = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>`;

function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add("show");
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => toast.classList.remove("show"), 1200);
}

async function copyText(text, btn, restoreHtml) {
  try {
    await navigator.clipboard.writeText(text);
  } catch (err) {
    const ta = document.createElement("textarea");
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    document.body.removeChild(ta);
  }
  showToast("Copied!");
  if (btn) {
    btn.innerHTML = btn.classList.contains("icon-only")
      ? CHECK_ICON
      : `${CHECK_ICON}<span>Copied</span>`;
    btn.classList.add("copied");
    setTimeout(() => {
      btn.innerHTML = restoreHtml;
      btn.classList.remove("copied");
    }, 1200);
  }
}

function copyBtn(text, label = "Copy", iconOnly = false) {
  const btn = document.createElement("button");
  btn.className = "copy-btn" + (iconOnly ? " icon-only" : "");
  const html = iconOnly ? COPY_ICON : `${COPY_ICON}<span>${label}</span>`;
  btn.innerHTML = html;
  btn.type = "button";
  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    copyText(text, btn, html);
  });
  return btn;
}

function fieldRow(text) {
  const row = document.createElement("div");
  row.className = "field-row";
  const span = document.createElement("span");
  span.className = "field-text";
  span.textContent = text;
  row.appendChild(span);
  row.appendChild(copyBtn(text));
  return row;
}

function bulletRow(text) {
  const row = document.createElement("li");
  row.className = "bullet-row";
  const span = document.createElement("span");
  span.className = "field-text";
  span.textContent = text;
  row.appendChild(span);
  row.appendChild(copyBtn(text, "Copy", true));
  return row;
}

function sectionEl(id, title, sectionText) {
  const section = document.createElement("section");
  section.className = "section";
  section.id = id;

  const header = document.createElement("div");
  header.className = "section-header";
  const h2 = document.createElement("h2");
  h2.textContent = title;
  header.appendChild(h2);
  header.appendChild(copyBtn(sectionText, "Copy all"));
  section.appendChild(header);

  const body = document.createElement("div");
  body.className = "section-body";
  section.appendChild(body);

  return { section, body };
}

function initials(name) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function renderNav(sections) {
  navbar.innerHTML = "";
  sections.forEach(({ id, label }) => {
    const a = document.createElement("a");
    a.href = `#${id}`;
    a.textContent = label;
    navbar.appendChild(a);
  });
}

function renderHeader(basics) {
  const header = document.createElement("div");
  header.className = "header";

  const avatar = document.createElement("div");
  avatar.className = "avatar";
  avatar.textContent = initials(basics.name);
  header.appendChild(avatar);

  const main = document.createElement("div");
  main.className = "header-main";

  const h1 = document.createElement("h1");
  h1.textContent = basics.name;
  main.appendChild(h1);

  const title = document.createElement("div");
  title.className = "title";
  title.textContent = basics.title;
  main.appendChild(title);

  const row = document.createElement("div");
  row.className = "contact-row";

  const contactFields = [
    basics.location,
    basics.phone,
    basics.email,
    basics.linkedin,
    basics.github,
  ];

  contactFields.forEach((value) => {
    if (!value) return;
    const item = document.createElement("div");
    item.className = "contact-item";
    const span = document.createElement("span");
    span.textContent = value;
    item.appendChild(span);
    item.appendChild(copyBtn(value, "Copy", true));
    row.appendChild(item);
  });

  main.appendChild(row);
  header.appendChild(main);
  return header;
}

function renderSummary(summary) {
  const text = summary.trim();
  const { section, body } = sectionEl("summary", "Summary", text);
  body.appendChild(fieldRow(text));
  return section;
}

function renderSkills(skills) {
  const allText = skills
    .map((g) => `${g.category}: ${g.items.join(", ")}`)
    .join("\n");
  const { section, body } = sectionEl("skills", "Technical Skills", allText);

  skills.forEach((group) => {
    const groupEl = document.createElement("div");
    groupEl.className = "skill-group";

    const groupHeader = document.createElement("div");
    groupHeader.className = "skill-group-header";
    const h3 = document.createElement("h3");
    h3.textContent = group.category;
    groupHeader.appendChild(h3);
    groupHeader.appendChild(copyBtn(group.items.join(", "), "Copy", true));
    groupEl.appendChild(groupHeader);

    const tags = document.createElement("div");
    tags.className = "skill-tags";
    group.items.forEach((item) => {
      const tag = document.createElement("div");
      tag.className = "skill-tag";
      const span = document.createElement("span");
      span.textContent = item;
      tag.appendChild(span);
      tag.appendChild(copyBtn(item, "Copy", true));
      tags.appendChild(tag);
    });
    groupEl.appendChild(tags);
    body.appendChild(groupEl);
  });

  return section;
}

function jobText(job) {
  const lines = [`${job.role} — ${job.company}${job.location ? ", " + job.location : ""} (${job.dates})`];
  if (job.subroles) {
    job.subroles.forEach((sr) => {
      lines.push(`${sr.title} (${sr.dates})`);
      sr.bullets.forEach((b) => lines.push(`- ${b}`));
    });
  } else if (job.bullets) {
    job.bullets.forEach((b) => lines.push(`- ${b}`));
  }
  return lines.join("\n");
}

function renderExperience(experience) {
  const allText = experience.map(jobText).join("\n\n");
  const { section, body } = sectionEl("experience", "Experience", allText);

  experience.forEach((job) => {
    const jobEl = document.createElement("div");
    jobEl.className = "job";

    const top = document.createElement("div");
    top.className = "job-top";
    const heading = document.createElement("div");
    heading.className = "job-heading";
    const role = document.createElement("div");
    role.className = "job-role";
    role.textContent = `${job.role} · ${job.company}`;
    const meta = document.createElement("div");
    meta.className = "job-meta";
    meta.textContent = `${job.location ? job.location + " · " : ""}${job.dates}`;
    heading.appendChild(role);
    heading.appendChild(meta);
    top.appendChild(heading);
    top.appendChild(copyBtn(jobText(job), "Copy", true));
    jobEl.appendChild(top);

    if (job.subroles) {
      job.subroles.forEach((sr) => {
        const srEl = document.createElement("div");
        srEl.className = "subrole";
        const srTop = document.createElement("div");
        srTop.className = "subrole-top";
        const srTitle = document.createElement("div");
        srTitle.className = "subrole-title";
        srTitle.textContent = sr.title;
        const srDates = document.createElement("div");
        srDates.className = "subrole-dates";
        srDates.textContent = sr.dates;
        srTop.appendChild(srTitle);
        srTop.appendChild(srDates);
        srEl.appendChild(srTop);

        const ul = document.createElement("ul");
        ul.className = "bullets";
        sr.bullets.forEach((b) => ul.appendChild(bulletRow(b)));
        srEl.appendChild(ul);
        jobEl.appendChild(srEl);
      });
    } else if (job.bullets) {
      const ul = document.createElement("ul");
      ul.className = "bullets";
      job.bullets.forEach((b) => ul.appendChild(bulletRow(b)));
      jobEl.appendChild(ul);
    }

    body.appendChild(jobEl);
  });

  return section;
}

function renderCertifications(certs) {
  const allText = certs.join("\n");
  const { section, body } = sectionEl("certifications", "Certifications & Recognition", allText);
  certs.forEach((c) => {
    const item = document.createElement("div");
    item.className = "list-item";
    const span = document.createElement("span");
    span.className = "field-text";
    span.textContent = c;
    item.appendChild(span);
    item.appendChild(copyBtn(c, "Copy", true));
    body.appendChild(item);
  });
  return section;
}

function renderEducation(education) {
  const allText = education
    .map((e) => `${e.degree} — ${e.school} (${e.dates})`)
    .join("\n");
  const { section, body } = sectionEl("education", "Education", allText);
  education.forEach((e) => {
    const text = `${e.degree} — ${e.school} (${e.dates})`;
    const item = document.createElement("div");
    item.className = "list-item edu-entry";
    const span = document.createElement("span");
    span.className = "field-text";
    span.innerHTML = `<div class="job-role">${e.degree}</div><div class="job-meta">${e.school} · ${e.dates}</div>`;
    item.appendChild(span);
    item.appendChild(copyBtn(text, "Copy", true));
    body.appendChild(item);
  });
  return section;
}

async function init() {
  try {
    const res = await fetch("/api/resume");
    const data = await res.json();

    app.innerHTML = "";
    app.appendChild(renderHeader(data.basics));
    app.appendChild(renderSummary(data.summary));
    app.appendChild(renderSkills(data.skills));
    app.appendChild(renderExperience(data.experience));
    app.appendChild(renderCertifications(data.certifications));
    app.appendChild(renderEducation(data.education));

    renderNav([
      { id: "summary", label: "Summary" },
      { id: "skills", label: "Skills" },
      { id: "experience", label: "Experience" },
      { id: "certifications", label: "Certs" },
      { id: "education", label: "Education" },
    ]);
  } catch (err) {
    app.innerHTML = `<div class="loading">Failed to load resume data: ${err.message}</div>`;
  }
}

init();
