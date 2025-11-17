const form = document.getElementById("submission-form");
const grid = document.getElementById("submission-grid");
const crimeModal = document.getElementById("crime-modal");
const crimeModalDialog = crimeModal?.querySelector(".crime-modal__dialog");
const modalTitle = crimeModal?.querySelector("[data-modal-title]");
const modalCategory = crimeModal?.querySelector("[data-modal-category]");
const modalOffender = crimeModal?.querySelector("[data-modal-offender]");
const modalReporter = crimeModal?.querySelector("[data-modal-reporter]");
const modalReportedOn = crimeModal?.querySelector("[data-modal-reported-on]");
const modalDescription = crimeModal?.querySelector("[data-modal-description]");
const modalBetter = crimeModal?.querySelector("[data-modal-better]");
const modalImageWrapper = crimeModal?.querySelector("[data-modal-image-wrapper]");
const modalImage = crimeModal?.querySelector("[data-modal-image]");
const crimeModalCloseControls = crimeModal
  ? crimeModal.querySelectorAll("[data-close-modal]")
  : [];
const formModal = document.getElementById("form-modal");
const formModalDialog = formModal?.querySelector(".form-modal__dialog");
const openFormButtons = document.querySelectorAll("[data-open-form]");
const formModalCloseControls = formModal
  ? formModal.querySelectorAll("[data-close-form]")
  : [];
const formSuccessMessage = document.getElementById("form-success");
let lastFocusedElement = null;
const reportConfirmation =
  "Crime filed. The Design Crime Unit thanks you for your service. Justice will be… discussed.";

if (grid) {
  grid.setAttribute("aria-live", "polite");
}

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?auto=format&fit=crop&w=600&q=80";

const sanitize = (value = "") => value.trim();

const generateAlias = () =>
  `Anonymous #${Math.floor(100 + Math.random() * 900)}`;

const formatReportedOn = (iso, fallbackLabel = "Just now") => {
  if (!iso) return fallbackLabel;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return fallbackLabel;
  return date.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

const createCardElement = ({
  title,
  description,
  imageSrc,
  submitter,
  reportedISO,
  reportedLabel,
  category,
  offender,
  better,
}) => {
  const li = document.createElement("li");
  li.className = "submission-card submission-card--new";
  li.dataset.submitter = submitter;
  li.dataset.reportedLabel = reportedLabel;
  li.dataset.reportedIso = reportedISO;
  li.dataset.title = title;
  li.dataset.description = description;
  li.dataset.category = category;
  li.dataset.offender = offender;
  li.dataset.better = better;
  li.dataset.image = imageSrc || FALLBACK_IMAGE;
  li.tabIndex = 0;
  li.setAttribute("role", "button");
  li.setAttribute("aria-label", `View details for ${title}`);

  const img = document.createElement("img");
  img.src = imageSrc || FALLBACK_IMAGE;
  img.alt = `${title} submission`;

  const media = document.createElement("div");
  media.className = "card-media";
  media.append(img);

  const body = document.createElement("div");
  body.className = "card-body";

  const heading = document.createElement("h3");
  heading.textContent = title;

  const copy = document.createElement("p");
  copy.textContent = description;

  const meta = document.createElement("div");
  meta.className = "card-meta";

  const submitterSpan = document.createElement("span");
  submitterSpan.textContent = "Submitted by ";
  const submitterStrong = document.createElement("strong");
  submitterStrong.textContent = submitter;
  submitterSpan.append(submitterStrong);

  const time = document.createElement("time");
  time.dateTime = reportedISO;
  time.textContent = `Reported: ${reportedLabel}`;

  meta.append(submitterSpan, time);

  body.append(heading, copy, meta);
  li.append(media, body);

  li.addEventListener("animationend", () => {
    li.classList.remove("submission-card--new");
  });

  return li;
};

const prependSubmission = (payload) => {
  if (!grid) return;
  const card = createCardElement(payload);
  grid.prepend(card);
};

const updateScrollLock = () => {
  if (
    crimeModal?.classList.contains("is-open") ||
    formModal?.classList.contains("is-open")
  ) {
    document.body.classList.add("modal-open");
  } else {
    document.body.classList.remove("modal-open");
  }
};

const closeCrimeModal = () => {
  if (!crimeModal) return;
  crimeModal.classList.remove("is-open");
  crimeModal.setAttribute("aria-hidden", "true");
  updateScrollLock();
  if (lastFocusedElement) {
    lastFocusedElement.focus();
  }
};

const closeFormModal = () => {
  if (!formModal) return;
  formModal.classList.remove("is-open");
  formModal.setAttribute("aria-hidden", "true");
  updateScrollLock();
  if (lastFocusedElement) {
    lastFocusedElement.focus();
  }
};

const openCrimeModal = (card) => {
  if (!crimeModal || !card) return;
  lastFocusedElement =
    document.activeElement instanceof HTMLElement ? document.activeElement : null;

  const {
    title,
    description,
    category,
    offender,
    submitter,
    reportedLabel,
    reportedIso,
    better,
    image,
  } = card.dataset;

  const displayTitle =
    title || card.querySelector("h3")?.textContent || "Untitled Offense";
  const displayDescription =
    description ||
    card.querySelector("p")?.textContent ||
    "No additional testimony provided.";
  const displayBetter =
    better || "No rehabilitation plan submitted yet.";

  if (modalTitle) modalTitle.textContent = displayTitle;
  if (modalCategory)
    modalCategory.textContent = category || "Miscellaneous";
  if (modalOffender)
    modalOffender.textContent = offender || "Unknown culprit";
  if (modalReporter)
    modalReporter.textContent = submitter || "Anonymous operative";
  if (modalReportedOn)
    modalReportedOn.textContent = formatReportedOn(
      reportedIso,
      reportedLabel
    );
  if (modalDescription) modalDescription.textContent = displayDescription;
  if (modalBetter) modalBetter.textContent = displayBetter;

  if (modalImageWrapper && modalImage) {
    if (image) {
      modalImageWrapper.hidden = false;
      modalImage.src = image;
      modalImage.alt = `${displayTitle} evidence`;
    } else {
      modalImageWrapper.hidden = true;
      modalImage.src = "";
      modalImage.alt = "";
    }
  }

  crimeModal.classList.add("is-open");
  crimeModal.setAttribute("aria-hidden", "false");
  updateScrollLock();
  crimeModalDialog?.focus();
};

crimeModalCloseControls.forEach((button) => {
  button.addEventListener("click", closeCrimeModal);
});

crimeModal?.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof Element)) return;
  if (
    target === crimeModal ||
    target.classList.contains("crime-modal__backdrop")
  ) {
    closeCrimeModal();
  }
});

