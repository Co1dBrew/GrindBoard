import {
    fetchSessions,
    fetchQuestions,
    fetchQuestionHistory,
    fetchSession,
    fetchStats,
    createSession,
    updateSession,
    deleteSession,
} from "./api.js";
import {
    clearElement,
    createElement,
    formatDate,
    resultClass,
    difficultyClass,
    showMessage,
} from "./utils.js";

const app = () => document.getElementById("app");

// Render session list view
export async function renderSessionList() {
    const container = app();
    clearElement(container);

    const wrapper = createElement("div", "sessions-page");

    const header = createElement("div", "page-header");
    header.appendChild(createElement("h1", null, "Practice Sessions"));
    const addBtn = createElement("button", "btn btn-primary", "+ Log Attempt");
    addBtn.addEventListener("click", () => {
        window.location.hash = "#/sessions/new";
    });
    header.appendChild(addBtn);
    wrapper.appendChild(header);

    const tableWrap = createElement("div", "table-wrapper");
    tableWrap.id = "session-table-wrap";
    wrapper.appendChild(tableWrap);
    container.appendChild(wrapper);

    await loadSessionTable();
}

async function loadSessionTable() {
    const tableWrap = document.getElementById("session-table-wrap");
    clearElement(tableWrap);
    tableWrap.appendChild(createElement("p", "loading", "Loading..."));

    try {
        const sessions = await fetchSessions();
        clearElement(tableWrap);

        if (sessions.length === 0) {
            tableWrap.appendChild(
                createElement("p", "empty-state", "No practice sessions yet."),
            );
            return;
        }

        const table = document.createElement("table");
        table.className = "session-table";
        table.innerHTML = `
      <thead>
        <tr>
          <th>Date</th>
          <th>Question</th>
          <th>Time (min)</th>
          <th>Result</th>
          <th>Notes</th>
          <th>Actions</th>
        </tr>
      </thead>
    `;

        const tbody = document.createElement("tbody");

        sessions.forEach((s) => {
            const tr = document.createElement("tr");
            const qTitle = s.question ? s.question.title : "Unknown";
            const qDiff = s.question ? s.question.difficulty : "";

            tr.innerHTML = `
        <td>${formatDate(s.date)}</td>
        <td>
          <span class="question-name">${qTitle}</span>
          ${qDiff ? `<span class="badge badge-sm ${difficultyClass(qDiff)}">${qDiff}</span>` : ""}
        </td>
        <td>${s.timeSpent}</td>
        <td><span class="badge ${resultClass(s.result)}">${s.result}</span></td>
        <td class="notes-cell">${s.notes || "—"}</td>
        <td class="action-cell"></td>
      `;

            const actionCell = tr.querySelector(".action-cell");

            const editBtn = createElement(
                "button",
                "btn btn-small btn-secondary",
                "Edit",
            );
            editBtn.addEventListener("click", () => {
                window.location.hash = `#/sessions/edit/${s._id}`;
            });
            actionCell.appendChild(editBtn);

            const delBtn = createElement(
                "button",
                "btn btn-small btn-danger",
                "Delete",
            );
            delBtn.addEventListener("click", async () => {
                if (!confirm("Delete this session?")) return;
                try {
                    await deleteSession(s._id);
                    showMessage(app(), "Session deleted", "success");
                    loadSessionTable();
                } catch (err) {
                    showMessage(app(), err.message, "error");
                }
            });
            actionCell.appendChild(delBtn);

            tbody.appendChild(tr);
        });

        table.appendChild(tbody);
        tableWrap.appendChild(table);
    } catch (err) {
        clearElement(tableWrap);
        tableWrap.appendChild(createElement("p", "error", err.message));
    }
}

