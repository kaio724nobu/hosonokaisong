(function () {
  const container = document.getElementById('tweets');
  const list = Array.isArray(window.TWEETS) ? window.TWEETS : [];
  const hasTimeline = !!document.querySelector('.twitter-timeline');
  const singleTweet = document.getElementById('tweet-embed');

  if (singleTweet) {
    let url = singleTweet.getAttribute('data-tweet-url') || '';
    if (!url) return;
    url = url.replace(/^https?:\/\/x\.com\//, 'https://twitter.com/');
    singleTweet.innerHTML = '<blockquote class="twitter-tweet"><a href="' + url + '"></a></blockquote>';
  } else if (container) {
    if (list.length === 0 && !hasTimeline) {
      const empty = document.createElement('p');
      empty.className = 'muted';
      empty.textContent = 'ツイートのURLを追加するとここに表示されます。';
      container.appendChild(empty);
    } else {
      list.forEach((url) => {
        if (typeof url !== 'string' || !url.trim()) return;
        const wrap = document.createElement('div');
        wrap.className = 'tweet-card';
        const block = document.createElement('blockquote');
        block.className = 'twitter-tweet';
        const a = document.createElement('a');
        a.href = url.trim();
        block.appendChild(a);
        wrap.appendChild(block);
        container.appendChild(wrap);
      });
    }
  }

  if (singleTweet || list.length > 0 || hasTimeline) {
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://platform.twitter.com/widgets.js';
    script.charset = 'utf-8';
    document.body.appendChild(script);
    // Fallback if widgets.js fails (e.g., offline or blocked)
    const fallback = document.getElementById('next-live-fallback');
    const timer = setTimeout(() => {
      if (fallback) fallback.hidden = false;
    }, 4000);
    script.onload = () => { clearTimeout(timer); if (fallback) fallback.hidden = true; };
  }
})();

// page polish: toggle scrolled shadow on nav
(function () {
  const onScroll = () => {
    if (window.scrollY > 4) document.documentElement.classList.add('scrolled');
    else document.documentElement.classList.remove('scrolled');
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

// mobile menu: open/close
(function () {
  const btn = document.querySelector('.menu-toggle');
  const menu = document.getElementById('nav-menu');
  const backdrop = document.getElementById('nav-backdrop');
  if (!btn || !menu) return;
  const root = document.documentElement;
  const setOpen = (open) => {
    root.classList.toggle('menu-open', open);
    btn.setAttribute('aria-expanded', String(open));
  };
  btn.addEventListener('click', () => setOpen(!root.classList.contains('menu-open')));
  if (backdrop) backdrop.addEventListener('click', () => setOpen(false));
  menu.addEventListener('click', (e) => {
    const a = e.target.closest('a');
    if (a) setOpen(false);
  });
  window.addEventListener('keydown', (e) => { if (e.key === 'Escape') setOpen(false); });
  window.addEventListener('resize', () => { if (window.innerWidth > 640) setOpen(false); });
})();

// scroll spy to highlight active nav link
(function () {
  const links = Array.from(document.querySelectorAll('.nav a[href^="#"]'));
  const map = new Map();
  links.forEach(a => {
    const id = a.getAttribute('href').slice(1);
    const sec = document.getElementById(id);
    if (sec) map.set(sec, a);
  });
  if (map.size === 0) return;
  const clear = () => links.forEach(a => a.classList.remove('active'));
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const a = map.get(entry.target);
        if (a) { clear(); a.classList.add('active'); }
      }
    });
  }, { threshold: 0.5 });
  map.forEach((_, sec) => io.observe(sec));
})();

