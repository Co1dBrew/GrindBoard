import { renderQuestionList, renderQuestionForm, renderEditForm } from "./questions.js";
import {
    renderSessionList,
    renderNewSessionForm,
    renderEditSessionForm,
    renderQuestionHistory,
    renderStats,
} from "./sessions.js";

// Simple hash-based router
function router() {
    const hash = window.location.hash || "#/";
    const path = hash.slice(1); // remove leading #

    // update active nav link
    document.querySelectorAll(".nav-link").forEach((link) => {
        link.classList.remove("active");
        const href = link.getAttribute("href").slice(1);
        if (path === href || (href !== "/" && path.startsWith(href))) {
            link.classList.add("active");
        } else if (href === "/" && path === "/") {
            link.classList.add("active");
        }
    });

    // route matching
    if (path === "/" || path === "") {
        renderQuestionList();
    } else if (path === "/questions/new") {
        renderQuestionForm();
    } else if (path.startsWith("/questions/edit/")) {
        const qId = path.split("/questions/edit/")[1];
        renderEditForm(qId);
    } else if (path === "/sessions") {
        renderSessionList();
    } else if (path.startsWith("/sessions/new/")) {
        const qId = path.split("/sessions/new/")[1];
        renderNewSessionForm(qId);
    } else if (path === "/sessions/new") {
        renderNewSessionForm();
    } else if (path.startsWith("/sessions/edit/")) {
        const sId = path.split("/sessions/edit/")[1];
        renderEditSessionForm(sId);
    } else if (path.startsWith("/sessions/question/")) {
        const qId = path.split("/sessions/question/")[1];
        renderQuestionHistory(qId);
    } else if (path === "/stats") {
        renderStats();
    } else {
        const app = document.getElementById("app");
        app.innerHTML = `<div class="form-page"><h1>404</h1><p>Page not found.</p></div>`;
    }
}

// Listen for hash changes
window.addEventListener("hashchange", router);
window.addEventListener("DOMContentLoaded", router);