// Render "log new attempt" form
export async function renderNewSessionForm(preselectedQuestionId) {
    const container = app();
    clearElement(container);

    const wrapper = createElement("div", "form-page");
    wrapper.appendChild(createElement("h1", null, "Log Practice Attempt"));

    try {
        const questions = await fetchQuestions();

        const form = document.createElement("form");
        form.id = "session-form";

        // build question select options
        let optionsHtml = "<option value=\"\">-- Select a question --</option>";
        questions.forEach((q) => {
            const selected =
                preselectedQuestionId && q._id === preselectedQuestionId
                    ? "selected"
                    : "";
            optionsHtml += `<option value="${q._id}" ${selected}>${q.title} (${q.difficulty})</option>`;
        });

        form.innerHTML = `
      <div class="form-group">
        <label for="s-question">Question</label>
        <select id="s-question" name="questionId" required>
          ${optionsHtml}
        </select>
      </div>
      <div class="form-group">
        <label for="s-time">Time Spent (minutes)</label>
        <input type="number" id="s-time" name="timeSpent" min="1" required placeholder="25" />
      </div>
      <div class="form-group">
        <label for="s-result">Result</label>
        <select id="s-result" name="result" required>
          <option value="Solved">Solved</option>
          <option value="Unsolved">Unsolved</option>
          <option value="Partial">Partial</option>
        </select>
      </div>
      <div class="form-group">
        <label for="s-notes">Notes</label>
        <textarea id="s-notes" name="notes" rows="4" placeholder="What approach did you use? What did you learn?"></textarea>
      </div>
      <div class="form-actions">
        <button type="submit" class="btn btn-primary">Save Session</button>
        <button type="button" class="btn btn-outline" id="cancel-btn">Cancel</button>
      </div>
    `;

        form.addEventListener("submit", async (e) => {
            e.preventDefault();
            const data = {
                questionId: form.querySelector("#s-question").value,
                timeSpent: form.querySelector("#s-time").value,
                result: form.querySelector("#s-result").value,
                notes: form.querySelector("#s-notes").value,
            };
            try {
                await createSession(data);
                window.location.hash = "#/sessions";
            } catch (err) {
                showMessage(wrapper, err.message, "error");
            }
        });

        form.querySelector("#cancel-btn").addEventListener("click", () => {
            window.location.hash = "#/sessions";
        });

        wrapper.appendChild(form);
    } catch (err) {
        wrapper.appendChild(createElement("p", "error", err.message));
    }

    container.appendChild(wrapper);
}

// Edit session form
export async function renderEditSessionForm(id) {
    const container = app();
    clearElement(container);

    const wrapper = createElement("div", "form-page");
    wrapper.appendChild(createElement("h1", null, "Edit Session"));

    try {
        const s = await fetchSession(id);

        const form = document.createElement("form");
        form.id = "session-form";
        form.innerHTML = `
      <div class="form-group">
        <label for="s-time">Time Spent (minutes)</label>
        <input type="number" id="s-time" name="timeSpent" min="1" required value="${s.timeSpent}" />
      </div>
      <div class="form-group">
        <label for="s-result">Result</label>
        <select id="s-result" name="result" required>
          <option value="Solved" ${s.result === "Solved" ? "selected" : ""}>Solved</option>
          <option value="Unsolved" ${s.result === "Unsolved" ? "selected" : ""}>Unsolved</option>
          <option value="Partial" ${s.result === "Partial" ? "selected" : ""}>Partial</option>
        </select>
      </div>
      <div class="form-group">
        <label for="s-notes">Notes</label>
        <textarea id="s-notes" name="notes" rows="4">${s.notes || ""}</textarea>
      </div>
      <div class="form-actions">
        <button type="submit" class="btn btn-primary">Update</button>
        <button type="button" class="btn btn-outline" id="cancel-btn">Cancel</button>
      </div>
    `;

        form.addEventListener("submit", async (e) => {
            e.preventDefault();
            const data = {
                timeSpent: form.querySelector("#s-time").value,
                result: form.querySelector("#s-result").value,
                notes: form.querySelector("#s-notes").value,
            };
            try {
                await updateSession(id, data);
                window.location.hash = "#/sessions";
            } catch (err) {
                showMessage(wrapper, err.message, "error");
            }
        });

        form.querySelector("#cancel-btn").addEventListener("click", () => {
            window.location.hash = "#/sessions";
        });

        wrapper.appendChild(form);
    } catch (err) {
        wrapper.appendChild(createElement("p", "error", err.message));
    }

    container.appendChild(wrapper);
}

