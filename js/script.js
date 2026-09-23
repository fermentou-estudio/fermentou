// ============================================
// FERMENTOU — script.js
// Menu hamburger, header sólido no scroll e
// efeito parallax de revelação dos trabalhos
// ============================================

// Substitui uma imagem que não carregou por um rótulo de texto discreto,
// evitando o ícone de "imagem quebrada" enquanto os arquivos reais não
// são enviados pelo usuário.
window.imgFallback = function (img, texto) {
  var span = document.createElement('span');
  span.className = 'logo-placeholder';
  span.textContent = texto;
  img.replaceWith(span);
};

document.addEventListener('DOMContentLoaded', function () {

  // ---- Clientes: centraliza se couber tudo, ou rola lateralmente se não couber ----
  var clientesGrid = document.querySelector('.clientes__grid');
  if (clientesGrid) {
    var ajustarClientesGrid = function () {
      var cabeTudo = clientesGrid.scrollWidth <= clientesGrid.clientWidth + 1;
      clientesGrid.classList.toggle('cabe-tudo', cabeTudo);
    };
    ajustarClientesGrid();
    window.addEventListener('resize', ajustarClientesGrid);
    window.addEventListener('load', ajustarClientesGrid);
    // recalcula depois que imagens quebradas viram texto (muda a largura)
    clientesGrid.querySelectorAll('img').forEach(function (img) {
      img.addEventListener('error', function () { setTimeout(ajustarClientesGrid, 50); });
      img.addEventListener('load', ajustarClientesGrid);
    });
  }

  // ---- Menu hamburguer ----
  var toggle = document.querySelector('.menu-toggle');
  var overlay = document.querySelector('.nav-overlay');
  var backdrop = document.querySelector('.nav-backdrop');

  function fecharMenu() {
    overlay.classList.remove('is-open');
    if (backdrop) backdrop.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  if (toggle && overlay) {
    toggle.addEventListener('click', function () {
      var isOpen = overlay.classList.toggle('is-open');
      if (backdrop) backdrop.classList.toggle('is-open', isOpen);
      toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    overlay.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', fecharMenu);
    });

    // clicar no fundo desfocado (metade direita da tela) também fecha o menu
    if (backdrop) backdrop.addEventListener('click', fecharMenu);
  }

  // ---- Header fica sólido depois de rolar a hero (só na Home) ----
  var header = document.querySelector('.site-header');
  var hero = document.querySelector('.hero-video');
  if (header && hero) {
    var onScrollHero = function () {
      var limite = hero.offsetHeight * 0.8;
      header.classList.toggle('is-scrolled', window.scrollY > limite);
    };
    window.addEventListener('scroll', onScrollHero, { passive: true });
    onScrollHero();
  }

  // ---- Header encolhe (fica "compacto") ao rolar, em todas as páginas ----
  if (header) {
    var onScrollCompacto = function () {
      header.classList.toggle('is-compacto', window.scrollY > 40);
    };
    window.addEventListener('scroll', onScrollCompacto, { passive: true });
    onScrollCompacto();
  }

  // ---- Parallax de revelação dos trabalhos ----
  // Cada .trabalho-item fica "grudado" (sticky) na tela; conforme o próximo
  // item sobe por cima, aplicamos um leve zoom-out + fade no item de baixo,
  // criando a sensação de uma imagem revelando a próxima.
  var itens = document.querySelectorAll('.trabalho-item');

  if (itens.length && 'IntersectionObserver' in window) {
    var atualizarParallax = function () {
      var vh = window.innerHeight;

      itens.forEach(function (item, index) {
        // "entrada": 0 = a imagem ainda está subindo por baixo, 1 = já grudou no topo (ativa)
        var rectAtual = item.getBoundingClientRect();
        var entrada = 1 - Math.min(Math.max(rectAtual.top / vh, 0), 1);

        var proximo = itens[index + 1];
        var cobertura = 0;

        if (proximo) {
          var rectProximo = proximo.getBoundingClientRect();
          cobertura = 1 - Math.min(Math.max(rectProximo.top / vh, 0), 1);

          var frame = item.querySelector('.trabalho-item__frame');
          if (frame) {
            var escala = 1 - cobertura * 0.08;
            frame.style.transform = 'scale(' + escala + ')';
            frame.style.opacity = 1 - cobertura * 0.6;
          }
        }

        // nome do trabalho: camada independente da imagem — sobe de baixo
        // para cima conforme a imagem assume o topo, e continua subindo
        // (some) enquanto o próximo trabalho a cobre
        var nome = item.querySelector('.trabalho-item__nome');
        if (nome) {
          var entradaTexto = Math.pow(entrada, 0.5);   // aparece um pouco mais cedo que a imagem termina de subir
          var saidaTexto = Math.pow(cobertura, 1.8);   // segura mais tempo visível, some rápido só no fim

          var visivel = entradaTexto * (1 - saidaTexto);
          var deslocamentoY = 90 * (1 - entradaTexto) - 70 * cobertura;

          nome.style.opacity = visivel;
          nome.style.transform = 'translateY(calc(-50% + ' + deslocamentoY + 'px))';
        }
      });
    };

    window.addEventListener('scroll', atualizarParallax, { passive: true });
    window.addEventListener('resize', atualizarParallax);
    atualizarParallax();
  }

  // ---- Off-canvas de detalhes do trabalho ----
  var workDrawer = document.querySelector('.work-drawer');
  var workBackdrop = document.querySelector('.work-backdrop');
  var workItems = document.querySelectorAll('.trabalho-item');

  if (workDrawer && workBackdrop && workItems.length) {
    var tituloEl = workDrawer.querySelector('.work-drawer__titulo');
    var fecharBtn = workDrawer.querySelector('.work-drawer__fechar');

    var abrirDrawer = function (item) {
      var titulo = item.getAttribute('data-titulo') || 'Trabalho';
      tituloEl.textContent = titulo;

      [1, 2, 3].forEach(function (slot) {
        var imagem = item.getAttribute('data-imagem-' + slot) || '';
        var texto = item.getAttribute('data-texto-' + slot) || '';
        var imgEl = workDrawer.querySelector('.work-drawer__imagem[data-slot="' + slot + '"]');
        var textoEl = workDrawer.querySelector('.work-drawer__texto[data-slot="' + slot + '"]');
        if (imgEl) {
          imgEl.style.display = '';
          imgEl.src = imagem;
          imgEl.alt = titulo + ' — imagem ' + slot;
        }
        if (textoEl) textoEl.textContent = texto;
      });

      workDrawer.classList.add('is-open');
      workBackdrop.classList.add('is-open');
      workDrawer.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    };

    var fecharDrawer = function () {
      workDrawer.classList.remove('is-open');
      workBackdrop.classList.remove('is-open');
      workDrawer.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    };

    workItems.forEach(function (item) {
      item.setAttribute('tabindex', '0');
      item.setAttribute('role', 'button');
      item.addEventListener('click', function () { abrirDrawer(item); });
      item.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          abrirDrawer(item);
        }
      });
    });

    if (fecharBtn) fecharBtn.addEventListener('click', fecharDrawer);
    workBackdrop.addEventListener('click', fecharDrawer);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') fecharDrawer();
    });
  }

  // ---- Cursor trailer (bolinha vermelha seguindo o cursor) ----
  // Só ativa em dispositivos com mouse de precisão (evita conflito em touch)
  if (window.matchMedia && window.matchMedia('(pointer: fine)').matches) {
    var trailer = document.createElement('div');
    trailer.className = 'cursor-trailer';
    document.body.appendChild(trailer);

    var mouseX = 0, mouseY = 0, posX = 0, posY = 0;

    document.addEventListener('mousemove', function (e) {
      mouseX = e.clientX;
      mouseY = e.clientY;
      trailer.classList.add('is-active');
    });

    document.addEventListener('mouseleave', function () {
      trailer.classList.remove('is-active');
    });

    // efeito de "explosão" (risquinhos se afastando e sumindo em fade)
    // ao passar sobre links, botões e trabalhos clicáveis
    var explodirCursor = function (x, y) {
      trailer.classList.add('is-bursting');

      var burst = document.createElement('div');
      burst.className = 'cursor-burst';
      burst.style.transform = 'translate(' + x + 'px, ' + y + 'px)';

      for (var i = 0; i < 5; i++) {
        var eixo = document.createElement('span');
        eixo.className = 'cursor-burst__eixo';
        eixo.style.transform = 'rotate(' + (i * 72) + 'deg)';

        var linha = document.createElement('span');
        linha.className = 'cursor-burst__linha';

        eixo.appendChild(linha);
        burst.appendChild(eixo);
      }

      document.body.appendChild(burst);
      setTimeout(function () {
        burst.remove();
        trailer.classList.remove('is-bursting');
      }, 500);
    };

    document.querySelectorAll('a, button, .trabalho-item').forEach(function (el) {
      el.addEventListener('mouseenter', function () { explodirCursor(mouseX, mouseY); });
    });

    var animarCursor = function () {
      posX += (mouseX - posX) * 0.2;
      posY += (mouseY - posY) * 0.2;
      trailer.style.transform = 'translate(' + posX + 'px, ' + posY + 'px) translate(-50%, -50%)';
      requestAnimationFrame(animarCursor);
    };
    animarCursor();
  }

  // ---- Efeito de marca-texto nos títulos de Serviços ----
  var marcadores = document.querySelectorAll('.marca-texto');
  if (marcadores.length && 'IntersectionObserver' in window) {
    var observerMarcaTexto = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (entrada) {
        if (entrada.isIntersecting) {
          entrada.target.classList.add('is-marcado');
          observerMarcaTexto.unobserve(entrada.target);
        }
      });
    }, { threshold: 0.6 });

    marcadores.forEach(function (el) { observerMarcaTexto.observe(el); });
  }

  // ---- Botão flutuante do WhatsApp (aparece em todas as páginas) ----
  // Troque o número no href abaixo pelo WhatsApp real (mesmo formato usado
  // no resto do site: https://wa.me/55DDDNUMERO).
  var whatsFlutuante = document.createElement('a');
  whatsFlutuante.href = 'https://wa.me/55SEUNUMEROAQUI';
  whatsFlutuante.target = '_blank';
  whatsFlutuante.rel = 'noopener';
  whatsFlutuante.className = 'whatsapp-flutuante';
  whatsFlutuante.setAttribute('aria-label', 'Conversar no WhatsApp');
  whatsFlutuante.innerHTML =
    '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12.04 2c-5.5 0-9.96 4.46-9.96 9.96 0 1.76.46 3.45 1.33 4.95L2 22l5.24-1.37a9.9 9.9 0 0 0 4.8 1.23h.01c5.5 0 9.96-4.46 9.96-9.96S17.54 2 12.04 2zm0 18.2h-.01c-1.5 0-2.98-.4-4.27-1.16l-.31-.18-3.18.83.85-3.1-.2-.32a8.2 8.2 0 0 1-1.26-4.31c0-4.53 3.69-8.22 8.23-8.22a8.2 8.2 0 0 1 8.22 8.23c0 4.54-3.69 8.23-8.23 8.23zm4.51-6.16c-.25-.12-1.46-.72-1.69-.8-.23-.08-.39-.12-.56.13-.16.24-.64.8-.78.96-.14.16-.29.18-.53.06-.25-.12-1.04-.38-1.99-1.22-.73-.66-1.23-1.46-1.37-1.71-.14-.24-.02-.38.11-.5.11-.11.25-.28.37-.42.13-.14.17-.24.25-.4.08-.16.04-.3-.02-.42-.06-.12-.56-1.35-.77-1.85-.2-.48-.41-.42-.56-.43h-.48c-.16 0-.42.06-.64.3-.22.24-.85.83-.85 2.02s.87 2.35.99 2.51c.12.16 1.72 2.62 4.16 3.68.58.25 1.03.4 1.39.51.58.19 1.11.16 1.53.1.47-.07 1.46-.6 1.66-1.18.21-.58.21-1.07.14-1.18-.06-.1-.22-.16-.47-.28z"/></svg>';
  document.body.appendChild(whatsFlutuante);
});
