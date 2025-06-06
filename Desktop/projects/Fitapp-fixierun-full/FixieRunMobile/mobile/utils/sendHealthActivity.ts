import libsodium from 'libsodium-wrappers'

/**
 * Chiffre et envoie l'activité Health Connect de façon sécurisée.
 * Les clés (key, nonce) doivent être gérées par provisioning sécurisé (non statique ni hardcodée !)
 * Ce code suppose que la clé secrète (partagée avec le backend) a été provisionnée de façon sécurisée lors du setup.
 */

export async function sendHealthActivityToBackend(
  userId: string,
  activity: { distance: number; duration: number; calories: number },
  encryptionKeyBase64: string // partagé de manière sécurisée (provisionning initial, Secure Enclave, etc.)
) {
  await libsodium.ready
  const sodium = libsodium

  // 1. Sérialiser les données
  const activityJSON = JSON.stringify(activity)

  // 2. Générer un nonce aléatoire sécurisé
  const nonce = sodium.randombytes_buf(sodium.crypto_secretbox_NONCEBYTES)

  // 3. Encoder la clé
  const key = sodium.from_base64(encryptionKeyBase64)

  // 4. Chiffrement
  const encryptedActivity = sodium.crypto_secretbox_easy(activityJSON, nonce, key)

  // 5. Transformation pour HTTP
  const encryptedB64 = sodium.to_base64(encryptedActivity)
  const nonceB64 = sodium.to_base64(nonce)

  // 6. Envoi vers backend Supabase (function HTTP)
  const resp = await fetch('https://<YOUR_SUPABASE_URL>/functions/syncHealthActivity', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // ici, ajouter authentification Bearer/jwt si nécessaire
    },
    body: JSON.stringify({
      user_id: userId,
      encryptedActivity: encryptedB64,
      nonce: nonceB64
    })
  })
  const json = await resp.json()
  if (!resp.ok) throw new Error(json.error || 'Erreur d\'envoi activité')
  return json
}

// Exemple d’utilisation
// const encryptionKey = '...' // à provisionner via Secure Enclave ou lors d’un onboarding sécurisé
// const userActivity = { distance: 4000, duration: 1200, calories: 320 };
// sendHealthActivityToBackend('user-abcd', userActivity, encryptionKey);