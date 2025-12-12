import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Firestore, collection, addDoc, Timestamp } from '@angular/fire/firestore';

import { FooterComponent } from '../../components/footer/footer.component';
@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FooterComponent],
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss']
})
export class ContactComponent {
  private fb = inject(FormBuilder);
  private firestore = inject(Firestore);

  contactForm: FormGroup;
  isSubmitting = false;
  submitSuccess = false;

  constructor() {
    this.contactForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: [''], // Optionnel
      subject: ['Question', Validators.required], // Valeur par défaut
      message: ['', [Validators.required, Validators.minLength(10)]],
      acceptTerms: [false, Validators.requiredTrue]
    });
  }

  async onSubmit() {
    if (this.contactForm.invalid) {
      this.contactForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;

    try {
      const formData = this.contactForm.value;
      
      // Préparation de l'objet pour Firestore
      const contactData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone || null,
        subject: formData.subject,
        message: formData.message,
        createdAt: Timestamp.now(),
        status: 'new' // Pour gestion admin future
      };

      // Enregistrement dans la collection 'contacts'
      const contactsRef = collection(this.firestore, 'contacts');
      await addDoc(contactsRef, contactData);

      this.submitSuccess = true;
      this.contactForm.reset({ subject: 'Question' }); // Reset gardant le sujet par défaut
      
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message', error);
      alert('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      this.isSubmitting = false;
    }
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.contactForm.get(fieldName);
    return field ? (field.invalid && (field.dirty || field.touched)) : false;
  }
}
