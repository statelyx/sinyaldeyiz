'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function ThreeBackground() {
    const containerRef = useRef<HTMLDivElement>(null);
    const mouseRef = useRef({ x: 0, y: 0 });
    const targetRef = useRef({ x: 0, y: 0 });

    useEffect(() => {
        if (!containerRef.current) return;

        // Check for reduced motion preference
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        // Scene setup
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.z = 30;

        // Renderer with optimized settings - PERFORMANCE OPTIMIZED
        const renderer = new THREE.WebGLRenderer({
            alpha: true,
            antialias: false, // Disabled for better performance
            powerPreference: 'high-performance'
        });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.0)); // Reduced for performance
        renderer.setClearColor(0x000000, 0);
        containerRef.current.appendChild(renderer.domElement);

        // Torus Knot with blue/purple glow - OPTIMIZED
        const torusKnotGeometry = new THREE.TorusKnotGeometry(8, 0.8, 48, 8); // Reduced segments
        const torusKnotMaterial = new THREE.MeshBasicMaterial({
            color: 0x6366f1,
            wireframe: true,
            transparent: true,
            opacity: 0.6,
        });
        const torusKnot = new THREE.Mesh(torusKnotGeometry, torusKnotMaterial);
        torusKnot.position.set(-15, 0, -10);
        scene.add(torusKnot);

        // Second Torus with purple glow - OPTIMIZED
        const torusKnot2Geometry = new THREE.TorusKnotGeometry(5, 0.5, 36, 6); // Reduced segments
        const torusKnot2Material = new THREE.MeshBasicMaterial({
            color: 0xa855f7,
            wireframe: true,
            transparent: true,
            opacity: 0.4,
        });
        const torusKnot2 = new THREE.Mesh(torusKnot2Geometry, torusKnot2Material);
        torusKnot2.position.set(20, -5, -15);
        scene.add(torusKnot2);

        // Lamborghini-like wedge car silhouette (original, wireframe)
        const createCarShape = () => {
            const carGroup = new THREE.Group();

            // Car body - low wedge shape
            const bodyPoints = [
                new THREE.Vector3(-3, 0, 0),      // front bottom
                new THREE.Vector3(-2.8, 0.3, 0),  // front nose
                new THREE.Vector3(-1, 0.8, 0),    // windshield start
                new THREE.Vector3(0.5, 1.2, 0),   // roof peak
                new THREE.Vector3(2.5, 1, 0),     // roof end
                new THREE.Vector3(3.2, 0.4, 0),   // rear end
                new THREE.Vector3(3.5, 0, 0),     // rear bottom
            ];

            // Create wireframe outline
            const bodyGeometry = new THREE.BufferGeometry().setFromPoints(bodyPoints);
            const bodyMaterial = new THREE.LineBasicMaterial({
                color: 0xfacc15, // Neon yellow
                transparent: true,
                opacity: 0.8,
                linewidth: 2,
            });
            const bodyLine = new THREE.Line(bodyGeometry, bodyMaterial);
            carGroup.add(bodyLine);

            // Mirror for 3D effect
            const bodyPoints2 = bodyPoints.map(p => new THREE.Vector3(p.x, p.y, 1.5));
            const bodyGeometry2 = new THREE.BufferGeometry().setFromPoints(bodyPoints2);
            const bodyLine2 = new THREE.Line(bodyGeometry2, bodyMaterial);
            carGroup.add(bodyLine2);

            // Connect front and back
            const connectMaterial = new THREE.LineBasicMaterial({
                color: 0xf97316, // Orange accent
                transparent: true,
                opacity: 0.6,
            });

            bodyPoints.forEach((p, i) => {
                const connectorGeometry = new THREE.BufferGeometry().setFromPoints([
                    p,
                    new THREE.Vector3(p.x, p.y, 1.5)
                ]);
                const connector = new THREE.Line(connectorGeometry, connectMaterial);
                carGroup.add(connector);
            });

            // Wheels (circles)
            const wheelGeometry = new THREE.CircleGeometry(0.5, 16);
            const wheelMaterial = new THREE.LineBasicMaterial({
                color: 0xfacc15,
                transparent: true,
                opacity: 0.7,
            });

            // Front wheel
            const frontWheelEdges = new THREE.EdgesGeometry(wheelGeometry);
            const frontWheel = new THREE.LineSegments(frontWheelEdges, wheelMaterial);
            frontWheel.position.set(-2, 0, 0);
            carGroup.add(frontWheel);

            // Rear wheel
            const rearWheelEdges = new THREE.EdgesGeometry(wheelGeometry);
            const rearWheel = new THREE.LineSegments(rearWheelEdges, wheelMaterial);
            rearWheel.position.set(2.5, 0, 0);
            carGroup.add(rearWheel);

            return carGroup;
        };

        const car = createCarShape();
        car.position.set(10, -8, 5);
        car.rotation.y = -0.3;
        scene.add(car);

        // Drift arc trail
        const trailPoints: THREE.Vector3[] = [];
        for (let i = 0; i < 50; i++) {
            const t = i / 50;
            const x = 10 + Math.sin(t * Math.PI * 2) * 8;
            const z = 5 + Math.cos(t * Math.PI * 2) * 4 - t * 8;
            trailPoints.push(new THREE.Vector3(x, -8, z));
        }

        const trailGeometry = new THREE.BufferGeometry().setFromPoints(trailPoints);
        const trailMaterial = new THREE.LineBasicMaterial({
            color: 0xf97316,
            transparent: true,
            opacity: 0.3,
        });
        const trail = new THREE.Line(trailGeometry, trailMaterial);
        scene.add(trail);

        // Floating particles - OPTIMIZED
        const particlesGeometry = new THREE.BufferGeometry();
        const particlesCount = 80; // Reduced for performance
        const posArray = new Float32Array(particlesCount * 3);

        for (let i = 0; i < particlesCount * 3; i++) {
            posArray[i] = (Math.random() - 0.5) * 100;
        }

        particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
        const particlesMaterial = new THREE.PointsMaterial({
            size: 0.1,
            color: 0xfacc15,
            transparent: true,
            opacity: 0.4,
        });
        const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
        scene.add(particlesMesh);

        // Mouse move handler
        const handleMouseMove = (event: MouseEvent) => {
            targetRef.current.x = (event.clientX / window.innerWidth) * 2 - 1;
            targetRef.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
        };

        window.addEventListener('mousemove', handleMouseMove);

        // Animation
        let animationId: number;
        let time = 0;

        const animate = () => {
            animationId = requestAnimationFrame(animate);
            time += 0.01;

            if (!prefersReducedMotion) {
                // Lerp mouse position for smooth parallax
                mouseRef.current.x += (targetRef.current.x - mouseRef.current.x) * 0.05;
                mouseRef.current.y += (targetRef.current.y - mouseRef.current.y) * 0.05;

                // Rotate torus knots
                torusKnot.rotation.x += 0.003;
                torusKnot.rotation.y += 0.005;
                torusKnot.position.y = Math.sin(time) * 2;

                torusKnot2.rotation.x -= 0.004;
                torusKnot2.rotation.y -= 0.003;
                torusKnot2.position.y = Math.cos(time * 0.8) * 3;

                // Car drift animation
                car.position.x = 10 + Math.sin(time * 0.5) * 3;
                car.position.z = 5 + Math.cos(time * 0.5) * 2;
                car.rotation.y = -0.3 + Math.sin(time * 0.5) * 0.2;

                // Parallax effect
                scene.rotation.y = mouseRef.current.x * 0.1;
                scene.rotation.x = mouseRef.current.y * 0.05;

                // Floating particles
                particlesMesh.rotation.y += 0.0005;
            }

            renderer.render(scene, camera);
        };

        // Start animation or render static frame
        if (prefersReducedMotion) {
            renderer.render(scene, camera);
        } else {
            animate();
        }

        // Resize handler
        const handleResize = () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        };

        window.addEventListener('resize', handleResize);

        // Cleanup
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('resize', handleResize);
            if (animationId) cancelAnimationFrame(animationId);

            // Dispose geometries
            torusKnotGeometry.dispose();
            torusKnot2Geometry.dispose();
            particlesGeometry.dispose();

            // Dispose materials
            torusKnotMaterial.dispose();
            torusKnot2Material.dispose();
            particlesMaterial.dispose();

            // Dispose renderer
            renderer.dispose();

            // Clear scene
            scene.clear();

            // Remove DOM element
            if (containerRef.current && renderer.domElement && containerRef.current.contains(renderer.domElement)) {
                containerRef.current.removeChild(renderer.domElement);
            }
        };
    }, []);

    return (
        <div
            ref={containerRef}
            className="fixed inset-0 z-0 pointer-events-none"
            aria-hidden="true"
        />
    );
}
