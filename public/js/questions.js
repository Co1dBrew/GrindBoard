import {
    fetchQuestions,
    fetchQuestion,
    createQuestion,
    updateQuestion,
    deleteQuestion,
} from "./api.js";
import {
    clearElement,
    createElement,
    difficultyClass,
    showMessage,
    renderPagination,
} from "./utils.js";

const app = () => document.getElementById("app");

// Render the question list view
export async function renderQuestionList() {
    const container = app();
    clearElement(container);

    const wrapper = createElement("div", "questions-page");

    // header row with title and add button
    const header = createElement("div", "page-header");
    header.appendChild(createElement("h1", null, "Question Bank"));
    const addBtn = createElement("button", "btn btn-primary", "+ Add Question");
    addBtn.addEventListener("click", () => {
        window.location.hash = "#/questions/new";
    });
    header.appendChild(addBtn);
    wrapper.appendChild(header);

    // filter bar
    const filterBar = buildFilterBar();
    wrapper.appendChild(filterBar);

    // question list container
    const listEl = createElement("div", "question-list");
    listEl.id = "question-list";
    wrapper.appendChild(listEl);
    
    // pagination container
    const paginationEl = createElement("div", "pagination-container");
    paginationEl.id = "question-pagination";
    wrapper.appendChild(paginationEl);
    
    container.appendChild(wrapper);

    await loadQuestions();
}

async function loadQuestions(filters = {}, page = 1) {
    const listEl = document.getElementById("question-list");
    const paginationEl = document.getElementById("question-pagination");
    
    clearElement(listEl);
    clearElement(paginationEl);
    
    listEl.appendChild(createElement("p", "loading", "Loading..."));

    try {
        const response = await fetchQuestions(filters, page, 50);
        const { data: questions, totalPages } = response;
        
        clearElement(listEl);

        if (questions.length === 0) {
            listEl.appendChild(
                createElement(
                    "p",
                    "empty-state",
                    "No questions found. Add one!",
                ),
            );
            return;
        }

        questions.forEach((q) => {
            listEl.appendChild(buildQuestionCard(q));
        });
        
        // Render pagination
        renderPagination(paginationEl, page, totalPages, (newPage) => {
            loadQuestions(filters, newPage);
        });
        
    } catch (err) {
        clearElement(listEl);
        listEl.appendChild(createElement("p", "error", err.message));
    }
}

function buildFilterBar() {
    const bar = createElement("div", "filter-bar");

    const diffSelect = document.createElement("select");
    diffSelect.id = "filter-difficulty";
    const defaultOpt = document.createElement("option");
    defaultOpt.value = "";
    defaultOpt.textContent = "All Difficulties";
    diffSelect.appendChild(defaultOpt);
    ["Easy", "Med", "Hard"].forEach((d) => {
        const opt = document.createElement("option");
        opt.value = d;
        opt.textContent = d;
        diffSelect.appendChild(opt);
    });
    bar.appendChild(diffSelect);

    const topicInput = document.createElement("input");
    topicInput.type = "text";
    topicInput.id = "filter-topic";
    topicInput.placeholder = "Filter by topic...";
    bar.appendChild(topicInput);

    const companyInput = document.createElement("input");
    companyInput.type = "text";
    companyInput.id = "filter-company";
    companyInput.placeholder = "Filter by company...";
    bar.appendChild(companyInput);

    const filterBtn = createElement("button", "btn btn-secondary", "Filter");
    filterBtn.addEventListener("click", () => {
        const filters = {};
        const diff = document.getElementById("filter-difficulty").value;
        const topic = document.getElementById("filter-topic").value.trim();
        const company = document.getElementById("filter-company").value.trim();
        if (diff) filters.difficulty = diff;
        if (topic) filters.topic = topic;
        if (company) filters.company = company;
        loadQuestions(filters, 1); // Reset to page 1 on filter
    });
    bar.appendChild(filterBtn);

    const clearBtn = createElement("button", "btn btn-outline", "Clear");
    clearBtn.addEventListener("click", () => {
        document.getElementById("filter-difficulty").value = "";
        document.getElementById("filter-topic").value = "";
        document.getElementById("filter-company").value = "";
        loadQuestions({}, 1); // Reset to page 1
    });
    bar.appendChild(clearBtn);

    return bar;
}

function buildQuestionCard(q) {
    const card = createElement("div", "question-card");

    const titleRow = createElement("div", "card-title-row");
    const titleLink = document.createElement("a");
    titleLink.href = q.link;
    titleLink.target = "_blank";
    titleLink.rel = "noopener noreferrer";
    titleLink.textContent = q.title;
    titleLink.className = "question-title-link";
    titleRow.appendChild(titleLink);

    const badge = createElement(
        "span",
        `badge ${difficultyClass(q.difficulty)}`,
        q.difficulty,
    );
    titleRow.appendChild(badge);
    card.appendChild(titleRow);

    // tags
    if (q.topic && q.topic.length > 0) {
        const tags = createElement("div", "tags");
        q.topic.forEach((t) => {
            tags.appendChild(createElement("span", "tag tag-topic", t));
        });
        card.appendChild(tags);
    }

    if (q.company && q.company.length > 0) {
        const tags = createElement("div", "tags");
        q.company.forEach((c) => {
            tags.appendChild(createElement("span", "tag tag-company", c));
        });
        card.appendChild(tags);
    }

    // action buttons
    const actions = createElement("div", "card-actions");

    const historyBtn = createElement("button", "btn btn-small", "History");
    historyBtn.addEventListener("click", () => {
        window.location.hash = `#/sessions/question/${q._id}`;
    });
    actions.appendChild(historyBtn);

    const logBtn = createElement(
        "button",
        "btn btn-small btn-primary",
        "Log Attempt",
    );
    logBtn.addEventListener("click", () => {
        window.location.hash = `#/sessions/new/${q._id}`;
    });
    actions.appendChild(logBtn);

    const editBtn = createElement(
        "button",
        "btn btn-small btn-secondary",
        "Edit",
    );
    editBtn.addEventListener("click", () => {
        window.location.hash = `#/questions/edit/${q._id}`;
    });
    actions.appendChild(editBtn);

    const delBtn = createElement(
        "button",
        "btn btn-small btn-danger",
        "Delete",
    );
    delBtn.addEventListener("click", async () => {
        if (!confirm(`Delete "${q.title}"?`)) return;
        try {
            await deleteQuestion(q._id);
            showMessage(app(), "Question deleted", "success");
            renderQuestionList();
        } catch (err) {
            showMessage(app(), err.message, "error");
        }
    });
    actions.appendChild(delBtn);

    card.appendChild(actions);
    return card;
}