// hero sky: rotate background with local images (disabled if scroller/slider present)
(function () {
  const hero = document.querySelector('.hero');
  if (!hero) return;
  if (hero.querySelector('.hero-scroll') || hero.querySelector('.hero-slider')) return; // another visual present
  let bg = hero.querySelector('.hero-bg');
  if (!bg) return;
  let next = hero.querySelector('.hero-bg-next');
  if (!next) {
    next = document.createElement('div');
    next.className = 'hero-bg-next';
    hero.insertBefore(next, hero.firstChild);
  }
  const images = Array.isArray(window.PHOTOS) && window.PHOTOS.length
    ? window.PHOTOS.slice()
    : [ 'IMG_6762.JPG', 'IMG_8690.JPG', 'IMG_3290.JPG', 'IMG_8763.JPG' ];
  // preload
  const existing = [];
  let loaded = 0;
  images.forEach(src => {
    const img = new Image();
    img.onload = () => { existing.push(src); loaded++; };
    img.onerror = () => { loaded++; };
    img.src = src;
  });
  let idx = 0;
  const apply = (el, src) => {
    el.style.backgroundImage = `linear-gradient(180deg, rgba(255,255,255,.65), rgba(255,255,255,.8)), url('${src}')`;
    el.style.backgroundPosition = 'center';
    el.style.backgroundSize = 'cover';
    el.style.backgroundRepeat = 'no-repeat';
  };
  // initial
  apply(bg, images[0]);
  const start = () => {
    if (existing.length <= 1) return; // nothing to rotate
    setInterval(() => {
      idx = (idx + 1) % existing.length;
      apply(next, existing[idx]);
      // fade in next
      next.style.opacity = '1';
      bg.style.opacity = '0';
      setTimeout(() => {
        // swap roles
        const tmp = bg; bg = next; next = tmp;
        next.style.opacity = '0';
      }, 1200);
    }, 10000);
  };
  // wait a moment for preload attempts
  setTimeout(start, 1200);
})();

// hero slider: one image at a time, auto-slide
(function () {
  const track = document.getElementById('hero-slider-track');
  if (!track) return;
  // normalize photos: allow string or {src, pos}
  const normalize = (item) => {
    if (typeof item === 'string') return { src: item, pos: '50% 30%' };
    if (item && typeof item === 'object') return { src: item.src, pos: item.pos || '50% 30%' };
    return null;
  };
  // get sources, exclude anything that contains '6762'
  const base = (Array.isArray(window.PHOTOS) && window.PHOTOS.length
    ? window.PHOTOS.slice()
    : [ 'IMG_8690.JPG', 'IMG_3290.JPG', 'IMG_8763.JPG' ]);
  const list = base
    .map(normalize)
    .filter(p => p && !/6762/i.test(p.src));
  if (!list.length) return;

  // build slides
  const makeSlide = (photo) => {
    const slide = document.createElement('div');
    slide.className = 'hero-slide';
    const img = document.createElement('img');
    img.src = photo.src;
    img.alt = '';
    img.style.objectPosition = photo.pos;
    slide.appendChild(img);
    return slide;
  };
  list.forEach(p => track.appendChild(makeSlide(p)));
  // clone first for seamless loop
  track.appendChild(makeSlide(list[0]));

  // also set hero-bg to the first image to avoid flicker before images paint
  const hero = document.querySelector('.hero');
  const bg = hero && hero.querySelector('.hero-bg');
  if (bg) {
    bg.style.backgroundImage = `linear-gradient(180deg, rgba(255,255,255,.65), rgba(255,255,255,.8)), url('${list[0].src}')`;
    bg.style.backgroundPosition = list[0].pos;
    bg.style.backgroundSize = 'cover';
    bg.style.backgroundRepeat = 'no-repeat';
  }

  let index = 0;
  const slideCount = list.length;
  const duration = 4000; // 4s per slide (shorter interval)
  const advance = () => {
    index += 1;
    track.style.transition = 'transform .9s cubic-bezier(.22,.61,.36,1)';
    track.style.transform = `translateX(${-index * 100}%)`;
    if (index === slideCount) {
      // after transition, jump back to 0 without animation
      setTimeout(() => {
        track.style.transition = 'none';
        track.style.transform = 'translateX(0)';
        index = 0;
      }, 950);
    }
  };
  // ensure track width is based on slides; CSS flex takes care of it
  setInterval(advance, duration);

  // delayed brand reveal
  const reveal = document.querySelector('.hero-reveal');
  if (reveal) {
    setTimeout(() => {
      reveal.classList.add('show');
    }, 700); // 少し早めに（約0.7秒後）表示
  }
})();