grid?.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof Element)) return;
  const card = target.closest(".submission-card");
  if (card) {
    openCrimeModal(card);
  }
});

grid?.addEventListener("keydown", (event) => {
  if (event.key !== "Enter" && event.key !== " ") return;
  const target = event.target;
  if (!(target instanceof Element)) return;
  const card = target.closest(".submission-card");
  if (card) {
    event.preventDefault();
    openCrimeModal(card);
  }
});

const openFormModal = () => {
  if (!formModal) return;
  lastFocusedElement =
    document.activeElement instanceof HTMLElement ? document.activeElement : null;
  formModal.classList.add("is-open");
  formModal.setAttribute("aria-hidden", "false");
  if (formSuccessMessage) {
    formSuccessMessage.textContent = "";
    formSuccessMessage.hidden = true;
  }
  updateScrollLock();
  formModalDialog?.focus();
};

openFormButtons.forEach((button) => {
  button.addEventListener("click", openFormModal);
});

formModalCloseControls.forEach((button) => {
  button.addEventListener("click", closeFormModal);
});

formModal?.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof Element)) return;
  if (
    target === formModal ||
    target.classList.contains("form-modal__backdrop")
  ) {
    closeFormModal();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  if (formModal?.classList.contains("is-open")) {
    event.preventDefault();
    closeFormModal();
    return;
  }
  if (crimeModal?.classList.contains("is-open")) {
    event.preventDefault();
    closeCrimeModal();
  }
});

const handleSubmission = (event) => {
  event.preventDefault();
  if (!form) return;

  const formData = new FormData(form);
  const title = sanitize(formData.get("title"));
  const submitter =
    sanitize(formData.get("submittedBy")) || generateAlias();
  const category =
    sanitize(formData.get("category")) || "Miscellaneous";
  const offender =
    sanitize(formData.get("offender")) || "Unknown culprit";
  const description = sanitize(formData.get("description"));
  const betterPlan =
    sanitize(formData.get("betterPlan")) ||
    "No rehabilitation plan submitted yet.";
  const file = formData.get("image");

  if (!title || !description) {
    form.classList.add("form-error");
    form.querySelector('[name="title"]')?.focus();
    return;
  }

  form.classList.remove("form-error");

  const reportedISO = new Date().toISOString();
  const reportedLabel = "Just now";

  const payload = {
    title,
    description,
    imageSrc: "",
    submitter,
    reportedISO,
    reportedLabel,
    category,
    offender,
    better: betterPlan,
  };

  const finalize = () => {
    prependSubmission(payload);
    form.reset();
    form.querySelector('[name="title"]')?.focus();
    if (formSuccessMessage) {
      formSuccessMessage.textContent = reportConfirmation;
      formSuccessMessage.hidden = false;
    }
  };

  if (file && file.size > 0) {
    const reader = new FileReader();
    reader.onload = () => {
      payload.imageSrc = reader.result;
      finalize();
    };
    reader.onerror = () => {
      payload.imageSrc = FALLBACK_IMAGE;
      finalize();
    };
    reader.readAsDataURL(file);
    return;
  }

  payload.imageSrc = FALLBACK_IMAGE;
  finalize();
};

if (form) {
  form.addEventListener("submit", handleSubmission);
}