// Render question history view
export async function renderQuestionHistory(questionId) {
    const container = app();
    clearElement(container);

    const wrapper = createElement("div", "sessions-page");

    try {
        const { question, sessions, stats } =
            await fetchQuestionHistory(questionId);

        const header = createElement("div", "page-header");
        const title = createElement("h1", null, `History: ${question.title}`);
        header.appendChild(title);

        const backBtn = createElement("button", "btn btn-outline", "Back");
        backBtn.addEventListener("click", () => {
            window.location.hash = "#/";
        });
        header.appendChild(backBtn);
        wrapper.appendChild(header);

        // stats summary
        const statsRow = createElement("div", "stats-summary");
        statsRow.innerHTML = `
      <div class="stat-card">
        <span class="stat-value">${stats.totalAttempts}</span>
        <span class="stat-label">Attempts</span>
      </div>
      <div class="stat-card">
        <span class="stat-value">${stats.solved}</span>
        <span class="stat-label">Solved</span>
      </div>
      <div class="stat-card">
        <span class="stat-value">${stats.unsolved}</span>
        <span class="stat-label">Unsolved</span>
      </div>
      <div class="stat-card">
        <span class="stat-value">${stats.avgTime} min</span>
        <span class="stat-label">Avg Time</span>
      </div>
    `;
        wrapper.appendChild(statsRow);

        // session list
        if (sessions.length === 0) {
            wrapper.appendChild(
                createElement("p", "empty-state", "No attempts logged yet."),
            );
        } else {
            const table = document.createElement("table");
            table.className = "session-table";
            table.innerHTML = `
        <thead>
          <tr>
            <th>Date</th>
            <th>Time (min)</th>
            <th>Result</th>
            <th>Notes</th>
          </tr>
        </thead>
      `;
            const tbody = document.createElement("tbody");
            sessions.forEach((s) => {
                const tr = document.createElement("tr");
                tr.innerHTML = `
          <td>${formatDate(s.date)}</td>
          <td>${s.timeSpent}</td>
          <td><span class="badge ${resultClass(s.result)}">${s.result}</span></td>
          <td class="notes-cell">${s.notes || "—"}</td>
        `;
                tbody.appendChild(tr);
            });
            table.appendChild(tbody);
            wrapper.appendChild(table);
        }
    } catch (err) {
        wrapper.appendChild(createElement("p", "error", err.message));
    }

    container.appendChild(wrapper);
}

// Render stats dashboard
export async function renderStats() {
    const container = app();
    clearElement(container);

    const wrapper = createElement("div", "stats-page");
    wrapper.appendChild(createElement("h1", null, "Practice Stats"));

    try {
        const stats = await fetchStats();

        // overall summary
        const overall = createElement("div", "stats-summary");
        overall.innerHTML = `
      <div class="stat-card">
        <span class="stat-value">${stats.totalSessions}</span>
        <span class="stat-label">Total Sessions</span>
      </div>
      <div class="stat-card stat-solved">
        <span class="stat-value">${stats.solved}</span>
        <span class="stat-label">Solved</span>
      </div>
      <div class="stat-card stat-unsolved">
        <span class="stat-value">${stats.unsolved}</span>
        <span class="stat-label">Unsolved</span>
      </div>
      <div class="stat-card">
        <span class="stat-value">${stats.avgTime} min</span>
        <span class="stat-label">Avg Time</span>
      </div>
    `;
        wrapper.appendChild(overall);

        // per topic breakdown
        if (stats.byTopic && stats.byTopic.length > 0) {
            wrapper.appendChild(createElement("h2", null, "By Topic"));

            const table = document.createElement("table");
            table.className = "session-table";
            table.innerHTML = `
        <thead>
          <tr>
            <th>Topic</th>
            <th>Sessions</th>
            <th>Solved</th>
            <th>Solve Rate</th>
            <th>Avg Time (min)</th>
          </tr>
        </thead>
      `;
            const tbody = document.createElement("tbody");
            stats.byTopic.forEach((t) => {
                const tr = document.createElement("tr");
                tr.innerHTML = `
          <td><strong>${t.topic}</strong></td>
          <td>${t.total}</td>
          <td>${t.solved}</td>
          <td>${t.solveRate}%</td>
          <td>${t.avgTime}</td>
        `;
                tbody.appendChild(tr);
            });
            table.appendChild(tbody);
            wrapper.appendChild(table);
        } else {
            wrapper.appendChild(
                createElement(
                    "p",
                    "empty-state",
                    "No data yet. Start practicing!",
                ),
            );
        }
    } catch (err) {
        wrapper.appendChild(createElement("p", "error", err.message));
    }

    container.appendChild(wrapper);
}