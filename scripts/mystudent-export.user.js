// ==UserScript==
// @name         UiTM MyStudent Timetable Exporter
// @namespace    https://uitm-timetable.vercel.app/
// @version      0.1.0
// @description  Export your MyStudent timetable as JSON for the UiTM timetable generator.
// @match        https://mystudent.uitm.edu.my/*
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function () {
  "use strict";

  const CDN_PATTERN = /^https:\/\/cdn\.uitm\.link\/jadual\/baru\/\d+\.json(?:\?.*)?$/i;
  const IMPORT_VERSION = 1;
  const SOURCE = "mystudent";

  let latestPayload = null;
  let latestUrl = "";
  let exportButton = null;
  let statusNode = null;

  hookFetch();
  hookXHR();
  window.addEventListener("load", () => {
    mountUI();
    discoverFromPerformance();
  });

  function hookFetch() {
    const originalFetch = window.fetch;
    if (typeof originalFetch !== "function") return;

    window.fetch = async function patchedFetch(...args) {
      const response = await originalFetch.apply(this, args);
      tryCaptureResponse(response);
      return response;
    };
  }

  function hookXHR() {
    const originalOpen = XMLHttpRequest.prototype.open;
    const originalSend = XMLHttpRequest.prototype.send;

    XMLHttpRequest.prototype.open = function patchedOpen(method, url, ...rest) {
      this.__mystudentUrl = typeof url === "string" ? url : String(url);
      return originalOpen.call(this, method, url, ...rest);
    };

    XMLHttpRequest.prototype.send = function patchedSend(...args) {
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
          const parsed = JSON.parse(rawText);
          registerPayload(url, parsed);
        } catch (error) {
          console.warn("[MyStudent Exporter] Failed to read XHR payload.", error);
        }
      });

      return originalSend.apply(this, args);
    };
  }

  async function tryCaptureResponse(response) {
    try {
      if (!response || !matchesTimetableUrl(response.url)) return;
      const clone = response.clone();
      const parsed = await clone.json();
      registerPayload(response.url, parsed);
    } catch (error) {
      console.warn("[MyStudent Exporter] Failed to read fetch payload.", error);
    }
  }

  function matchesTimetableUrl(url) {
    return CDN_PATTERN.test(String(url || ""));
  }

  async function discoverFromPerformance() {
    const entries = performance.getEntriesByType("resource");
    const match = entries.find((entry) => matchesTimetableUrl(entry.name));
    if (!match) {
      setStatus("Waiting for timetable data. Open the timetable page first.", "idle");
      return;
    }

    try {
      const response = await fetch(match.name, {
        credentials: "include",
        cache: "no-store",
      });
      const parsed = await response.json();
      registerPayload(match.name, parsed);
    } catch (error) {
      console.warn("[MyStudent Exporter] Failed to refetch timetable JSON.", error);
      setStatus("Timetable request found, but refetch failed. Reload the page once.", "warn");
    }
  }

  function registerPayload(url, payload) {
    if (!payload || typeof payload !== "object") return;
    latestUrl = url;
    latestPayload = payload;

    const summary = summarizePayload(payload);
    setStatus(
      `Ready to export ${summary.sessionCount} session${summary.sessionCount !== 1 ? "s" : ""} across ${summary.subjectCount} subject${summary.subjectCount !== 1 ? "s" : ""}.`,
      "ready",
    );
  }

  function summarizePayload(payload) {
    const subjects = new Set();
    let sessionCount = 0;

    Object.values(payload).forEach((dayData) => {
      if (!dayData || !Array.isArray(dayData.jadual)) return;
      dayData.jadual.forEach((session) => {
        if (session && session.courseid) {
          subjects.add(String(session.courseid).trim().toUpperCase());
          sessionCount += 1;
        }
      });
    });

    return {
      subjectCount: subjects.size,
      sessionCount,
    };
  }

  function mountUI() {
    if (exportButton) return;

    const shell = document.createElement("div");
    shell.id = "uitm-mystudent-exporter";
    shell.style.cssText = [
      "position:fixed",
      "right:18px",
      "bottom:18px",
      "z-index:999999",
      "width:min(320px,calc(100vw - 24px))",
      "padding:14px",
      "border-radius:18px",
      "background:linear-gradient(160deg,rgba(8,20,33,0.96),rgba(25,61,96,0.96))",
      "color:#f6fbff",
      "box-shadow:0 18px 48px rgba(0,0,0,0.26)",
      "font-family:ui-sans-serif,system-ui,sans-serif",
    ].join(";");

    const badge = document.createElement("div");
    badge.textContent = "UiTM Timetable Export";
    badge.style.cssText = [
      "display:inline-flex",
      "align-items:center",
      "padding:5px 9px",
      "border-radius:999px",
      "font-size:10px",
      "font-weight:700",
      "letter-spacing:0.18em",
      "text-transform:uppercase",
      "background:rgba(255,255,255,0.1)",
      "color:rgba(255,255,255,0.78)",
    ].join(";");

    const title = document.createElement("div");
    title.textContent = "Export timetable JSON";
    title.style.cssText = "margin-top:10px;font-size:16px;font-weight:800;letter-spacing:-0.02em;";

    const description = document.createElement("p");
    description.textContent =
      "Use this after your class timetable appears. The downloaded file imports directly into the wallpaper app.";
    description.style.cssText =
      "margin:8px 0 0;font-size:12px;line-height:1.55;color:rgba(255,255,255,0.72);";

    statusNode = document.createElement("p");
    statusNode.style.cssText =
      "margin:12px 0 0;padding:10px 12px;border-radius:12px;font-size:12px;line-height:1.5;background:rgba(255,255,255,0.08);color:rgba(255,255,255,0.84);";
    statusNode.textContent = "Waiting for timetable data.";

    exportButton = document.createElement("button");
    exportButton.type = "button";
    exportButton.textContent = "Download JSON";
    exportButton.style.cssText = [
      "margin-top:12px",
      "width:100%",
      "border:0",
      "border-radius:999px",
      "padding:11px 14px",
      "background:#28d8d2",
      "color:#082033",
      "font-size:13px",
      "font-weight:800",
      "cursor:pointer",
    ].join(";");
    exportButton.addEventListener("click", handleExport);

    const hint = document.createElement("p");
    hint.textContent = "If this stays idle, refresh the timetable page once.";
    hint.style.cssText =
      "margin:9px 0 0;font-size:11px;line-height:1.45;color:rgba(255,255,255,0.54);";

    shell.appendChild(badge);
    shell.appendChild(title);
    shell.appendChild(description);
    shell.appendChild(statusNode);
    shell.appendChild(exportButton);
    shell.appendChild(hint);
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
    } else if (state === "warn") {
      statusNode.style.background = "rgba(251,191,36,0.16)";
      statusNode.style.color = "#fff4cf";
      exportButton.disabled = !latestPayload;
      exportButton.style.opacity = latestPayload ? "1" : "0.65";
      exportButton.style.cursor = latestPayload ? "pointer" : "not-allowed";
    } else {
      statusNode.style.background = "rgba(255,255,255,0.08)";
      statusNode.style.color = "rgba(255,255,255,0.84)";
      exportButton.disabled = !latestPayload;
      exportButton.style.opacity = latestPayload ? "1" : "0.65";
      exportButton.style.cursor = latestPayload ? "pointer" : "not-allowed";
    }
  }

  function handleExport() {
    if (!latestPayload) {
      setStatus("No timetable payload captured yet. Refresh the timetable page first.", "warn");
      return;
    }

    try {
      const fileData = buildImportFile(latestPayload, latestUrl);
      const json = JSON.stringify(fileData, null, 2);
      downloadJson(`mystudent-timetable-${getDateStamp()}.json`, json);
      setStatus(
        `Downloaded ${fileData.sessions.length} normalized session${fileData.sessions.length !== 1 ? "s" : ""}.`,
        "ready",
      );
    } catch (error) {
      console.error("[MyStudent Exporter] Export failed.", error);
      setStatus("Export failed. Check the console and try again.", "warn");
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
    const timeRange = parseTimeRange(cleanText(session.masa));

    if (!subjectCode || !subjectName || !group || !day || !timeRange.start || !timeRange.end) {
      return null;
    }

    return {
      subjectCode,
      subjectName,
      group,
      day,
      start: timeRange.start,
      end: timeRange.end,
      venue: cleanText(session.bilik) || "Online",
      lecturer: cleanText(session.lecturer) || "",
      source: SOURCE,
      date,
    };
  }

  function normalizeDay(value) {
    const raw = cleanText(value).toLowerCase();
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

    return map[raw] || "";
  }

  function parseTimeRange(value) {
    const cleaned = cleanText(value).replace(/[–—]/g, "-");
    const parts = cleaned.split("-").map((part) => normalizeTime(part));
    return {
      start: parts[0] || "",
      end: parts[1] || "",
    };
  }

  function normalizeTime(value) {
    const raw = cleanText(value).toUpperCase();
    if (!raw) return "";

    const match = raw.match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)?$/);
    if (!match) return "";

    let hour = Number(match[1] || "0");
    const minute = Number(match[2] || "0");
    const meridiem = match[3] || "";

    if (meridiem === "AM" && hour === 12) hour = 0;
    if (meridiem === "PM" && hour < 12) {
      hour += 12;
    }

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
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const d = String(now.getDate()).padStart(2, "0");
    return `${y}${m}${d}`;
  }
})();