// Render add question form
export function renderQuestionForm() {
    const container = app();
    clearElement(container);

    const wrapper = createElement("div", "form-page");
    wrapper.appendChild(createElement("h1", null, "Add New Question"));

    const form = document.createElement("form");
    form.id = "question-form";
    form.innerHTML = `
    <div class="form-group">
      <label for="q-title">Title</label>
      <input type="text" id="q-title" name="title" required placeholder="Two Sum" />
    </div>
    <div class="form-group">
      <label for="q-link">Link</label>
      <input type="url" id="q-link" name="link" required placeholder="https://leetcode.com/problems/two-sum/" />
    </div>
    <div class="form-group">
      <label for="q-company">Companies (comma separated)</label>
      <input type="text" id="q-company" name="company" placeholder="Google, Amazon, Meta" />
    </div>
    <div class="form-group">
      <label for="q-topic">Topics (comma separated)</label>
      <input type="text" id="q-topic" name="topic" placeholder="Array, Hash Table" />
    </div>
    <div class="form-group">
      <label for="q-difficulty">Difficulty</label>
      <select id="q-difficulty" name="difficulty">
        <option value="Easy">Easy</option>
        <option value="Med" selected>Med</option>
        <option value="Hard">Hard</option>
      </select>
    </div>
    <div class="form-actions">
      <button type="submit" class="btn btn-primary">Save Question</button>
      <button type="button" class="btn btn-outline" id="cancel-btn">Cancel</button>
    </div>
  `;

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const data = {
            title: form.querySelector("#q-title").value,
            link: form.querySelector("#q-link").value,
            company: form.querySelector("#q-company").value,
            topic: form.querySelector("#q-topic").value,
            difficulty: form.querySelector("#q-difficulty").value,
        };
        try {
            await createQuestion(data);
            window.location.hash = "#/";
        } catch (err) {
            showMessage(wrapper, err.message, "error");
        }
    });

    form.querySelector("#cancel-btn").addEventListener("click", () => {
        window.location.hash = "#/";
    });

    wrapper.appendChild(form);
    container.appendChild(wrapper);
}

// Render edit form pre-filled with existing data
export async function renderEditForm(id) {
    const container = app();
    clearElement(container);

    const wrapper = createElement("div", "form-page");
    wrapper.appendChild(createElement("h1", null, "Edit Question"));

    try {
        const q = await fetchQuestion(id);

        const form = document.createElement("form");
        form.id = "question-form";
        form.innerHTML = `
      <div class="form-group">
        <label for="q-title">Title</label>
        <input type="text" id="q-title" name="title" required value="${q.title}" />
      </div>
      <div class="form-group">
        <label for="q-link">Link</label>
        <input type="url" id="q-link" name="link" required value="${q.link}" />
      </div>
      <div class="form-group">
        <label for="q-company">Companies (comma separated)</label>
        <input type="text" id="q-company" name="company" value="${(q.company || []).join(", ")}" />
      </div>
      <div class="form-group">
        <label for="q-topic">Topics (comma separated)</label>
        <input type="text" id="q-topic" name="topic" value="${(q.topic || []).join(", ")}" />
      </div>
      <div class="form-group">
        <label for="q-difficulty">Difficulty</label>
        <select id="q-difficulty" name="difficulty">
          <option value="Easy" ${q.difficulty === "Easy" ? "selected" : ""}>Easy</option>
          <option value="Med" ${q.difficulty === "Med" ? "selected" : ""}>Med</option>
          <option value="Hard" ${q.difficulty === "Hard" ? "selected" : ""}>Hard</option>
        </select>
      </div>
      <div class="form-actions">
        <button type="submit" class="btn btn-primary">Update</button>
        <button type="button" class="btn btn-outline" id="cancel-btn">Cancel</button>
      </div>
    `;

        form.addEventListener("submit", async (e) => {
            e.preventDefault();
            const data = {
                title: form.querySelector("#q-title").value,
                link: form.querySelector("#q-link").value,
                company: form.querySelector("#q-company").value,
                topic: form.querySelector("#q-topic").value,
                difficulty: form.querySelector("#q-difficulty").value,
            };
            try {
                await updateQuestion(id, data);
                window.location.hash = "#/";
            } catch (err) {
                showMessage(wrapper, err.message, "error");
            }
        });

        form.querySelector("#cancel-btn").addEventListener("click", () => {
            window.location.hash = "#/";
        });

        wrapper.appendChild(form);
    } catch (err) {
        wrapper.appendChild(createElement("p", "error", err.message));
    }

    container.appendChild(wrapper);
}
