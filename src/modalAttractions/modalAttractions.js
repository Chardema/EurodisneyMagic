// AttractionModal.js
import React from 'react';
import styles from './modalAttractions.module.scss'; // Assurez-vous de créer ce fichier de styles

const AttractionModal = ({ isOpen, onClose, attractionDetails }) => {
    if (!isOpen) return null;

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <h2>{attractionDetails.name}</h2>
                <p>{attractionDetails.description}</p>
                <button onClick={onClose}>Fermer</button>
            </div>
        </div>
    );
};

export default AttractionModal;
