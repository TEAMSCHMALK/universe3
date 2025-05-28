fetch('objects.json')
  .then(res => res.json())
  .then(objects => {
    const viewport    = document.getElementById('viewport');
    const indicator   = document.getElementById('scaleIndicator');
    const progressBar = document.getElementById('progressBar');

    // Precompute log-sizes
    const logs   = objects.map(o => Math.log10(o.size));
    const minLog = Math.min(...logs);
    const maxLog = Math.max(...logs);

    // Create each <img> and give it a "scatter" angle
    objects.forEach((obj, i) => {
      const img   = document.createElement('img');
      img.classList.add('obj');
      img.src     = obj.img;
      img.alt     = obj.name;
      img.dataset.size  = obj.size;
      // Angle evenly around the circle
      img.dataset.angle = (2 * Math.PI * i) / objects.length;
      viewport.appendChild(img);
    });

    function update() {
      // How far the user has scrolled, 0→1
      const scrollY   = window.scrollY;
      const maxScroll = document.body.scrollHeight - window.innerHeight;
      const t         = Math.min(Math.max(scrollY / maxScroll, 0), 1);

      // Map t linearly into the log-domain
      const currentLog = minLog + t * (maxLog - minLog);
      const scale      = Math.pow(10, currentLog);

      // Update positions, scale, and visibility
      document.querySelectorAll('.obj').forEach(el => {
        const objSize = parseFloat(el.dataset.size);
        const rel     = objSize / scale;

        // Scatter them around a circle 20% off-center
        const angle   = parseFloat(el.dataset.angle);
        const offsetX = Math.cos(angle) * 20; // percent
        const offsetY = Math.sin(angle) * 20;

        el.style.left      = `${50 + offsetX}%`;
        el.style.top       = `${50 + offsetY}%`;
        el.style.transform = `translate(-50%,-50%) scale(${rel})`;
        el.style.opacity   = (rel < 0.001 || rel > 1000) ? 0 : 1;
      });

      // Update the numeric scale readout
      const pretty = scale
        .toExponential(2)
        .replace(/e\+?/, '×10^');
      indicator.textContent = `Scale: 1px = ${pretty} m`;

      // Update the progress bar
      progressBar.style.width = `${t * 100}%`;
    }

    // Always jump to the very top (Quark) on load…
    window.scrollTo(0, 0);
    // …draw the first frame…
    update();
    // …and redraw on every scroll
    window.addEventListener('scroll', update);
  })
  .catch(console.error);
