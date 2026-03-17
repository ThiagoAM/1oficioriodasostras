import { analyticsPromise, db } from "./firebase-app.js";
import {
  doc,
  getDoc,
  increment,
  serverTimestamp,
  setDoc,
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";

const SESSION_WINDOW_MS = 30 * 60 * 1000;
const STORAGE_KEY = "siteVisit:lastTrackedAt";
const SITE_TIME_ZONE = "America/Sao_Paulo";
let lastError = null;

const safeNumber = (value) => (Number.isFinite(value) ? value : 0);

const getVisitDateParts = (date = new Date()) => {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: SITE_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  const parts = formatter.formatToParts(date);
  const year = parts.find((part) => part.type === "year")?.value || "0000";
  const month = parts.find((part) => part.type === "month")?.value || "01";
  const day = parts.find((part) => part.type === "day")?.value || "01";

  return {
    year,
    month,
    day,
    dateKey: `${year}-${month}-${day}`,
  };
};

const readLastTrackedAt = () => {
  try {
    return Number.parseInt(window.localStorage.getItem(STORAGE_KEY) || "", 10);
  } catch (error) {
    return Number.NaN;
  }
};

const writeLastTrackedAt = (timestamp) => {
  try {
    window.localStorage.setItem(STORAGE_KEY, String(timestamp));
  } catch (error) {
    // Ignore browsers that block storage access.
  }
};

const shouldTrackVisit = (now = Date.now()) => {
  const lastTrackedAt = readLastTrackedAt();
  if (!Number.isFinite(lastTrackedAt)) {
    return true;
  }
  return now - lastTrackedAt >= SESSION_WINDOW_MS;
};

const incrementVisitCounters = async (now = new Date()) => {
  const visitDate = getVisitDateParts(now);
  const summaryRef = doc(db, "site_visits_summary", "global");
  const yearlyRef = doc(db, "site_visits_yearly", visitDate.year);
  const dailyRef = doc(db, "site_visits_daily", visitDate.dateKey);

  await Promise.all([
    setDoc(
      summaryRef,
      {
        total: increment(1),
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    ),
    setDoc(
      yearlyRef,
      {
        year: Number.parseInt(visitDate.year, 10),
        count: increment(1),
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    ),
    setDoc(
      dailyRef,
      {
        dateKey: visitDate.dateKey,
        year: Number.parseInt(visitDate.year, 10),
        month: Number.parseInt(visitDate.month, 10),
        day: Number.parseInt(visitDate.day, 10),
        count: increment(1),
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    ),
  ]);
};

const recordSiteVisit = async () => {
  const trackedAt = Date.now();
  if (!shouldTrackVisit(trackedAt)) {
    lastError = null;
    return false;
  }

  try {
    void analyticsPromise;
    await incrementVisitCounters(new Date(trackedAt));
    writeLastTrackedAt(trackedAt);
    lastError = null;
    return true;
  } catch (error) {
    lastError = {
      code: error?.code,
      message: error?.message || "Unknown Firestore error while recording site visit.",
    };
    window.SiteVisits.lastError = lastError;
    console.error("Site visit counter failed.", lastError);
    return false;
  }
};

const loadYearlyVisits = async (years) => {
  const uniqueYears = Array.from(
    new Set(
      (Array.isArray(years) ? years : [])
        .map((value) => String(value || "").trim())
        .filter(Boolean),
    ),
  );

  if (uniqueYears.length === 0) {
    return {};
  }

  try {
    const snapshots = await Promise.all(
      uniqueYears.map((year) => getDoc(doc(db, "site_visits_yearly", year))),
    );

    return uniqueYears.reduce((accumulator, year, index) => {
      const snapshot = snapshots[index];
      const count = snapshot.exists() ? snapshot.data()?.count : 0;
      accumulator[year] = safeNumber(count);
      return accumulator;
    }, {});
  } catch (error) {
    return uniqueYears.reduce((accumulator, year) => {
      accumulator[year] = 0;
      return accumulator;
    }, {});
  }
};

window.SiteVisits = {
  get lastError() {
    return lastError;
  },
  loadYearlyVisits,
  recordSiteVisit,
};

window.dispatchEvent(new CustomEvent("sitevisits:ready"));

void recordSiteVisit();
