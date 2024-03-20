import React, { useState, useEffect, useCallback } from 'react';
import styles from './popupSurvey.module.scss';
import { FaClock, FaHome, FaLaughBeam, FaHeart, FaTimesCircle } from 'react-icons/fa';
import { TbRollercoaster } from 'react-icons/tb';
import { useDispatch } from 'react-redux';
import { toggleFavorite } from '../redux/actions';
import CardSwipe from '../CardSwipe/CardSwipe';
import { attractionImages } from '../Attractions/AttractionsPage';
import { useMemo } from 'react';

const questionIcons = {
  0: <FaHome className={styles.icon} />,
  2: <TbRollercoaster className={styles.icon} />,
  1: <FaLaughBeam className={styles.icon} />,
  3: <FaClock className={styles.icon} />,
};

const questions = [
  {
    question: "Bonjour et Bienvenue dans Magic Journey, l'application qui vous fera profiter au maximum de Disneyland Paris",
    answers: ['Suivant'],
    type: 'intro',
  },
  {
    question: "Commençons par vous poser quelques questions afin de vous proposer votre première attraction",
    answers: ['Suivant'],
    type: 'intro',
  },
  {
    question: "Quel type d'attractions préférez-vous ?",
    answers: ['Famille', 'Sensation', "Sans file d'attente", 'Rencontre avec les personnages'],
    type: 'typePreference',
  },
  {
    question: "Quelle durée d'attente est acceptable pour vous ?",
    answers: ['Moins de 15 minutes', '15-30 minutes', '30-60 minutes', 'Plus de 60 minutes'],
    type: 'waitTimePreference',
  },
];

const PopupSurvey = ({ onClose, attractions }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [responses, setResponses] = useState({
    typePreference: [],
    waitTimePreference: '',
  });
  const [showConfirmButton, setShowConfirmButton] = useState(false);
  const [currentAttractionIndex, setCurrentAttractionIndex] = useState(0);
  const dispatch = useDispatch();
  const [hasSwipedAllAttractions, setHasSwipedAllAttractions] = useState(false);

  useEffect(() => {
    const storedPreferences = JSON.parse(localStorage.getItem('userPreferences'));
    if (storedPreferences) {
      setResponses({
        typePreference: storedPreferences.typePreference || [],
        waitTimePreference: storedPreferences.waitTimePreference || '',
      });
    }
  }, []);

  const recommendedAttractions = useMemo(() => {
    if (!attractions || !responses.typePreference.length) return [];

    let maxWaitTime;
    switch (responses.waitTimePreference) {
      case 'Moins de 15 minutes': maxWaitTime = 15; break;
      case '15-30 minutes': maxWaitTime = 30; break;
      case '30-60 minutes': maxWaitTime = 60; break;
      case 'Plus de 60 minutes': maxWaitTime = Infinity; break;
      default: maxWaitTime = Infinity;
    }

    return attractions.filter(attraction =>
        (responses.typePreference.length === 0 || responses.typePreference.some(type => attraction.type.includes(type))) &&
        attraction.waitTime <= maxWaitTime
    );
  }, [attractions, responses]);
  const handleAnswer = useCallback((answer, type) => {
    setResponses(current => {
      const updatedResponses = {
        ...current,
        [type]: type === 'typePreference'
            ? current.typePreference.includes(answer)
                ? current.typePreference.filter(item => item !== answer)
                : [...current.typePreference, answer]
            : answer,
      };

      // Ajouté pour gérer la progression pour tous les types de questions
      if (type !== 'typePreference' || answer === 'Suivant') {
        setCurrentStep(current => current + 1);
        setShowConfirmButton(false);
      } else if (type === 'typePreference') {
        setShowConfirmButton(updatedResponses.typePreference.length > 0);
      }

      return updatedResponses;
    });
  }, []);


  useEffect(() => {
    if (questions[currentStep]?.type === 'typePreference') {
      setShowConfirmButton(responses.typePreference.length > 0);
    } else {
      setShowConfirmButton(false);
    }
  }, [currentStep, responses.typePreference]);

  useEffect(() => {
    if (currentStep === questions.length) {
      localStorage.setItem('userPreferences', JSON.stringify(responses));
    }
  }, [currentStep, responses]);

  const onSwipeLeft = useCallback(() => {
    if (currentAttractionIndex < recommendedAttractions.length - 1) {
      setCurrentAttractionIndex(current => current + 1);
    } else {
      setHasSwipedAllAttractions(true);
    }
  }, [currentAttractionIndex, recommendedAttractions.length]);

  const onSwipeRight = useCallback((attraction) => {
    dispatch(toggleFavorite(attraction));
    if (currentAttractionIndex < recommendedAttractions.length - 1) {
      setCurrentAttractionIndex(current => current + 1);
    } else {
      setHasSwipedAllAttractions(true);
    }
  }, [dispatch, currentAttractionIndex, recommendedAttractions.length]);

  return (
      <div className={styles.popupContainer}>
        <div className={styles.popup}>
          {currentStep < questions.length ? (
              <>
                {questionIcons[currentStep]}
                <h2>{questions[currentStep].question}</h2>
                {questions[currentStep].answers.map((answer, index) => (
                    <button
                        key={index}
                        onClick={() => handleAnswer(answer, questions[currentStep].type)}
                        className={`${styles.answerButton} ${(responses[questions[currentStep].type] || []).includes(answer) ? styles.selected : ''}`}
                    >
                      {answer}
                    </button>
                ))}
                {showConfirmButton && (
                    <button
                        onClick={() => {
                          setCurrentStep(current => current + 1);
                          setShowConfirmButton(false); // Cacher le bouton après le passage à la prochaine question
                        }}
                        className={styles.confirmButton}
                    >
                      Confirmer
                    </button>
                )}
              </>
          ) : (
              <>
                <h2>Attractions recommandées pour vous</h2>
                {recommendedAttractions.length > 0 && !hasSwipedAllAttractions ? (
                    <>
                      <CardSwipe
                          key={recommendedAttractions[currentAttractionIndex].id}
                          attraction={{
                            ...recommendedAttractions[currentAttractionIndex],
                            image: attractionImages[recommendedAttractions[currentAttractionIndex].name]
                          }}
                          onSwipeLeft={onSwipeLeft}
                          onSwipeRight={() => onSwipeRight(recommendedAttractions[currentAttractionIndex])}
                      />
                      <div className={styles.actionButtons}>
                        <FaTimesCircle className={styles.passIcon} onClick={onSwipeLeft} />
                        <FaHeart className={styles.favoriteIcon} onClick={() => onSwipeRight(recommendedAttractions[currentAttractionIndex])} />
                      </div>
                    </>
                ) : (
                    <p>Toutes les attractions recommandées ont été parcourues. Appuyez sur "Fermer" pour continuer.</p>
                )}
                <button onClick={onClose} className={styles.closeButton}>Fermer</button>
              </>
          )}
        </div>
      </div>
  );
};

export default PopupSurvey;

