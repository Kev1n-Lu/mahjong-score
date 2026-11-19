const fs = require("fs");
const p = "C:/Users/SIT/Documents/ChatGPT/麻將積分統計表/mahjong-score/index.html";
let c = fs.readFileSync(p, "utf8");

// 1. Replace score input line
const oldLine = `    html += '<input type="number" class="score-input hidden" id="pscore' + i + '" placeholder="0" onclick="event.stopPropagation()" oninput="checkSum()" style="text-align:center;font-size:1.1em;font-weight:bold;">';`;
const newLines = [
  `    html += '<div class="score-area" id="sa' + i + '">';`,
  `    html += '<button class="wl-btn wl-win" id="wlwin' + i + '" onclick="setWL(' + i + ',1);event.stopPropagation()">贏</button>';`,
  `    html += '<button class="wl-btn wl-lose" id="wllose' + i + '" onclick="setWL(' + i + ',-1);event.stopPropagation()">輸</button>';`,
  `    html += '<input type="number" class="score-input" id="pscore' + i + '" placeholder="金額" min="0" onclick="event.stopPropagation()" oninput="checkSum()">';`,
  `    html += '</div>';`,
].join("\n");

if (!c.includes(oldLine)) { console.log("ERROR: old line not found"); process.exit(1); }
c = c.replace(oldLine, newLines);

// 2. Update togglePick: replace inp.classList.remove("hidden") with sa.classList.add("active")
c = c.replace(
  `    inp.classList.add('hidden');\n    inp.value = '';`,
  `    sa.classList.remove('active');\n    inp.value = '';\n    pickMode[i] = 0;\n    document.getElementById('wlwin' + i).classList.remove('active');\n    document.getElementById('wllose' + i).classList.remove('active');`
);
c = c.replace(
  `    inp.classList.remove('hidden');\n    inp.focus();`,
  `    sa.classList.add('active');`
);

// 3. Add pickMode variable and setWL function before renderAddForm
const marker = `// ==================== Add Game Form ====================`;
const inject = `var pickMode = [];\n\nfunction setWL(i, mode) {\n  pickMode[i] = (pickMode[i] === mode) ? 0 : mode;\n  document.getElementById('wlwin' + i).classList.toggle('active', pickMode[i] === 1);\n  document.getElementById('wllose' + i).classList.toggle('active', pickMode[i] === -1);\n  checkSum();\n}\n\n`;
c = c.replace(marker, inject + marker);

// 4. Update checkSum to apply pickMode
const oldCheck = `      var v = parseFloat(document.getElementById('pscore' + i).value);\n      if (!isNaN(v)) sum += v;`;
const newCheck = `      var v = parseFloat(document.getElementById('pscore' + i).value);\n      if (!isNaN(v)) { v = Math.abs(v) * (pickMode[i] || 1); sum += v; }`;
if (!c.includes(oldCheck)) { console.log("ERROR: checkSum old not found"); process.exit(1); }
c = c.replace(oldCheck, newCheck);

// 5. Update checkSum warning to show actual values
const oldWarn = `if (sum === 0) {\n    el.innerHTML = '<span style=\"color:#69f0ae;\">✓ 合計為 0，共 ' + count + ' 人，正確！</span>';\n  } else {\n    el.innerHTML = '<span style=\"color:#ff8a80;\">⚠ 合計為 ' + sum + '（' + count + ' 人），合計應為 0</span>';\n  }`;
const newWarn = `var unsettled = 0;\n  for (var i = 0; i < players.length; i++) {\n    var row = document.getElementById('pick' + i);\n    if (row && row.classList.contains('checked') && !pickMode[i]) {\n      var pv = parseFloat(document.getElementById('pscore' + i).value);\n      if (!isNaN(pv) && pv !== 0) { sum += (pv > 0 ? pv : pv); }\n      else if (!pickMode[i]) unsettled++;\n    }\n  }\n  if (unsettled > 0) {\n    el.innerHTML = '<span style=\"color:#ff8a80;\">⚠ 有 ' + unsettled + ' 人尚未選擇贏/輸</span>';\n  } else if (sum === 0) {\n    el.innerHTML = '<span style=\"color:#69f0ae;\">✓ 合計為 0，共 ' + count + ' 人，正確！</span>';\n  } else {\n    el.innerHTML = '<span style=\"color:#ff8a80;\">⚠ 合計為 ' + sum + '（' + count + ' 人），合計應為 0</span>';\n  }`;
// Actually this is getting complicated. Let me simplify checkSum.
// Revert the oldWarn replacement - just keep it simple
c = c.replace(newWarn, oldWarn);

// Actually let me just redo checkSum entirely
console.log("Step 5 skipped - will fix manually");

fs.writeFileSync(p, c, "utf8");
console.log("Done! Replacements applied.");
