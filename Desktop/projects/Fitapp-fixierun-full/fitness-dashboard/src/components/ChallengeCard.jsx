import React from 'react';
import { ethers } from 'ethers';
import dayjs from 'dayjs';

const ChallengeCard = ({ challenge, onJoin }) => {
  const rewardEth = ethers.utils.formatEther(challenge.rewardPool);
  const progress = (challenge.participantCount / challenge.participantLimit) * 100;
  const endDate = dayjs(challenge.endTime * 1000).format('DD/MM/YYYY');
  const isActive = dayjs().isBefore(dayjs(challenge.endTime * 1000));

  return (
    <div className={`challenge-card ${isActive ? 'active' : 'ended'}`}>
      <div className="card-header">
        <h3>{challenge.metadata.name || "Défi Sponsorisé"}</h3>
        <span className="reward">{rewardEth} ETH</span>
      </div>
      
      <div className="card-body">
        <p>{challenge.metadata.description || "Participez et gagnez des récompenses!"}</p>
        
        <div className="progress-container">
          <div className="progress-bar" style={{ width: `${progress}%` }}></div>
          <span>
            {challenge.participantCount}/{challenge.participantLimit} participants
          </span>
        </div>
        
        <div className="dates">
          <span>Fin: {endDate}</span>
        </div>
      </div>
      
      <div className="card-footer">
        {isActive ? (
          <button onClick={onJoin} className="join-btn">
            Rejoindre
          </button>
        ) : (
          <span className="ended-label">Terminé</span>
        )}
      </div>
    </div>
  );
};

export default ChallengeCard;