require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors()); // Autorise Angular à appeler ce serveur
app.use(express.json());

// Configuration Nodemailer (Gmail Example)
// IMPORTANT: Utilisez un "App Password" si vous utilisez Gmail avec 2FA
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Endpoint d'envoi
app.post('/send-email', async (req, res) => {
  const { type, to, data } = req.body;
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@gmail.com';

  let mailOptions = {
    from: `"Kyranis Park" <${process.env.EMAIL_USER}>`,
    to: to,
    subject: 'Kyranis Park Info',
    html: ''
  };

  try {
    // Logique de template
    switch (type) {
      case 'confirmation':
        mailOptions.subject = 'Confirmation de Réservation - Kyranis Park';
        mailOptions.html = `
          <h2>Bonjour ${data.name},</h2>
          <p>Votre demande de réservation est bien enregistrée.</p>
          <ul>
            <li><strong>Date :</strong> ${data.date} à ${data.time}</li>
            <li><strong>Activité :</strong> ${data.type}</li>
            <li><strong>Prix estimé :</strong> ${data.price} TND</li>
          </ul>
          <p>Nous vous contacterons bientôt pour valider les détails.</p>
        `;
        break;

      case 'admin_notification':
        mailOptions.to = adminEmail;
        mailOptions.subject = '🔔 Nouvelle Réservation Reçue';
        mailOptions.html = `
          <h3>Nouvelle demande !</h3>
          <p><strong>Client :</strong> ${data.clientName}</p>
          <p><strong>Tél :</strong> ${data.phone}</p>
          <p><strong>Date :</strong> ${data.date}</p>
          <p><strong>Statut :</strong> ${data.status}</p>
          <br>
          <a href="https://kyranispark.tn/admin">Voir dans le Dashboard</a>
        `;
        break;

      case 'contact_reply':
        mailOptions.subject = 'Nous avons reçu votre message';
        mailOptions.html = `
          <h3>Bonjour ${data.name},</h3>
          <p>Merci de nous avoir contactés. Notre équipe va traiter votre demande dans les plus brefs délais.</p>
          <hr>
          <p><em>Votre message :</em> ${data.originalMessage}</p>
        `;
        break;

      default:
        return res.status(400).json({ error: 'Type d\'email invalide' });
    }

    // Envoi réel
    await transporter.sendMail(mailOptions);
    console.log(`Email [${type}] envoyé à ${mailOptions.to}`);
    res.status(200).json({ success: true, message: 'Email envoyé' });

  } catch (error) {
    console.error('Erreur Nodemailer:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Serveur Email démarré sur http://localhost:${PORT}`);
});
