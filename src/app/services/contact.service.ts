import { Injectable } from '@angular/core';
import { Observable, from } from 'rxjs';
import emailjs from '@emailjs/browser';

@Injectable({
  providedIn: 'root'
})
export class ContactService {
  private readonly SERVICE_ID = 'service_uog42tf';  // Replace with your Service ID
  private readonly TEMPLATE_ID = 'template_5plyf3w'; // Replace with your Template ID
  private readonly PUBLIC_KEY = 'T2yB54myP9eMgDHmZ';   // Replace with your Public Key

  constructor() {
    emailjs.init(this.PUBLIC_KEY);
  }

  submitContactForm(formData: any): Observable<any> {
    const templateParams = {
      to_email: 'ghosts45555@gmail.com',
      from_name: formData.name,
      from_email: formData.email,
      phone: formData.phone,
      message: formData.message
    };

    return from(
      emailjs.send(
        this.SERVICE_ID,
        this.TEMPLATE_ID,
        templateParams
      )
    );
  }
}