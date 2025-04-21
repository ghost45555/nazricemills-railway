import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as THREE from 'three';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Swiper from 'swiper';
import type { SwiperOptions } from 'swiper/types';
import { Navigation, Pagination, EffectCreative, Autoplay } from 'swiper/modules';
import { register } from 'swiper/element/bundle';
import { AnimationService } from '../../services/animation.service';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-creative';
import { HeroComponent } from "../../shared/components/hero/hero.component";
import { SectionHeaderComponent } from "../../shared/components/section-header/section-header.component";
import { AnimatedIconComponent } from "../../shared/components/animated-icon/animated-icon.component";
import { RouterLink } from '@angular/router';

gsap.registerPlugin(ScrollTrigger);

// Register Swiper custom elements
register();

interface Stat {
  value: string;
  label: string;
  icon: string;
}

interface CompanyValue {
  icon: string;
  title: string;
  description: string;
  quote: string;
  stats: Array<{ number: string; text: string; }>;
}

interface Milestone {
  year: string;
  title: string;
  description: string;
  media?: {
    image: string;
    caption: string;
  };
}

interface TeamMember {
  image: string;
  name: string;
  position: string;
  bio: string;
  social: Array<{ icon: string; url: string; }>;
}

interface GlobalLocation {
  name: string;
  exportVolume: string;
  description: string;
  coordinates: [number, number];
}

interface HeritageImage {
  src: string;
  alt: string;
  caption: string;
}

