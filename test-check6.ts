const sheetTitles = ["179", "180", "New Sprint 181", "sprint backlog"];
let sprintSheets = sheetTitles
        .filter((t) => /sprint/i.test(t) || /^\d+/.test(t))
        .map((title) => ({ title, num: parseInt(title.match(/\d+/)?.[0] || "0", 10) }))
        .filter((s) => s.num >= 170 && s.num < 500) // Between 170 and 500
        .sort((a, b) => a.num - b.num);

console.log("sprintSheets last element:", sprintSheets[sprintSheets.length - 1].title);
