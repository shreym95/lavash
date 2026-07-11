const express = require("express");
const fs = require("fs");
const path = require("path");
const os = require("os");
const yaml = require("js-yaml");

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_PATH = path.join(__dirname, "data", "resume.yaml");
const CONTACT_PATH = path.join(__dirname, "data", "contact.local.yaml");

app.use(express.static(path.join(__dirname, "public")));

app.get("/api/resume", (req, res) => {
  try {
    const raw = fs.readFileSync(DATA_PATH, "utf8");
    const data = yaml.load(raw);

    // Merge private contact info (gitignored) into basics, if present.
    if (fs.existsSync(CONTACT_PATH)) {
      const contact = yaml.load(fs.readFileSync(CONTACT_PATH, "utf8")) || {};
      data.basics = { ...data.basics, ...contact };
    }

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Failed to read resume data", details: err.message });
  }
});

function getLanIp() {
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === "IPv4" && !net.internal) return net.address;
    }
  }
  return "localhost";
}

app.listen(PORT, "0.0.0.0", () => {
  const ip = getLanIp();
  console.log(`Resume app running:`);
  console.log(`  Local:   http://localhost:${PORT}`);
  console.log(`  Network: http://${ip}:${PORT}`);
});
