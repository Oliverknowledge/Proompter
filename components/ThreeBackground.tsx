import { useEffect, useRef } from 'react';
import * as THREE from 'three';

const ThreeBackground = () => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;
    const mount = mountRef.current; // <--- store ref value

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.top = '0';
    renderer.domElement.style.left = '0';
    renderer.domElement.style.width = '100vw';
    renderer.domElement.style.height = '100vh';
    renderer.domElement.style.zIndex = '1';
    renderer.domElement.style.pointerEvents = 'none';
    renderer.domElement.style.mixBlendMode = 'screen';
    mount.appendChild(renderer.domElement);

    // Enhanced color palette with more vibrant colors
    const neonColors = [0x00ffe7, 0x00c3ff, 0x00ff99, 0x1e90ff, 0x00ffcc, 0xff00ff, 0xffff00, 0xff6600, 0x9900ff];

    // Clean geometric shapes array
    const shapes: (THREE.LineSegments | THREE.Line)[] = [];

    // 1. Wireframe Cubes/Squares (reduced to 3, spread out)
    const cubePositions = [[10, 5, -2], [-12, -4, -3], [0, -10, -2]];
    for (let i = 0; i < 3; i++) {
      const size = 1.2 + Math.random() * 0.8;
      const geometry = new THREE.BoxGeometry(size, size, size);
      const material = new THREE.LineBasicMaterial({
        color: neonColors[i % neonColors.length],
        linewidth: 2,
        transparent: true,
        opacity: 0.8
      });
      const wireframe = new THREE.LineSegments(new THREE.EdgesGeometry(geometry), material);
      wireframe.position.set(...cubePositions[i] as [number, number, number]);
      wireframe.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
      scene.add(wireframe);
      shapes.push(wireframe);
    }

    // 2. Wireframe Tetrahedrons (unchanged)
    const tetraPositions = [[-2, 6, -2], [4, -4, -3], [-6, 2, -4], [8, 1, -3], [-3, -6, -2]];
    for (let i = 0; i < 5; i++) {
      const size = 1.5 + Math.random() * 0.5;
      const geometry = new THREE.TetrahedronGeometry(size);
      const material = new THREE.LineBasicMaterial({
        color: neonColors[(i + 3) % neonColors.length],
        linewidth: 2,
        transparent: true,
        opacity: 0.7
      });
      const wireframe = new THREE.LineSegments(new THREE.EdgesGeometry(geometry), material);
      wireframe.position.set(...tetraPositions[i] as [number, number, number]);
      wireframe.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
      scene.add(wireframe);
      shapes.push(wireframe);
    }

    // 3. Clean Star Patterns (unchanged)
    const starPositions = [[0, 8, -3], [0, -8, -3], [9, 0, -4], [-9, 0, -4], [6, 6, -2], [-6, -6, -2]];
    for (let i = 0; i < 6; i++) {
      const starGeometry = new THREE.BufferGeometry();
      const starVertices = [];
      const outerRadius = 1.5 + Math.random() * 0.5;
      const innerRadius = outerRadius * 0.5;
      const spikes = 6; // Clean 6-pointed stars
      
      for (let j = 0; j < spikes; j++) {
        const angle1 = (j / spikes) * Math.PI * 2;
        const angle2 = ((j + 0.5) / spikes) * Math.PI * 2;
        
        // Create clean star lines
        starVertices.push(
          0, 0, 0, // Center
          Math.cos(angle1) * outerRadius, Math.sin(angle1) * outerRadius, 0, // Outer point
          Math.cos(angle2) * innerRadius, Math.sin(angle2) * innerRadius, 0, // Inner point
          Math.cos(angle1) * outerRadius, Math.sin(angle1) * outerRadius, 0 // Back to outer
        );
      }
      
      starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
      const material = new THREE.LineBasicMaterial({
        color: neonColors[(i + 6) % neonColors.length],
        linewidth: 2,
        transparent: true,
        opacity: 0.7
      });
      const star = new THREE.LineSegments(starGeometry, material);
      star.position.set(...starPositions[i] as [number, number, number]);
      scene.add(star);
      shapes.push(star);
    }

    // 4. Glitter/Particle System
    const glitterCount = 300;
    const glitterGeometry = new THREE.BufferGeometry();
    const glitterPositions = new Float32Array(glitterCount * 3);
    const glitterOpacities = new Float32Array(glitterCount);
    for (let i = 0; i < glitterCount; i++) {
      glitterPositions[i * 3] = (Math.random() - 0.5) * 30;
      glitterPositions[i * 3 + 1] = (Math.random() - 0.5) * 20;
      glitterPositions[i * 3 + 2] = (Math.random() - 0.5) * 10;
      glitterOpacities[i] = Math.random();
    }
    glitterGeometry.setAttribute('position', new THREE.BufferAttribute(glitterPositions, 3));
    // We'll animate opacity in the render loop
    const glitterMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.08,
      transparent: true,
      opacity: 1.0,
      depthWrite: false
    });
    const glitter = new THREE.Points(glitterGeometry, glitterMaterial);
    scene.add(glitter);

    // Enhanced lighting system with color-changing lights (unchanged)
    const lights: THREE.PointLight[] = [];
    const lightPositions = [[-6, 4, 3], [6, -3, 3], [0, 7, 2], [0, -7, 2]];
    const lightColors = [0x00ffe7, 0xff00ff, 0x00c3ff, 0xffff00];
    
    for (let i = 0; i < 4; i++) {
      const light = new THREE.PointLight(lightColors[i], 2.5, 25);
      light.position.set(...lightPositions[i] as [number, number, number]);
      scene.add(light);
      lights.push(light);
    }

    // Ambient light for overall illumination (unchanged)
    const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
    scene.add(ambientLight);

    // Static spinning cube in corner (unchanged)
    const cornerGeometry = new THREE.BoxGeometry(1.2, 1.2, 1.2);
    const cornerMaterial = new THREE.LineBasicMaterial({ 
      color: 0x00ffe7, 
      linewidth: 3, 
      transparent: true, 
      opacity: 0.9 
    });
    const cornerShape = new THREE.LineSegments(new THREE.EdgesGeometry(cornerGeometry), cornerMaterial);
    cornerShape.position.set(7, 4, -1);
    scene.add(cornerShape);

    camera.position.z = 10;

    // Enhanced mouse parallax (unchanged)
    let mouseX = 0, mouseY = 0;
    const onPointerMove = (event: MouseEvent) => {
      mouseX = (event.clientX / window.innerWidth) * 2 - 1;
      mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', onPointerMove);

    // Track scroll position (unchanged)
    let scrollY = 0;
    const onScroll = () => {
      scrollY = window.scrollY || window.pageYOffset;
    };
    window.addEventListener('scroll', onScroll);

    // Enhanced animation loop
    let t = 0;
    const animate = () => {
      requestAnimationFrame(animate);
      t += 0.012; // Slightly faster

      // Animate all shapes with varied behaviors (unchanged, but add color shift for wireframes)
      shapes.forEach((shape, i) => {
        const scrollFactor = scrollY * 0.001;
        const timeFactor = t + i * 0.5;
        // Color shift for wireframes
        if (
          shape.material &&
          'color' in shape.material &&
          shape.material instanceof THREE.LineBasicMaterial
        ) {
          const hue = (t * 0.08 + i * 0.13) % 1;
          shape.material.color.setHSL(hue, 1, 0.6);
        }
        if (i % 4 === 0) {
          // Rotate based on scroll and time
          shape.rotation.x = scrollFactor * (i + 1) + timeFactor * 0.3;
          shape.rotation.y = scrollFactor * (i + 2) + timeFactor * 0.2;
          shape.rotation.z = timeFactor * 0.1;
        } else if (i % 4 === 1) {
          // Move position with scroll and sine wave
          shape.position.x += Math.sin(timeFactor) * 0.02 + scrollFactor * (i + 1);
          shape.position.y += Math.cos(timeFactor * 0.7) * 0.02 + scrollFactor * (i + 2);
          shape.rotation.x += 0.005;
          shape.rotation.y += 0.008;
        } else if (i % 4 === 2) {
          // Pulsing effect for stars
          const scale = 1 + Math.sin(timeFactor * 2) * 0.28;
          shape.scale.set(scale, scale, scale);
          shape.rotation.z = timeFactor * 0.4;
        } else {
          // Complex orbital motion
          const radius = 2 + Math.sin(timeFactor * 0.5) * 0.5;
          shape.position.x += Math.cos(timeFactor * 0.3 + i) * 0.01;
          shape.position.y += Math.sin(timeFactor * 0.4 + i) * 0.01;
          shape.rotation.x = timeFactor * 0.6;
          shape.rotation.y = timeFactor * 0.4;
        }
      });

      // Animate glitter particles (twinkle + swirling motion)
      const positions = glitterGeometry.getAttribute('position');
      for (let i = 0; i < glitterCount; i++) {
        // Swirl motion
        const swirlRadius = 0.2 + 0.1 * Math.sin(t + i);
        const swirlAngle = t * 0.7 + i;
        positions.setX(i, positions.getX(i) + Math.cos(swirlAngle) * swirlRadius * 0.01);
        positions.setY(i, positions.getY(i) + Math.sin(swirlAngle) * swirlRadius * 0.01);
        // Animate opacity as a function of time and index for twinkling
        glitterMaterial.opacity = 0.7 + 0.3 * Math.sin(t * 2 + i);
      }
      positions.needsUpdate = true;

      // Animate corner shape (unchanged)
      cornerShape.rotation.x = scrollY * 0.015 + t * 0.3;
      cornerShape.rotation.y = scrollY * 0.018 + t * 0.2;
      cornerShape.rotation.z = t * 0.1;

      // Animate lights with color cycling (unchanged)
      lights.forEach((light, i) => {
        const lightTime = t * (0.5 + i * 0.2);
        light.intensity = 2 + Math.sin(lightTime) * 0.8;
        
        // Color cycling
        const hue = (lightTime * 0.1 + i * 0.25) % 1;
        light.color.setHSL(hue, 1, 0.6);
        
        // Subtle movement
        light.position.x += Math.sin(lightTime * 0.3) * 0.02;
        light.position.y += Math.cos(lightTime * 0.4) * 0.02;
      });

      // Enhanced parallax camera with more lively bobbing
      const targetX = mouseX * 2 + Math.sin(t * 0.7) * 0.18;
      const targetY = mouseY * 2 + Math.cos(t * 0.5) * 0.14;
      camera.position.x += (targetX - camera.position.x) * 0.04;
      camera.position.y += (targetY - camera.position.y) * 0.04;
      camera.lookAt(0, 0, 0);

      // Subtle camera shake on scroll (unchanged)
      if (scrollY > 0) {
        camera.position.x += (Math.random() - 0.5) * 0.01;
        camera.position.y += (Math.random() - 0.5) * 0.01;
      }

      renderer.render(scene, camera);
    };
    animate();

    // Handle resize (unchanged)
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', onPointerMove);
      window.removeEventListener('scroll', onScroll);
      // Use the stored variable instead of mountRef.current
      if (mount && renderer.domElement) {
        mount.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ zIndex: 1, background: 'radial-gradient(ellipse at center, #0f172a 0%, #020617 100%)' }}
    />
  );
};

export default ThreeBackground;