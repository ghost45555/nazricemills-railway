import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SectionHeaderComponent } from '../shared/components/section-header/section-header.component';
import { CertificateFrameComponent } from '../shared/components/certificate-frame/certificate-frame.component';
import Swiper from 'swiper';
import { Navigation, Pagination, EffectCoverflow, Autoplay } from 'swiper/modules';
import { register } from 'swiper/element/bundle';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-coverflow';

register();

interface Certificate {
  image: string;
  alt: string;
  name: string;
  description?: string;
}

@Component({
  selector: 'app-certification-section',
  standalone: true,
  imports: [CommonModule, SectionHeaderComponent, CertificateFrameComponent],
  templateUrl: './certification-section.component.html',
  styleUrl: './certification-section.component.css'
})
export class CertificationSectionComponent {
  certificates: Certificate[] = [
    {
      image: 'assets/img/certifications/certificate-1.jpg',
      alt: 'ISO 9001:2015 Quality Management',
      name: 'ISO 9001:2015',
      description: 'Quality Management System'
    },
    {
      image: 'assets/img/certifications/certificate-2.jpg',
      alt: 'ISO 22000:2018 Food Safety',
      name: 'ISO 22000:2018',
      description: 'Food Safety Management'
    },
    {
      image: 'assets/img/certifications/certificate-3.jpg',
      alt: 'HACCP Certified',
      name: 'HACCP',
      description: 'Hazard Analysis & Critical Control Points'
    },
    {
      image: 'assets/img/certifications/certificate-4.jpg',
      alt: 'Halal Certification',
      name: 'Halal',
      description: 'Halal Food Certification'
    }
  ];
  swiper: Swiper | null = null;
  modalOpen = false;
  modalCert: Certificate | null = null;

  ngAfterViewInit() {
    this.swiper = new Swiper('.certifications-swiper', {
      modules: [Navigation, Pagination, EffectCoverflow, Autoplay],
      slidesPerView: 1.2,
      spaceBetween: 48,
      loop: true,
      effect: 'coverflow',
      coverflowEffect: {
        rotate: 32,
        stretch: 0,
        depth: 220,
        modifier: 1.1,
        slideShadows: true,
        scale: 0.92
      },
      speed: 800,
      grabCursor: true,
      centeredSlides: true,
      autoplay: {
        delay: 6000,
        disableOnInteraction: false,
        pauseOnMouseEnter: true
      },
      navigation: {
        nextEl: '.cert-swiper-next',
        prevEl: '.cert-swiper-prev',
      },
      pagination: {
        el: '.cert-swiper-pagination',
        clickable: true,
        bulletClass: 'slider-bullet',
        bulletActiveClass: 'slider-bullet-active'
      },
      breakpoints: {
        900: {
          slidesPerView: 2.2,
          spaceBetween: 64
        },
        1400: {
          slidesPerView: 2.7,
          spaceBetween: 96
        }
      }
    });
  }

  openModal(cert: Certificate) {
    this.modalCert = cert;
    this.modalOpen = true;
    document.body.style.overflow = 'hidden';
  }
  closeModal() {
    this.modalOpen = false;
    this.modalCert = null;
    document.body.style.overflow = '';
  }
}