// hero photo scroller: build from PHOTOS
(function () {
  const track = document.getElementById('hero-scroll-track');
  if (!track) return;
  const normalize = (item) => {
    if (typeof item === 'string') return { src: item, pos: '50% 30%' };
    if (item && typeof item === 'object') return { src: item.src, pos: item.pos || '50% 30%' };
    return null;
  };
  const sources = (Array.isArray(window.PHOTOS) && window.PHOTOS.length
    ? window.PHOTOS.slice()
    : [ 'IMG_8690.JPG', 'IMG_3290.JPG', 'IMG_8763.JPG' ])
    .map(normalize)
    .filter(p => p && !/6762/i.test(p.src));
  // construct one loop
  const makeSet = () => sources.map((p) => {
    const img = document.createElement('img');
    img.src = p.src; img.alt = '';
    img.loading = 'lazy';
    img.style.objectPosition = p.pos;
    return img;
  });
  // append two sets for seamless 50% translate loop
  [...makeSet(), ...makeSet()].forEach(n => track.appendChild(n));
  // set duration relative to count (larger set → longer loop)
  const base = 8; // seconds per image
  const duration = Math.max(24, sources.length * base);
  track.style.animationDuration = duration + 's';
})();

// gallery: render grid from PHOTOS and enable lightbox
(function () {
  const grid = document.getElementById('gallery-grid');
  if (!grid) return;
  const normalize = (item) => {
    if (typeof item === 'string') return { src: item, pos: '50% 30%' };
    if (item && typeof item === 'object') return { src: item.src, pos: item.pos || '50% 30%' };
    return null;
  };
  const sources = (Array.isArray(window.PHOTOS) ? window.PHOTOS : [])
    .map(normalize)
    .filter(Boolean);
  if (!sources.length) {
    grid.innerHTML = '<p class="muted">写真を assets/gallery に追加し、assets/js/photos.js の配列に書き足してください。</p>';
    return;
  }
  sources.forEach((p, i) => {
    const item = document.createElement('a');
    item.href = p.src;
    item.className = 'gallery-item';
    item.setAttribute('data-index', String(i));
    const img = document.createElement('img');
    img.loading = 'lazy';
    img.alt = 'gallery photo';
    img.src = p.src;
    img.style.objectPosition = p.pos;
    item.appendChild(img);
    grid.appendChild(item);
  });

  // lightbox
  const lb = document.createElement('div');
  lb.className = 'lightbox';
  lb.innerHTML = '<button class="close" aria-label="閉じる">×</button><div class="nav"><button class="prev" aria-label="前へ">‹</button><button class="next" aria-label="次へ">›</button></div>';
  const img = document.createElement('img');
  lb.appendChild(img);
  document.body.appendChild(lb);
  let current = 0;
  const open = (idx) => {
    current = idx;
    img.src = sources[current].src;
    lb.classList.add('open');
  };
  const close = () => lb.classList.remove('open');
  const next = () => open((current + 1) % sources.length);
  const prev = () => open((current - 1 + sources.length) % sources.length);
  grid.addEventListener('click', (e) => {
    const a = e.target.closest('a.gallery-item');
    if (!a) return;
    e.preventDefault();
    open(Number(a.getAttribute('data-index')) || 0);
  });
  lb.querySelector('.close').addEventListener('click', close);
  lb.querySelector('.next').addEventListener('click', next);
  lb.querySelector('.prev').addEventListener('click', prev);
  lb.addEventListener('click', (e) => { if (e.target === lb) close(); });
  document.addEventListener('keydown', (e) => {
    if (!lb.classList.contains('open')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowRight') next();
    if (e.key === 'ArrowLeft') prev();
  });
})();
