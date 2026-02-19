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

export function renderPagination(container, currentPage, totalPages, onPageChange) {
    if (totalPages <= 1) return;

    const nav = createElement("nav", "pagination-nav");
    const ul = createElement("ul", "pagination");

    // Previous
    const prevLi = createElement("li", `page-item ${currentPage === 1 ? "disabled" : ""}`);
    const prevBtn = createElement("button", "page-link", "Previous");
    prevBtn.disabled = currentPage === 1;
    prevBtn.addEventListener("click", () => {
        if (currentPage > 1) onPageChange(currentPage - 1);
    });
    prevLi.appendChild(prevBtn);
    ul.appendChild(prevLi);

    // Page Numbers (Show window around current page)
    const windowSize = 2;
    let startPage = Math.max(1, currentPage - windowSize);
    let endPage = Math.min(totalPages, currentPage + windowSize);

    // Adjust window if close to boundaries
    if (currentPage <= windowSize) {
        endPage = Math.min(totalPages, 1 + windowSize * 2);
    }
    if (currentPage >= totalPages - windowSize) {
        startPage = Math.max(1, totalPages - windowSize * 2);
    }

    if (startPage > 1) {
        const li = createElement("li", "page-item");
        const btn = createElement("button", "page-link", "1");
        btn.addEventListener("click", () => onPageChange(1));
        li.appendChild(btn);
        ul.appendChild(li);

        if (startPage > 2) {
            const dots = createElement("li", "page-item disabled");
            dots.appendChild(createElement("span", "page-link", "..."));
            ul.appendChild(dots);
        }
    }

    for (let i = startPage; i <= endPage; i++) {
        const li = createElement("li", `page-item ${i === currentPage ? "active" : ""}`);
        const btn = createElement("button", "page-link", i.toString());
        if (i === currentPage) {
            btn.disabled = true;
        } else {
            btn.addEventListener("click", () => onPageChange(i));
        }
        li.appendChild(btn);
        ul.appendChild(li);
    }

    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            const dots = createElement("li", "page-item disabled");
            dots.appendChild(createElement("span", "page-link", "..."));
            ul.appendChild(dots);
        }

        const li = createElement("li", "page-item");
        const btn = createElement("button", "page-link", totalPages.toString());
        btn.addEventListener("click", () => onPageChange(totalPages));
        li.appendChild(btn);
        ul.appendChild(li);
    }

    // Next
    const nextLi = createElement("li", `page-item ${currentPage === totalPages ? "disabled" : ""}`);
    const nextBtn = createElement("button", "page-link", "Next");
    nextBtn.disabled = currentPage === totalPages;
    nextBtn.addEventListener("click", () => {
        if (currentPage < totalPages) onPageChange(currentPage + 1);
    });
    nextLi.appendChild(nextBtn);
    ul.appendChild(nextLi);

    nav.appendChild(ul);
    container.appendChild(nav);
}
