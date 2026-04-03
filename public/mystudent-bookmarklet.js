(function () {
  "use strict";

  const CDN_PATTERN = /^https:\/\/cdn\.uitm\.link\/jadual\/baru\/\d+\.json(?:\?.*)?$/i;
  const IMPORT_VERSION = 1;
  const SOURCE = "mystudent";

  let latestPayload = null;
  let latestUrl = "";
  let shell = document.getElementById("uitm-mystudent-bookmarklet-shell");
  let statusNode = null;
  let exportButton = null;

  if (shell) {
    shell.remove();
  }

  hookFetch();
  hookXHR();
  mountUI();
  discoverFromPerformance();

  function hookFetch() {
    const originalFetch = window.fetch;
    if (typeof originalFetch !== "function" || originalFetch.__mystudentHooked) return;

    const patchedFetch = async function (...args) {
      const response = await originalFetch.apply(this, args);
      tryCaptureResponse(response);
      return response;
    };

    patchedFetch.__mystudentHooked = true;
    window.fetch = patchedFetch;
  }

  function hookXHR() {
    if (XMLHttpRequest.prototype.open.__mystudentHooked) return;

    const originalOpen = XMLHttpRequest.prototype.open;
    const originalSend = XMLHttpRequest.prototype.send;

    XMLHttpRequest.prototype.open = function (method, url, ...rest) {
      this.__mystudentUrl = typeof url === "string" ? url : String(url);
      return originalOpen.call(this, method, url, ...rest);
    };

    XMLHttpRequest.prototype.send = function (...args) {
      this.addEventListener("load", () => {
        try {
          const url = this.responseURL || this.__mystudentUrl || "";
          if (!matchesTimetableUrl(url)) return;
          const rawText =
            typeof this.responseText === "string"
              ? this.responseText
              : typeof this.response === "string"
                ? this.response
                : "";
          if (!rawText) return;
          registerPayload(url, JSON.parse(rawText));
        } catch (error) {
          console.warn("[MyStudent Bookmarklet] Failed to read XHR payload.", error);
        }
      });

      return originalSend.apply(this, args);
    };

    XMLHttpRequest.prototype.open.__mystudentHooked = true;
  }

  async function tryCaptureResponse(response) {
    try {
      if (!response || !matchesTimetableUrl(response.url)) return;
      registerPayload(response.url, await response.clone().json());
    } catch (error) {
      console.warn("[MyStudent Bookmarklet] Failed to read fetch payload.", error);
    }
  }

  function matchesTimetableUrl(url) {
    return CDN_PATTERN.test(String(url || ""));
  }

  async function discoverFromPerformance() {
    const entries = performance.getEntriesByType("resource");
    const match = entries.find((entry) => matchesTimetableUrl(entry.name));
    if (!match) {
      setStatus("No timetable JSON detected yet. Refresh this page, then run the bookmark again.", "warn");
      return;
    }

    try {
      const response = await fetch(match.name, {
        credentials: "include",
        cache: "no-store",
      });
      registerPayload(match.name, await response.json());
    } catch (error) {
      console.warn("[MyStudent Bookmarklet] Failed to refetch timetable JSON.", error);
      setStatus("Timetable request found, but refetch failed. Reload this page and try again.", "warn");
    }
  }

  function registerPayload(url, payload) {
    if (!payload || typeof payload !== "object") return;
    latestUrl = url;
    latestPayload = payload;

    const summary = summarizePayload(payload);
    setStatus(
      `Ready to export ${summary.sessionCount} session${summary.sessionCount !== 1 ? "s" : ""} from ${summary.subjectCount} subject${summary.subjectCount !== 1 ? "s" : ""}.`,
      "ready",
    );
  }

  function summarizePayload(payload) {
    const subjects = new Set();
    let sessionCount = 0;

    Object.values(payload).forEach((dayData) => {
      if (!dayData || !Array.isArray(dayData.jadual)) return;
      dayData.jadual.forEach((session) => {
        if (!session || !session.courseid) return;
        subjects.add(cleanText(session.courseid).toUpperCase());
        sessionCount += 1;
      });
    });

    return { subjectCount: subjects.size, sessionCount };
  }

  function mountUI() {
    shell = document.createElement("div");
    shell.id = "uitm-mystudent-bookmarklet-shell";
    shell.style.cssText = [
      "position:fixed",
      "right:18px",
      "bottom:18px",
      "z-index:2147483647",
      "width:min(340px,calc(100vw - 24px))",
      "padding:14px",
      "border-radius:18px",
      "background:linear-gradient(160deg,rgba(8,20,33,0.97),rgba(26,65,93,0.97))",
      "color:#f6fbff",
      "box-shadow:0 18px 48px rgba(0,0,0,0.28)",
      "font-family:ui-sans-serif,system-ui,sans-serif",
    ].join(";");

    const badge = document.createElement("div");
    badge.textContent = "UiTM Timetable Import";
    badge.style.cssText = "display:inline-flex;padding:5px 9px;border-radius:999px;background:rgba(255,255,255,0.1);font-size:10px;font-weight:800;letter-spacing:0.18em;text-transform:uppercase;color:rgba(255,255,255,0.75);";

    const title = document.createElement("div");
    title.textContent = "Export MyStudent JSON";
    title.style.cssText = "margin-top:10px;font-size:16px;font-weight:800;letter-spacing:-0.02em;";

    const text = document.createElement("p");
    text.textContent = "This bookmarklet reads the timetable JSON already loaded by MyStudent and downloads a file for the wallpaper app.";
    text.style.cssText = "margin:8px 0 0;font-size:12px;line-height:1.55;color:rgba(255,255,255,0.72);";

    statusNode = document.createElement("p");
    statusNode.style.cssText = "margin:12px 0 0;padding:10px 12px;border-radius:12px;background:rgba(255,255,255,0.08);font-size:12px;line-height:1.5;color:rgba(255,255,255,0.84);";
    statusNode.textContent = "Checking for timetable data.";

    exportButton = document.createElement("button");
    exportButton.type = "button";
    exportButton.textContent = "Download JSON";
    exportButton.disabled = true;
    exportButton.style.cssText = "margin-top:12px;width:100%;border:0;border-radius:999px;padding:11px 14px;background:#28d8d2;color:#082033;font-size:13px;font-weight:800;opacity:0.65;cursor:not-allowed;";
    exportButton.addEventListener("click", handleExport);

    const closeButton = document.createElement("button");
    closeButton.type = "button";
    closeButton.textContent = "Close";
    closeButton.style.cssText = "margin-top:8px;width:100%;border:1px solid rgba(255,255,255,0.12);border-radius:999px;padding:10px 14px;background:transparent;color:#f6fbff;font-size:12px;font-weight:700;cursor:pointer;";
    closeButton.addEventListener("click", () => shell.remove());

    shell.appendChild(badge);
    shell.appendChild(title);
    shell.appendChild(text);
    shell.appendChild(statusNode);
    shell.appendChild(exportButton);
    shell.appendChild(closeButton);
    document.documentElement.appendChild(shell);
  }

  function setStatus(message, state) {
    if (!statusNode || !exportButton) return;
    statusNode.textContent = message;

    if (state === "ready") {
      statusNode.style.background = "rgba(52,211,153,0.16)";
      statusNode.style.color = "#d9fff2";
      exportButton.disabled = false;
      exportButton.style.opacity = "1";
      exportButton.style.cursor = "pointer";
      return;
    }

    statusNode.style.background =
      state === "warn" ? "rgba(251,191,36,0.16)" : "rgba(255,255,255,0.08)";
    statusNode.style.color =
      state === "warn" ? "#fff4cf" : "rgba(255,255,255,0.84)";
    exportButton.disabled = !latestPayload;
    exportButton.style.opacity = latestPayload ? "1" : "0.65";
    exportButton.style.cursor = latestPayload ? "pointer" : "not-allowed";
  }

  function handleExport() {
    if (!latestPayload) {
      setStatus("No timetable payload captured yet. Reload the timetable page and try again.", "warn");
      return;
    }

    try {
      const fileData = buildImportFile(latestPayload, latestUrl);
      downloadJson(`mystudent-timetable-${getDateStamp()}.json`, JSON.stringify(fileData, null, 2));
      setStatus(`Downloaded ${fileData.sessions.length} normalized session${fileData.sessions.length !== 1 ? "s" : ""}.`, "ready");
    } catch (error) {
      console.error("[MyStudent Bookmarklet] Export failed.", error);
      setStatus("Export failed. Open DevTools console if you need more detail.", "warn");
    }
  }

  function buildImportFile(payload, sourceUrl) {
    const sessions = [];
    const seen = new Set();

    Object.entries(payload)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .forEach(([date, dayData]) => {
        if (!dayData || !Array.isArray(dayData.jadual)) return;

        dayData.jadual.forEach((session) => {
          const normalized = normalizeSession(date, dayData.hari, session);
          if (!normalized) return;

          const dedupeKey = [
            normalized.subjectCode,
            normalized.group,
            normalized.day,
            normalized.start,
            normalized.end,
            normalized.venue,
            normalized.lecturer || "",
          ].join("|");

          if (seen.has(dedupeKey)) return;
          seen.add(dedupeKey);
          sessions.push(normalized);
        });
      });

    return {
      source: SOURCE,
      version: IMPORT_VERSION,
      exportedAt: new Date().toISOString(),
      sourceUrl,
      sessions,
    };
  }

  function normalizeSession(date, dayLabel, session) {
    if (!session || typeof session !== "object") return null;

    const subjectCode = cleanText(session.courseid).toUpperCase();
    const subjectName = cleanText(session.course_desc);
    const group = cleanText(session.groups);
    const day = normalizeDay(dayLabel);
    const { start, end } = parseTimeRange(cleanText(session.masa));

    if (!subjectCode || !subjectName || !group || !day || !start || !end) return null;

    return {
      subjectCode,
      subjectName,
      group,
      day,
      start,
      end,
      venue: cleanText(session.bilik) || "Online",
      lecturer: cleanText(session.lecturer) || "",
      source: SOURCE,
      date,
    };
  }

  function normalizeDay(value) {
    const map = {
      sunday: "Sunday",
      monday: "Monday",
      tuesday: "Tuesday",
      wednesday: "Wednesday",
      thursday: "Thursday",
      friday: "Friday",
      saturday: "Saturday",
      ahad: "Sunday",
      isnin: "Monday",
      selasa: "Tuesday",
      rabu: "Wednesday",
      khamis: "Thursday",
      jumaat: "Friday",
      sabtu: "Saturday",
    };
    return map[cleanText(value).toLowerCase()] || "";
  }

  function parseTimeRange(value) {
    const parts = cleanText(value).replace(/[–—]/g, "-").split("-").map((part) => normalizeTime(part));
    return {
      start: parts[0] || "",
      end: parts[1] || "",
    };
  }

  function normalizeTime(value) {
    const raw = cleanText(value).toUpperCase();
    const match = raw.match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)?$/);
    if (!match) return "";

    let hour = Number(match[1] || "0");
    const minute = Number(match[2] || "0");
    const meridiem = match[3] || "";

    if (meridiem === "AM" && hour === 12) hour = 0;
    if (meridiem === "PM" && hour < 12) hour += 12;
    if (hour > 23 || minute > 59) return "";

    return String(hour).padStart(2, "0") + ":" + String(minute).padStart(2, "0");
  }

  function cleanText(value) {
    return String(value == null ? "" : value).replace(/\s+/g, " ").trim();
  }

  function downloadJson(filename, contents) {
    const blob = new Blob([contents], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function getDateStamp() {
    const now = new Date();
    return [
      now.getFullYear(),
      String(now.getMonth() + 1).padStart(2, "0"),
      String(now.getDate()).padStart(2, "0"),
    ].join("");
  }
})();
