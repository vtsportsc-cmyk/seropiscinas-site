(function () {
  "use strict";

  var WHATSAPP_NUMBER = "5521959037482";
  var WHATSAPP_MSG_BASE = "Ol%C3%A1!%20Vim%20pelo%20site%20da%20Seropiscinas%20e%20gostaria%20de%20informa%C3%A7%C3%B5es.";

  var WHATSAPP_MSG = {
    geral: "Olá! Vim pelo site da Seropiscinas e gostaria de informações sobre os produtos e serviços de piscina.",
    delivery: "Olá! Vim pelo site da Seropiscinas e gostaria de fazer um pedido no Delivery. Podem me ajudar?",
    servicos: "Olá! Vim pelo site da Seropiscinas e preciso de assistência técnica para minha piscina. Podem me ajudar?",
    filtros: "Olá! Vim pelo site da Seropiscinas e gostaria de saber sobre instalação e troca de areia de filtros.",
    bombas: "Olá! Vim pelo site da Seropiscinas e preciso de conserto na motobomba da minha piscina.",
    produtos: "Olá! Vim pelo site da Seropiscinas e gostaria de saber mais sobre produtos químicos para piscina."
  };

  var prefersReducedMotion =
    window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function waUrl(message) {
    return "https://api.whatsapp.com/send/?phone=" + WHATSAPP_NUMBER + "&text=" + encodeURIComponent(message);
  }

  /* ---- Links dinâmicos do WhatsApp ---- */
  document.querySelectorAll("[data-wa]").forEach(function (link) {
    var key = link.getAttribute("data-wa");
    var msg = WHATSAPP_MSG[key] || WHATSAPP_MSG.geral;
    link.setAttribute("href", waUrl(msg));
    link.addEventListener("click", function (e) {
      e.preventDefault();
      window.open(waUrl(msg), "_blank", "noopener");
    });
  });

  /* ---- Header com efeito de vidro ao rolar ---- */
  var header = document.getElementById("header");
  var scrollTicking = false;

  function applyHeaderState() {
    if (!header) return;
    if (window.scrollY > 12) header.classList.add("scrolled");
    else header.classList.remove("scrolled");
    scrollTicking = false;
  }

  window.addEventListener(
    "scroll",
    function () {
      if (scrollTicking) return;
      scrollTicking = true;
      window.requestAnimationFrame(applyHeaderState);
    },
    { passive: true }
  );
  applyHeaderState();

  /* ---- Menu mobile ---- */
  var navToggle = document.getElementById("navToggle");
  var nav = document.getElementById("nav");

  function closeNav() {
    if (!nav || !navToggle) return;
    nav.classList.remove("open");
    navToggle.classList.remove("open");
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", "Abrir menu");
  }

  if (navToggle && nav) {
    navToggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      navToggle.classList.toggle("open", open);
      navToggle.setAttribute("aria-expanded", open ? "true" : "false");
      navToggle.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
    });

    nav.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", closeNav);
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("open")) {
        closeNav();
        navToggle.focus();
      }
    });

    document.addEventListener("click", function (e) {
      if (!nav.classList.contains("open")) return;
      if (nav.contains(e.target) || navToggle.contains(e.target)) return;
      closeNav();
    });
  }

  /* ---- Revelação suave ao rolar ---- */
  var revealEls = Array.prototype.slice.call(document.querySelectorAll(".reveal"));

  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    revealEls.forEach(function (el) { el.classList.add("visible"); });
  } else {
    var revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var el = entry.target;
          var delay = 0;

          if (el.parentElement) {
            var siblings = Array.prototype.slice
              .call(el.parentElement.children)
              .filter(function (n) { return n.classList && n.classList.contains("reveal"); });
            var idx = siblings.indexOf(el);
            if (idx > 0) delay = Math.min(idx * 80, 480);
          }

          el.style.setProperty("--reveal-delay", delay + "ms");
          el.classList.add("visible");
          revealObserver.unobserve(el);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -50px 0px" }
    );

    revealEls.forEach(function (el) { revealObserver.observe(el); });
  }

  /* ---- Ano corrente no rodapé ---- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ============================================================
     SEROBOT · assistente virtual de atendimento
     ============================================================ */

  var fab = document.getElementById("botFab");
  var chat = document.getElementById("chat");

  if (fab && chat) {
    var fabIcon = document.getElementById("fabIcon");
    var fabLabel = fab.querySelector(".fab-label");
    var chatBody = document.getElementById("chatBody");
    var chatClose = document.getElementById("chatClose");
    var chatInput = document.getElementById("chatInput");
    var chatSend = document.getElementById("chatSend");
    var chatFooter = chat.querySelector(".chat-footer");

    var botState = null;

    function scrollChat() {
      chatBody.scrollTop = chatBody.scrollHeight;
    }

    function openChat() {
      chat.classList.add("open");
      fab.setAttribute("aria-expanded", "true");
      fab.setAttribute("aria-label", "Fechar atendimento");
      if (fabIcon) fabIcon.textContent = "✕";
      if (fabLabel) fabLabel.textContent = "Fechar";
      if (!botState) startBot();
      window.setTimeout(function () {
        if (window.innerWidth > 600) chatInput.focus();
      }, 350);
    }

    function closeChat() {
      chat.classList.remove("open");
      fab.setAttribute("aria-expanded", "false");
      fab.setAttribute("aria-label", "Abrir atendimento");
      if (fabIcon) fabIcon.textContent = "💬";
      if (fabLabel) fabLabel.textContent = "Atendimento";
    }

    fab.addEventListener("click", function () {
      if (chat.classList.contains("open")) closeChat();
      else openChat();
    });
    chatClose.addEventListener("click", closeChat);

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && chat.classList.contains("open")) closeChat();
    });

    function bubble(text, sender) {
      var msg = document.createElement("div");
      msg.className = "msg " + (sender === "user" ? "user" : "bot");
      var avatar = document.createElement("span");
      avatar.className = "msg-avatar";
      avatar.textContent = sender === "user" ? "🙂" : "🏊";
      var b = document.createElement("div");
      b.className = "bubble";
      b.textContent = text;
      msg.appendChild(avatar);
      msg.appendChild(b);
      chatBody.appendChild(msg);
      scrollChat();
    }

    function typing(callback, delay) {
      var msg = document.createElement("div");
      msg.className = "msg bot";
      var avatar = document.createElement("span");
      avatar.className = "msg-avatar";
      avatar.textContent = "🏊";
      var b = document.createElement("div");
      b.className = "bubble typing";
      for (var i = 0; i < 3; i++) b.appendChild(document.createElement("span"));
      msg.appendChild(avatar);
      msg.appendChild(b);
      chatBody.appendChild(msg);
      scrollChat();
      window.setTimeout(function () {
        msg.remove();
        callback();
      }, delay || 900);
    }

    function quickReplies(options) {
      var wrap = document.createElement("div");
      wrap.className = "quick-replies";
      options.forEach(function (opt) {
        var btn = document.createElement("button");
        btn.className = "qr-btn";
        btn.type = "button";
        btn.textContent = opt.label;
        btn.addEventListener("click", function () {
          wrap.remove();
          opt.action();
        });
        wrap.appendChild(btn);
      });
      chatBody.appendChild(wrap);
      scrollChat();
    }

    function setInputMode(enabled) {
      chatFooter.classList.toggle("hidden", !enabled);
      if (enabled && window.innerWidth > 600) chatInput.focus();
    }

    var SERVICES = [
      { key: "produtos", label: "🧪 Produtos Químicos", part: "saber mais sobre produtos químicos para piscina (cloro, clarificante, pH)", msgKey: "produtos" },
      { key: "filtros", label: "🔧 Filtros e Areia", part: "instalação ou troca de areia do filtro da piscina", msgKey: "filtros" },
      { key: "bombas", label: "⚙️ Conserto de Bombas", part: "conserto ou manutenção de motobomba para piscina", msgKey: "bombas" },
      { key: "delivery", label: "🚚 Delivery", part: "fazer um pedido no Delivery da Seropiscinas", msgKey: "delivery" },
      { key: "outro", label: "💬 Outro assunto", part: "tirar dúvidas gerais sobre piscina", msgKey: "geral" }
    ];

    var PERIODS = ["Manhã", "Tarde", "Indiferente"];

    function startBot() {
      botState = { step: "intro" };
      setInputMode(false);
      bubble("Olá! 👋 Eu sou o SeroBot, assistente virtual da Seropiscinas. Estou aqui para ajudar você com tudo sobre piscinas!");
      typing(function () {
        bubble("Como posso te ajudar hoje?");
        var options = SERVICES.map(function (s) {
          return {
            label: s.label,
            action: function () {
              botState.service = s;
              botState.step = "name";
              bubble(s.label, "user");
              typing(function () {
                bubble("Ótima escolha! 😊 Qual o seu nome?");
                setInputMode(true);
              });
            }
          };
        });
        options.push({
          label: "💬 Falar com atendente direto",
          action: function () {
            window.open(waUrl(WHATSAPP_MSG.geral), "_blank", "noopener");
          }
        });
        quickReplies(options);
      }, 1100);
    }

    function askName() {
      bubble(name, "user");
      botState.step = "period";
      typing(function () {
        bubble("Prazer, " + name.split(" ")[0] + "! 🏊 Em qual período você prefere ser atendido(a)?");
        quickReplies(PERIODS.map(function (p) {
          return {
            label: p,
            action: function () {
              botState.period = p;
              botState.step = "done";
              bubble(p, "user");
              typing(function () {
                bubble("Perfeito! 📋 Sua mensagem está pronta. É só enviar no WhatsApp da Seropiscinas:");
                showSummary();
              }, 900);
            }
          };
        }));
      }, 700);
    }

    function buildMessage() {
      var st = botState;
      var name = st.name || "um cliente";
      var periodPart = st.period ? " Prefiro atendimento no período da " + st.period + "." : "";
      return "Olá! Meu nome é " + name + ". Vim pelo site da Seropiscinas e gostaria de " + st.service.part + "." + periodPart + " Podem me ajudar?";
    }

    function showSummary() {
      var msg = buildMessage();
      var card = document.createElement("div");
      card.className = "msg bot";
      var avatar = document.createElement("span");
      avatar.className = "msg-avatar";
      avatar.textContent = "🏊";

      var wrap = document.createElement("div");
      wrap.className = "bubble";
      wrap.style.padding = "12px";
      wrap.style.width = "100%";

      var summary = document.createElement("div");
      summary.className = "summary-card";
      var textarea = document.createElement("textarea");
      textarea.className = "summary-text";
      textarea.readOnly = true;
      textarea.value = msg;

      var actions = document.createElement("div");
      actions.className = "chat-actions";

      var waBtn = document.createElement("a");
      waBtn.className = "btn-wa";
      waBtn.textContent = "📲 Enviar no WhatsApp";
      waBtn.href = waUrl(msg);
      waBtn.target = "_blank";
      waBtn.rel = "noopener";

      var copyBtn = document.createElement("button");
      copyBtn.className = "btn-copy";
      copyBtn.type = "button";
      copyBtn.textContent = "📋 Copiar mensagem";
      copyBtn.addEventListener("click", function () {
        copyText(msg, copyBtn);
      });

      var restart = document.createElement("button");
      restart.className = "chat-restart";
      restart.type = "button";
      restart.textContent = "🔄 Recomeçar";
      restart.addEventListener("click", function () {
        chatBody.innerHTML = "";
        startBot();
      });

      actions.appendChild(waBtn);
      actions.appendChild(copyBtn);
      actions.appendChild(restart);
      summary.appendChild(textarea);
      summary.appendChild(actions);
      wrap.appendChild(summary);

      card.appendChild(avatar);
      card.appendChild(wrap);
      chatBody.appendChild(card);
      setInputMode(false);
      scrollChat();
    }

    function copyText(text, btn) {
      function done() {
        var original = btn.textContent;
        btn.textContent = "✓ Copiado!";
        window.setTimeout(function () { btn.textContent = original; }, 1800);
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done).catch(function () {
          fallbackCopy(text);
          done();
        });
      } else {
        fallbackCopy(text);
        done();
      }
    }

    function fallbackCopy(text) {
      var ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand("copy"); } catch (err) {}
      document.body.removeChild(ta);
    }

    chatSend.addEventListener("click", sendName);
    chatInput.addEventListener("keydown", function (e) {
      if (e.key === "Enter") sendName();
    });

    function sendName() {
      if (!botState || botState.step !== "name") return;
      var value = chatInput.value.trim();
      chatInput.value = "";
      if (!value) return;
      botState.name = value;
      botState.step = "period";
      setInputMode(false);
      typing(function () {
        bubble("Prazer, " + value.split(" ")[0] + "! 🏊 Em qual período você prefere ser atendido(a)?");
        quickReplies(PERIODS.map(function (p) {
          return {
            label: p,
            action: function () {
              botState.period = p;
              botState.step = "done";
              bubble(p, "user");
              typing(function () {
                bubble("Perfeito! 📋 Sua mensagem está pronta. É só enviar no WhatsApp da Seropiscinas:");
                showSummary();
              }, 900);
            }
          };
        }));
      }, 700);
    }
  }
})();
