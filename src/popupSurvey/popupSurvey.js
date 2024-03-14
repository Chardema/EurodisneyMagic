import React, { useState, useEffect } from 'react';
import styles from './popupSurvey.module.scss';
import { FaClock, FaHome } from 'react-icons/fa';
import { TbRollercoaster } from "react-icons/tb";
import { useDispatch } from 'react-redux';
import { toggleFavorite } from '../redux/actions'; // Assurez-vous que le chemin d'importation est correct

const questionIcons = {
  0: <FaHome className={styles.icon} />,
  1: <TbRollercoaster className={styles.icon}/>,
  2: <FaClock className={styles.icon} />,
};

const questions = [
  {
    question: "Bonjour et Bienvenue dans Magic Journey, l'application qui vous fera profiter au maximum de Disneyland Paris",
    answers: ['Suivant'],
  },
  {
    question: "Commençons par vous poser quelques questions afin de vous proposer votre première attraction",
    answers: ['Suivant'],
  },
  {
    question: "Quel type d'attractions préférez-vous ?",
    answers: ['Famille', 'Sensation', "Sans file d'attente", 'Rencontre avec les personnages'],
  },
  {
    question: "Quelle durée d'attente est acceptable pour vous ?",
    answers: ['Moins de 15 minutes', '15-30 minutes', '30-60 minutes', 'Plus de 60 minutes'],
  },
];

const PopupSurvey = ({ onClose, attractions }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [responses, setResponses] = useState([]);
  const dispatch = useDispatch();

  useEffect(() => {
    const storedPreferences = localStorage.getItem('userPreferences');
    if (storedPreferences) {
      onClose();
    }
  }, [onClose]);

  useEffect(() => {
    if (currentStep === questions.length) {
      localStorage.setItem('userPreferences', JSON.stringify(responses));
    }
  }, [currentStep, responses, onClose]);

  const handleAnswer = (answer) => {
    // Ajouter la réponse à l'état seulement si ce n'est pas "Suivant"
    if (answer !== 'Suivant') {
      setResponses(current => [...current, answer]);
    }
  
    // Passer à la question suivante ou procéder à la fermeture
    // Ce passage à l'étape suivante doit se faire indépendamment de la réponse donnée
    setCurrentStep(current => current + 1);
  
    // La logique pour traiter la fin du questionnaire et enregistrer dans localStorage
    // sera gérée dans useEffect basé sur `currentStep` et `responses`
  };
  

  const recommendedAttractions = () => {
    if (!attractions || responses.length < 4) return [];
  
    const preferredType = responses[2];
    if (!preferredType) return []; 
  
    let maxWaitTime;
    switch (responses[3]) {
      case 'Moins de 15 minutes': maxWaitTime = 15; break;
      case '15-30 minutes': maxWaitTime = 30; break;
      case '30-60 minutes': maxWaitTime = 60; break;
      case 'Plus de 60 minutes': maxWaitTime = Infinity; break;
      default: maxWaitTime = Infinity;
    }
    console.log("Attractions before filtering:", attractions);

    // Correction pour utiliser `type` et ajustement pour `waitTime`
    return attractions.filter(attraction =>
      attraction.type === preferredType && attraction.waitTime <= maxWaitTime
    ).slice(0, 3);
  };

  return (
    <div className={styles.popupContainer}>
      <div className={styles.popup}>
        {currentStep < questions.length ? (
          <>
            {questionIcons[currentStep]}
            <h2>{questions[currentStep].question}</h2>
            {questions[currentStep].answers.map((answer, index) => (
              <button key={index} onClick={() => handleAnswer(answer)} className={styles.answerButton}>
                {answer}
              </button>
            ))}
          </>
        ) : (
          <>
            <h2>Attractions recommandées pour vous</h2>
            {recommendedAttractions().map(attraction => (
              <div key={attraction.id} className={styles.attractionRecommendation}>
                <h3>{attraction.name}</h3>
                <button onClick={() => dispatch(toggleFavorite(attraction.id))}>Ajouter aux favoris</button>
              </div>
            ))}
            <button onClick={onClose}>Terminer</button>
          </>
        )}
      </div>
    </div>
  );
};

export default PopupSurvey;
