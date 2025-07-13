'use client';

import styles from './LoadingSpinner.module.css';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  text?: string;
}

export default function LoadingSpinner({ size = 'medium', text }: LoadingSpinnerProps) {
  return (
    <div className={styles.loadingContainer}>
      <div className={`${styles.spinner} ${styles[size]}`}>
        <svg 
          viewBox="0 0 100 100" 
          xmlns="http://www.w3.org/2000/svg" 
          className={styles.svg}
        >
          <g className={styles.ldlScale}>
            <g className={styles.ldlAni}>
              <g className={styles.ldlLayer}>
                <g className={styles.ldlAni}>
                  <path 
                    fill="#ff566b" 
                    d="M75.9 42.5v41c0 .7-.6 1.3-1.3 1.3H63.1s-.1 0-.1-.1V59.3H36.9v25.4s0 .1-.1.1H25.5c-.7 0-1.3-.6-1.3-1.3v-41l-4.3 4.3v36.7c0 3.1 2.5 5.6 5.6 5.6h11.4c2.4 0 4.4-2 4.4-4.4V63.6h17.5v21.1c0 2.4 2 4.4 4.4 4.4h11.4c3.1 0 5.6-2.5 5.6-5.6V46.8l-4.3-4.3z"
                  />
                </g>
              </g>
              <g className={styles.ldlLayer}>
                <g className={styles.ldlAni}>
                  <path 
                    fill="#ff566b" 
                    d="M80.2 54.4l3 3c2.1 2.1 5.6 2.1 7.7 0l.1-.1c2.1-2.1 2.1-5.6 0-7.7L80.2 38.9 73.3 32 53.7 12.4c-2-2-5.3-2-7.3 0L26.7 32l-6.9 6.9L9.1 49.6c-2.1 2.1-2.1 5.6 0 7.7l.1.1c2.1 2.1 5.6 2.1 7.7 0l3-3 4.3-4.3L38 36.3l4.3-4.3 7.8-7.8 7.8 7.8 4.3 4.3L76 50.1l4.2 4.3z"
                  />
                </g>
              </g>
              <g className={styles.ldlLayer}>
                <g className={styles.ldlAni}>
                  <path 
                    fill="#ebafb0" 
                    d="M57.8 32L50 24.2 42.2 32l-4.3 4.3-13.8 13.8v33.5c0 .7.6 1.3 1.3 1.3h11.4s.1 0 .1-.1V59.3H63V84.7s0 .1.1.1h11.4c.7 0 1.3-.6 1.3-1.3V50.1L62.1 36.3 57.8 32z"
                  />
                </g>
              </g>
            </g>
          </g>
        </svg>
      </div>
      {text && <p className={styles.loadingText}>{text}</p>}
    </div>
  );
} 