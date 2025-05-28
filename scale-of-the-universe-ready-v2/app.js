fetch('objects.json')
  .then(res => res.json())
  .then(objects => {
    const viewport    = document.getElementById('viewport');
    const indicator   = document.getElementById('scaleIndicator');
    const progressBar = document.getElementById('progressBar');

    const logs   = objects.map(o => Math.log10(o.size));
    const minLog = Math.min(...logs);
    const maxLog = Math.max(...logs);

    objects.forEach((obj, i) => {
      const img   = document.createElement('img');
      img.classList.add('obj');
      img.src     = obj.img;
      img.alt     = obj.name;
      img.dataset.size  = obj.size;
      img.dataset.angle = (2 * Math.PI * i) / objects.length;
      viewport.appendChild(img);
    });

    function update() {
      const scrollY   = window.scrollY;
      const maxScroll = document.body.scrollHeight - window.innerHeight;
      const t         = Math.min(Math.max(scrollY / maxScroll, 0), 1);
      const currentLog = minLog + t * (maxLog - minLog);
      const scale      = Math.pow(10, currentLog);

      document.querySelectorAll('.obj').forEach(el => {
        const objSize = parseFloat(el.dataset.size);
        const rel     = objSize / scale;
        let angle   = parseFloat(el.dataset.angle);
        let offsetX = Math.cos(angle) * 20;
        let offsetY = Math.sin(angle) * 20;

        // Center Moritz' genius fully so it's never clipped
        if (el.alt === "Moritz' genius") {
          offsetX = 0;
          offsetY = 0;
        }

        el.style.left      = `${50 + offsetX}%`;
        el.style.top       = `${50 + offsetY}%`;
        el.style.transform = `translate(-50%,-50%) scale(${rel})`;
        el.style.opacity   = (rel < 0.001 || rel > 1000) ? 0 : 1;
      });

      const pretty = scale.toExponential(2).replace(/e\+?/, '×10^');
      indicator.textContent = `Scale: 1px = ${pretty} m`;
      progressBar.style.width = `${t * 100}%`;
    }

    window.scrollTo(0, 0);
    update();
    window.addEventListener('scroll', update);
  })
  .catch(console.error);