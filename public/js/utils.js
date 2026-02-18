// Utility helpers shared across modules

export function formatDate(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}

export function difficultyClass(difficulty) {
    const map = { Easy: "badge-easy", Med: "badge-med", Hard: "badge-hard" };
    return map[difficulty] || "badge-med";
}

export function resultClass(result) {
    const map = {
        Solved: "badge-solved",
        Unsolved: "badge-unsolved",
        Partial: "badge-partial",
    };
    return map[result] || "";
}

export function clearElement(el) {
    el.innerHTML = "";
}

export function createElement(tag, className, textContent) {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (textContent) el.textContent = textContent;
    return el;
}

export function showMessage(container, text, type = "info") {
    const msg = createElement("div", `message message-${type}`, text);
    container.prepend(msg);
    setTimeout(() => msg.remove(), 3000);
}
