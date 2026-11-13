// Enrolment A85204925023 - started 2026-11-13
const P = 9;
const M = 25;
const T = 43;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^\d{9}$/;
const LABELS = {
  fullName: "Full name",
  email: "Email",
  phone: "Phone",
  password: "Password",
  confirmPassword: "Confirm password",
  city: "City"
};

// ---------- Page 1: registration ----------
function getError(id) {
  const el = document.getElementById(id);
  const isPwd = id === "password" || id === "confirmPassword";
  const value = isPwd ? el.value : el.value.trim();
  if (value === "") return LABELS[id] + " is required";
  if (id === "email" && !EMAIL_RE.test(value)) return "Email is not valid";
  if (id === "phone" && !PHONE_RE.test(value)) return "Phone must be exactly 9 digits";
  if (id === "password" && value.length < P) return "Password must be at least " + P + " characters";
  if (id === "confirmPassword" && value !== document.getElementById("password").value) {
    return "Passwords do not match";
  }
  return "";
}

function validate() {
  const errors = [];
  for (const id of Object.keys(LABELS)) {
    const msg = getError(id);
    document.getElementById(id).classList.toggle("invalid", msg !== "");
    if (msg !== "") errors.push(msg);
  }
  return errors;
}

function showErrors(errors) {
  const list = document.getElementById("errors");
  list.textContent = "";
  for (const msg of errors) {
    const li = document.createElement("li");
    li.textContent = msg;
    list.appendChild(li);
  }
}

function initRegistration(form) {
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    const errors = validate();
    showErrors(errors);
    if (errors.length > 0) return;
    const name = document.getElementById("fullName").value.trim();
    if (confirm("Register " + name + "?")) {
      location.href = "board.html?name=" + encodeURIComponent(name);
    }
  });

  for (const id of Object.keys(LABELS)) {
    const el = document.getElementById(id);
    el.addEventListener("blur", function () {
      el.classList.toggle("invalid", getError(id) !== "");
    });
  }

  const nameInput = document.getElementById("fullName");
  const counter = document.getElementById("nameCounter");
  nameInput.addEventListener("keyup", function () {
    const left = Math.max(M - nameInput.value.length, 0);
    counter.textContent = left + " characters left out of " + M;
  });

  const city = document.getElementById("city");
  const cityLine = document.getElementById("cityLine");
  city.addEventListener("change", function () {
    cityLine.textContent = city.value === "" ? "" : "You chose " + city.value;
  });
}

// ---------- Page 2: marks board ----------
function grade(marks) {
  if (marks < T) return "Fail";
  if (marks >= 75) return "Distinction";
  return "Pass";
}

function renderBoard(list) {
  const body = document.getElementById("boardBody");
  body.textContent = "";
  for (const s of list) {
    const tr = document.createElement("tr");
    const g = grade(s.marks);
    const cells = [s.name, s.marks, s.city, g];
    for (const text of cells) {
      const td = document.createElement("td");
      td.textContent = text;
      tr.appendChild(td);
    }
    tr.lastChild.className = "grade-" + g;
    body.appendChild(tr);
  }
}

async function initBoard() {
  const name = new URLSearchParams(location.search).get("name");
  document.getElementById("welcome").textContent = "Welcome, " + (name === null ? "guest" : name);
  document.getElementById("loadTime").textContent = "Page loaded at " + new Date().toLocaleTimeString();

  document.getElementById("backBtn").addEventListener("click", function () {
    history.back();
  });

  let students = [];
  try {
    const res = await fetch("students.json");
    if (!res.ok) throw new Error("HTTP " + res.status);
    students = await res.json();
    renderBoard(students);
  } catch (err) {
    document.getElementById("message").textContent = "Could not load the marks: " + err.message;
  }

  document.getElementById("sortSelect").addEventListener("change", function (e) {
    const copy = [...students];
    if (e.target.value === "name") copy.sort((a, b) => a.name.localeCompare(b.name));
    if (e.target.value === "marks") copy.sort((a, b) => b.marks - a.marks);
    renderBoard(copy);
  });
}

// ---------- Start ----------
const regForm = document.getElementById("regForm");
if (regForm !== null) initRegistration(regForm);
if (document.getElementById("board") !== null) initBoard();

console.log("A85204925023");
