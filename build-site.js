const fs = require("fs");
fs.mkdirSync("dist", { recursive: true });
for (const f of ["index.html", "app.js", "style.css", "data.js"]) {
  fs.copyFileSync(f, `dist/${f}`);
}