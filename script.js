document.documentElement.classList.add('js');

(function(){
  var portrait = document.querySelector('.hero-photo img');
  if (portrait) portrait.src = 'main.jpeg';
})();

(function(){
  function TextScramble(el){
    this.el = el;
    this.chars = '!<>-_\\/[]{}—=+*^?#________';
    this.frameRequest = 0;
    this.update = this.update.bind(this);
  }

  TextScramble.prototype.setText = function(newText){
    var oldText = this.el.textContent;
    var length = Math.max(oldText.length, newText.length);
    var promise = new Promise(function(resolve){ this.resolve = resolve; }.bind(this));
    this.queue = [];

    for (var i = 0; i < length; i++){
      var from = oldText[i] || '';
      var to = newText[i] || '';
      var start = Math.floor(Math.random() * 40);
      var end = start + Math.floor(Math.random() * 40);
      this.queue.push({ from:from, to:to, start:start, end:end });
    }

    cancelAnimationFrame(this.frameRequest);
    this.frame = 0;
    this.update();
    return promise;
  };

  TextScramble.prototype.update = function(){
    var output = '';
    var complete = 0;

    for (var i = 0; i < this.queue.length; i++){
      var item = this.queue[i];
      if (this.frame >= item.end){
        complete++;
        output += item.to;
      }else if (this.frame >= item.start){
        if (!item.char || Math.random() < 0.28) item.char = this.randomChar();
        output += '<span class="scramble-char" aria-hidden="true">' + item.char + '</span>';
      }else{
        output += item.from;
      }
    }

    this.el.innerHTML = output;
    if (complete === this.queue.length){
      this.el.classList.add('scrambled');
      if (this.resolve) this.resolve();
      return;
    }

    this.frameRequest = requestAnimationFrame(this.update);
    this.frame++;
  };

  TextScramble.prototype.randomChar = function(){
    return this.chars[Math.floor(Math.random() * this.chars.length)];
  };

  var scrambleEls = document.querySelectorAll('[data-scramble]');
  var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function revealText(el){
    var text = el.dataset.scrambleText || el.textContent;
    el.dataset.scrambleText = text;
    if (prefersReduced){
      el.classList.add('scrambled');
      return;
    }
    new TextScramble(el).setText(text);
  }

  if (prefersReduced || !('IntersectionObserver' in window)){
    scrambleEls.forEach(revealText);
  }else{
    var scrambleObserver = new IntersectionObserver(function(entries, observer){
      entries.forEach(function(entry){
        if (!entry.isIntersecting || entry.target.classList.contains('scrambled')) return;
        revealText(entry.target);
        observer.unobserve(entry.target);
      });
    }, { threshold:0.5 });
    scrambleEls.forEach(function(el){ scrambleObserver.observe(el); });
  }
})();

(function(){
  var coordDisplay = document.querySelector('.hud-coords');
  if (!coordDisplay) return;

  var updateCoordinates = function(event){
    var x = (event.clientX / window.innerWidth).toFixed(4);
    var y = (event.clientY / window.innerHeight).toFixed(4);
    var timestamp = Date.now().toString().slice(-6);
    coordDisplay.innerHTML = 'X-REF: ' + x + ' <br> Y-REF: ' + y + ' <br> SEQ: ' + timestamp;
  };

  window.addEventListener('mousemove', updateCoordinates, { passive:true });
})();

