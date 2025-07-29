import { Injectable } from '@angular/core';
import * as THREE from 'three';

interface GlobalLocation {
  lat: number;
  lng: number;
  name: string;
}

@Injectable({
  providedIn: 'root'
})
export class GlobeService {
  private renderer?: THREE.WebGLRenderer;
  private scene?: THREE.Scene;
  private camera?: THREE.OrthographicCamera;
  private globe?: THREE.Mesh;
  private markers: THREE.Group = new THREE.Group();
  private isAnimating = false;

  initializeGlobe(container: HTMLElement, locations: GlobalLocation[]): void {
    // Create scene with optimized settings
    this.scene = new THREE.Scene();
    
    // Use orthographic camera for better performance
    const aspect = container.clientWidth / container.clientHeight;
    this.camera = new THREE.OrthographicCamera(-5 * aspect, 5 * aspect, 5, -5, 1, 1000);
    
    // Optimize renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: false,
      alpha: true,
      powerPreference: 'high-performance'
    });
    
    // Use lower resolution textures and geometries for mobile
    const isMobile = window.innerWidth < 768;
    const segments = isMobile ? 32 : 64;
    
    // Use shared geometries and materials
    const geometry = new THREE.SphereGeometry(5, segments, segments);
    const material = new THREE.MeshPhongMaterial({
      color: 0xb38c3d,
      shininess: 30
    });

    this.globe = new THREE.Mesh(geometry, material);
    this.scene.add(this.globe);
    
    // Batch create markers
    this.createMarkers(locations);
    
    // Optimize animation loop
    this.startAnimation();
  }

  private createMarkers(locations: GlobalLocation[]): void {
    // Implementation for creating markers
    // This is a placeholder - you can implement marker creation logic here
    locations.forEach(location => {
      // Create marker logic here
    });
  }

  private startAnimation(): void {
    if (this.isAnimating) return;
    this.isAnimating = true;

    let lastTime = 0;
    const animate = (time: number) => {
      if (!this.isAnimating) return;
      
      if (time - lastTime > 16.67) { // Cap at 60fps
        this.renderer?.render(this.scene!, this.camera!);
        lastTime = time;
      }
      
      requestAnimationFrame(animate);
    };
    
    requestAnimationFrame(animate);
  }
} 