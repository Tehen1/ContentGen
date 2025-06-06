import { createClient } from '@supabase/supabase-js';
import { createWalletClient, http, parseAbi } from 'viem';
import { polygon } from 'viem/chains';
import * as sodium from 'libsodium-wrappers';
import { Request, Response } from 'express';
import { z } from 'zod';

/**
 * Cette fonction illustre la meilleure pratique :
 * - Les tokens Health Connect ne sortent JAMAIS du backend.
 * - Chiffrement libsodium côté client ; déchiffrement si besoin ici.
 * - Validation forte AVANT écriture blockchain.
 * - Appel Viem/Wallet pour Smart Contract.
 * - Logging de l’événement et des accès sensibles.
 */

interface HealthPayload {
  user_id: string;
  encryptedActivity: string; // Données chiffrées côté client
  nonce: string; // Pour déchiffrement (libsodium)
}

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function syncHealthActivity(req: Request, res: Response) {
  await sodium.ready;
  const { user_id, encryptedActivity, nonce }: HealthPayload = req.body;

  try {
    // 1. Récupère la clé secrète de chiffrement depuis Supabase Vault (jamais stockée en .env)
    const { data: encryptionKey, error } = await supabase.rpc('get_health_encryption_key');

    if (error) {
      return res.status(500).json({ error: "Encryption key not configured" });
    }

    // 2. Déchiffre les données activité reçues
    const decrypted = sodium.crypto_secretbox_open_easy(
      sodium.from_base64(encryptedActivity),
      sodium.from_base64(nonce),
      sodium.from_base64(encryptionKey.value)
    );
    if (!decrypted) {
      return res.status(400).json({ error: "Données d'activité illisibles" });
    }
    const activity = JSON.parse(sodium.to_string(decrypted));
    const { distance, duration, calories } = activity;

    // 3. Contrôles élémentaires AVANT tout action (anti-fraude, anti-robot)
    if (distance <= 0 || duration <= 0) {
      return res.status(400).json({ error: "Valeurs d'activité invalides." });
    }

    // 4. Log d'audit d'accès sensible
    await supabase
      .from('audit_log')
      .insert({ user_id, action: 'SYNC_ACTIVITY', status: 'initiated', at: new Date() });

    // 5. Appel sécurisé Smart Contract avec Viem, via clé backend DÉDIÉE (jamais exposée)
    const client = createWalletClient({
      account: process.env.BLOCKCHAIN_SVC_ACCOUNT,
      chain: polygon,
      transport: http({
        retry: {
          maxRetries: 3,
          retryDelay: (attempt: number) => Math.pow(2, attempt) * 1000
        }
      })
    });
    const contractAbi = parseAbi([
      'function recordRide(uint256 distance, uint256 duration, uint256 calories)',
    ]);
    const tx = await client.writeContract({
      account: process.env.BLOCKCHAIN_SVC_ACCOUNT,
      address: process.env.FIXIERUN_CONTRACT_ADDRESS,
      abi: contractAbi,
      functionName: 'recordRide',
      args: [distance, duration, calories],
      chain: polygon,
    });

    // 6. Journalisation+stockage dans Supabase, y compris le hash transaction
    await supabase
      .from('activities')
      .insert({
        user_id,
        distance,
        duration,
        calories,
        transaction_hash: tx.hash,
        validated: false,
      });

    // 7. Audit success
    await supabase.rpc('audit_activity_sync', {
      p_user_id: user_id,
      p_status: 'success',
      p_tx_hash: tx
    });

    return res.json({ success: true, transaction_hash: tx });
  } catch (error) {
    console.error('Erreur de synchronisation sécurisée :', error);
    await supabase
      .from('audit_log')
      .insert({
        user_id: req.body?.user_id,
        action: 'SYNC_ACTIVITY',
        status: 'error',
        message: error instanceof Error ? error.message : 'Erreur inconnue',
        at: new Date(),
      });
    return res.status(500).json({ error: "Échec de la synchronisation sécurisée" });
  }
}