(function(){
  var heroRole = document.querySelector('.hero-role');
  if (!heroRole || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var text = heroRole.textContent;
  heroRole.textContent = '';
  var index = 0;

  function type(){
    if (index >= text.length) return;
    heroRole.textContent += text.charAt(index++);
    window.setTimeout(type, 100);
  }

  window.setTimeout(type, 1000);
})();

(function(){
  var revealItems = document.querySelectorAll('section:not(.hero) .kicker, section:not(.hero) .section-title, .about-grid, .stack-list, .role-entry, .tl-item, .contact-list li, footer');
  var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  revealItems.forEach(function(item, index){
    item.classList.add('reveal');
    item.style.setProperty('--reveal-delay', Math.min(index % 4, 3) * 70 + 'ms');
  });

  if (prefersReduced){
    revealItems.forEach(function(item){ item.classList.add('is-visible'); });
  }else if ('IntersectionObserver' in window){
    var revealObserver = new IntersectionObserver(function(entries, observer){
      entries.forEach(function(entry){
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.16, rootMargin: '0px 0px -8% 0px' });
    revealItems.forEach(function(item){ revealObserver.observe(item); });
  }else{
    revealItems.forEach(function(item){ item.classList.add('is-visible'); });
  }
})();

(function(){
  var header = document.querySelector('header.nav');
  var links = Array.prototype.slice.call(document.querySelectorAll('nav.links a'));
  var sections = links.map(function(link){ return document.querySelector(link.getAttribute('href')); }).filter(Boolean);
  var ticking = false;

  function updateScrollProgress(){
    var scrollable = document.documentElement.scrollHeight - window.innerHeight;
    var progress = scrollable > 0 ? window.scrollY / scrollable : 0;
    document.documentElement.style.setProperty('--scroll-progress', Math.min(progress, 1));
    ticking = false;
  }

  window.addEventListener('scroll', function(){
    if (!ticking){
      window.requestAnimationFrame(updateScrollProgress);
      ticking = true;
    }
  }, { passive:true });
  updateScrollProgress();

  if ('IntersectionObserver' in window && sections.length){
    var activeObserver = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if (!entry.isIntersecting) return;
        links.forEach(function(link){ link.classList.toggle('is-active', link.getAttribute('href') === '#' + entry.target.id); });
      });
    }, { rootMargin:'-35% 0px -55% 0px', threshold:0 });
    sections.forEach(function(section){ activeObserver.observe(section); });
  }

  if (header) header.addEventListener('click', function(event){
    var link = event.target.closest('a[href^="#"]');
    if (link) links.forEach(function(item){ item.classList.toggle('is-active', item === link); });
  });
})();

(function(){
  var buttons = document.querySelectorAll('.btn');
  buttons.forEach(function(button){
    button.addEventListener('pointermove', function(event){
      var rect = button.getBoundingClientRect();
      button.style.setProperty('--pointer-x', event.clientX - rect.left + 'px');
      button.style.setProperty('--pointer-y', event.clientY - rect.top + 'px');
    });
  });
})();

