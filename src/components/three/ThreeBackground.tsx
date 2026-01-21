'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function ThreeBackground() {
    const containerRef = useRef<HTMLDivElement>(null);
    const mouseRef = useRef({ x: 0, y: 0 });
    const targetRef = useRef({ x: 0, y: 0 });

    useEffect(() => {
        if (!containerRef.current) return;

        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        // Scene setup
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.set(0, 15, 25);
        camera.lookAt(0, 0, 0);

        const renderer = new THREE.WebGLRenderer({
            alpha: true,
            antialias: false,
            powerPreference: 'high-performance'
        });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
        renderer.setClearColor(0x000000, 0);
        containerRef.current.appendChild(renderer.domElement);

        // F1 Track - Oval circuit
        const createTrack = () => {
            const trackGroup = new THREE.Group();

            // Outer track boundary
            const outerTrackPoints: THREE.Vector3[] = [];
            const innerTrackPoints: THREE.Vector3[] = [];

            for (let i = 0; i <= 64; i++) {
                const t = (i / 64) * Math.PI * 2;
                // F1 oval shape
                const outerX = Math.cos(t) * 18 + Math.sin(t * 2) * 3;
                const outerZ = Math.sin(t) * 12;
                const innerX = Math.cos(t) * 12 + Math.sin(t * 2) * 2;
                const innerZ = Math.sin(t) * 8;

                outerTrackPoints.push(new THREE.Vector3(outerX, 0, outerZ));
                innerTrackPoints.push(new THREE.Vector3(innerX, 0, innerZ));
            }

            // Outer line (neon yellow)
            const outerGeometry = new THREE.BufferGeometry().setFromPoints(outerTrackPoints);
            const outerMaterial = new THREE.LineBasicMaterial({
                color: 0xfacc15,
                transparent: true,
                opacity: 0.5,
                linewidth: 3,
            });
            const outerLine = new THREE.Line(outerGeometry, outerMaterial);
            trackGroup.add(outerLine);

            // Inner line (neon orange)
            const innerGeometry = new THREE.BufferGeometry().setFromPoints(innerTrackPoints);
            const innerMaterial = new THREE.LineBasicMaterial({
                color: 0xf97316,
                transparent: true,
                opacity: 0.5,
                linewidth: 3,
            });
            const innerLine = new THREE.Line(innerGeometry, innerMaterial);
            trackGroup.add(innerLine);

            // Track surface grid
            const gridHelper = new THREE.GridHelper(50, 50, 0x333333, 0x222222);
            gridHelper.position.y = -0.1;
            trackGroup.add(gridHelper);

            // Start/Finish line
            const startLineGeometry = new THREE.BufferGeometry().setFromPoints([
                new THREE.Vector3(15, 0.01, 0),
                new THREE.Vector3(15, 0.01, -12),
            ]);
            const startLineMaterial = new THREE.LineBasicMaterial({ color: 0xffffff, opacity: 0.8 });
            const startLine = new THREE.Line(startLineGeometry, startLineMaterial);
            trackGroup.add(startLine);

            return trackGroup;
        };

        const track = createTrack();
        scene.add(track);

        // F1 Car shape
        const createF1Car = (color: number, teamName: string) => {
            const carGroup = new THREE.Group();

            // Main body - sleek F1 shape
            const bodyShape = new THREE.Shape();
            bodyShape.moveTo(-2.5, 0);
            bodyShape.lineTo(-2.2, 0.3);  // Front nose
            bodyShape.lineTo(-1.5, 0.6);  // Nose cone
            bodyShape.lineTo(-0.5, 0.8);  // Front wing
            bodyShape.lineTo(0.5, 1.0);   // Cockpit
            bodyShape.lineTo(1.5, 0.9);   // Air intake
            bodyShape.lineTo(2.5, 0.5);   // Engine cover
            bodyShape.lineTo(3.2, 0.2);   // Rear
            bodyShape.lineTo(3.5, 0);     // Rear end
            bodyShape.lineTo(3.2, -0.1);
            bodyShape.lineTo(2.5, -0.3);  // Rear diffuser
            bodyShape.lineTo(1.5, -0.4);
            bodyShape.lineTo(-0.5, -0.3);
            bodyShape.lineTo(-2.2, -0.2);
            bodyShape.lineTo(-2.5, 0);

            const bodyGeometry = new THREE.ExtrudeGeometry(bodyShape, {
                depth: 1.2,
                bevelEnabled: true,
                bevelThickness: 0.1,
                bevelSize: 0.1,
                bevelSegments: 1,
            });

            const bodyMaterial = new THREE.MeshBasicMaterial({
                color: color,
                wireframe: true,
                transparent: true,
                opacity: 0.9,
            });
            const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
            body.rotation.y = Math.PI / 2;
            carGroup.add(body);

            // Front wing
            const frontWingGeometry = new THREE.BoxGeometry(0.2, 0.1, 3);
            const frontWing = new THREE.Mesh(frontWingGeometry, bodyMaterial);
            frontWing.position.set(-2.3, 0.2, 0);
            frontWing.rotation.y = Math.PI / 2;
            carGroup.add(frontWing);

            // Rear wing
            const rearWingGeometry = new THREE.BoxGeometry(0.15, 0.6, 2);
            const rearWing = new THREE.Mesh(rearWingGeometry, bodyMaterial);
            rearWing.position.set(3.3, 0.5, 0);
            rearWing.rotation.y = Math.PI / 2;
            carGroup.add(rearWing);

            // Wheels
            const wheelGeometry = new THREE.TorusGeometry(0.35, 0.12, 8, 16);
            const wheelMaterial = new THREE.MeshBasicMaterial({
                color: 0x333333,
                wireframe: true,
                transparent: true,
                opacity: 0.7,
            });

            const wheelPositions = [
                [-2, 0, 0.8],   // Front left
                [-2, 0, -0.8],  // Front right
                [2.2, 0, 0.9],  // Rear left
                [2.2, 0, -0.9], // Rear right
            ];

            wheelPositions.forEach(pos => {
                const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
                wheel.position.set(pos[0], pos[1], pos[2]);
                wheel.rotation.y = Math.PI / 2;
                carGroup.add(wheel);
            });

            // Halo (cockpit protection)
            const haloGeometry = new THREE.TorusGeometry(0.3, 0.05, 8, 16, Math.PI);
            const haloMaterial = new THREE.MeshBasicMaterial({
                color: 0x666666,
                transparent: true,
                opacity: 0.8,
            });
            const halo = new THREE.Mesh(haloGeometry, haloMaterial);
            halo.position.set(0.5, 1.1, 0);
            halo.rotation.y = Math.PI / 2;
            halo.rotation.x = -Math.PI / 2;
            carGroup.add(halo);

            return carGroup;
        };

        // Create 3 F1 cars with different team colors
        const car1 = createF1Car(0xfacc15, 'Mercedes'); // Yellow - Leading
        const car2 = createF1Car(0xff0000, 'Ferrari');  // Red
        const car3 = createF1Car(0x00ff00, 'Aston');   // Green

        // Cars group
        const carsGroup = new THREE.Group();
        carsGroup.add(car1);
        carsGroup.add(car2);
        carsGroup.add(car3);
        scene.add(carsGroup);

        // Speed trail particles for cars
        const createSpeedTrails = (carColor: number) => {
            const trailGeometry = new THREE.BufferGeometry();
            const positions = new Float32Array(50 * 3);
            trailGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

            const trailMaterial = new THREE.PointsMaterial({
                color: carColor,
                size: 0.15,
                transparent: true,
                opacity: 0.6,
            });

            const trail = new THREE.Points(trailGeometry, trailMaterial);
            return { mesh: trail, positions: [] as THREE.Vector3[] };
        };

        const trail1 = createSpeedTrails(0xfacc15);
        const trail2 = createSpeedTrails(0xff0000);
        const trail3 = createSpeedTrails(0x00ff00);

        scene.add(trail1.mesh);
        scene.add(trail2.mesh);
        scene.add(trail3.mesh);

        // Racing line positions on track
        const getTrackPosition = (progress: number, offset: number = 0) => {
            const t = progress * Math.PI * 2;
            const x = Math.cos(t) * 15 + Math.sin(t * 2) * 2.5 + offset * Math.cos(t + Math.PI / 2);
            const z = Math.sin(t) * 10 + offset * Math.sin(t + Math.PI / 2);
            return { x, z };
        };

        // Car states
        const carStates = [
            { car: car1, progress: 0, speed: 0.003, offset: 0, trail: trail1 },
            { car: car2, progress: 0.33, speed: 0.0028, offset: 1.5, trail: trail2 },
            { car: car3, progress: 0.66, speed: 0.0025, offset: -1.5, trail: trail3 },
        ];

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
                // Smooth mouse following
                mouseRef.current.x += (targetRef.current.x - mouseRef.current.x) * 0.08;
                mouseRef.current.y += (targetRef.current.y - mouseRef.current.y) * 0.08;

                // Update cars position on track
                carStates.forEach((state, index) => {
                    // Update progress
                    state.progress += state.speed;
                    if (state.progress > 1) state.progress -= 1;

                    // Get position on track
                    const pos = getTrackPosition(state.progress, state.offset);

                    // Add mouse influence - cars react to cursor
                    const mouseInfluenceX = mouseRef.current.x * 3;
                    const mouseInfluenceZ = mouseRef.current.y * 2;

                    state.car.position.x = pos.x + mouseInfluenceX * (0.3 + index * 0.1);
                    state.car.position.z = pos.z + mouseInfluenceZ * (0.3 + index * 0.1);

                    // Rotate car to face direction
                    const nextPos = getTrackPosition(state.progress + 0.01, state.offset);
                    const angle = Math.atan2(nextPos.z - pos.z, nextPos.x - pos.x);
                    state.car.rotation.y = angle;

                    // Update trail
                    state.trail.positions.push(new THREE.Vector3(pos.x, 0.5, pos.z));
                    if (state.trail.positions.length > 50) {
                        state.trail.positions.shift();
                    }

                    const positions = state.trail.mesh.geometry.attributes.position.array as Float32Array;
                    for (let i = 0; i < state.trail.positions.length; i++) {
                        positions[i * 3] = state.trail.positions[i].x + mouseInfluenceX * 0.2;
                        positions[i * 3 + 1] = 0.5;
                        positions[i * 3 + 2] = state.trail.positions[i].z + mouseInfluenceZ * 0.2;
                    }
                    state.trail.mesh.geometry.attributes.position.needsUpdate = true;
                    state.trail.mesh.geometry.setDrawRange(0, state.trail.positions.length);
                });

                // Camera follows action with mouse influence
                camera.position.x = mouseRef.current.x * 5;
                camera.position.y = 15 + mouseRef.current.y * 3;
                camera.lookAt(
                    mouseRef.current.x * 2,
                    0,
                    mouseRef.current.y * 2
                );

                // Subtle track rotation
                track.rotation.y = mouseRef.current.x * 0.05;

                // Pulsing effect on track lines
                track.children.forEach((child, i) => {
                    if (child instanceof THREE.Line && child.material) {
                        const material = child.material as THREE.LineBasicMaterial;
                        material.opacity = 0.4 + Math.sin(time * 2 + i) * 0.15;
                    }
                });
            }

            renderer.render(scene, camera);
        };

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

            scene.traverse((object) => {
                if (object instanceof THREE.Mesh) {
                    object.geometry?.dispose();
                    if (object.material instanceof THREE.Material) {
                        object.material.dispose();
                    }
                }
            });

            renderer.dispose();
            scene.clear();

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
