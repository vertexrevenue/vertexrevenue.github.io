import * as THREE from "three";

/* Card faces drawn with the site's own fonts. The prospect card is redrawn as
   each check passes; the invite is the back of the same card. */
const W = 1160, H = 760, R = 46;
const SANS = `"Archivo Variable", "Archivo", system-ui, sans-serif`;

function roundRect(g, x, y, w, h, r) {
  g.beginPath();
  g.moveTo(x + r, y);
  g.arcTo(x + w, y, x + w, y + h, r);
  g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r);
  g.arcTo(x, y, x + w, y, r);
  g.closePath();
}

function make() {
  const c = document.createElement("canvas");
  c.width = W; c.height = H;
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return { c, g: c.getContext("2d"), t };
}

const CHECKS = ["Real problem", "Budget", "Authority", "Said yes to a call"];

export function prospectFace() {
  const f = make();
  f.draw = (ticks) => {
    const g = f.g;
    g.clearRect(0, 0, W, H);
    roundRect(g, 4, 4, W - 8, H - 8, R);
    const bg = g.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0, "#1b1e25");
    bg.addColorStop(1, "#111318");
    g.fillStyle = bg; g.fill();
    g.lineWidth = 3; g.strokeStyle = "rgba(196,200,208,.35)"; g.stroke();

    g.fillStyle = "#9aa0ad"; g.font = `500 34px ${SANS}`;
    g.fillText("Reply received", 70, 100);
    g.fillStyle = "#f4f5f7"; g.font = `700 58px ${SANS}`;
    g.fillText("COO, 40-person HVAC distributor", 70, 176);
    g.fillStyle = "#c4c8d0"; g.font = `400 38px ${SANS}`;
    g.fillText("“Our pipeline stalled after our sales lead left.”", 70, 240);

    g.strokeStyle = "rgba(196,200,208,.18)"; g.lineWidth = 2;
    g.beginPath(); g.moveTo(70, 290); g.lineTo(W - 70, 290); g.stroke();

    CHECKS.forEach((label, i) => {
      const y = 360 + i * 92;
      const on = i < ticks;
      g.beginPath(); g.arc(98, y - 12, 24, 0, Math.PI * 2);
      if (on) { g.fillStyle = "#2f4bff"; g.fill(); }
      else { g.strokeStyle = "rgba(196,200,208,.45)"; g.lineWidth = 3; g.stroke(); }
      if (on) {
        g.strokeStyle = "#fff"; g.lineWidth = 5; g.lineCap = "round"; g.lineJoin = "round";
        g.beginPath(); g.moveTo(86, y - 12); g.lineTo(95, y - 2); g.lineTo(112, y - 24); g.stroke();
      }
      g.fillStyle = on ? "#f4f5f7" : "#9aa0ad"; g.font = `${on ? 600 : 500} 44px ${SANS}`;
      g.fillText(label, 146, y);
      if (on) { g.fillStyle = "#8fa2ff"; g.font = `600 34px ${SANS}`; g.textAlign = "right"; g.fillText("Passed", W - 70, y); g.textAlign = "left"; }
    });
    f.t.needsUpdate = true;
  };
  f.draw(0);
  return f;
}

export function inviteFace() {
  const f = make();
  const g = f.g;
  roundRect(g, 4, 4, W - 8, H - 8, R);
  g.fillStyle = "#f7f7f9"; g.fill();
  g.save(); roundRect(g, 4, 4, W - 8, H - 8, R); g.clip();
  g.fillStyle = "#ececf1"; g.fillRect(0, 0, W, 96);
  g.restore();
  g.fillStyle = "#5d616b"; g.font = `500 30px ${SANS}`;
  g.fillText("Your calendar", 64, 62);
  g.textAlign = "right"; g.fillText("Thu", W - 64, 62); g.textAlign = "left";
  g.fillStyle = "#2f4bff"; roundRect(g, 64, 140, 10, 170, 5); g.fill();
  g.fillStyle = "#0c0d10"; g.font = `700 50px ${SANS}`;
  g.fillText("Intro call: COO, 40-person", 104, 190);
  g.fillText("HVAC distributor", 104, 250);
  g.fillStyle = "#5d616b"; g.font = `400 34px ${SANS}`;
  g.fillText("Thursday, 10:30 to 11:00 AM ET", 104, 302);
  g.fillStyle = "#e7eaff"; roundRect(g, 104, 330, 210, 58, 29); g.fill();
  g.fillStyle = "#2f4bff"; g.font = `600 30px ${SANS}`; g.fillText("✓  Accepted", 128, 370);
  const rows = [["Problem", "Pipeline stalled after their sales lead left"], ["Budget", "Set aside for outside help this quarter"], ["Authority", "Signs off on vendors"], ["Agreed to call", "Yes, asked for it by email"]];
  rows.forEach(([k, v], i) => {
    const y = 470 + i * 70;
    g.strokeStyle = "#e1e2e7"; g.lineWidth = 2; g.beginPath(); g.moveTo(64, y - 46); g.lineTo(W - 64, y - 46); g.stroke();
    g.fillStyle = "#6a6e78"; g.font = `400 30px ${SANS}`; g.fillText(k, 64, y);
    g.fillStyle = "#0c0d10"; g.font = `500 30px ${SANS}`; g.fillText(v, 330, y);
  });
  f.t.needsUpdate = true;
  return f;
}

export const CARD_ASPECT = W / H;
