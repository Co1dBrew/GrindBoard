const API_BASE = "/api";

async function request(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`;
    const config = {
        headers: { "Content-Type": "application/json" },
        ...options,
    };

    const res = await fetch(url, config);
    if (!res.ok) {
        const err = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error(err.error || "Request failed");
    }
    return res.json();
}

// Questions API
export function fetchQuestions(filters = {}) {
    const params = new URLSearchParams();
    if (filters.company) params.set("company", filters.company);
    if (filters.topic) params.set("topic", filters.topic);
    if (filters.difficulty) params.set("difficulty", filters.difficulty);
    const qs = params.toString();
    return request(`/questions${qs ? "?" + qs : ""}`);
}

export function fetchQuestion(id) {
    return request(`/questions/${id}`);
}

export function createQuestion(data) {
    return request("/questions", {
        method: "POST",
        body: JSON.stringify(data),
    });
}

export function updateQuestion(id, data) {
    return request(`/questions/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
    });
}

export function deleteQuestion(id) {
    return request(`/questions/${id}`, { method: "DELETE" });
}

// Sessions API
export function fetchSessions(questionId) {
    const qs = questionId ? `?questionId=${questionId}` : "";
    return request(`/sessions${qs}`);
}

export function fetchSession(id) {
    return request(`/sessions/${id}`);
}

export function fetchQuestionHistory(questionId) {
    return request(`/sessions/question/${questionId}`);
}

export function fetchStats() {
    return request("/sessions/stats");
}

export function createSession(data) {
    return request("/sessions", {
        method: "POST",
        body: JSON.stringify(data),
    });
}

export function updateSession(id, data) {
    return request(`/sessions/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
    });
}

export function deleteSession(id) {
    return request(`/sessions/${id}`, { method: "DELETE" });
}
