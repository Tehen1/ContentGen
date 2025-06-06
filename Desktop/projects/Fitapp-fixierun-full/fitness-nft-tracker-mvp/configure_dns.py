# Créez un fichier configure_dns.py
import requests
import json
import os

# Configuration
CLOUDFLARE_API_TOKEN = "dfjqh5_szfoyE_2myRiAQZoKkHsB14ZTrgzqBsf2"
O2SWITCH_IP = "193.70.4.151"

# Liste des domaines
DOMAINS = [
    "affinitylove.eu",
    "aiforbusinesses.org",
    "antonylambi.be",
    "beautyproductreviews.net",
    "cryptostocksinsider.net",
    "devtehen.xyz",
    "dropshippingstore.net",
    "dropshippingstores.net",
    "fixie.run",
    "fixienftrun.com",
    "healthylivingadvices.com",
    "puffs-store.com",
    "techbuzzinga.com"
]

headers = {
    "Authorization": f"Bearer {CLOUDFLARE_API_TOKEN}",
    "Content-Type": "application/json"
}

def get_zone_id(domain):
    url = f"https://api.cloudflare.com/client/v4/zones?name={domain}"
    response = requests.get(url, headers=headers)
    data = response.json()
    return data['result'][0]['id'] if data['result'] else None

def create_dns_record(zone_id, type, name, content, proxied=True):
    url = f"https://api.cloudflare.com/client/v4/zones/{zone_id}/dns_records"
    data = {
        "type": type,
        "name": name,
        "content": content,
        "proxied": proxied,
        "ttl": 1  # Auto TTL
    }
    response = requests.post(url, headers=headers, json=data)
    return response.json()

def clear_existing_records(zone_id):
    url = f"https://api.cloudflare.com/client/v4/zones/{zone_id}/dns_records"
    response = requests.get(url, headers=headers)
    records = response.json()['result']

    for record in records:
        delete_url = f"{url}/{record['id']}"
        requests.delete(delete_url, headers=headers)

def configure_domain(domain):
    print(f"\nConfiguring {domain}...")
    zone_id = get_zone_id(domain)
    if not zone_id:
        print(f"Could not find zone ID for {domain}")
        return

    # Supprimer les enregistrements existants
    clear_existing_records(zone_id)

    # Créer les nouveaux enregistrements
    # 1. Enregistrement A pour le domaine principal
    create_dns_record(zone_id, "A", domain, O2SWITCH_IP, True)

    # 2. CNAME pour www
    create_dns_record(zone_id, "CNAME", f"www.{domain}", domain, True)

    # 3. CNAME wildcard pour tous les sous-domaines
    create_dns_record(zone_id, "CNAME", f"*.{domain}", domain, True)

    # 4. TXT pour la vérification
    create_dns_record(zone_id, "TXT", domain, "museau.o2switch.net", False)

    print(f"✓ Configuration completed for {domain}")

def main():
    for domain in DOMAINS:
        configure_domain(domain)
    print("\nDNS configuration completed for all domains!")

if __name__ == "__main__":
    main()