interface HeritageHighlight {
  icon: string;
  title: string;
  description: string;
}

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.css'],
  standalone: true,
  imports: [CommonModule, HeroComponent, SectionHeaderComponent, AnimatedIconComponent,RouterLink],
  providers: [AnimationService]
})
export class AboutComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('teamSlider') teamSlider!: ElementRef;
  @ViewChild('globeContainer') globeContainer!: ElementRef;

  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private swiper: Swiper | null = null;
  private animationFrame: number = 0;
  isLoading = true;
  selectedLocation: GlobalLocation | null = null;
  imagesLoaded = false;

  // Optimize performance by using private fields
  private readonly intersectionObserver: IntersectionObserver;
  private readonly resizeObserver: ResizeObserver;
  private isDestroyed = false;

  // Initialize with default values
  stats: Stat[] = [
    { value: '35+', label: 'Years of Innovation', icon: 'history' },
    { value: '42', label: 'Global Markets', icon: 'globe' },
    { value: '500K', label: 'Annual Production', icon: 'chart' },
    { value: '10K+', label: 'Partner Families', icon: 'community' }
  ];

  companyValues: CompanyValue[] = [
    {
      icon: 'quality-control',
      title: 'Uncompromising Quality',
      description: 'We maintain rigorous quality control at every stage of processing.',
      quote: 'Excellence is not an act, but a habit.',
      stats: [
        { number: '99.9%', text: 'Quality Approval Rate' },
        { number: '24/7', text: 'Quality Monitoring' }
      ]
    },
    {
      icon: 'sustainability',
      title: 'Sustainability',
      description: 'Committed to environmentally responsible farming and processing practices.',
      quote: 'Preserving nature for future generations.',
      stats: [
        { number: '40%', text: 'Reduced Carbon Footprint' },
        { number: '100%', text: 'Renewable Energy' }
      ]
    },
    {
      icon: 'innovation',
      title: 'Innovation',
      description: 'Continuously improving our processes with cutting-edge technology.',
      quote: 'Tomorrow\'s solutions, today.',
      stats: [
        { number: '5M+', text: 'R&D Investment' },
        { number: '12', text: 'Patents Held' }
      ]
    },
    {
      icon: 'community',
      title: 'Community',
      description: 'Supporting local farmers and communities through sustainable partnerships.',
      quote: 'Growing together, prospering together.',
      stats: [
        { number: '10K+', text: 'Farmer Families' },
        { number: '15+', text: 'Community Programs' }
      ]
    }
  ];

  milestones: Milestone[] = [
    {
      year: '1985',
      title: 'Foundation',
      description: 'Established with a vision to revolutionize rice processing in Pakistan.',
      media: {
        image: 'assets/img/history/foundation.jpeg',
        caption: 'Our first facility'
      }
    },
    {
      year: '1995',
      title: 'International Expansion',
      description: 'Began exporting premium rice to international markets.',
      media: {
        image: 'assets/img/history/expansion.jpeg',
        caption: 'First international shipment'
      }
    },
    {
      year: '1990',
      title: 'First Export',
      description: 'Achieved our first international export milestone, marking our entry into the global market.',
      media: {
        image: 'assets/img/history/first-export.jpeg',
        caption: 'First shipment leaving for Dubai'
      }
    },
    {
      year: '2000',
      title: 'Quality Certification',
      description: 'Received ISO 9001 certification, validating our commitment to quality.',
      media: {
        image: 'assets/img/history/certification.jpeg',
        caption: 'ISO certification ceremony'
      }
    },
    {
      year: '2005',
      title: 'Expansion',
      description: 'Doubled production capacity with a new state-of-the-art facility.',
      media: {
        image: 'assets/img/history/expansion2.jpeg',
        caption: 'Aerial view of our expanded facility'
      }
    },
    {
      year: '2010',
      title: 'Sustainability Initiative',
      description: 'Launched comprehensive sustainability program focusing on environmental responsibility.',
      media: {
        image: 'assets/img/history/sustainability.jpeg',
        caption: 'Solar panel installation at our facility'
      }
    },
    {
      year: '2015',
      title: 'Global Recognition',
      description: 'Awarded "Best Rice Exporter" at the International Food Exhibition.',
      media: {
        image: 'assets/img/history/award.jpeg',
        caption: 'Receiving the prestigious award'
      }
    },
    {
      year: '2020',
      title: 'Digital Transformation',
      description: 'Implemented AI-driven quality control and smart processing systems.',
      media: {
        image: 'assets/img/history/digital.jpeg',
        caption: 'Our new AI-powered quality control center'
      }
    },
    {
      year: '2023',
      title: 'Future Forward',
      description: 'Launched research center for sustainable farming practices and rice varieties.',
      media: {
        image: 'assets/img/history/research.jpeg',
        caption: 'Our new research and development center'
      }
    }
  ];

  teamMembers: TeamMember[] = [
    {
      image: 'assets/img/team/ceo.jpg',
      name: 'Muhammad Nazir',
      position: 'Founder & CEO',
      bio: 'With over 40 years of experience in the rice industry, Muhammad has led Naz Rice Mills from a small local mill to a global leader in premium rice processing.',
      social: [
        { icon: 'fab fa-linkedin', url: '#' },
        { icon: 'fab fa-twitter', url: '#' }
      ]
    },
    {
      image: 'assets/img/team/coo.jpg',
      name: 'Muhammad Ahmed',
      position: 'Chief Operations Officer',
      bio: 'A seasoned operations expert with 15 years of experience in optimizing production processes and implementing sustainable practices.',
      social: [
        { icon: 'fab fa-linkedin', url: '#' },
        { icon: 'fab fa-instagram', url: '#' }
      ]
    },
    {
      image: 'assets/img/team/cto.jpg',
      name: 'Dr. Ali Hassan',
      position: 'Chief Technology Officer',
      bio: 'Leading our digital transformation with expertise in AI and automation. PhD in Food Processing Technology from MIT.',
      social: [
        { icon: 'fab fa-linkedin', url: '#' },
        { icon: 'fab fa-github', url: '#' }
      ]
    },
    {
      image: 'assets/img/team/quality-head.jpg',
      name: 'Muhammad Khan',
      position: 'Head of Quality Assurance',
      bio: 'International food safety expert ensuring our products meet the highest global standards. Former WHO food safety consultant.',
      social: [
        { icon: 'fab fa-linkedin', url: '#' },
        { icon: 'fab fa-twitter', url: '#' }
      ]
    },
    {
      image: 'assets/img/team/sustainability.jpg',
      name: 'Zain Rahman',
      position: 'Sustainability Director',
      bio: 'Environmental scientist spearheading our eco-friendly initiatives and sustainable farming practices across the region.',
      social: [
        { icon: 'fab fa-linkedin', url: '#' },
        { icon: 'fab fa-instagram', url: '#' }
      ]
    },
    {
      image: 'assets/img/team/export-head.jpg',
      name: 'Aisha Malik',
      position: 'Global Export Director',
      bio: 'International trade expert managing our global distribution network across 42 countries. MBA from London Business School.',
      social: [
        { icon: 'fab fa-linkedin', url: '#' },
        { icon: 'fab fa-twitter', url: '#' }
      ]
    }
  ];

  globalLocations: GlobalLocation[] = [
    {
      name: 'United Arab Emirates',
      exportVolume: '120,000 tons/year',
      description: 'Our largest export market in the Middle East, serving as a central distribution hub for premium rice varieties.',
      coordinates: [55.307, 25.276]
    },
    {
      name: 'Saudi Arabia',
      exportVolume: '85,000 tons/year',
      description: 'Strategic market with growing demand for premium basmati rice and specialty varieties.',
      coordinates: [45.079, 23.886]
    },
    {
      name: 'United Kingdom',
      exportVolume: '45,000 tons/year',
      description: 'European flagship market with strong presence in premium retail chains and restaurants.',
      coordinates: [-0.118, 51.509]
    },
    {
      name: 'Singapore',
      exportVolume: '35,000 tons/year',
      description: 'Key distribution center for Southeast Asian markets, known for quality standards.',
      coordinates: [103.851, 1.290]
    },
    {
      name: 'United States',
      exportVolume: '50,000 tons/year',
      description: 'Growing market for organic and specialty rice varieties, focused on health-conscious consumers.',
      coordinates: [-95.712, 37.090]
    },
    {
      name: 'Australia',
      exportVolume: '25,000 tons/year',
      description: 'Premium market with emphasis on sustainable farming practices and organic certification.',
      coordinates: [133.775, -25.274]
    },
    {
      name: 'Canada',
      exportVolume: '30,000 tons/year',
      description: 'Expanding presence in high-end retail and specialty food segments.',
      coordinates: [-106.346, 56.130]
    },
    {
      name: 'Germany',
      exportVolume: '40,000 tons/year',
      description: 'Central European hub with strong focus on quality and sustainability standards.',
      coordinates: [10.451, 51.165]
    },
    {
      name: 'Japan',
      exportVolume: '20,000 tons/year',
      description: 'Exclusive market segment focusing on ultra-premium rice varieties and specialty products.',
      coordinates: [138.252, 36.204]
    },
    {
      name: 'South Africa',
      exportVolume: '15,000 tons/year',
      description: 'Strategic gateway to African markets with growing premium segment presence.',
      coordinates: [22.937, -30.559]
    }
  ];

  heritageImages: HeritageImage[] = [
    {
      src: 'assets/img/heritage/process1.jpg',
      alt: 'Rice Processing',
      caption: 'State-of-the-art Processing'
    },
    {
      src: 'assets/img/heritage/farming.jpg',
      alt: 'Sustainable Farming',
      caption: 'Sustainable Practices'
    },
    {
      src: 'assets/img/heritage/quality.jpg',
      alt: 'Quality Control',
      caption: 'Quality Assurance'
    }
  ];

  heritageHighlights: HeritageHighlight[] = [
    {
      icon: 'innovation',
      title: 'Pioneering Innovation',
      description: 'Leading the industry with cutting-edge processing technology and sustainable practices.'
    },
    {
      icon: 'quality',
      title: 'Unmatched Quality',
      description: 'Rigorous quality control at every stage ensures premium grade rice for our customers.'
    },
    {
      icon: 'global',
      title: 'Global Impact',
      description: 'Supporting communities and delivering excellence across 42 countries worldwide.'
    }
  ];

  constructor(public animationService: AnimationService) {
    // Initialize observers in constructor
    this.intersectionObserver = new IntersectionObserver(
      this.handleIntersection.bind(this),
      { threshold: 0.2 }
    );

    this.resizeObserver = new ResizeObserver(
      this.handleResize.bind(this)
    );
  }

  ngOnInit(): void {
    if (typeof window !== 'undefined') {
      this.initializePerformanceOptimizations();
    }
    this.isLoading = true;
  }

  ngAfterViewInit(): void {
    // Optimize loading sequence
    Promise.resolve().then(() => this.loadCriticalAssets())
      .then(() => {
        if (this.isDestroyed) return;
        
        this.isLoading = false;
        this.initializeEssentialAnimations();
        
        requestAnimationFrame(() => {
          if (this.isDestroyed) return;
          this.initializeComponents();
        });
      });

    // Optimize observer usage
    this.observeLeaderCards();
  }

  ngOnDestroy(): void {
    this.isDestroyed = true;
    this.cleanup();
  }

  private initializeComponents(): void {
    if (this.teamSlider?.nativeElement) {
      this.initializeTeamSlider();
    }
    if (this.globeContainer?.nativeElement) {
      this.initializeGlobe();
    }
    this.initializeValueCards();
    this.initializeTimeline();
  }

  private handleIntersection(entries: IntersectionObserverEntry[]): void {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        this.intersectionObserver.unobserve(entry.target);
      }
    });
  }

  private handleResize(): void {
    if (this.renderer && this.camera) {
      const container = this.globeContainer.nativeElement;
      const width = container.clientWidth;
      const height = container.clientHeight;
      
      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(width, height);
    }
  }

  private cleanup(): void {
    // Cleanup resources
    this.swiper?.destroy();
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
    this.renderer?.dispose();
    this.intersectionObserver.disconnect();
    this.resizeObserver.disconnect();
  }

  private initializeTeamSlider(): void {
    const swiperConfig: SwiperOptions = {
      modules: [Pagination, EffectCreative, Autoplay],
      slidesPerView: "auto" as const,
      centeredSlides: true,
      loop: true,
      speed: 1000,
      grabCursor: true,
      initialSlide: 1,
      spaceBetween: 30,
      effect: 'creative',
      creativeEffect: {
        prev: {
          translate: ['-85%', 0, -1],
          scale: 0.85,
          opacity: 0.5
        },
        next: {
          translate: ['85%', 0, 0],
          scale: 0.85,
          opacity: 0.5
        }
      },
      breakpoints: {
        320: {
          slidesPerView: 'auto',
          spaceBetween: 20
        },
        768: {
          slidesPerView: 3,
          spaceBetween: 30
        }
      },
      autoplay: {
        delay: 5000,
        disableOnInteraction: false,
        pauseOnMouseEnter: true
      },
      pagination: {
        el: '.slider-pagination',
        clickable: true,
        bulletClass: 'slider-bullet',
        bulletActiveClass: 'slider-bullet-active'
      }
    };

    this.swiper = new Swiper(this.teamSlider.nativeElement, swiperConfig);
  }

  private initializeGlobe(): void {
    if (!this.globeContainer?.nativeElement) return;

    const container = this.globeContainer.nativeElement;
    const { width, height } = container.getBoundingClientRect();

    // Initialize Three.js scene with optimized settings
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });

    this.setupGlobeScene(container, width, height);
  }

  private setupGlobeScene(container: HTMLElement, width: number, height: number): void {
    this.renderer.setSize(width, height);
    container.appendChild(this.renderer.domElement);

    // Optimize lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
    directionalLight.position.set(1, 1, 1);
    
    this.scene.add(ambientLight, directionalLight);

    // Create optimized globe geometry
    const globeGeometry = new THREE.SphereGeometry(5, 64, 64);
    const globeMaterial = new THREE.MeshPhongMaterial({
      color: 0xb38c3d,
      shininess: 30
    });
    const globe = new THREE.Mesh(globeGeometry, globeMaterial);
    this.scene.add(globe);

    this.camera.position.z = 15;

    // Optimize animation loop
    const animate = () => {
      if (this.isDestroyed) return;
      
      this.animationFrame = requestAnimationFrame(animate);
      globe.rotation.y += 0.002;
      this.renderer.render(this.scene, this.camera);
    };
    animate();

    // Optimize resize handling
    this.resizeObserver.observe(container);
  }

  private initializePerformanceOptimizations(): void {
    // Remove duplicate observer
    // const observer = new IntersectionObserver...
  }

  private loadCriticalAssets(): Promise<void> {
    return new Promise((resolve) => {
      document.querySelector('.about-page')?.classList.add('loaded');
      setTimeout(resolve, 500);
    });
  }

  private initializeEssentialAnimations(): void {
    this.initializeValueCards();
    this.initializeTimeline();
  }

  private initializeValueCards(): void {
    // Create a single observer that disconnects after all cards are animated
    let cardsToAnimate = document.querySelectorAll('.value-card').length;
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
          cardsToAnimate--;
          
          // Disconnect observer when all cards are animated
          if (cardsToAnimate === 0) {
            observer.disconnect();
          }
        }
      });
    }, { threshold: 0.2 });

    document.querySelectorAll('.value-card').forEach((card: Element) => {
      observer.observe(card);
    });
  }

  private initializeTimeline(): void {
    document.querySelectorAll('.timeline-item').forEach(item => {
      this.animationService.observeElement(item, {
        threshold: 0.2,
        once: true
      }).subscribe(isVisible => {
        if (isVisible) {
          item.classList.add('visible');
        }
      });
    });
  }

  showLocationInfo(location: GlobalLocation): void {
    this.selectedLocation = location;
  }

  closeLocationInfo(): void {
    this.selectedLocation = null;
  }

  private observeLeaderCards(): void {
    const leaderCards = document.querySelectorAll('.leader-card');
    leaderCards.forEach(card => {
      this.intersectionObserver.observe(card);
    });
  }
}