(function(){
  var canvas = document.getElementById('hero-canvas');
  var heroSection = document.querySelector('.hero');
  if(!canvas || !heroSection || typeof THREE === 'undefined') return;

  var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var renderer;
  try{
    renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
  }catch(e){ return; }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
  camera.position.set(0, 0.4, 8.4);

  var group = new THREE.Group();
  group.rotation.x = -0.12;
  scene.add(group);

  var signalRings = [];
  [0x55d6be, 0xc9a227].forEach(function(color, index){
    var ring = new THREE.Mesh(
      new THREE.TorusGeometry(3.15 + index * 0.42, 0.012, 6, 72),
      new THREE.MeshBasicMaterial({ color: color, transparent: true, opacity: index ? 0.28 : 0.2, wireframe: true })
    );
    ring.position.z = -2.8 - index * 0.35;
    ring.rotation.x = index ? 0.18 : -0.24;
    ring.rotation.y = index ? -0.3 : 0.16;
    group.add(ring);
    signalRings.push(ring);
  });

  // ---- stacked layers: UI / logic / API / data, front to back ----
  var layerZ = [3.3, 1.1, -1.1, -3.3];
  var layerW = 4.4, layerH = 2.5;
  var panelGeo = new THREE.PlaneGeometry(layerW, layerH, 6, 4);
  var edgeGeo = new THREE.EdgesGeometry(new THREE.PlaneGeometry(layerW, layerH));

  layerZ.forEach(function(z, idx){
    var fill = new THREE.Mesh(
      panelGeo,
      new THREE.MeshBasicMaterial({ color: 0x1c2330, transparent: true, opacity: 0.22, side: THREE.DoubleSide })
    );
    fill.position.z = z;
    group.add(fill);

    var grid = new THREE.Mesh(
      panelGeo,
      new THREE.MeshBasicMaterial({ color: 0xc9a227, wireframe: true, transparent: true, opacity: 0.32 })
    );
    grid.position.z = z;
    group.add(grid);

    var border = new THREE.LineSegments(
      edgeGeo,
      new THREE.LineBasicMaterial({ color: 0xede7da, transparent: true, opacity: 0.4 - idx * 0.03 })
    );
    border.position.z = z;
    group.add(border);
  });

  // ---- data packets flowing front-to-back through the stack ----
  var packetCount = 46;
  var packetGeo = new THREE.BufferGeometry();
  var packetPos = new Float32Array(packetCount * 3);
  var packetSpeed = [];
  var packetSpanZ = 5.6;
  for (var i = 0; i < packetCount; i++){
    var x = (Math.random() - 0.5) * (layerW - 0.6);
    var y = (Math.random() - 0.5) * (layerH - 0.6);
    var z = (Math.random() - 0.5) * packetSpanZ * 2;
    packetPos[i*3] = x; packetPos[i*3+1] = y; packetPos[i*3+2] = z;
    packetSpeed.push(0.55 + Math.random() * 0.5);
  }
  packetGeo.setAttribute('position', new THREE.BufferAttribute(packetPos, 3));
  var packetMat = new THREE.PointsMaterial({ color: 0xc9a227, size: 0.075, transparent: true, opacity: 0.85 });
  var packets = new THREE.Points(packetGeo, packetMat);
  group.add(packets);

  function resize(){
    var w = heroSection.clientWidth, h = heroSection.clientHeight;
    if (w === 0 || h === 0) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  window.addEventListener('resize', resize);
  resize();

  var mouseX = 0, mouseY = 0;
  window.addEventListener('mousemove', function(e){
    mouseX = (e.clientX / window.innerWidth) - 0.5;
    mouseY = (e.clientY / window.innerHeight) - 0.5;
  });

  var clock = new THREE.Clock();
  var posAttr = packetGeo.getAttribute('position');

  function renderFrame(){
    var dt = Math.min(clock.getDelta(), 0.05);
    if (!prefersReduced){
      group.rotation.y = Math.sin(clock.elapsedTime * 0.1) * 0.28;
      signalRings[0].rotation.z += dt * 0.18;
      signalRings[1].rotation.z -= dt * 0.11;
      var signalPulse = 1 + Math.sin(clock.elapsedTime * 2.2) * 0.035;
      signalRings[0].scale.set(signalPulse, signalPulse, signalPulse);
      signalRings[1].scale.set(2 - signalPulse, 2 - signalPulse, 2 - signalPulse);
      camera.position.x += (mouseX * 1.2 - camera.position.x) * 0.03;
      camera.position.y += (0.4 - mouseY * 1.0 - camera.position.y) * 0.03;
      camera.lookAt(0, 0, 0);

      for (var i = 0; i < packetCount; i++){
        var zi = i*3+2;
        var nz = posAttr.array[zi] - packetSpeed[i] * dt * 1.6;
        if (nz < -packetSpanZ) nz = packetSpanZ;
        posAttr.array[zi] = nz;
      }
      posAttr.needsUpdate = true;
    }
    renderer.render(scene, camera);
    if (!prefersReduced) requestAnimationFrame(renderFrame);
  }
  renderFrame();
})();

// subtle mouse-tilt on the portrait frame
(function(){
  var photo = document.querySelector('.hero-photo');
  var frame = document.querySelector('.hero-photo .frame');
  if (!photo || !frame) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (window.matchMedia('(hover: none)').matches) return;

  photo.addEventListener('mousemove', function(e){
    var rect = frame.getBoundingClientRect();
    var x = (e.clientX - rect.left) / rect.width - 0.5;
    var y = (e.clientY - rect.top) / rect.height - 0.5;
    var rotY = x * 14;
    var rotX = -y * 14;
    frame.style.transform = 'rotateX(' + rotX + 'deg) rotateY(' + rotY + 'deg)';
  });
  photo.addEventListener('mouseleave', function(){
    frame.style.transform = 'rotateX(0deg) rotateY(0deg)';
  });
})();
