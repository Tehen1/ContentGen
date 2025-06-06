import React, { useState, useEffect, useContext } from 'react';
import { Web3Context } from '../context/Web3Context';
import axios from 'axios';
import { ethers } from 'ethers';
import ChallengeCard from './ChallengeCard';

const SponsoredChallenges = () => {
  const { account, contracts } = useContext(Web3Context);
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSponsor, setIsSponsor] = useState(false);

  useEffect(() => {
    const fetchChallenges = async () => {
      try {
        // Vérifier si l'utilisateur est un sponsor
        if (contracts.sponsor) {
          const sponsorStatus = await contracts.sponsor.hasRole(
            ethers.utils.id("SPONSOR_ROLE"),
            account
          );
          setIsSponsor(sponsorStatus);
        }

        // Récupérer les défis
        const response = await axios.get('/api/sponsored-challenges');
        setChallenges(response.data.challenges);
      } catch (error) {
        console.error("Error fetching challenges:", error);
      } finally {
        setLoading(false);
      }
    };

    if (account) {
      fetchChallenges();
    }
  }, [account, contracts]);

  const joinChallenge = async (challengeId) => {
    try {
      const tx = await contracts.sponsor.joinChallenge(
        challengeId,
        ethers.utils.formatBytes32String("proof") // À remplacer par une vraie preuve ZK
      );
      await tx.wait();
      alert("Vous avez rejoint le défi avec succès!");
    } catch (error) {
      console.error("Error joining challenge:", error);
    }
  };

  if (loading) return <div>Chargement...</div>;

  return (
    <div className="sponsored-challenges">
      <h2>Défis Sponsorisés</h2>
      
      {isSponsor && (
        <button 
          className="create-challenge-btn"
          onClick={() => window.location.href = '/create-challenge'}
        >
          Créer un Défi
        </button>
      )}

      <div className="challenges-grid">
        {challenges.map(challenge => (
          <ChallengeCard 
            key={challenge.id}
            challenge={challenge}
            onJoin={() => joinChallenge(challenge.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default SponsoredChallenges;