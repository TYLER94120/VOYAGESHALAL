import { NextRequest, NextResponse } from 'next/server'
import { getRedis } from '@/lib/pushStore'

export const runtime = 'nodejs'

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

// Email de bienvenue = le « guide gratuit » livré directement dans la boîte mail.
// Envoyé via l'API transactionnelle Brevo (aucun template à configurer côté dashboard).
function welcomeEmail(en: boolean) {
  const brand = en ? 'GoHalalTravel' : 'VoyagesHalal'
  const site = en ? 'https://www.gohalaltravel.com' : 'https://www.voyageshalal.fr'
  const subject = en
    ? 'Your free halal travel guide 🌙'
    : 'Votre guide voyage halal gratuit 🌙'
  const link = (path: string, label: string) =>
    `<li style="margin:6px 0"><a href="${site}${path}" style="color:#1a6b3c">${label}</a></li>`
  const htmlContent = en
    ? `<div style="font-family:Georgia,serif;max-width:560px;margin:0 auto;color:#1a3a2a">
<h2 style="color:#1a3a2a">Welcome to ${brand} 🌙</h2>
<p>Thank you for joining! Here is your free guide — our most useful resources for traveling as a Muslim:</p>
<ul>
${link('/guides/traveling-during-ramadan', 'Traveling during Ramadan — complete guide')}
${link('/guides', 'All our halal travel guides')}
${link('/destinations', 'Halal destination guides (350+ cities)')}
${link('/prayer-times', 'Prayer times for any city')}
${link('/qibla', 'Qibla compass')}
${link('/nearby-mosque', 'Find a mosque near you')}
</ul>
<p style="font-size:13px;color:#666">We never certify the halal status of a place ourselves — we report information and always recommend verifying on site.</p>
<p>— The ${brand} team</p>
</div>`
    : `<div style="font-family:Georgia,serif;max-width:560px;margin:0 auto;color:#1a3a2a">
<h2 style="color:#1a3a2a">Bienvenue sur ${brand} 🌙</h2>
<p>Merci pour votre inscription ! Voici votre guide gratuit — nos ressources les plus utiles pour voyager en tant que musulman :</p>
<ul>
${link('/guides/voyager-pendant-ramadan-guide-complet', 'Voyager pendant le Ramadan — guide complet')}
${link('/guides', 'Tous nos guides voyage halal')}
${link('/destinations', 'Guides destinations halal (350+ villes)')}
${link('/horaires-priere', 'Horaires de prière pour toutes les villes')}
${link('/qibla', 'Boussole Qibla')}
${link('/mosquee-proche', 'Trouver une mosquée proche')}
</ul>
<p style="font-size:13px;color:#666">Nous ne certifions jamais nous-mêmes le statut halal d'un lieu — nous signalons l'information et recommandons toujours de vérifier sur place.</p>
<p>— L'équipe ${brand}</p>
</div>`
  return { subject, htmlContent, brand, site }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, source, city, lang } = body
    const en = lang === 'en'

    if (!email || !isValidEmail(email)) {
      return NextResponse.json(
        { error: 'Adresse email invalide.' },
        { status: 400 }
      )
    }

    const normalizedEmail = email.toLowerCase().trim()

    // ── Stockage des leads dans Upstash Redis (ta base de données) ──
    const redis = getRedis()
    if (redis) {
      try {
        await redis.sadd('vh:leads:emails', normalizedEmail)
        await redis.set(`vh:lead:${normalizedEmail}`, {
          email: normalizedEmail,
          source: source || 'inconnu',
          city: city || null,
          lang: en ? 'en' : 'fr',
          date: new Date().toISOString(),
        })
      } catch { /* stockage best-effort */ }
    }

    // ── Option A : Formspree — best-effort (n'échoue JAMAIS l'inscription) ──
    if (process.env.FORMSPREE_ENDPOINT) {
      try {
        await fetch(process.env.FORMSPREE_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({ email: normalizedEmail, source: 'waitlist-voyageshalal' }),
        })
      } catch (e) { console.error('[WAITLIST] Formspree', e) }
    }

    // ── Option B : Brevo — best-effort (le lead est déjà stocké dans Redis) ──
    if (process.env.BREVO_API_KEY && process.env.BREVO_LIST_ID) {
      const apiKey = process.env.BREVO_API_KEY
      const listId = parseInt(process.env.BREVO_LIST_ID, 10)
      const doiTemplateId = parseInt(process.env.BREVO_DOI_TEMPLATE_ID ?? '', 10)
      const { subject, htmlContent, brand, site } = welcomeEmail(en)

      try {
        if (!Number.isNaN(doiTemplateId) && !Number.isNaN(listId)) {
          // Double opt-in propre : Brevo envoie l'email de confirmation (template
          // configuré dans le dashboard) et n'ajoute le contact à la liste qu'après
          // le clic de confirmation. Activé dès que BREVO_DOI_TEMPLATE_ID est défini.
          const response = await fetch('https://api.brevo.com/v3/contacts/doubleOptinConfirmation', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'api-key': apiKey },
            body: JSON.stringify({
              email: normalizedEmail,
              includeListIds: [listId],
              templateId: doiTemplateId,
              redirectionUrl: `${site}/?inscription=confirmee`,
              attributes: { SOURCE: source || 'inconnu' },
            }),
          })
          if (!response.ok && response.status !== 204) {
            const err = await response.json().catch(() => ({}))
            if (err.code !== 'duplicate_parameter') console.error('[WAITLIST] Brevo DOI', response.status, err)
          }
        } else {
          // Opt-in simple : ajout direct à la liste.
          const response = await fetch('https://api.brevo.com/v3/contacts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'api-key': apiKey },
            body: JSON.stringify({
              email: normalizedEmail,
              ...(Number.isNaN(listId) ? {} : { listIds: [listId] }),
              updateEnabled: true,
              attributes: { SOURCE: source || 'inconnu' },
            }),
          })
          if (!response.ok && response.status !== 204) {
            const err = await response.json().catch(() => ({}))
            if (err.code !== 'duplicate_parameter') console.error('[WAITLIST] Brevo', response.status, err)
          }

          // Envoi auto du guide gratuit (email de bienvenue transactionnel).
          // En mode double opt-in, c'est le template Brevo qui joue ce rôle.
          try {
            const senderEmail = process.env.BREVO_SENDER_EMAIL || 'contact@voyageshalal.fr'
            const send = await fetch('https://api.brevo.com/v3/smtp/email', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'api-key': apiKey },
              body: JSON.stringify({
                sender: { name: brand, email: senderEmail },
                to: [{ email: normalizedEmail }],
                subject,
                htmlContent,
              }),
            })
            if (!send.ok) {
              const err = await send.json().catch(() => ({}))
              console.error('[WAITLIST] Brevo welcome email', send.status, err)
            }
          } catch (e) { console.error('[WAITLIST] Brevo welcome email', e) }
        }
      } catch (e) { console.error('[WAITLIST] Brevo', e) }
    }

    // ── Fallback : log console si aucun service configuré ──
    if (!process.env.FORMSPREE_ENDPOINT && !process.env.BREVO_API_KEY) {
      console.log(`[WAITLIST] Nouvel inscrit : ${normalizedEmail}`)
    }

    return NextResponse.json(
      { success: true, message: 'Inscription confirmée ! Nous vous contacterons en priorité.' },
      { status: 200 }
    )
  } catch (error) {
    console.error('[WAITLIST ERROR]', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue. Réessayez dans quelques instants.' },
      { status: 500 }
    )
  }
}
