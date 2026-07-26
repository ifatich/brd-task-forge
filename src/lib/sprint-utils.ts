export function sortSprints(sprints: string[]) {
  return sprints.sort((a, b) => {
    const numA = parseInt(a.match(/\d+/)?.[0] || "0", 10);
    const numB = parseInt(b.match(/\d+/)?.[0] || "0", 10);
    return numB - numA;
  });
}

export function filterTasksByLatestSprint(tasks: any[], projectSprintsStr?: string) {
  let latestSprint: string | null = null;

  if (projectSprintsStr) {
    try {
      const pSprints = JSON.parse(projectSprintsStr);
      if (Array.isArray(pSprints) && pSprints.length > 0) {
        const sortedPSprints = sortSprints(pSprints);
        latestSprint = sortedPSprints[0];
      }
    } catch (e) {}
  }

  if (!latestSprint) {
    const sprintSet = new Set<string>();
    tasks.forEach((t) => {
      let s = [];
      if (Array.isArray(t.sprints)) {
        s = t.sprints;
      } else if (typeof t.sprints === "string") {
        try {
          s = JSON.parse(t.sprints);
        } catch (e) {}
      }
      s.forEach((sprint: string) => sprintSet.add(sprint));
    });

    const sortedSprints = sortSprints(Array.from(sprintSet));
    latestSprint = sortedSprints.length > 0 ? sortedSprints[0] : null;
  }

  if (!latestSprint) return tasks;

  return tasks.filter((t) => {
    let s = [];
    if (Array.isArray(t.sprints)) {
      s = t.sprints;
    } else if (typeof t.sprints === "string") {
      try {
        s = JSON.parse(t.sprints);
      } catch (e) {}
    }
    return s.includes(latestSprint);
  });
}
