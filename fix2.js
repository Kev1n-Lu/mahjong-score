const fs = require("fs");
const p = "C:/Users/SIT/Documents/ChatGPT/麻將積分統計表/mahjong-score/index.html";
let c = fs.readFileSync(p, "utf8");

// Fix saveGame: apply pickMode to scores
const oldSave = `      var v = parseFloat(document.getElementById('pscore' + i).value);\n      if (isNaN(v)) v = 0;\n      scores[players[i]] = v;`;
const newSave = `      var v = parseFloat(document.getElementById('pscore' + i).value);\n      if (isNaN(v)) v = 0;\n      v = Math.abs(v) * (pickMode[i] || 1);\n      scores[players[i]] = v;`;

if (!c.includes(oldSave)) { console.log("ERROR: saveGame old not found"); process.exit(1); }
c = c.replace(oldSave, newSave);

// Also update checkSum to warn if someone hasn't picked win/lose
const oldWarn = `  if (sum === 0) {\n    el.innerHTML = '<span style="color:#69f0ae;">✓ 合計為 0，共 ' + count + ' 人，正確！</span>';\n  } else {\n    el.innerHTML = '<span style="color:#ff8a80;">⚠ 合計為 ' + sum + '（' + count + ' 人），合計應為 0</span>';\n  }`;
const newWarn = `var unset = 0;\n  for (var j = 0; j < players.length; j++) {\n    var r2 = document.getElementById('pick' + j);\n    if (r2 && r2.classList.contains('checked') && !pickMode[j]) unset++;\n  }\n  if (unset > 0) {\n    el.innerHTML = '<span style="color:#ff8a80;">⚠ 有 ' + unset + ' 人尚未選擇贏/輸，合計 ' + sum + '</span>';\n  } else if (sum === 0) {\n    el.innerHTML = '<span style="color:#69f0ae;">✓ 合計為 0，共 ' + count + ' 人，正確！</span>';\n  } else {\n    el.innerHTML = '<span style="color:#ff8a80;">⚠ 合計為 ' + sum + '（' + count + ' 人），合計應為 0</span>';\n  }`;

if (!c.includes(oldWarn)) { console.log("ERROR: checkSum warn old not found"); process.exit(1); }
c = c.replace(oldWarn, newWarn);

fs.writeFileSync(p, c, "utf8");
console.log("Done!");
