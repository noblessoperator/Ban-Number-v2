/* =====================================
   SORA LABS — SCRIPT
   ===================================== */

// =====================================
// CONFIGURATION
// =====================================

const SUPPORT_EMAIL = "support@whatsapp.com";

const EMAIL_SUBJECTS = [
  "Demande de réexamen de mon compte WhatsApp",
  "Appel concernant la suspension de mon compte",
  "Demande de vérification de mon compte WhatsApp",
  "Compte WhatsApp désactivé — demande d’examen",
  "Demande de réévaluation de la suspension"
];

/*
 * 5 modèles de demande.
 *
 * {{NUMBER}} est automatiquement remplacé
 * par le numéro entré dans le formulaire.
 */
const unbanMessages = [

`Bonjour l’équipe WhatsApp,

Je vous contacte au sujet de mon compte associé au numéro :

{{NUMBER}}

Mon compte a récemment été suspendu et je souhaiterais demander un réexamen de cette décision.

Si cette suspension résulte d’une erreur, je vous serais reconnaissant de bien vouloir vérifier mon compte et, si possible, rétablir son accès.

Je reste disponible pour fournir toute information nécessaire.

Merci pour votre aide.

Cordialement,`,

`Bonjour,

Je souhaite faire appel concernant la suspension de mon compte WhatsApp lié au numéro :

{{NUMBER}}

Je ne comprends pas la raison de cette suspension et j’aimerais qu’une vérification de mon compte soit effectuée.

Si une règle a été enfreinte involontairement, je suis prêt à prendre les mesures nécessaires afin de respecter les conditions d’utilisation à l’avenir.

Merci d’examiner ma demande.

Cordialement,`,

`Bonjour l’équipe WhatsApp Support,

Numéro concerné : {{NUMBER}}

Je vous écris afin de demander une vérification de la suspension appliquée à mon compte.

Je pense que cette décision pourrait être liée à une erreur ou à une détection incorrecte. Je souhaiterais donc qu’un réexamen de la situation soit effectué.

Merci de vérifier mon compte et de m’indiquer, si possible, les prochaines étapes à suivre.

Bien cordialement,`,

`Bonjour,

Mon compte WhatsApp associé au numéro {{NUMBER}} est actuellement désactivé.

Je souhaiterais comprendre la raison de cette décision et demander un réexamen de mon compte.

Je respecte l’importance des règles de la plateforme et je suis disposé à corriger toute utilisation qui pourrait ne pas être conforme aux conditions applicables.

Merci d’avance pour votre vérification.

Cordialement,`,

`À l’attention du support WhatsApp,

Je souhaite contester la suspension de mon compte associé au numéro :

{{NUMBER}}

Je vous demande simplement de bien vouloir effectuer une nouvelle vérification de mon dossier afin de déterminer si la suspension a été appliquée correctement.

Si une action de ma part est nécessaire, je suis prêt à suivre les indications du support.

Merci pour le temps consacré à ma demande.

Cordialement,`

];


// =====================================
// ÉTAT GLOBAL
// =====================================

const state = {
  selectedIndex: 0,

  lastMailto: null,

  copyTimer: null,
  toastTimer: null,

  audioUnlocked: false,
};


// =====================================
// DOM
// =====================================

const els = {
  app: null,

  form: null,

  numberField: null,
  numberInput: null,
  numberError: null,

  templatesRow: null,
  tplButtons: [],

  previewBody: null,
  previewCount: null,

  copyBtn: null,
  openBtn: null,

  toast: null,

  video: null,
  bg: null,

  audio: null,
  audioEl: null,
  audioToggle: null,
  audioVolume: null,
  audioMute: null
};


// =====================================
// INITIALISATION
// =====================================

function init() {
  cacheDom();

  setupVideo();
  setupAudio();

  setupNumberField();
  setupTemplates();

  setupCopy();
  setupOpenEmail();

  selectTemplate(0, false);

  requestAnimationFrame(() => {
    if (els.app) {
      els.app.classList.add("is-mounted");
    }
  });

  restoreAudioChoice();
}


// =====================================
// CACHE DOM
// =====================================

function cacheDom() {

  els.app =
    document.getElementById("app");

  els.form =
    document.getElementById("form");

  els.numberField =
    document.getElementById("field-number");

  els.numberInput =
    document.getElementById("number");

  els.numberError =
    document.getElementById("number-error");

  els.templatesRow =
    document.getElementById("templates-row");

  els.tplButtons =
    Array.from(document.querySelectorAll(".tpl"));

  els.previewBody =
    document.getElementById("preview-body");

  els.previewCount =
    document.getElementById("preview-count");

  els.copyBtn =
    document.getElementById("copy-btn");

  els.openBtn =
    document.getElementById("open-btn");

  els.toast =
    document.getElementById("toast");

  els.video =
    document.getElementById("bg-video");

  els.bg =
    document.querySelector(".bg");

  els.audio =
    document.getElementById("audio");

  els.audioEl =
    document.getElementById("bg-music");

  els.audioToggle =
    document.getElementById("audio-toggle");

  els.audioVolume =
    document.getElementById("audio-volume");

  els.audioMute =
    document.getElementById("audio-mute");
}


// =====================================
// VIDÉO BACKGROUND
// =====================================

function setupVideo() {

  if (!els.video) return;

  const markReady = () => {

    els.video.classList.add("is-ready");

    if (els.bg) {
      els.bg.classList.remove("is-fallback");
    }
  };

  const fallback = () => {

    if (els.bg) {
      els.bg.classList.add("is-fallback");
    }
  };

  els.video.addEventListener(
    "loadeddata",
    markReady,
    { once: true }
  );

  els.video.addEventListener(
    "canplay",
    markReady,
    { once: true }
  );

  els.video.addEventListener(
    "error",
    fallback
  );

  const source =
    els.video.querySelector("source");

  if (source) {
    source.addEventListener(
      "error",
      fallback
    );
  }

  /*
   * Tentative d'autoplay.
   * Le navigateur peut bloquer l'autoplay.
   */
  const promise =
    els.video.play?.();

  if (
    promise &&
    typeof promise.catch === "function"
  ) {

    promise.catch(() => {

      const resume = () => {

        els.video.play?.().catch(() => {});

        document.removeEventListener(
          "pointerdown",
          resume
        );

        document.removeEventListener(
          "touchstart",
          resume
        );
      };

      document.addEventListener(
        "pointerdown",
        resume,
        { once: true }
      );

      document.addEventListener(
        "touchstart",
        resume,
        {
          once: true,
          passive: true
        }
      );
    });
  }
}


// =====================================
// AUDIO
// =====================================

function setupAudio() {

  if (!els.audioEl || !els.audio) {
    return;
  }

  els.audioEl.loop = true;

  const defaultVolume = 60;

  els.audioEl.volume =
    defaultVolume / 100;


  // -------------------------------
  // VOLUME SAUVEGARDÉ
  // -------------------------------

  const savedVolume =
    readStorage("sora.volume");

  if (savedVolume !== null) {

    const volume =
      clamp(
        parseInt(savedVolume, 10),
        0,
        100
      );

    if (els.audioVolume) {
      els.audioVolume.value =
        String(volume);
    }

    els.audioEl.volume =
      volume / 100;
  }


  // -------------------------------
  // MUTE SAUVEGARDÉ
  // -------------------------------

  const savedMuted =
    readStorage("sora.muted") === "1";

  els.audioEl.muted =