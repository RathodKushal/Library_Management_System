import React, { useEffect, useRef } from 'react';

export default function LibraryCanvasBackground({ isDark = true }) {
  const canvasRef = useRef(null);
  
  useEffect(() => {
    // respect prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    
    // Handle resizing
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    // Mouse tracking for parallax
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let targetMouseX = mouseX;
    let targetMouseY = mouseY;

    const onMouseMove = (e) => {
      targetMouseX = e.clientX;
      targetMouseY = e.clientY;
    };
    window.addEventListener('mousemove', onMouseMove);

    // Objects
    const glows = [];
    for (let i = 0; i < 6; i++) {
      glows.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: 200 + Math.random() * 300,
        color: i % 3 === 0 ? '#1f3a6e' : i % 3 === 1 ? '#4a6aa8' : '#c8a45c',
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        phase: Math.random() * Math.PI * 2
      });
    }

    const books = [];
    const bookCount = window.innerWidth < 768 ? 15 : 25;
    for (let i = 0; i < bookCount; i++) {
      books.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        z: 0.2 + Math.random() * 0.8, // Depth for parallax & sizing
        speed: 0.2 + Math.random() * 0.5,
        angle: (Math.random() - 0.5) * 0.5,
        spin: (Math.random() - 0.5) * 0.01,
        color: Math.random() > 0.5 ? '#12264f' : '#4a6aa8',
        spineColor: '#c8a45c',
        width: 30 + Math.random() * 20,
        height: 40 + Math.random() * 30
      });
    }

    const sparkles = [];
    const sparkleCount = window.innerWidth < 768 ? 40 : 70;
    for (let i = 0; i < sparkleCount; i++) {
      sparkles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: 1 + Math.random() * 2,
        phase: Math.random() * Math.PI * 2,
        speed: 0.02 + Math.random() * 0.03
      });
    }

    let time = 0;

    const render = () => {
      if (!prefersReducedMotion) {
        time += 0.01;
      }
      
      // Smooth mouse
      mouseX += (targetMouseX - mouseX) * 0.05;
      mouseY += (targetMouseY - mouseY) * 0.05;
      
      const parallaxX = prefersReducedMotion ? 0 : (mouseX / canvas.width - 0.5) * 50;
      const parallaxY = prefersReducedMotion ? 0 : (mouseY / canvas.height - 0.5) * 50;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw glows
      glows.forEach((glow, i) => {
        if (!prefersReducedMotion) {
          glow.x += glow.vx + Math.sin(time + glow.phase) * 0.5;
          glow.y += glow.vy + Math.cos(time + glow.phase) * 0.5;
        }

        // Wrap
        if (glow.x < -glow.r) glow.x = canvas.width + glow.r;
        if (glow.x > canvas.width + glow.r) glow.x = -glow.r;
        if (glow.y < -glow.r) glow.y = canvas.height + glow.r;
        if (glow.y > canvas.height + glow.r) glow.y = -glow.r;

        const gradient = ctx.createRadialGradient(
          glow.x - parallaxX, glow.y - parallaxY, 0,
          glow.x - parallaxX, glow.y - parallaxY, glow.r
        );
        
        // Convert hex to rgba for opacity
        const hex = glow.color;
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        
        const opacity = isDark ? 0.4 : 0.2;
        gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${opacity})`);
        gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(glow.x - parallaxX, glow.y - parallaxY, glow.r, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw Aurora Ribbons
      ctx.save();
      ctx.globalAlpha = isDark ? 0.2 : 0.08;
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        for (let x = 0; x <= canvas.width; x += 50) {
          const y = canvas.height * 0.3 + 
                    Math.sin(x * 0.005 + time * (i + 1)) * 100 + 
                    Math.cos(x * 0.002 - time) * 50 + 
                    (i * 50);
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.lineWidth = 40 + i * 20;
        ctx.strokeStyle = i === 0 ? '#c8a45c' : i === 1 ? '#4a6aa8' : '#1f3a6e';
        // Blur
        ctx.shadowBlur = 50;
        ctx.shadowColor = ctx.strokeStyle;
        ctx.stroke();
      }
      ctx.restore();

      // Draw Books
      books.forEach(book => {
        if (!prefersReducedMotion) {
          book.y -= book.speed;
          book.angle += book.spin;
        }
        
        if (book.y < -100) {
          book.y = canvas.height + 100;
          book.x = Math.random() * canvas.width;
        }

        const px = book.x - parallaxX * book.z;
        const py = book.y - parallaxY * book.z;
        const scale = book.z;

        ctx.save();
        ctx.translate(px, py);
        ctx.rotate(book.angle);
        ctx.scale(scale, scale);

        // Soft glow behind book
        ctx.shadowBlur = 15;
        ctx.shadowColor = 'rgba(200, 164, 92, 0.3)';

        // Cover
        ctx.fillStyle = book.color;
        ctx.fillRect(-book.width/2, -book.height/2, book.width, book.height);
        
        // Spine
        ctx.shadowBlur = 0;
        ctx.fillStyle = book.spineColor;
        ctx.fillRect(-book.width/2, -book.height/2, 6, book.height);
        
        // Cream page edge
        ctx.fillStyle = '#f3eee3';
        ctx.fillRect(book.width/2 - 4, -book.height/2 + 2, 4, book.height - 4);
        
        // Gold title lines
        ctx.fillStyle = '#c8a45c';
        ctx.fillRect(-book.width/2 + 10, -book.height/2 + 10, book.width - 20, 3);
        ctx.fillRect(-book.width/2 + 10, -book.height/2 + 16, book.width - 25, 3);

        ctx.restore();
      });

      // Draw Sparkles
      sparkles.forEach(sparkle => {
        if (!prefersReducedMotion) {
          sparkle.phase += sparkle.speed;
        }
        const alpha = (Math.sin(sparkle.phase) + 1) / 2;
        
        ctx.beginPath();
        ctx.arc(sparkle.x - parallaxX * 0.5, sparkle.y - parallaxY * 0.5, sparkle.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200, 164, 92, ${alpha * (isDark ? 0.8 : 0.5)})`;
        ctx.fill();
        
        // Cross glare
        if (alpha > 0.8) {
          ctx.fillStyle = `rgba(255, 255, 255, ${(alpha - 0.8) * 2})`;
          ctx.fillRect(sparkle.x - parallaxX * 0.5 - sparkle.size * 3, sparkle.y - parallaxY * 0.5 - 0.5, sparkle.size * 6, 1);
          ctx.fillRect(sparkle.x - parallaxX * 0.5 - 0.5, sparkle.y - parallaxY * 0.5 - sparkle.size * 3, 1, sparkle.size * 6);
        }
      });

      if (!prefersReducedMotion || time === 0) {
        animationFrameId = requestAnimationFrame(render);
      }
    };

    render();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouseMove);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [isDark]);

  return (
    <canvas 
      ref={canvasRef} 
      style={{ 
        position: 'absolute', 
        inset: 0, 
        width: '100%', 
        height: '100%', 
        pointerEvents: 'none', 
        zIndex: 0 
      }} 
    />
  );
}
