import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { X } from 'lucide-react';
import type { Node as GraphNode, Edge } from '../lib/graph';

interface ARVisualizationProps {
  pathNodes: GraphNode[];
  pathEdges: Edge[];
  onClose: () => void;
}

export default function ARVisualization({ pathNodes, pathEdges, onClose }: ARVisualizationProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a2e);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = 100;
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const lighting = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(lighting);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
    directionalLight.position.set(100, 100, 100);
    scene.add(directionalLight);

    const nodeMaterial = new THREE.MeshStandardMaterial({
      color: 0x0ea5e9,
      metalness: 0.5,
      roughness: 0.3,
    });

    const startNodeMaterial = new THREE.MeshStandardMaterial({
      color: 0x10b981,
      metalness: 0.5,
      roughness: 0.3,
      emissive: 0x10b981,
      emissiveIntensity: 0.5,
    });

    const endNodeMaterial = new THREE.MeshStandardMaterial({
      color: 0xef4444,
      metalness: 0.5,
      roughness: 0.3,
      emissive: 0xef4444,
      emissiveIntensity: 0.5,
    });

    const nodeGeometry = new THREE.SphereGeometry(3, 32, 32);

    pathNodes.forEach((node, index) => {
      let material = nodeMaterial;
      let scale = 1;

      if (index === 0) {
        material = startNodeMaterial;
        scale = 1.5;
      } else if (index === pathNodes.length - 1) {
        material = endNodeMaterial;
        scale = 1.5;
      }

      const sphereMesh = new THREE.Mesh(nodeGeometry, material.clone());
      sphereMesh.position.set(node.coordinates.x, node.coordinates.y, 0);
      sphereMesh.scale.set(scale, scale, scale);
      sphereMesh.userData = { nodeId: node.id, nodeName: node.name };
      scene.add(sphereMesh);

      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 128;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(node.name, 128, 64);
      }

      const texture = new THREE.CanvasTexture(canvas);
      const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
      const sprite = new THREE.Sprite(spriteMaterial);
      sprite.position.set(node.coordinates.x, node.coordinates.y + 8, 1);
      sprite.scale.set(20, 10, 1);
      scene.add(sprite);
    });

    pathEdges.forEach((edge) => {
      const startNode = pathNodes.find((n) => n.id === edge.from);
      const endNode = pathNodes.find((n) => n.id === edge.to);

      if (startNode && endNode) {
        const points = [
          new THREE.Vector3(startNode.coordinates.x, startNode.coordinates.y, 0),
          new THREE.Vector3(endNode.coordinates.x, endNode.coordinates.y, 0),
        ];

        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial({
          color: 0x0ea5e9,
          linewidth: 3,
        });
        const line = new THREE.Line(geometry, material);
        scene.add(line);

        const arrowGeometry = new THREE.ConeGeometry(2, 5, 8);
        const arrowMaterial = new THREE.MeshStandardMaterial({ color: 0x0ea5e9 });
        const arrow = new THREE.Mesh(arrowGeometry, arrowMaterial);

        const direction = new THREE.Vector3(
          endNode.coordinates.x - startNode.coordinates.x,
          endNode.coordinates.y - startNode.coordinates.y,
          0
        ).normalize();

        const midpoint = new THREE.Vector3(
          (startNode.coordinates.x + endNode.coordinates.x) / 2,
          (startNode.coordinates.y + endNode.coordinates.y) / 2,
          0
        );

        arrow.position.copy(midpoint);
        arrow.lookAt(midpoint.clone().add(direction));
        scene.add(arrow);
      }
    });

    let rotationX = 0;
    let rotationY = 0;
    let targetRotationX = 0;
    let targetRotationY = 0;

    const handleMouseMove = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      targetRotationX = ((event.clientY - rect.top) / height - 0.5) * 2;
      targetRotationY = ((event.clientX - rect.left) / width - 0.5) * 2;
    };

    renderer.domElement.addEventListener('mousemove', handleMouseMove);

    const animate = () => {
      requestAnimationFrame(animate);

      rotationX += (targetRotationX - rotationX) * 0.05;
      rotationY += (targetRotationY - rotationY) * 0.05;

      camera.position.x = 100 * Math.sin(rotationY) * Math.cos(rotationX);
      camera.position.y = 100 * Math.sin(rotationX);
      camera.position.z = 100 * Math.cos(rotationY) * Math.cos(rotationX);

      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      const newWidth = containerRef.current?.clientWidth || width;
      const newHeight = containerRef.current?.clientHeight || height;

      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('mousemove', handleMouseMove);
      renderer.dispose();
      containerRef.current?.removeChild(renderer.domElement);
    };
  }, [pathNodes, pathEdges]);

  return (
    <div className="fixed inset-0 z-50 bg-black/80">
      <div className="h-full w-full" ref={containerRef} />
      <button
        onClick={onClose}
        className="absolute top-4 right-4 bg-white rounded-full p-2 hover:bg-slate-200 transition-colors"
      >
        <X className="w-6 h-6 text-slate-900" />
      </button>
      <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm p-4 rounded-lg max-w-xs">
        <p className="text-sm text-slate-600 mb-2">
          <strong>AR Navigation View</strong>
        </p>
        <p className="text-xs text-slate-500">
          Move your mouse to rotate the view. Green sphere = Start, Red sphere = End
        </p>
      </div>
    </div>
  );
}
